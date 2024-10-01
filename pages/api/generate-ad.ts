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

  return [...new Set(keywords)]; // Remove duplicatas
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    const userInput = req.body

    // Fazer scraping das palavras-chave dos sites concorrentes
    const competitorUrls = userInput.competitors.split('\n').map((url: string) => url.trim());
    const scrapedKeywords = await scrapeKeywords(competitorUrls);

    const prompt = `Gere um anúncio para uma campanha ${userInput.campaignType} com as seguintes características:
    Idioma: ${userInput.language}
    Tom de voz: ${userInput.tone}
    Descrição do produto/serviço: ${userInput.description}
    Público-alvo: ${userInput.target}
    Diferenciais: ${userInput.differentials}
    Call to Action (CTA): ${userInput.cta}
    URL Final: ${userInput.finalUrl}
    Sites concorrentes: ${userInput.competitors}
    Palavras-chave dos concorrentes: ${scrapedKeywords.join(', ')}

    Forneça o seguinte:
    1. Uma lista de palavras-chave relevantes (máximo 10), incluindo algumas das palavras-chave dos concorrentes se relevantes
    2. 15 headlines (títulos curtos) com EXATAMENTE 30 caracteres cada
    3. ${userInput.campaignType === 'pmax' ? '5 títulos longos' : ''}
    4. ${userInput.campaignType === 'search' ? '4' : '5'} descrições com EXATAMENTE 90 caracteres cada

    Certifique-se de incorporar o CTA "${userInput.cta}" em pelo menos um headline e uma descrição.

    Por favor, formate a saída da seguinte maneira:
    Palavras-chave: palavra1, palavra2, palavra3, ...
    Headline 1: [texto do headline de 30 caracteres]
    Headline 2: [texto do headline de 30 caracteres]
    ...
    Headline 15: [texto do headline de 30 caracteres]
    ${userInput.campaignType === 'pmax' ? `Título longo 1: [texto do título longo]
    Título longo 2: [texto do título longo]
    ...
    Título longo 5: [texto do título longo]
    ` : ''}
    Descrição 1: [texto da descrição de 90 caracteres]
    Descrição 2: [texto da descrição de 90 caracteres]
    ...
    Descrição ${userInput.campaignType === 'search' ? '4' : '5'}: [texto da descrição de 90 caracteres]

    É CRUCIAL que os headlines tenham EXATAMENTE 30 caracteres, os títulos longos tenham NO MÍNIMO 70 caracteres e as descrições tenham EXATAMENTE 90 caracteres. Ajuste o texto conforme necessário para atender a esses limites, sem cortar palavras no meio. Se não for possível atingir exatamente o número de caracteres solicitado, forneça o texto mais próximo possível do limite, mantendo a integridade das palavras.`

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
    const keywords = lines.find(line => line.startsWith('Palavras-chave:'))?.replace('Palavras-chave:', '').trim() || ''
    const headlines = lines
      .filter(line => line.startsWith('Headline'))
      .map(line => adjustTextLength(line.split(':')[1].trim(), 30, 25));
    const longTitles = userInput.campaignType === 'pmax' 
      ? lines.filter(line => line.startsWith('Título longo')).map(line => adjustTextLength(line.split(':')[1].trim(), 90, 70)) 
      : []
    const descriptions = lines
      .filter(line => line.startsWith('Descrição'))
      .map(line => adjustTextLength(line.split(':')[1].trim(), 90, 80));

    res.status(200).json({
      keywords,
      headlines,
      longTitles,
      descriptions,
      scrapedKeywords, // Adicione esta linha para incluir as palavras-chave extraídas
    })
  } catch (error) {
    console.error('Erro ao gerar o anúncio:', error)
    res.status(500).json({ message: 'Erro ao gerar o anúncio' })
  }
}