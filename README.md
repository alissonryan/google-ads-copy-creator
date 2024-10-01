# Gerador de Anúncios AI

## Sobre o Projeto

O Gerador de Anúncios AI é uma aplicação web que utiliza inteligência artificial para criar cópias de anúncios personalizadas. Esta ferramenta é projetada para ajudar profissionais de marketing e empresas a gerar conteúdo publicitário de forma rápida e eficiente.

## Stack Tecnológica

- **Frontend**: React.js com Next.js
- **Backend**: Node.js com Express
- **AI**: OpenAI API
- **Estilização**: CSS Modules ou Styled Components (especificar qual está sendo usado)
- **Deployment**: Vercel (ou especificar outra plataforma, se aplicável)

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- Node.js (versão 14.x ou superior)
- npm (normalmente vem com Node.js)
- Uma conta na OpenAI com acesso à API

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/gerador-de-anuncios-ai.git
   cd gerador-de-anuncios-ai
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto e adicione sua chave API da OpenAI:
   ```
   OPENAI_API_KEY=sua_chave_api_aqui
   ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

5. Acesse `http://localhost:3000` no seu navegador.

## Uso

1. Na página inicial, você verá um formulário para inserir detalhes sobre o produto ou serviço para o qual deseja criar um anúncio.

2. Preencha os campos com informações relevantes, como nome do produto, características principais, público-alvo, etc.

3. Clique em "Gerar Anúncio" e aguarde enquanto a IA processa sua solicitação.

4. O anúncio gerado será exibido na tela. Você pode copiar o texto ou solicitar uma nova versão, se necessário.

## Estrutura do Projeto

- `pages/`: Contém as rotas e páginas da aplicação Next.js
- `components/`: Componentes React reutilizáveis
- `pages/api/`: Endpoints da API, incluindo a integração com a OpenAI
- `styles/`: Arquivos de estilo (CSS ou Styled Components)
- `public/`: Arquivos estáticos como imagens e fontes

## Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o guia de contribuição para saber como contribuir corretamente para este projeto.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - seuemail@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/gerador-de-anuncios-ai](https://github.com/seu-usuario/gerador-de-anuncios-ai)

## Agradecimentos

- OpenAI pela incrível API
- Next.js pela framework React
- Todos os contribuidores e usuários deste projeto
