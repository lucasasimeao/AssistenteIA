const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const knowledgeBase = [
  'Identidade e Operação da Loja:',
  '- Nome da Loja: CM Arte & Presentes (ou CM Gift Shop).',
  '- Localização: Taubaté, SP.',
  '- Horário de Produção Interna: Turnos de 4 horas e meia de segunda a sexta-feira. Aos finais de semana, há um turno de 6 horas (podendo ser no sábado ou no domingo).',
  '- Horário de Atendimento ao Público (Porta Aberta): Domingo 09:00-14:00; Segunda 09:00-18:00; Terça 09:00-20:00; Quarta 09:00-20:00; Quinta 09:00-20:00; Sexta 09:00-20:00; Sábado 09:00-20:00.',
  '- Contato: WhatsApp/Telefone +55 12 99127-5399.',
  '- Endereço Físico: Av. Amador Bueno da Veiga, 2040 - Jardim Jaragua, Taubaté - SP, 12062-400, Brasil.',
  '- Área de Cobertura: Localização exata (física), com atendimento presencial na loja.',
  '- Catálogo Geral (além das personalizações): A loja realiza estamparia de canecas, camisetas e muito mais. Também vende roupas infantis e adultas, acessórios, maquiagens e uma variedade de brinquedos.',
  '- Especialidade: Fabricação e venda de produtos personalizados utilizando Impressão 3D, Sublimação e Gravação/Corte a Laser.',
  '',
  'Técnicas de Personalização Oferecidas:',
  '1. Impressão 3D (FDM): Fabricação de objetos tridimensionais camada por camada através do derretimento de filamentos plásticos (como PLA e PETG). Ideal para itens de decoração, utilitários, suportes e action figures.',
  '2. Sublimação Térmica: Processo onde a tinta sublimática passa do estado sólido diretamente para o gasoso sob alta temperatura e pressão, transferindo a arte de forma permanente para materiais que possuam resina de poliéster ou tecidos sintéticos.',
  '3. Gravação e Corte a Laser: Utilização de feixe de luz concentrado para queimar ou derreter a superfície de materiais. Permite gravação em alta definição em madeiras, couro, acrílico e metais pintados, além de corte preciso em materiais de menor espessura.',
  '',
  'Especificações do Maquinário:',
  '- Impressão 3D - Bambu Lab A1 Mini: Tecnologia FDM. Volume de impressão de 180 x 180 x 180 mm. Alta velocidade, ideal para peças menores, chaveiros e miniaturas.',
  '- Impressão 3D - Bambu Lab A1: Tecnologia FDM. Volume de impressão de 256 x 256 x 256 mm. Usada para peças maiores, utilitários e decoração de médio porte.',
  '- Laser - TwoTrees TS5 (Fechada): Máquina de gravação e corte a laser (Diodo). A estrutura fechada (enclosure) garante segurança contra a radiação do laser e permite exaustão eficiente da fumaça.',
  '- Sublimação - Prensa de Caneca LiveSub: Prensa cilíndrica com resistência térmica (padrão 11oz). Usada para estampar canecas de cerâmica, polímero e vidro tratado (geralmente operando em torno de 200°C por 180 a 200 segundos).',
  '- Sublimação - Prensa Plana Padrão: Prensa de chapa reta. Utilizada para estampar camisetas (poliéster), azulejos, mousepads, placas de MDF resinado e quebra-cabeças.',
  '',
  'Regras de Atendimento da IA:',
  '- Se o cliente perguntar sobre prazos ou disponibilidade de entrega rápida, considerar a carga horária de produção (4,5h durante a semana e 6h no fim de semana).',
  '- Sempre diferenciar horário de atendimento ao público (porta aberta) da carga horária de produção interna. Não confundir esses dois contextos.',
  '- Se o cliente quiser personalizar uma caneca, informar que o processo usado é a sublimação na prensa LiveSub e que a caneca precisa ter tratamento adequado (resina).',
  '- Se o cliente pedir um item plástico ou de decoração complexa, sugerir a impressão 3D; peças muito grandes usam a A1 e peças menores usam a A1 Mini.',
  '',
  'Regras Fixas da Operação (prioridade máxima):',
  '- Turno de trabalho dos funcionários: 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).',
  '- Sublimação padrão em canecas e cerâmicas: 180°C por 180 segundos. Para encolhimento de shrink film, ajustar compressão e distribuição térmica no forno.',
  '- Aderência na primeira camada (Bambu Lab A1 e A1 Mini): lavar a chapa PEI com detergente neutro, secar bem e rodar calibração automática de nivelamento no Bambu Studio.',
  '- Precificação 3D (CM Store) - Parâmetros fixos: Impressoras de referência Bambu Lab A1 / A1 Mini; consumo de energia da máquina 0,11 kWh; tarifa de energia local R$ 1,05/kWh; custo padrão do filamento R$ 70,00/kg (R$ 0,07 por grama); taxa de manutenção 5% sobre o custo base; multiplicador de venda (markup) 4x sobre o custo total final.',
  '- Precificação 3D (CM Store) - Ordem de cálculo obrigatória: 1) Custo do Material (R$) = (Peso em gramas ÷ 1000) × Preço do rolo de filamento. 2) Custo de Energia (R$) = Tempo em horas × 0,11 × 1,05. 3) Custo Base (R$) = Custo do Material + Custo de Energia. 4) Taxa de Manutenção (R$) = Custo Base × 0,05. 5) Custo Total de Produção (R$) = Custo Base + Taxa de Manutenção. 6) Preço Final de Venda (R$) = Custo Total de Produção × 4.',
  '- Precificação 3D (CM Store) - Exemplo de referência (100g, 2h): Material R$ 7,00; Energia R$ 0,23; Manutenção R$ 0,36; Custo Total R$ 7,59; Preço de Venda Sugerido R$ 30,36.'
].join('\n');

