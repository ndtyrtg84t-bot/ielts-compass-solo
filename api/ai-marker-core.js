function buildPrompt({ type, prompt, answer }) {
  const isSpeaking = /Speaking/i.test(type || '');
  return `你是一名严格但鼓励学生的 IELTS ${isSpeaking ? 'Speaking' : 'Writing'} 考官。请用中文批改，并按 IELTS 评分维度给出具体、可执行的建议。\n\n练习类型：${type}\n题目：${prompt}\n学生答案：\n${answer}\n\n请用 Markdown 返回：\n1. 预估分数\n2. 四项评分\n3. 主要问题\n4. 逐句/逐段修改建议\n5. 高分表达替换\n6. 可直接背诵的升级版答案\n7. 下一次训练任务\n\n如果是口语文字稿，不要假装听到了发音；Pronunciation 写“暂不评分”。`;
}

function localFallback({ type, prompt, answer }) {
  const words = (answer.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
  const isSpeaking = /Speaking/i.test(type || '');
  const band = words >= 260 ? '6.5–7.0' : words >= 160 ? '6.0–6.5' : '5.5–6.0';
  return `## 预估分数\nBand ${band}\n\n## 四项评分\n- ${isSpeaking ? 'Fluency and Coherence' : 'Task Response'}：需要结合题目展开更具体的例子。\n- Coherence and Cohesion：段落结构基本清楚，但衔接可以更自然。\n- Lexical Resource：建议替换重复词，并增加更精准的 IELTS 表达。\n- ${isSpeaking ? 'Pronunciation' : 'Grammar Range and Accuracy'}：${isSpeaking ? '仅凭文字稿暂不评分。' : '复杂句可以更多样，注意主谓一致和从句边界。'}\n\n## 主要问题\n- 当前答案约 ${words} 个英文词，内容已经可以批改，但论证还可以更具体。\n- 建议每个主体段加入一个清晰例子，避免只写抽象观点。\n- 连接词不要只依赖 firstly / secondly，可以改用 more importantly, as a result, this means that。\n\n## 高分表达替换\n- important → significant / essential / far-reaching\n- good → beneficial / effective / constructive\n- bad → harmful / counterproductive / problematic\n\n## 下一次训练任务\n1. 重写开头段，让立场更明确。\n2. 给每个主体段补一个具体例子。\n3. 从本次答案里挑 5 句改成更自然的英文。\n\n> 当前是本地规则反馈。要启用真正 AI 批改，请在部署平台配置 AI_MARKING_ENDPOINT 和 AI_API_KEY。`;
}

async function callConfiguredAI({ type, prompt, answer }) {
  const endpoint = process.env.AI_MARKING_ENDPOINT;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'default';
  if (!endpoint || !apiKey) return { configured: false, feedback: localFallback({ type, prompt, answer }) };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, prompt: buildPrompt({ type, prompt, answer }), type, question: prompt, answer })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || 'AI provider request failed.');
  return { configured: true, feedback: data.feedback || data.result || data.text || data.choices?.[0]?.message?.content || 'AI 已响应，但没有返回可显示的批改文本。' };
}

module.exports = { callConfiguredAI };
