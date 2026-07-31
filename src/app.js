const express = require('express');
const path = require('path');
require('dotenv').config();

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const knowledgeBase = [
    'Administrativo: O turno de trabalho dos funcionários é de 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).',
    'Atendimento ao Público (Porta Aberta): Domingo: 09:00 - 14:00. Segunda-feira: 09:00 - 18:00. Terça-feira: 09:00 - 20:00. Quarta-feira: 09:00 - 20:00. Quinta-feira: 09:00 - 20:00. Sexta-feira: 09:00 - 20:00. Sábado: 09:00 - 20:00.',
    'Contato e Localização: Nome Comercial: CM Arte e Presentes. WhatsApp/Telefone: +55 12 99127-5399. Endereço: Av. Amador Bueno da Veiga, 2040 - Jardim Jaragua, Taubaté - SP, 12062-400, Brasil. Área de cobertura: localização física/exata (atendimento presencial na loja).',
    'Catálogo Geral da Loja (além das personalizações): A loja realiza estamparia de canecas, camisetas e muito mais. Também vende roupas infantis e adultas, acessórios, maquiagens e uma variedade de brinquedos.',
    'Sublimação: A temperatura e tempo ideal para sublimação padrão em canecas e cerâmicas é de 180°C por 180 segundos. Para problemas com encolhimento de shrink film, deve-se ajustar a compressão e a distribuição térmica no forno.',
    'Impressão 3D: Para problemas de aderência na primeira camada nas impressoras Bambu Lab A1 e A1 Mini, o procedimento padrão é lavar a chapa PEI com detergente neutro, secar bem e rodar a calibração automática de nivelamento no Bambu Studio.',
    'Precificação 3D (CM Store) - Parâmetros Fixos: Impressoras de referência Bambu Lab A1 / A1 Mini. Consumo de energia da máquina: 0,11 kWh. Tarifa de energia local: R$ 1,05/kWh. Custo padrão do filamento: R$ 70,00/kg (R$ 0,07 por grama). Taxa de manutenção do equipamento: 5% sobre o custo base de produção. Multiplicador de venda (markup): 4x sobre o custo total final.',
    'Precificação 3D (CM Store) - Ordem de cálculo obrigatória: 1) Custo do Material (R$) = (Peso em gramas ÷ 1000) × Preço do rolo de filamento. 2) Custo de Energia (R$) = Tempo em horas × 0,11 × 1,05. 3) Custo Base (R$) = Custo do Material + Custo de Energia. 4) Taxa de Manutenção (R$) = Custo Base × 0,05. 5) Custo Total de Produção (R$) = Custo Base + Taxa de Manutenção. 6) Preço Final de Venda (R$) = Custo Total de Produção × 4.',
    'Precificação 3D (CM Store) - Exemplo de referência (100g, 2h): Material R$ 7,00; Energia R$ 0,23; Manutenção R$ 0,36; Custo Total R$ 7,59; Preço de Venda Sugerido R$ 30,36.'
  ].join('\n');

  app.post('/api/ask', async (req, res) => {
    const userMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!userMessage) {
      return res.status(400).json({ error: 'A message is required.' });
    }

    const systemPrompt = `Você é um assistente corporativo da CM Store. Responda estritamente com base nas regras abaixo. Se não tiver certeza, diga que não possui informação suficiente e siga as regras sem inventar detalhes.\n\nBase de Conhecimento:\n${knowledgeBase}`;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const fallbackReply = `Resposta baseada nas regras internas da CM Store. ${buildFallbackReply(userMessage, knowledgeBase)}`;
      return res.json({ reply: fallbackReply, source: 'fallback' });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorPayload = await response.text();
        throw new Error(`LLM request failed: ${response.status} ${errorPayload}`);
      }

      const payload = await response.json();
      const reply = payload?.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta no momento.';

      return res.json({ reply, source: 'llm' });
    } catch (error) {
      const fallbackReply = `Resposta baseada nas regras internas da CM Store. ${buildFallbackReply(userMessage, knowledgeBase)}`;
      return res.json({ reply: fallbackReply, source: 'fallback', error: error.message });
    }
  });

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

function buildFallbackReply(userMessage, knowledgeBase) {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('turno') || lowerMessage.includes('horas') || lowerMessage.includes('trabalho')) {
    return 'O turno de trabalho é de 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).';
  }

  if (lowerMessage.includes('horário') || lowerMessage.includes('horario') || lowerMessage.includes('aberto') || lowerMessage.includes('funcionamento') || lowerMessage.includes('domingo') || lowerMessage.includes('sábado') || lowerMessage.includes('segunda')) {
    return 'Horário de atendimento ao público (porta aberta): Domingo 09:00-14:00; Segunda 09:00-18:00; Terça 09:00-20:00; Quarta 09:00-20:00; Quinta 09:00-20:00; Sexta 09:00-20:00; Sábado 09:00-20:00. Observação: este horário é de atendimento ao público e é diferente da escala interna de produção (4,5h em dias úteis e 6h no fim de semana).';
  }

  if (lowerMessage.includes('whatsapp') || lowerMessage.includes('telefone') || lowerMessage.includes('contato') || lowerMessage.includes('endereço') || lowerMessage.includes('endereco') || lowerMessage.includes('localização') || lowerMessage.includes('localizacao')) {
    return 'Contato da loja: WhatsApp/Telefone +55 12 99127-5399. Endereço: Av. Amador Bueno da Veiga, 2040 - Jardim Jaragua, Taubaté - SP, 12062-400, Brasil.';
  }

  if (lowerMessage.includes('catálogo') || lowerMessage.includes('catalogo') || lowerMessage.includes('vende') || lowerMessage.includes('produto') || lowerMessage.includes('roupa') || lowerMessage.includes('brinquedo') || lowerMessage.includes('maquiagem')) {
    return 'Além de personalizações, a loja também vende roupas infantis e adultas, acessórios, maquiagens e variedade de brinquedos, além de estamparia de canecas e camisetas.';
  }

  if (lowerMessage.includes('sublima') || lowerMessage.includes('temperatura') || lowerMessage.includes('tempo')) {
    return 'Para sublimação padrão em canecas e cerâmicas, a temperatura e tempo ideal é de 180°C por 180 segundos. Para encolhimento de shrink film, ajuste a compressão e a distribuição térmica no forno.';
  }

  if (lowerMessage.includes('3d') || lowerMessage.includes('impress') || lowerMessage.includes('aderência') || lowerMessage.includes('primeira camada')) {
    return 'Para problemas de aderência na primeira camada em impressoras Bambu Lab A1 e A1 Mini, lave a chapa PEI com detergente neutro, seque bem e rode a calibração automática de nivelamento no Bambu Studio.';
  }

  if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('orcamento') || lowerMessage.includes('orçamento') || lowerMessage.includes('markup') || lowerMessage.includes('filamento')) {
    return 'Para precificação de peças 3D na CM Store, use esta ordem: 1) Material = (peso em g ÷ 1000) × R$ 70,00/kg. 2) Energia = tempo em horas × 0,11 × R$ 1,05. 3) Custo Base = Material + Energia. 4) Manutenção = Custo Base × 0,05. 5) Custo Total = Custo Base + Manutenção. 6) Preço Final = Custo Total × 4. Exemplo (100g e 2h): Material R$ 7,00; Energia R$ 0,23; Manutenção R$ 0,36; Custo Total R$ 7,59; Preço de Venda R$ 30,36.';
  }

  return knowledgeBase;
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  createApp().listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { createApp };
