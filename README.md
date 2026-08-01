# CM Copilot

Copiloto Corporativo Inteligente para a CM Arte & Presentes, criado para responder perguntas em linguagem natural sobre regras de negocio da loja, horarios operacionais e calculos de precificacao para impressao 3D. O sistema utiliza um backend com contexto empresarial injetado no prompt para fornecer respostas mais consistentes e alinhadas a operacao real.

## Tecnologias Utilizadas

- JavaScript
- HTML5
- CSS3
- Node.js
- Express
- API Groq (LLM)
- Dotenv para configuracao de ambiente

## Ferramentas de IA no Desenvolvimento

- IA generativa aplicada para apoiar a criacao da interface com proposta visual minimalista e foco em clareza.
- GitHub Copilot utilizado no apoio a escrita e refino de codigo.
- LLMs utilizadas na engenharia do System Prompt, com foco em grounding e restricao de respostas ao contexto corporativo.

## Diferenciais do Projeto

- Injecao de contexto especifico da operacao da loja diretamente no System Prompt.
- Regras fixas de negocio para horarios de trabalho, atendimento ao publico e procedimentos tecnicos.
- Suporte a perguntas sobre precificacao de impressao 3D com parametros definidos e ordem de calculo obrigatoria.
- Fallback inteligente quando a chave da API nao esta configurada, mantendo utilidade basica do sistema.
- Endpoint de chat preparado para uso no frontend e para integracoes futuras.

## Prints da Interface

[Prints da Tela Aqui]

## Instalacao e Execucao

### 1. Clonar o repositorio

```bash
git clone https://github.com/lucasasimeao/AssistenteIA.git
cd AssistenteIA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variaveis de ambiente

Crie o arquivo .env na raiz do projeto com o seguinte conteudo:

```env
GROQ_API_KEY=sua_chave_groq_aqui
PORT=3000
```

### 4. Executar o projeto

```bash
npm start
```

A aplicacao sera iniciada em:

- http://localhost:3000

### 5. Executar testes

```bash
npm test
```

### 6. Teste rapido da API

Exemplo de requisicao para o endpoint de perguntas:

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"qual o turno de trabalho?"}'
```

Resposta esperada:

- JSON com campo reply
- source como groq (quando GROQ_API_KEY estiver configurada) ou fallback (quando nao estiver)
