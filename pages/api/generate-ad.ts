import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAI as LangChainOpenAI } from "@langchain/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const adjustTextLength = (text: string, targetLength: number, minLength: number = targetLength * 0.8) => {
  let adjusted = text.trim().replace(/\s+/g, ' '); // Remove espaços extras
  
  if (adjusted.length < minLength) {
    console.warn(`Texto muito curto: ${adjusted.length} caracteres. Mínimo esperado: ${minLength}`);
    return adjusted; // Retorna o texto original se for muito curto
  }
  
  if (adjusted.length > targetLength) {
    // Se for maior, corta no último espaço antes do limite
    adjusted = adjusted.substr(0, targetLength).trim();
    const lastSpaceIndex = adjusted.lastIndexOf(' ');
    if (lastSpaceIndex > minLength) {
      adjusted = adjusted.substr(0, lastSpaceIndex);
    }
  }
  
  return adjusted;
};

async function scrapeKeywords(urls: string[]): Promise<string[]> {
  const keywords: string[] = [];

  for (const url of urls) {
    try {
      const loader = new CheerioWebBaseLoader(url);
      const docs = await loader.load();

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      const embeddings = new OpenAIEmbeddings();
      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

      const model = new LangChainOpenAI({ temperature: 0 });
      const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

      const response = await chain.call({
        query: "Quais são as principais palavras-chave relacionadas ao conteúdo deste site?",
      });

      const siteKeywords = response.text.split(',').map((kw: string) => kw.trim());
      keywords.push(...siteKeywords);
    } catch (error) {
      console.error(`Erro ao fazer scraping de ${url}:`, error);
    }
  }

  return Array.from(new Set(keywords)); // Corrigido para usar Array.from()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { 
        url, 
        keywords: providedKeywords,
        campaignType,
        language,
        tone,
        description,
        searchTerm,
        target,
        differentials,
        finalUrl,
        competitors,
        ctaCategory,
        cta
      } = req.body;

      // Verificar campos obrigatórios
      if (!campaignType || !language || !tone || !description || !searchTerm || !target || !differentials) {
        return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
      }

      // Se url não for fornecida, use finalUrl
      const urlToUse = url || finalUrl;

      if (!urlToUse) {
        return res.status(400).json({ error: 'URL não fornecida' });
      }

      const scrapedKeywords = providedKeywords || await scrapeKeywords([urlToUse]);

      const prompt = `Crie um anúncio ${campaignType === 'search' ? 'de pesquisa' : 'de performance max'} em ${language} com tom ${tone}.
      Produto/Serviço: ${description}
      Termo de pesquisa principal: ${searchTerm}
      Público-alvo: ${target}
      Diferenciais: ${differentials}
      ${finalUrl ? `URL Final: ${finalUrl}` : ''}
      ${competitors ? `Concorrentes: ${competitors}` : ''}
      ${ctaCategory ? `Categoria CTA: ${ctaCategory}` : ''}
      ${cta ? `CTA: ${cta}` : ''}

      O anúncio deve ser altamente relevante para o termo de pesquisa "${searchTerm}" para garantir uma qualidade excelente. Use este termo de forma estratégica nos títulos e descrições.

      Forneça:
      1. Uma lista de palavras-chave relacionadas ao termo de pesquisa e ao produto/serviço.
      2. 15 headlines (títulos curtos) de até 30 caracteres.
      ${campaignType === 'pmax' ? '3. 5 títulos longos de até 90 caracteres.' : ''}
      ${campaignType === 'pmax' ? '4.' : '3.'} 5 descrições de até 90 caracteres.

      Formate a saída em JSON.`;

      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o", 
        messages: [{ role: "user", content: prompt }],
      })

      const content = chatCompletion.choices[0].message.content

      if (!content) {
        throw new Error('Conteúdo não gerado')
      }

      // Analisar o conteúdo gerado
      const lines = content.split('\n')
      const extractedKeywords = lines.find(line => line.startsWith('Palavras-chave:'))?.replace('Palavras-chave:', '').trim() || ''
      const headlines = lines
        .filter(line => line.startsWith('Headline'))
        .map(line => adjustTextLength(line.split(':')[1].trim(), 30, 25));
      const longTitles = campaignType === 'pmax' 
        ? lines.filter(line => line.startsWith('Título longo')).map(line => adjustTextLength(line.split(':')[1].trim(), 90, 70)) 
        : []
      const descriptions = lines
        .filter(line => line.startsWith('Descrição'))
        .map(line => adjustTextLength(line.split(':')[1].trim(), 90, 80));

      res.status(200).json({
        keywords: extractedKeywords,
        headlines,
        longTitles,
        descriptions,
        scrapedKeywords,
      })
    } catch (error) {
      console.error('Erro ao gerar o anúncio:', error)
      res.status(500).json({ error: 'Erro ao gerar o anúncio' })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}