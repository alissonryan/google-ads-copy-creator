require('dotenv').config();
const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');
const fs = require('fs').promises;
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => readline.question(query, resolve));
}

async function getUserInput() {
  const userInput = {};
  const fields = [
    'idioma', 'palavrasChave', 'tom', 'produtoServico', 
    'publicoAlvo', 'diferenciais', 'cta', 'urlFinal'
  ];

  for (const field of fields) {
    userInput[field] = await question(`Digite ${field}: `);
  }

  readline.close();
  return userInput;
}

function fillPromptTemplate(template, input) {
  return template
    .replace('{idioma}', input.idioma)
    .replace('{palavras-chave}', input.palavrasChave)
    .replace('{tom}', input.tom)
    .replace('{produto/serviço}', input.produtoServico)
    .replace('{público-alvo}', input.publicoAlvo)
    .replace('{diferenciais}', input.diferenciais)
    .replace('{cta}', input.cta)
    .replace('{url final}', input.urlFinal);
}

async function saveToFile(content, filename) {
  await fs.writeFile(filename, content, 'utf-8');
  console.log(`Anúncio salvo em ${filename}`);
}

async function generateAd(userInput) {
  const model = new OpenAI({ 
    openAIApiKey: process.env.OPENAI_API_KEY, 
    modelName: "gpt-4o",
    temperature: 0.7
  });

  const template = `
  Crie um anúncio do Google Ads para o seguinte produto/serviço:
  
  Idioma: {idioma}
  Palavras-chave: {palavrasChave}
  Tom: {tom}
  Produto/Serviço: {produtoServico}
  Público-alvo: {publicoAlvo}
  Diferenciais: {diferenciais}
  CTA: {cta}
  URL final: {urlFinal}
  
  Gere 3 headlines (máximo 30 caracteres cada) e 2 descrições (máximo 90 caracteres cada).
  Formato da saída:
  Headline 1: [headline]
  Headline 2: [headline]
  Headline 3: [headline]
  Descrição 1: [descrição]
  Descrição 2: [descrição]
  `;

  const prompt = new PromptTemplate({
    template: template,
    inputVariables: [
      "idioma", "palavrasChave", "tom", "produtoServico", 
      "publicoAlvo", "diferenciais", "cta", "urlFinal"
    ]
  });

  const chain = new LLMChain({ llm: model, prompt: prompt });

  try {
    const result = await chain.call(userInput);
    return result.text;
  } catch (error) {
    console.error('Erro ao gerar o anúncio:', error);
    throw error;
  }
}

async function validateAdContent(content) {
  const lines = content.split('\n');
  const validatedLines = lines.map(line => {
    if (line.startsWith('Headline:')) {
      return validateLine(line, 30, 'Headline');
    } else if (line.startsWith('Descrição:')) {
      return validateLine(line, 90, 'Descrição');
    }
    return line;
  });
  return validatedLines.join('\n');
}

function validateLine(line, maxLength, type) {
  const [label, content] = line.split(':');
  const trimmedContent = content.trim();
  if (trimmedContent.length > maxLength) {
    console.warn(`Aviso: ${type} excede o limite de ${maxLength} caracteres. Será truncado.`);
    return `${label}: ${trimmedContent.substring(0, maxLength)}`;
  }
  return line;
}

async function main() {
  try {
    const userInput = await getUserInput();
    let result = await generateAd(userInput);
    result = await validateAdContent(result);
    console.log(result);

    await saveToFile(result, 'anuncio_gerado.txt');
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();