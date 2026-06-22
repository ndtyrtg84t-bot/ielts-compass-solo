const DB_NAME = 'ielts-compass-solo-db';
const DB_VERSION = 1;
const STORE = 'state';
const STATE_KEY = 'main';

const MEMORY_STEPS = [0, 1, 3, 7, 15, 30];
const coreWords = (window.IELTS_WORD_BANK && window.IELTS_WORD_BANK.length ? window.IELTS_WORD_BANK : [
  { word: 'allocate', meaning: '分配；拨出', example: 'Governments should allocate more funding to public transport.' },
  { word: 'significant', meaning: '显著的；重要的', example: 'There was a significant increase in overseas student numbers.' },
  { word: 'consistent', meaning: '持续一致的', example: 'Consistent practice makes weaknesses visible earlier.' },
  { word: 'maintain', meaning: '维持；保持', example: 'Cities must maintain a balance between growth and sustainability.' },
  { word: 'beneficial', meaning: '有益的', example: 'Regular feedback is beneficial for IELTS writing improvement.' },
  { word: 'constraint', meaning: '限制；约束', example: 'Time is a major constraint during the reading test.' },
  { word: 'evidence', meaning: '证据', example: 'A strong essay needs clear evidence and explanation.' },
  { word: 'approach', meaning: '方法；处理方式', example: 'A strategic approach can reduce repeated mistakes.' },
  { word: 'indicate', meaning: '表明；显示', example: 'The figures indicate a steady rise after 2015.' },
  { word: 'priority', meaning: '优先事项', example: 'Vocabulary review should be a daily priority.' }
]);
const fullTests = window.IELTS_FULL_TESTS || [];
const AI_ENDPOINTS = ['./api/mark-output', '/.netlify/functions/mark-output'];

const questionSets = {
  reading: {
    module: 'Reading',
    title: 'Micro-habits and Exam Performance',
    passage: `A small group of language learners were asked to replace long, irregular study sessions with short daily routines. Instead of studying for five hours once a week, they completed twenty-five minutes of focused practice each evening. After eight weeks, most learners reported that they felt less anxious before practice tests. Their scores did not rise dramatically in every skill, but their error logs became more detailed and their ability to explain mistakes improved. The tutor concluded that consistency did not magically create high scores; rather, it made weaknesses visible early enough to be corrected.`,
    questions: [
      { id: 'r1', type: 'Main idea', text: 'What is the main point of the passage?', options: ['Long weekly sessions are the fastest route to a high score.', 'Short daily routines can reveal weaknesses and support correction.', 'Anxiety disappears when learners stop taking practice tests.', 'Tutors should avoid asking learners to keep error logs.'], answer: 1, explanation: '文章强调短时、持续练习让问题更早暴露，并帮助纠正，而不是强调神奇提分。' },
      { id: 'r2', type: 'Detail', text: 'What changed most clearly after eight weeks?', options: ['Every skill score rose dramatically.', 'Learners stopped making mistakes.', 'Error logs became more detailed.', 'Practice tests were removed.'], answer: 2, explanation: '原文直接说 error logs became more detailed。' },
      { id: 'r3', type: 'Inference', text: 'What would the tutor probably recommend next?', options: ['Only study at weekends.', 'Ignore mistakes if the score improves.', 'Use daily practice plus regular mistake review.', 'Focus only on vocabulary lists.'], answer: 2, explanation: '结论强调 consistency + weaknesses visible + corrected，因此下一步应继续日常练习并复盘错题。' }
    ]
  },
  listening: {
    module: 'Listening',
    title: 'Library Study Room Booking',
    passage: `Audio script: A student calls the campus library to book a study room. The assistant explains that rooms on the second floor are quiet rooms for individual study, while rooms on the fourth floor are for group discussion. The student first asks for Friday morning, but the assistant says only Friday afternoon is available. The student books Room 4B from 2:00 to 4:00 p.m. and is reminded to bring a student card.`,
    questions: [
      { id: 'l1', type: 'Location', text: 'Which floor is used for group discussion rooms?', options: ['First floor', 'Second floor', 'Fourth floor', 'Fifth floor'], answer: 2, explanation: '录音脚本说明 fourth floor 是 group discussion。' },
      { id: 'l2', type: 'Time', text: 'When does the student book the room?', options: ['Friday morning', 'Friday 12:00–2:00', 'Friday 2:00–4:00 p.m.', 'Saturday afternoon'], answer: 2, explanation: '最终预订时间是 Friday 2:00 to 4:00 p.m.。' },
      { id: 'l3', type: 'Detail', text: 'What must the student bring?', options: ['A passport', 'A student card', 'A printed receipt', 'A laptop charger'], answer: 1, explanation: '最后提醒 bring a student card。' }
    ]
  },
  vocabulary: {
    module: 'Vocabulary',
    title: 'Band 7 Useful Paraphrases',
    passage: `Choose the best academic paraphrase. These items train the kind of synonym awareness needed in IELTS Reading, Writing and Listening.`,
    questions: [
      { id: 'v1', type: 'Paraphrase', text: 'Which phrase best matches “a significant increase”?', options: ['a minor fall', 'a noticeable rise', 'a stable trend', 'an unclear result'], answer: 1, explanation: 'significant increase 可替换为 noticeable rise。' },
      { id: 'v2', type: 'Paraphrase', text: 'Which word is closest to “allocate”?', options: ['distribute', 'ignore', 'predict', 'remove'], answer: 0, explanation: 'allocate 表示分配，可替换为 distribute。' },
      { id: 'v3', type: 'Paraphrase', text: 'Which phrase is most suitable for academic writing?', options: ['kids are super into phones', 'children increasingly use mobile devices', 'phones are kinda everywhere', 'children like stuff online'], answer: 1, explanation: '该表达更正式、具体，适合 IELTS Writing。' }
    ]
  }
};

