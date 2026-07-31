const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');

test('POST /api/ask returns a grounded fallback response without LLM configuration', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));
    const response = await fetch(`http://127.0.0.1:${port}/api/ask`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Qual é o turno de trabalho?' })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.source, 'fallback');
    assert.match(body.reply, /turno|4 horas|sábado|domingo/i);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
