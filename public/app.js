const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chips = document.querySelectorAll('.chip');

function addBubble(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function addThinkingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble assistant thinking';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  messages.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  addBubble(prompt, 'user');
  input.value = '';
  const thinkingBubble = addThinkingBubble();
  sendBtn.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const payload = await response.json();
    thinkingBubble.remove();
    if (!response.ok) {
      addBubble(payload.error || 'Não consegui responder.', 'assistant');
      return;
    }
    addBubble(payload.reply || 'Não consegui responder.', 'assistant');
  } catch (error) {
    thinkingBubble.remove();
    addBubble('Erro ao contactar o servidor.', 'assistant');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

newChatBtn.addEventListener('click', () => {
  messages.innerHTML = '';
  input.focus();
});

for (const chip of chips) {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.prompt || '';
    input.focus();
  });
}