const outputPrompts = [
  { type: 'Writing Task 2', prompt: 'Some people think students should focus on practical skills, while others believe academic subjects are more important. Discuss both views and give your opinion.', hint: '自查：观点是否明确？两方是否平衡？每段是否有解释和例子？' },
  { type: 'Writing Task 1', prompt: 'The chart shows changes in the number of international students in three countries from 2010 to 2020. Summarise the main features and make comparisons.', hint: '自查：概述句是否覆盖最大趋势？是否有关键数据比较？' },
  { type: 'Speaking Part 2', prompt: 'Describe a time when you learned something difficult. You should say what it was, how you learned it, why it was difficult, and how you felt afterwards.', hint: '自查：是否有具体情节？是否使用过去时？是否能讲满 1.5–2 分钟？' },
  { type: 'Speaking Part 3', prompt: 'Do you think online learning will replace traditional classrooms in the future?', hint: '自查：先直接回答，再解释原因，最后补充限制或例子。' }
];

const highScoreResources = [
  { id: crypto.randomUUID(), name: 'IELTS 官方备考资源', type: '官方', level: '必用', url: 'https://ielts.org/take-a-test/preparation-resources', note: '官方样题、写作评分说明、课程、App、讲座、视频和书籍入口。' },
  { id: crypto.randomUUID(), name: 'British Council 免费练习题', type: '刷题', level: '必用', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests', note: '覆盖听说读写的 Academic 与 General Training 样题。' },
  { id: crypto.randomUUID(), name: 'IDP IELTS Prepare Hub', type: '官方', level: '必用', url: 'https://ielts.idp.com/prepare', note: '含练习题、机考熟悉题、文章、视频、播客和自测工具。' },
  { id: crypto.randomUUID(), name: 'Cambridge English IELTS Preparation', type: '官方', level: '必用', url: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/', note: '剑桥备考指南、样题和官方练习材料入口。' },
  { id: crypto.randomUUID(), name: 'IELTS Liz', type: '写作', level: '高分策略', url: 'https://ieltsliz.com', note: '技巧、话题、范文和题型讲解。' },
  { id: crypto.randomUUID(), name: 'IELTS Advantage', type: '写作', level: '高分策略', url: 'https://www.ieltsadvantage.com', note: '写作、口语反馈、评分标准和备考路径。' },
  { id: crypto.randomUUID(), name: 'Cambridge Dictionary', type: '词汇', level: '长期使用', url: 'https://dictionary.cambridge.org/', note: '查词、例句、同义表达和发音。' },
  { id: crypto.randomUUID(), name: 'IELTS Online Tests', type: '刷题', level: '大量题库', url: 'https://ieltsonlinetests.com/', note: '大量在线 IELTS practice tests，可作为外部刷题库补充。' },
  { id: crypto.randomUUID(), name: 'IELTS.org Sample Questions', type: '官方', level: '官方样题', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions', note: '官方 IELTS sample test questions。' },
  { id: crypto.randomUUID(), name: 'British Council Listening Practice', type: '听力', level: '官方听力', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/listening', note: 'British Council 免费听力练习。' },
  { id: crypto.randomUUID(), name: 'IELTS Buddy', type: '刷题', level: '补充练习', url: 'https://www.ieltsbuddy.com/', note: '覆盖写作、口语、听力、阅读、词汇和练习题。' }
];

const templateTasks = [
  { title: '系统内刷题：阅读/听力/词汇任选 1 组', module: '刷题', minutes: 30 },
  { title: '错题本二刷：至少 5 道错题', module: '复盘', minutes: 25 },
  { title: '写作或口语输出：保存 1 条记录', module: '写作', minutes: 45 },
  { title: '外部官方材料限时训练', module: '模考', minutes: 50 }
];

const defaultState = {
  user: null,
  target: { overall: 7.0, listening: 7.5, reading: 7.5, writing: 6.5, speaking: 6.5, examDate: nextExamDate() },
  resources: highScoreResources,
  tasks: templateTasks.map(task => ({ ...task, id: crypto.randomUUID(), done: false })),
  checkins: seedCheckins(),
  review: { wins: '', blockers: '', next: '' },
  reminder: { enabled: false, time: '20:30', text: '该交今日雅思打卡了：刷题 + 错题 + 输出记录' },
  practice: { attempts: [], wrongbook: [], currentSet: 'reading', currentIndex: 0 },
  mock: { attempts: [], currentTestId: fullTests[0]?.id || '', answers: {}, startedAt: null, remaining: 0, audioNames: {}, audioUrls: {}, audioRates: {} },
  vocab: coreWords.slice(0, 6).map(createWordCard),
  outputs: [],
  aiFeedback: null
};

let db, state = structuredClone(defaultState);
let timerSeconds = 45 * 60, timerTotal = 45 * 60, timerInterval = null;
let practiceSeconds = 0, practiceInterval = null, selectedAnswer = null, currentPromptIndex = 0, reminderInterval = null, mockInterval = null, deferredInstallPrompt = null, scribbleReady = false;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

init();
async function init() { db = await openDB(); $('#dbStatus').textContent = 'IndexedDB 已连接'; const saved = await getState(); state = saved ? mergeState(saved) : structuredClone(defaultState); bindEvents(); render(); startReminderLoop(); }
function openDB() { return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = e => { const database = e.target.result; if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
function getState() { return new Promise(resolve => { const tx = db.transaction(STORE, 'readonly'); const request = tx.objectStore(STORE).get(STATE_KEY); request.onsuccess = () => resolve(request.result || null); request.onerror = () => resolve(null); }); }
function saveState() { return new Promise(resolve => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(state, STATE_KEY); tx.oncomplete = () => resolve(); }); }
function mergeState(saved) { return { ...structuredClone(defaultState), ...saved, target: { ...defaultState.target, ...(saved.target || {}) }, reminder: { ...defaultState.reminder, ...(saved.reminder || {}) }, review: { ...defaultState.review, ...(saved.review || {}) }, practice: { ...defaultState.practice, ...(saved.practice || {}) }, mock: { ...defaultState.mock, ...(saved.mock || {}) }, vocab: saved.vocab?.length ? saved.vocab : defaultState.vocab, resources: saved.resources?.length ? saved.resources : highScoreResources, tasks: saved.tasks?.length ? saved.tasks : defaultState.tasks, checkins: saved.checkins?.length ? saved.checkins : defaultState.checkins, outputs: saved.outputs || [], aiFeedback: saved.aiFeedback || null }; }
function bindEvents() {
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); login({ name: $('#loginName').value.trim(), email: $('#loginEmail').value.trim(), band: Number($('#loginBand').value), examDate: $('#loginExam').value }); });
  $('#demoLogin').addEventListener('click', () => login({ name: 'Solo Runner', email: 'solo@ielts.local', band: 7.5, examDate: nextExamDate() }));
  $('#logoutBtn').addEventListener('click', async () => { state.user = null; await saveState(); render(); });
  $('#mobileMenuBtn').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
  $$('.sidebar a').forEach(a => a.addEventListener('click', () => $('.sidebar').classList.remove('open')));
  $$('[data-practice]').forEach(btn => btn.addEventListener('click', () => switchPractice(btn.dataset.practice)));
  $('#startPracticeBtn').addEventListener('click', togglePracticeTimer); $('#resetPracticeBtn').addEventListener('click', resetPractice); $('#submitAnswerBtn').addEventListener('click', submitAnswer); $('#nextQuestionBtn').addEventListener('click', nextQuestion); $('#clearMasteredBtn').addEventListener('click', clearMastered);
  $('#startMockBtn').addEventListener('click', startMock); $('#submitMockBtn').addEventListener('click', submitMock); $('#mockSelect').addEventListener('change', async () => { state.mock.currentTestId = $('#mockSelect').value; state.mock.answers = {}; state.mock.startedAt = null; state.mock.remaining = 0; await saveState(); renderMock(); }); document.addEventListener('change', handleMockAudioChange); document.addEventListener('click', handleMockAudioClick);
  $('#newPromptBtn').addEventListener('click', () => { currentPromptIndex = (currentPromptIndex + 1) % outputPrompts.length; renderOutputPrompt(); });
  $('#wordForm').addEventListener('submit', addWord);
  $('#seedWordsBtn').addEventListener('click', seedMoreWords);
  $('#clearScribbleBtn').addEventListener('click', clearScribblePad);
  $('#forgotWordBtn').addEventListener('click', () => reviewWord(false));
  $('#knowWordBtn').addEventListener('click', () => reviewWord(true));
  $('#installBtn').addEventListener('click', installApp);
  $('#outputMode').addEventListener('change', renderOutputPromptByMode); $('#outputText').addEventListener('input', updateWordCount); $('#outputForm').addEventListener('submit', saveOutput); $('#aiMarkBtn')?.addEventListener('click', markOutputWithAI); $('#aiMarkBtn').addEventListener('click', () => requestAIReview('mark')); $('#aiPolishBtn').addEventListener('click', () => requestAIReview('polish'));
  $('#resourceForm').addEventListener('submit', addResource); $('#taskForm').addEventListener('submit', addTask); $('#loadTemplateBtn').addEventListener('click', async () => { state.tasks = templateTasks.map(t => ({ ...t, id: crypto.randomUUID(), done: false })); await saveState(); renderTasks(); });
  $$('.timer-controls [data-minutes]').forEach(b => b.addEventListener('click', () => setTimer(Number(b.dataset.minutes)))); $('#startTimerBtn').addEventListener('click', toggleTimer); $('#resetTimerBtn').addEventListener('click', () => setTimer(Math.round(timerTotal / 60))); $('#enableReminderBtn').addEventListener('click', enableReminder); $('#checkinForm').addEventListener('submit', submitCheckin);
  $$('[data-review]').forEach(t => t.addEventListener('input', async () => { state.review[t.dataset.review] = t.value; await saveState(); })); $('#exportBtn').addEventListener('click', exportJSON); $('#importInput').addEventListener('change', importJSON);
}
async function login(profile) { state.user = { name: profile.name, email: profile.email, createdAt: new Date().toISOString() }; state.target.overall = profile.band; state.target.examDate = profile.examDate || nextExamDate(); await saveState(); render(); }
function render() { $('#authScreen').classList.toggle('hidden', Boolean(state.user)); $('#app').classList.toggle('hidden', !state.user); $('#loginExam').value = state.target.examDate || nextExamDate(); if (!state.user) return; renderUser(); renderMetrics(); renderPractice(); renderMockSelect(); renderMock(); renderVocab(); renderWrongbook(); renderOutputs(); renderOutputPrompt(); renderAIFeedback(); renderResources(); renderTasks(); renderHeatmap(); renderReview(); renderReminder(); renderTimer(); setupScribblePad(); registerServiceWorker(); }
function renderUser() { $('#userName').textContent = state.user.name; $('#userEmail').textContent = `${state.user.email} · 单人本地版`; $('#userInitial').textContent = state.user.name.slice(0, 1).toUpperCase(); }
function renderMetrics() { const attempts = state.practice.attempts || []; const correct = attempts.filter(a => a.correct).length; const accuracy = attempts.length ? Math.round(correct / attempts.length * 100) : 0; $('#accuracyRate').textContent = `${accuracy}%`; $('#accuracyBar').style.width = `${accuracy}%`; $('#wrongCount').textContent = (state.practice.wrongbook || []).filter(w => !w.mastered).length; $('#dueWordCount').textContent = getDueWords().length; $('#daysLeft').textContent = Math.max(0, Math.ceil((new Date(state.target.examDate) - startOfDay(new Date())) / 86400000)); $('#weeklyMinutes').textContent = recentCheckins(7).reduce((s, i) => s + Number(i.minutes || 0), 0); }
function switchPractice(set) { state.practice.currentSet = set; state.practice.currentIndex = 0; selectedAnswer = null; $$('.chip[data-practice]').forEach(c => c.classList.toggle('active', c.dataset.practice === set)); resetPractice(false); renderPractice(); }
function renderPractice() { const set = questionSets[state.practice.currentSet]; const q = set.questions[state.practice.currentIndex]; $('#practiceModule').textContent = set.module; $('#practiceTitle').textContent = set.title; $('#practicePassage').textContent = set.passage; $('#questionIndex').textContent = `${state.practice.currentIndex + 1} / ${set.questions.length}`; $('#questionType').textContent = q.type; $('#questionText').textContent = q.text; $('#answerFeedback').innerHTML = ''; selectedAnswer = null; const list = $('#optionList'); list.innerHTML = ''; q.options.forEach((option, index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'option-button'; button.textContent = `${String.fromCharCode(65 + index)}. ${option}`; button.addEventListener('click', () => { selectedAnswer = index; $$('.option-button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); }); list.appendChild(button); }); renderPracticeTimer(); }
async function submitAnswer() { if (selectedAnswer === null) { $('#answerFeedback').innerHTML = '<p class="warn">请先选择一个答案。</p>'; return; } const set = questionSets[state.practice.currentSet]; const q = set.questions[state.practice.currentIndex]; const correct = selectedAnswer === q.answer; const attempt = { id: crypto.randomUUID(), date: toDateKey(new Date()), set: state.practice.currentSet, questionId: q.id, question: q.text, selected: q.options[selectedAnswer], answer: q.options[q.answer], explanation: q.explanation, correct }; state.practice.attempts.push(attempt); if (!correct && !state.practice.wrongbook.some(w => w.questionId === q.id && !w.mastered)) state.practice.wrongbook.unshift({ ...attempt, mastered: false }); await saveState(); $('#answerFeedback').innerHTML = `<p class="${correct ? 'ok' : 'bad'}">${correct ? '回答正确' : `回答错误，正确答案：${q.options[q.answer]}`}</p><p>${q.explanation}</p>`; renderMetrics(); renderWrongbook(); }
function nextQuestion() { const set = questionSets[state.practice.currentSet]; state.practice.currentIndex = (state.practice.currentIndex + 1) % set.questions.length; selectedAnswer = null; renderPractice(); }
function togglePracticeTimer() { if (practiceInterval) { clearInterval(practiceInterval); practiceInterval = null; return; } practiceInterval = setInterval(() => { practiceSeconds += 1; renderPracticeTimer(); }, 1000); }
function resetPractice(renderNow = true) { clearInterval(practiceInterval); practiceInterval = null; practiceSeconds = 0; if (renderNow) renderPractice(); else renderPracticeTimer(); }
function renderPracticeTimer() { $('#practiceTimer').textContent = formatSeconds(practiceSeconds); }
function renderWrongbook() { const list = $('#wrongbookList'); const wrongs = (state.practice.wrongbook || []).filter(w => !w.mastered); list.innerHTML = ''; if (!wrongs.length) { list.innerHTML = '<p class="empty">暂无错题。刷题答错后会自动进入这里。</p>'; return; } const template = $('#wrongTemplate'); wrongs.forEach(item => { const node = template.content.firstElementChild.cloneNode(true); node.querySelector('span').textContent = item.set; node.querySelector('small').textContent = item.date; node.querySelector('h3').textContent = item.question; node.querySelector('p').textContent = `你的答案：${item.selected}；正确答案：${item.answer}`; node.querySelector('strong').textContent = item.explanation; node.querySelector('button').addEventListener('click', async () => { item.mastered = true; await saveState(); renderWrongbook(); renderMetrics(); }); list.appendChild(node); }); }


function renderMockSelect() { const select = $('#mockSelect'); if (!select || select.options.length) return; fullTests.forEach(test => { const option = document.createElement('option'); option.value = test.id; option.textContent = test.title; select.appendChild(option); }); if (!state.mock.currentTestId && fullTests[0]) state.mock.currentTestId = fullTests[0].id; select.value = state.mock.currentTestId; }
function currentMock() { return fullTests.find(test => test.id === state.mock.currentTestId) || fullTests[0]; }
function renderMock() { const test = currentMock(); const area = $('#mockArea'); if (!test) { area.innerHTML = '<p class="empty">暂无模拟题。</p>'; return; } $('#mockTimer').textContent = state.mock.remaining ? formatSeconds(state.mock.remaining) : `${test.minutes}:00`; area.innerHTML = `${renderListeningSection(test)}${renderReadingSection(test)}`; area.querySelectorAll('[data-mock-q]').forEach(input => { const key = input.dataset.mockQ; input.checked = state.mock.answers[key] === Number(input.value); input.addEventListener('change', async () => { state.mock.answers[key] = Number(input.value); await saveState(); }); }); }
function renderListeningSection(test) {
  const uploadedUrl = state.mock.audioUrls?.[test.id] || '';
  const uploadedName = state.mock.audioNames?.[test.id] || '';
  const rate = state.mock.audioRates?.[test.id] || '1';
  return `<article class="mock-section listening-real"><div class="mock-section-head"><span>Listening</span><a class="source-link" href="https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/listening" target="_blank" rel="noopener noreferrer">官方听力入口</a></div><h3>${escapeHTML(test.listening.title)}</h3><div class="real-audio-card"><div><strong>用真实音频练这一套</strong><p>上传你自己合法拥有的 MP3 / M4A / WAV。系统只在当前浏览器播放，不会上传到服务器。</p></div><label class="file-import audio-upload">上传音频<input data-audio-upload="${test.id}" type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/ogg"></label>${uploadedUrl ? `<audio id="mockAudioPlayer" controls preload="metadata" src="${uploadedUrl}"></audio><div class="audio-meta"><span>${escapeHTML(uploadedName || '已加载本地音频')}</span><label>速度<select id="audioRateSelect" data-audio-rate="${test.id}"><option value="0.75" ${rate === '0.75' ? 'selected' : ''}>0.75x</option><option value="0.9" ${rate === '0.9' ? 'selected' : ''}>0.9x</option><option value="1" ${rate === '1' ? 'selected' : ''}>1x</option><option value="1.15" ${rate === '1.15' ? 'selected' : ''}>1.15x</option></select></label><button class="text-btn" type="button" data-clear-audio="${test.id}">移除音频</button></div>` : `<p class="empty audio-empty">还没有上传真实音频。你可以先打开官方听力入口练习，或上传自己已有的音频文件。</p>`}</div><details class="script-details"><summary>备用：查看脚本 / 机器朗读</summary><p class="audio-script">${escapeHTML(test.listening.script)}</p><button type="button" class="ghost-btn" onclick="speakMockScript()">备用朗读脚本</button></details>${renderMockQuestions(test.listening.questions)}</article>`;
}
function renderReadingSection(test) { return `<article class="mock-section"><div class="mock-section-head"><span>Reading</span></div><h3>${escapeHTML(test.reading.title)}</h3><p>${escapeHTML(test.reading.passage)}</p>${renderMockQuestions(test.reading.questions)}</article>`; }
function renderMockQuestions(questions) { return questions.map(q => `<div class="mock-question"><strong>${escapeHTML(q.text)}</strong>${q.options.map((opt, index) => `<label><input type="radio" name="${q.id}" data-mock-q="${q.id}" value="${index}"> ${String.fromCharCode(65 + index)}. ${escapeHTML(opt)}</label>`).join('')}</div>`).join(''); }

async function handleMockAudioChange(event) {
  const fileInput = event.target.closest('[data-audio-upload]');
  const rateSelect = event.target.closest('[data-audio-rate]');
  if (fileInput) {
    const testId = fileInput.dataset.audioUpload;
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { alert('请上传 MP3、M4A、WAV 等音频文件。'); return; }
    if (!state.mock.audioUrls) state.mock.audioUrls = {};
    if (!state.mock.audioNames) state.mock.audioNames = {};
    const previous = state.mock.audioUrls[testId];
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
    state.mock.audioUrls[testId] = URL.createObjectURL(file);
    state.mock.audioNames[testId] = file.name;
    await saveState();
    renderMock();
    const audio = $('#mockAudioPlayer');
    if (audio) audio.playbackRate = Number(state.mock.audioRates?.[testId] || 1);
  }
  if (rateSelect) {
    const testId = rateSelect.dataset.audioRate;
    if (!state.mock.audioRates) state.mock.audioRates = {};
    state.mock.audioRates[testId] = rateSelect.value;
    const audio = $('#mockAudioPlayer');
    if (audio) audio.playbackRate = Number(rateSelect.value);
    await saveState();
  }
}
async function handleMockAudioClick(event) {
  const clear = event.target.closest('[data-clear-audio]');
  if (!clear) return;
  const testId = clear.dataset.clearAudio;
  const previous = state.mock.audioUrls?.[testId];
  if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
  delete state.mock.audioUrls?.[testId];
  delete state.mock.audioNames?.[testId];
  await saveState();
  renderMock();
}

window.speakMockScript = function speakMockScript() { const test = currentMock(); if (!('speechSynthesis' in window) || !test) { alert('当前浏览器不支持语音播放。'); return; } speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(test.listening.script.replace('Audio script:', '')); utterance.lang = 'en-US'; utterance.rate = 0.86; speechSynthesis.speak(utterance); };
async function startMock() { const test = currentMock(); if (!test) return; state.mock.answers = {}; state.mock.startedAt = new Date().toISOString(); state.mock.remaining = test.minutes * 60; clearInterval(mockInterval); mockInterval = setInterval(() => { state.mock.remaining = Math.max(0, state.mock.remaining - 1); $('#mockTimer').textContent = formatSeconds(state.mock.remaining); if (state.mock.remaining === 0) submitMock(); }, 1000); await saveState(); renderMock(); $('#mockResult').innerHTML = '<p class="empty">考试已开始。请按真实考试状态完成听力和阅读。</p>'; }
async function submitMock() { const test = currentMock(); if (!test) return; clearInterval(mockInterval); mockInterval = null; const all = [...test.listening.questions, ...test.reading.questions]; let correct = 0; const details = all.map(q => { const chosen = state.mock.answers[q.id]; const ok = chosen === q.answer; if (ok) correct += 1; return `<li class="${ok ? 'ok' : 'bad'}"><strong>${escapeHTML(q.text)}</strong><br>你的答案：${chosen === undefined ? '未作答' : escapeHTML(q.options[chosen])}；正确答案：${escapeHTML(q.options[q.answer])}<br>${escapeHTML(q.explanation)}</li>`; }).join(''); const score = Math.round(correct / all.length * 100); state.mock.attempts.unshift({ id: crypto.randomUUID(), date: new Date().toLocaleString(), testId: test.id, correct, total: all.length, score }); await saveState(); $('#mockResult').innerHTML = `<h3>自动判分：${correct}/${all.length} · ${score}%</h3><p>${estimateBand(score)}</p><ol>${details}</ol>`; }
function estimateBand(score) { if (score >= 90) return '估算表现：Band 8.0–9.0 区间。'; if (score >= 75) return '估算表现：Band 7.0–7.5 区间。'; if (score >= 60) return '估算表现：Band 6.0–6.5 区间。'; return '估算表现：Band 5.5 或以下，需要集中复盘错题。'; }
function setupScribblePad() { if (scribbleReady) return; const canvas = $('#scribbleCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#2d2118'; let drawing = false; const pos = event => { const rect = canvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; return { x: (point.clientX - rect.left) * (canvas.width / rect.width), y: (point.clientY - rect.top) * (canvas.height / rect.height) }; }; const start = event => { drawing = true; const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); event.preventDefault(); }; const move = event => { if (!drawing) return; const p = pos(event); ctx.lineTo(p.x, p.y); ctx.stroke(); event.preventDefault(); }; const end = () => { drawing = false; }; canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end); canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', end); scribbleReady = true; }
function clearScribblePad() { const canvas = $('#scribbleCanvas'); if (!canvas) return; canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); }

function createWordCard(item) { const today = toDateKey(new Date()); return { id: crypto.randomUUID(), word: item.word, meaning: item.meaning, example: item.example || '', stage: 0, due: today, correctCount: 0, missCount: 0, createdAt: today }; }
function getDueWords() { const today = toDateKey(new Date()); return (state.vocab || []).filter(w => w.due <= today); }
function currentDueWord() { return getDueWords()[0] || null; }
function renderVocab() { const due = getDueWords(); const word = due[0]; $('#wordDue').textContent = `今日待复习 ${due.length}`; if (!word) { $('#wordStage').textContent = 'Done'; $('#wordText').textContent = '今天的单词已完成'; $('#wordMeaning').textContent = '可以添加新词，或明天按记忆曲线继续复习。'; $('#wordExample').textContent = ''; } else { $('#wordStage').textContent = `第 ${word.stage + 1} 轮 · 间隔 ${MEMORY_STEPS[word.stage] || 30} 天`; $('#wordText').textContent = word.word; $('#wordMeaning').textContent = word.meaning; $('#wordExample').textContent = word.example ? `例句：${word.example}` : ''; } renderWordList(); }
async function addWord(event) { event.preventDefault(); state.vocab.unshift(createWordCard({ word: $('#newWord').value.trim(), meaning: $('#newMeaning').value.trim(), example: $('#newExample').value.trim() })); event.currentTarget.reset(); await saveState(); renderVocab(); renderMetrics(); }
async function seedMoreWords() { const existing = new Set((state.vocab || []).map(w => w.word.toLowerCase())); coreWords.filter(w => !existing.has(w.word.toLowerCase())).forEach(w => state.vocab.push(createWordCard(w))); await saveState(); renderVocab(); renderMetrics(); }
async function reviewWord(known) { const word = currentDueWord(); if (!word) return; if (known) { word.correctCount += 1; word.stage = Math.min(word.stage + 1, MEMORY_STEPS.length - 1); } else { word.missCount += 1; word.stage = 1; } const next = new Date(); next.setDate(next.getDate() + (known ? MEMORY_STEPS[word.stage] : 1)); word.due = toDateKey(next); await saveState(); renderVocab(); renderMetrics(); }
function renderWordList() { const list = $('#wordList'); const template = $('#wordTemplate'); list.innerHTML = ''; (state.vocab || []).slice().sort((a, b) => a.due.localeCompare(b.due)).slice(0, 12).forEach(word => { const node = template.content.firstElementChild.cloneNode(true); node.querySelector('strong').textContent = word.word; node.querySelector('span').textContent = word.meaning; node.querySelector('small').textContent = `下次：${word.due} · 第 ${word.stage + 1} 轮`; list.appendChild(node); }); }
function installApp() { if (window.deferredInstallPrompt) { window.deferredInstallPrompt.prompt(); return; } alert('如果浏览器没有弹出安装按钮：iPhone/iPad 用 Safari 分享 → 添加到主屏幕；Android/Chrome 用菜单 → 安装应用或添加到主屏幕。'); }
function registerServiceWorker() { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {}); }
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); window.deferredInstallPrompt = event; });

async function clearMastered() { state.practice.wrongbook = state.practice.wrongbook.filter(w => !w.mastered); await saveState(); renderWrongbook(); }
function renderOutputPromptByMode() { const mode = $('#outputMode').value; const index = outputPrompts.findIndex(p => p.type === mode); currentPromptIndex = Math.max(0, index); renderOutputPrompt(); }
function renderOutputPrompt() { const p = outputPrompts[currentPromptIndex]; $('#outputType').textContent = p.type; $('#outputPrompt').textContent = p.prompt; $('#outputHint').textContent = p.hint; $('#outputMode').value = p.type; }
function updateWordCount() { const words = ($('#outputText').value.trim().match(/[A-Za-z]+(?:'[A-Za-z]+)?|[一-龥]/g) || []).length; $('#wordCounter').textContent = `${words} words`; }

function markdownToHTML(markdown) {
  const source = escapeHTML(String(markdown || ''));
  return source
    .replace(/^### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^## (.*)$/gm, '<h3>$1</h3>')
    .replace(/^# (.*)$/gm, '<h3>$1</h3>')
    .replace(/^\d+\. (.*)$/gm, '<li>$1</li>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(?:<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[uhlp])/gm, '')
    .replace(/^(.+)$/s, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
async function requestAIMarking(payload) {
  const endpoints = ['/api/mark-output', '/.netlify/functions/mark-output'];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.status === 404) continue;
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'AI 批改接口暂时不可用。');
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('没有找到 AI 批改接口。');
}
async function markOutputWithAI() {
  const text = $('#outputText').value.trim();
  const feedback = $('#aiFeedback');
  const status = $('#aiMarkStatus');
  if (!text || text.length < 20) {
    status.textContent = '请先输入一段更完整的作文或口语答案，再进行 AI 批改。';
    status.className = 'ai-status warning';
    return;
  }
  const payload = { type: $('#outputMode').value, prompt: $('#outputPrompt').textContent, answer: text };
  status.textContent = 'AI 正在批改：评分、找问题、改表达、生成下一步训练任务…';
  status.className = 'ai-status loading';
  $('#aiMarkBtn').disabled = true;
  feedback.classList.remove('hidden');
  feedback.innerHTML = '<div class="ai-feedback-head"><span>AI Marking</span><strong>批改中</strong></div><p>正在连接安全后端接口，请稍等。</p>';
  try {
    const data = await requestAIMarking(payload);
    const result = data.feedback || data.message || '后端已响应，但没有返回批改内容。';
    feedback.innerHTML = `<div class="ai-feedback-head"><span>AI Marking</span><strong>${escapeHTML(payload.type)}</strong></div><div class="ai-feedback-body">${markdownToHTML(result)}</div>`;
    status.textContent = data.configured === false ? '接口已接通，但还没有配置真正的 AI 服务；请在部署平台添加 AI 环境变量。' : 'AI 批改完成，可以把建议保存进复盘或据此重写。';
    status.className = data.configured === false ? 'ai-status warning' : 'ai-status ok';
  } catch (error) {
    feedback.innerHTML = `<div class="ai-feedback-head"><span>AI Marking</span><strong>连接失败</strong></div><p>${escapeHTML(error.message || 'AI 批改失败，请检查部署接口和环境变量。')}</p>`;
    status.textContent = 'AI 批改失败：请确认已部署 /api/mark-output 或 Netlify Function，并配置环境变量。';
    status.className = 'ai-status warning';
  } finally {
    $('#aiMarkBtn').disabled = false;
  }
}

async function saveOutput(e) { e.preventDefault(); const text = $('#outputText').value.trim(); if (!text) return; state.outputs.unshift({ id: crypto.randomUUID(), date: new Date().toLocaleString(), type: $('#outputMode').value, prompt: $('#outputPrompt').textContent, text, words: $('#wordCounter').textContent }); $('#outputText').value = ''; updateWordCount(); await saveState(); renderOutputs(); }
function renderOutputs() { $('#outputSavedCount').textContent = `${state.outputs.length} 条记录`; const box = $('#outputHistory'); box.innerHTML = state.outputs.slice(0, 5).map(o => `<article><span>${o.type} · ${o.date} · ${o.words}</span><h3>${escapeHTML(o.prompt)}</h3><p>${escapeHTML(o.text.slice(0, 220))}${o.text.length > 220 ? '…' : ''}</p></article>`).join('') || '<p class="empty">还没有输出记录。保存一篇作文或一段口语素材后会显示在这里。</p>'; }

function currentOutputPayload(mode) { const text = $('#outputText').value.trim(); return { mode, type: $('#outputMode').value, prompt: $('#outputPrompt').textContent, text, words: $('#wordCounter').textContent, targetBand: state.target?.overall || 7 }; }
async function requestAIReview(mode = 'mark') { const payload = currentOutputPayload(mode); if (!payload.text) { showAIStatus('先写一段作文或口语文字稿，再点击 AI 批改。', 'warn'); return; } ['#aiMarkBtn', '#aiPolishBtn'].forEach(id => { const btn = $(id); if (btn) btn.disabled = true; }); showAIStatus(mode === 'polish' ? '正在生成高分改写和可复用表达...' : '正在按 IELTS 评分维度批改...', 'loading'); try { const data = await fetchAIMarking(payload); state.aiFeedback = { ...(data.feedback || data), mode, date: new Date().toLocaleString(), type: payload.type, prompt: payload.prompt }; await saveState(); renderAIFeedback(); } catch (error) { showAIStatus(`AI 批改接口还没有配置好：${error.message}。部署到 Vercel 或 Netlify 后，请在环境变量中设置 AI_API_KEY、AI_MODEL，可选设置 AI_API_BASE_URL。`, 'warn'); } finally { ['#aiMarkBtn', '#aiPolishBtn'].forEach(id => { const btn = $(id); if (btn) btn.disabled = false; }); } }
async function fetchAIMarking(payload) { let lastError = '未找到可用接口'; for (const endpoint of AI_ENDPOINTS) { try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const contentType = response.headers.get('content-type') || ''; if (response.status === 404 || !contentType.includes('application/json')) { lastError = `${endpoint} 未启用`; continue; } const data = await response.json(); if (!response.ok || data.ok === false) { lastError = data.error || data.message || `接口返回 ${response.status}`; continue; } return data; } catch (error) { lastError = error.message; } } throw new Error(lastError); }
function showAIStatus(message, tone = 'loading') { const panel = $('#aiFeedbackPanel'); if (!panel) return; panel.className = `ai-feedback-panel ${tone}`; panel.innerHTML = `<div class="ai-feedback-empty"><span>${tone === 'loading' ? 'AI marking' : 'Setup needed'}</span><p>${escapeHTML(message)}</p></div>`; }
function renderAIFeedback() { const panel = $('#aiFeedbackPanel'); if (!panel) return; const feedback = state.aiFeedback; panel.className = 'ai-feedback-panel'; if (!feedback) { panel.innerHTML = '<div class="ai-feedback-empty"><span>AI marking desk</span><h3>写完后点 AI 批改，这里会出现四项评分、逐句修改和下次训练任务。</h3><p>部署前端时把密钥放到平台环境变量，不要写进网页代码。</p></div>'; return; } const criteria = (feedback.criteria || []).map(item => `<li><strong>${escapeHTML(item.name || item.label)}</strong><span>${escapeHTML(item.score || '')}</span><p>${escapeHTML(item.comment || item.advice || '')}</p></li>`).join(''); const problems = (feedback.problems || feedback.keyProblems || []).map(item => `<li>${escapeHTML(item)}</li>`).join(''); const edits = (feedback.lineEdits || feedback.sentenceEdits || []).map(item => `<li><strong>原句：</strong>${escapeHTML(item.original || '')}<br><strong>建议：</strong>${escapeHTML(item.suggestion || '')}<br><em>${escapeHTML(item.reason || '')}</em></li>`).join(''); const vocab = (feedback.vocabulary || feedback.expressions || []).map(item => `<li>${escapeHTML(typeof item === 'string' ? item : `${item.from || ''} → ${item.to || item.expression || ''}`)}</li>`).join(''); const tasks = (feedback.nextTasks || []).map(item => `<li>${escapeHTML(item)}</li>`).join(''); panel.innerHTML = `<div class="ai-feedback-head"><span>AI marking report · ${escapeHTML(feedback.date || '')}</span><button id="saveAiToReviewBtn" class="ghost-btn" type="button">保存到周复盘</button></div><div class="ai-band"><small>${escapeHTML(feedback.type || '')}</small><strong>${escapeHTML(feedback.band || feedback.estimatedBand || '待确认')}</strong><p>${escapeHTML(feedback.summary || feedback.overall || '')}</p></div>${criteria ? `<ol class="ai-criteria">${criteria}</ol>` : ''}${problems ? `<section><h3>主要问题</h3><ul>${problems}</ul></section>` : ''}${edits ? `<section><h3>逐句修改</h3><ol class="ai-edits">${edits}</ol></section>` : ''}${vocab ? `<section><h3>高分表达替换</h3><ul>${vocab}</ul></section>` : ''}${feedback.rewrite ? `<section class="ai-rewrite"><h3>高分改写</h3><p>${escapeHTML(feedback.rewrite)}</p></section>` : ''}${tasks ? `<section><h3>下次训练任务</h3><ol>${tasks}</ol></section>` : ''}${feedback.raw ? `<section class="ai-rewrite"><h3>模型原始反馈</h3><p>${escapeHTML(feedback.raw)}</p></section>` : ''}`; const saveBtn = $('#saveAiToReviewBtn'); if (saveBtn) saveBtn.addEventListener('click', saveAIAdviceToReview); }
async function saveAIAdviceToReview() { const f = state.aiFeedback; if (!f) return; const tasks = (f.nextTasks || []).join('；'); const note = `AI 批改 ${f.date || ''}：${f.band || f.estimatedBand || ''}。${f.summary || f.overall || ''}${tasks ? ` 下次任务：${tasks}` : ''}`; state.review.next = [state.review.next, note].filter(Boolean).join('\n'); state.tasks.push({ id: crypto.randomUUID(), title: '根据 AI 批改反馈重写一版输出', module: f.type?.includes('Speaking') ? '口语' : '写作', minutes: 35, done: false }); await saveState(); renderReview(); renderTasks(); showAIStatus('已保存到周复盘，并自动加入一条重写任务。', 'ok'); }

function renderResources() { const grid = $('#resourceGrid'); grid.innerHTML = ''; const template = $('#resourceTemplate'); state.resources.forEach(r => { const node = template.content.firstElementChild.cloneNode(true); node.querySelector('span').textContent = r.type; node.querySelector('small').textContent = r.level || '自定义'; node.querySelector('h3').textContent = r.name; node.querySelector('p').textContent = r.note || '自定义学习入口。'; node.querySelector('a').href = r.url; node.querySelector('.delete-link').addEventListener('click', async () => { state.resources = state.resources.filter(item => item.id !== r.id); await saveState(); renderResources(); }); grid.appendChild(node); }); }
async function addResource(e) { e.preventDefault(); state.resources.unshift({ id: crypto.randomUUID(), name: $('#resourceName').value.trim(), type: $('#resourceType').value, level: '自定义', url: $('#resourceUrl').value.trim(), note: '你手动添加的课程或学习网站。' }); e.currentTarget.reset(); await saveState(); renderResources(); }
function renderTasks() { const list = $('#taskList'); list.innerHTML = ''; const template = $('#taskTemplate'); state.tasks.forEach(task => { const node = template.content.firstElementChild.cloneNode(true); node.classList.toggle('done', task.done); node.querySelector('strong').textContent = task.title; node.querySelector('p').textContent = task.module; node.querySelector('time').textContent = `${task.minutes} min`; node.querySelector('.task-toggle').addEventListener('click', async () => { task.done = !task.done; await saveState(); renderTasks(); }); node.querySelector('.delete-link').addEventListener('click', async () => { state.tasks = state.tasks.filter(i => i.id !== task.id); await saveState(); renderTasks(); }); list.appendChild(node); }); if (!state.tasks.length) list.innerHTML = '<p class="empty">今天还没有计划。</p>'; }
async function addTask(e) { e.preventDefault(); state.tasks.push({ id: crypto.randomUUID(), title: $('#taskTitle').value.trim(), module: $('#taskModule').value, minutes: Number($('#taskMinutes').value), done: false }); e.currentTarget.reset(); $('#taskMinutes').value = 45; await saveState(); renderTasks(); }
function renderHeatmap() { const map = new Map(state.checkins.map(i => [i.date, i])); const today = startOfDay(new Date()); const heatmap = $('#heatmap'); heatmap.innerHTML = ''; for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); const key = toDateKey(d); const minutes = Number(map.get(key)?.minutes || 0); const cell = document.createElement('div'); cell.className = `heat-cell level-${heatLevel(minutes)}`; cell.dataset.day = d.getDate(); cell.title = `${key} · ${minutes} 分钟`; heatmap.appendChild(cell); } }
function renderReview() { $$('[data-review]').forEach(t => t.value = state.review[t.dataset.review] || ''); }
function renderReminder() { $('#reminderTime').value = state.reminder.time; $('#reminderText').value = state.reminder.text; $('#reminderStatus').textContent = state.reminder.enabled ? `已开启：每天 ${state.reminder.time} 提醒` : '提醒将在当前浏览器本地运行。'; }
function renderTimer() { $('#timerDisplay').textContent = formatSeconds(timerSeconds); }
async function submitCheckin(e) { e.preventDefault(); const c = { date: toDateKey(new Date()), minutes: Number($('#checkinMinutes').value), words: Number($('#checkinWords').value), questions: Number($('#checkinQuestions').value), note: $('#checkinNote').value.trim() }; state.checkins = state.checkins.filter(i => i.date !== c.date).concat(c); $('#checkinNote').value = ''; await saveState(); renderMetrics(); renderHeatmap(); }
function setTimer(m) { timerTotal = m * 60; timerSeconds = timerTotal; clearInterval(timerInterval); timerInterval = null; renderTimer(); }
function toggleTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; return; } timerInterval = setInterval(() => { timerSeconds = Math.max(0, timerSeconds - 1); renderTimer(); if (timerSeconds === 0) { clearInterval(timerInterval); timerInterval = null; notify('专注结束', '完成一轮训练，建议立刻记录错题或证据。'); } }, 1000); }
async function enableReminder() { if ('Notification' in window && Notification.permission !== 'granted') await Notification.requestPermission(); state.reminder = { enabled: true, time: $('#reminderTime').value, text: $('#reminderText').value }; await saveState(); renderReminder(); startReminderLoop(); }
function startReminderLoop() { clearInterval(reminderInterval); reminderInterval = setInterval(() => { if (!state.reminder.enabled) return; const now = new Date(); const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; if (current === state.reminder.time && now.getSeconds() < 5) notify('IELTS Compass 提醒', state.reminder.text); }, 5000); }
function notify(title, body) { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body }); else alert(`${title}\n${body}`); }
function exportJSON() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ielts-compass-solo-backup.json'; a.click(); URL.revokeObjectURL(url); }
function importJSON(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => { state = mergeState(JSON.parse(reader.result)); await saveState(); render(); }; reader.readAsText(file); }
function recentCheckins(days) { const keys = new Set(); const today = startOfDay(new Date()); for (let i = 0; i < days; i++) { const d = new Date(today); d.setDate(today.getDate() - i); keys.add(toDateKey(d)); } return state.checkins.filter(i => keys.has(i.date)); }
function seedCheckins() { const today = startOfDay(new Date()); return [0,45,80,120,0,150,95,60,130,0,110,160,75,125].map((v,i,a) => { const d = new Date(today); d.setDate(today.getDate() - (a.length - 1 - i)); return { date: toDateKey(d), minutes: v, words: v ? Math.round(v / 4) : 0, questions: v ? Math.round(v / 10) : 0, note: '' }; }); }
function heatLevel(m) { if (m >= 150) return 4; if (m >= 100) return 3; if (m >= 45) return 2; if (m > 0) return 1; return 0; }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function toDateKey(date) { return date.toISOString().slice(0, 10); }
function nextExamDate() { const d = new Date(); d.setDate(d.getDate() + 90); return toDateKey(d); }
function formatSeconds(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
function escapeHTML(str) { return String(str ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[c])); }
