# Especificação: Copiloto Corporativo CM Store

## 1. O que o app faz?
Um assistente de IA em formato de chat web para os colaboradores tirarem dúvidas sobre os processos internos de produção e rotinas administrativas da loja.

## 2. Base de Conhecimento (Regras Fixas)
O assistente deve responder estritamente com base nestas informações:
* Administrativo: O turno de trabalho dos funcionários é de 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).
* Sublimação: A temperatura e tempo ideal para sublimação padrão em canecas e cerâmicas é de 180°C por 180 segundos. Para problemas com encolhimento de shrink film, deve-se ajustar a compressão e a distribuição térmica no forno.
* Impressão 3D: Para problemas de aderência na primeira camada nas impressoras Bambu Lab A1 e A1 Mini, o procedimento padrão é lavar a chapa PEI com detergente neutro, secar bem e rodar a calibração automática de nivelamento no Bambu Studio.

## 3. Back-end (/src)
* Node.js com Express.
* Rota POST `/api/ask`: Recebe a pergunta do usuário, injeta as regras da "Base de Conhecimento" no System Prompt e faz a requisição para a API de LLM. Retorna a resposta em JSON.

## 4. Front-end (/public)
* Página única (`index.html`, `style.css`, `app.js`).
* Interface de chat limpa (estilo ChatGPT).
* Input de texto e exibição do histórico de mensagens em balões (usuário à direita, IA à esquerda).
