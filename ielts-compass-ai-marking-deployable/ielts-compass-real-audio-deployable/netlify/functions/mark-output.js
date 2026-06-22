const { callConfiguredAI } = require('../../api/ai-marker-core');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Only POST is allowed.' }) };
  const body = JSON.parse(event.body || '{}');
  const { type = 'Writing Task 2', prompt = '', answer = '' } = body;
  if (!answer || answer.trim().length < 20) return { statusCode: 400, body: JSON.stringify({ error: '请先输入更完整的作文或口语答案。' }) };
  try {
    const result = await callConfiguredAI({ type, prompt, answer });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message || 'AI marking failed.' }) };
  }
};
