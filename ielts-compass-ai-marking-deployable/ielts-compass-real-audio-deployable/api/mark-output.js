const { callConfiguredAI } = require('./ai-marker-core');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Only POST is allowed.' });
  }
  const { type = 'Writing Task 2', prompt = '', answer = '' } = req.body || {};
  if (!answer || answer.trim().length < 20) return res.status(400).json({ error: '请先输入更完整的作文或口语答案。' });
  try {
    const result = await callConfiguredAI({ type, prompt, answer });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'AI marking failed.' });
  }
};