async function handleChat(req, res) {
  const promptFromPrompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  const promptFromMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const userPrompt = promptFromPrompt || promptFromMessage;

  if (!userPrompt) {
    return res.status(400).json({ error: 'A prompt is required.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.json({
      reply: buildFallbackReply(userPrompt, knowledgeBase),
      source: 'fallback',
      warning: 'GROQ_API_KEY is not configured.'
    });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente corporativo da CM Arte & Presentes (CM Gift Shop). Responda estritamente com base na Base de Conhecimento fornecida. Se não houver informação suficiente no contexto, diga explicitamente que não possui informação suficiente e não invente detalhes.\n\nBase de Conhecimento:\n${knowledgeBase}`
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta.';
    return res.json({ reply, source: 'groq' });
  } catch (error) {
    console.error('Groq request failed:', error);
    return res.json({
      reply: buildFallbackReply(userPrompt, knowledgeBase),
      source: 'fallback',
      warning: error.message || 'Groq request failed.'
    });
  }
}

function buildFallbackReply(userPrompt, fullKnowledgeBase) {
  const lowerPrompt = userPrompt.toLowerCase();

  if (lowerPrompt.includes('turno') || lowerPrompt.includes('horas') || lowerPrompt.includes('trabalho')) {
    return 'O turno de trabalho dos funcionários é de 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).';
  }

  if (lowerPrompt.includes('horário') || lowerPrompt.includes('horario') || lowerPrompt.includes('aberto') || lowerPrompt.includes('funcionamento') || lowerPrompt.includes('domingo') || lowerPrompt.includes('sábado') || lowerPrompt.includes('segunda')) {
    return 'Horário de atendimento ao público (porta aberta): Domingo 09:00-14:00; Segunda 09:00-18:00; Terça 09:00-20:00; Quarta 09:00-20:00; Quinta 09:00-20:00; Sexta 09:00-20:00; Sábado 09:00-20:00. Observação: este horário é de atendimento ao público e é diferente da escala interna de produção (4,5h em dias úteis e 6h no fim de semana).';
  }

  if (lowerPrompt.includes('whatsapp') || lowerPrompt.includes('telefone') || lowerPrompt.includes('contato') || lowerPrompt.includes('endereço') || lowerPrompt.includes('endereco') || lowerPrompt.includes('localização') || lowerPrompt.includes('localizacao')) {
    return 'Contato da loja: WhatsApp/Telefone +55 12 99127-5399. Endereço: Av. Amador Bueno da Veiga, 2040 - Jardim Jaragua, Taubaté - SP, 12062-400, Brasil.';
  }

  if (lowerPrompt.includes('catálogo') || lowerPrompt.includes('catalogo') || lowerPrompt.includes('vende') || lowerPrompt.includes('produto') || lowerPrompt.includes('roupa') || lowerPrompt.includes('brinquedo') || lowerPrompt.includes('maquiagem')) {
    return 'Além de personalizações, a loja também vende roupas infantis e adultas, acessórios, maquiagens e variedade de brinquedos, além de estamparia de canecas e camisetas.';
  }

  if (lowerPrompt.includes('sublima') || lowerPrompt.includes('caneca') || lowerPrompt.includes('ceram') || lowerPrompt.includes('shrink')) {
    return 'Para sublimação padrão em canecas e cerâmicas, a temperatura e tempo ideal é de 180°C por 180 segundos. Para problemas com encolhimento de shrink film, ajuste a compressão e a distribuição térmica no forno.';
  }

  if (lowerPrompt.includes('3d') || lowerPrompt.includes('impress') || lowerPrompt.includes('ader') || lowerPrompt.includes('bambu')) {
    return 'Para problemas de aderência na primeira camada nas impressoras Bambu Lab A1 e A1 Mini, lave a chapa PEI com detergente neutro, seque bem e rode a calibração automática de nivelamento no Bambu Studio.';
  }

  if (lowerPrompt.includes('preço') || lowerPrompt.includes('valor') || lowerPrompt.includes('orcamento') || lowerPrompt.includes('orçamento') || lowerPrompt.includes('markup') || lowerPrompt.includes('filamento')) {
    return 'Para precificação de peças 3D na CM Store, use esta ordem: 1) Material = (peso em g ÷ 1000) × R$ 70,00/kg. 2) Energia = tempo em horas × 0,11 × R$ 1,05. 3) Custo Base = Material + Energia. 4) Manutenção = Custo Base × 0,05. 5) Custo Total = Custo Base + Manutenção. 6) Preço Final = Custo Total × 4. Exemplo (100g e 2h): Material R$ 7,00; Energia R$ 0,23; Manutenção R$ 0,36; Custo Total R$ 7,59; Preço de Venda R$ 30,36.';
  }

  return fullKnowledgeBase;
}

app.post('/api/chat', handleChat);
app.post('/api/ask', handleChat);

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
