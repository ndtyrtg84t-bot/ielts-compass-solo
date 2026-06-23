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
const vocabModules = window.USER_VOCAB_MODULES || [];
const importedPdfWords = window.USER_IMPORTED_WORD_BANK || vocabModules.flatMap(module => module.words.map(item => ({ word: item.word, meaning: item.meaning, example: item.example })));
coreWords.push(...importedPdfWords.filter(item => !coreWords.some(word => word.word.toLowerCase() === String(item.word || '').toLowerCase())));
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
  vocab: coreWords.slice(0, 6).map(createWordCard), pdfDrill: { fileName: '', fileUrl: '', pdfData: null, page: 1, totalPages: 1, mode: 'reading', secondsLeft: 3600, running: false, answers: {}, segmentAnswers: {}, sessions: [], audioTracks: [], activeBundleId: '', activeSegmentId: '', segments: [], viewMode: 'pdf', pageTexts: {}, segmentTexts: {}, ocrTexts: {}, ocrProgress: '' },
  testBundles: [],
  outputs: [],
  aiFeedback: null,
  vocabModuleProgress: {}
};

let db, state = structuredClone(defaultState);
let activeVocabModuleId = vocabModules[0]?.id || '';
let vocabAnswerVisible = false;
let pdfInterval = null, pdfDoc = null, pdfRenderTask = null, pdfScale = 1.25, pdfFitMode = true;
let timerSeconds = 45 * 60, timerTotal = 45 * 60, timerInterval = null;
let practiceSeconds = 0, practiceInterval = null, selectedAnswer = null, currentPromptIndex = 0, reminderInterval = null, mockInterval = null, deferredInstallPrompt = null, scribbleReady = false;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

init();
async function init() { db = await openDB(); $('#dbStatus').textContent = 'IndexedDB 已连接'; const saved = await getState(); state = saved ? mergeState(saved) : structuredClone(defaultState); bindEvents(); render(); startReminderLoop(); }
function openDB() { return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = e => { const database = e.target.result; if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
function getState() { return new Promise(resolve => { const tx = db.transaction(STORE, 'readonly'); const request = tx.objectStore(STORE).get(STATE_KEY); request.onsuccess = () => resolve(request.result || null); request.onerror = () => resolve(null); }); }
function saveState() { return new Promise(resolve => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(state, STATE_KEY); tx.oncomplete = () => resolve(); }); }
function mergeState(saved) { const merged = { ...structuredClone(defaultState), ...saved, target: { ...defaultState.target, ...(saved.target || {}) }, reminder: { ...defaultState.reminder, ...(saved.reminder || {}) }, review: { ...defaultState.review, ...(saved.review || {}) }, practice: { ...defaultState.practice, ...(saved.practice || {}) }, mock: { ...defaultState.mock, ...(saved.mock || {}) }, pdfDrill: { ...defaultState.pdfDrill, ...(saved.pdfDrill || {}) }, testBundles: saved.testBundles || [], vocab: saved.vocab?.length ? saved.vocab : defaultState.vocab, resources: saved.resources?.length ? saved.resources : highScoreResources, tasks: saved.tasks?.length ? saved.tasks : defaultState.tasks, checkins: saved.checkins?.length ? saved.checkins : defaultState.checkins, outputs: saved.outputs || [], aiFeedback: saved.aiFeedback || null, vocabModuleProgress: saved.vocabModuleProgress || {} }; mergeImportedContent(merged); return merged; }
function mergeImportedContent(targetState) { const wordMap = new Map((targetState.vocab || []).map(item => [String(item.word || '').toLowerCase(), item])); importedPdfWords.forEach(item => { const key = String(item.word || '').toLowerCase(); if (key && !wordMap.has(key)) targetState.vocab.push(createWordCard(item)); }); const resourceMap = new Set((targetState.resources || []).map(item => item.url)); highScoreResources.forEach(item => { if (!resourceMap.has(item.url)) targetState.resources.push(item); }); }
function bindEvents() {
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); login({ name: $('#loginName').value.trim(), email: $('#loginEmail').value.trim(), band: Number($('#loginBand').value), examDate: $('#loginExam').value }); });
  $('#demoLogin').addEventListener('click', () => login({ name: 'Solo Runner', email: 'solo@ielts.local', band: 7.5, examDate: nextExamDate() }));
  $('#logoutBtn').addEventListener('click', async () => { state.user = null; await saveState(); render(); });
  $('#mobileMenuBtn').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
  $$('.sidebar a, .home-actions a').forEach(a => a.addEventListener('click', () => { $('.sidebar')?.classList.remove('open'); setTimeout(showCurrentView, 0); }));
  window.addEventListener('hashchange', showCurrentView);
  $$('[data-practice]').forEach(btn => btn.addEventListener('click', () => switchPractice(btn.dataset.practice)));
  $('#startPracticeBtn').addEventListener('click', togglePracticeTimer); $('#resetPracticeBtn').addEventListener('click', resetPractice); $('#submitAnswerBtn').addEventListener('click', submitAnswer); $('#nextQuestionBtn').addEventListener('click', nextQuestion); $('#clearMasteredBtn').addEventListener('click', clearMastered);
  $('#startMockBtn').addEventListener('click', startMock); $('#submitMockBtn').addEventListener('click', submitMock); document.addEventListener('click', handleMockControlClick); $('#mockSelect').addEventListener('change', async () => { state.mock.currentTestId = $('#mockSelect').value; state.mock.answers = {}; state.mock.startedAt = null; state.mock.remaining = 0; await saveState(); renderMock(); }); document.addEventListener('change', handleMockAudioChange); document.addEventListener('click', handleMockAudioClick);
  $('#newPromptBtn').addEventListener('click', () => { currentPromptIndex = (currentPromptIndex + 1) % outputPrompts.length; renderOutputPrompt(); });
  $('#wordForm').addEventListener('submit', addWord);
  $('#seedWordsBtn').addEventListener('click', seedMoreWords);
  $('#clearScribbleBtn').addEventListener('click', clearScribblePad);
  $('#vocabModuleTabs')?.addEventListener('click', handleVocabModuleTabClick);
  $('#vocabModuleWords')?.addEventListener('click', handleVocabModuleWordClick);
  $('#showMeaningBtn')?.addEventListener('click', showWordAnswer);
  $('#forgotWordBtn').addEventListener('click', () => reviewWord('forgot'));
  $('#fuzzyWordBtn')?.addEventListener('click', () => reviewWord('fuzzy'));
  $('#knowWordBtn').addEventListener('click', () => reviewWord('known'));
  $('#installBtn').addEventListener('click', installApp);
  $('#outputMode').addEventListener('change', renderOutputPromptByMode); $('#outputText').addEventListener('input', updateWordCount); $('#outputForm').addEventListener('submit', saveOutput); $('#aiMarkBtn')?.addEventListener('click', markOutputWithAI); $('#aiMarkBtn').addEventListener('click', () => requestAIReview('mark')); $('#aiPolishBtn').addEventListener('click', () => requestAIReview('polish'));
  $('#resourceForm').addEventListener('submit', addResource); $('#taskForm').addEventListener('submit', addTask); $('#loadTemplateBtn').addEventListener('click', async () => { state.tasks = templateTasks.map(t => ({ ...t, id: crypto.randomUUID(), done: false })); await saveState(); renderTasks(); });
  $$('.timer-controls [data-minutes]').forEach(b => b.addEventListener('click', () => setTimer(Number(b.dataset.minutes)))); $('#startTimerBtn').addEventListener('click', toggleTimer); $('#resetTimerBtn').addEventListener('click', () => setTimer(Math.round(timerTotal / 60))); $('#enableReminderBtn').addEventListener('click', enableReminder); $('#checkinForm').addEventListener('submit', submitCheckin);
  $$('[data-review]').forEach(t => t.addEventListener('input', async () => { state.review[t.dataset.review] = t.value; await saveState(); })); $('#exportBtn').addEventListener('click', exportJSON); $('#importInput').addEventListener('change', importJSON); bindPdfDrillEvents(); bindVocabImportEvents();
}

function bindPdfDrillEvents() {
  $('#pdfInput')?.addEventListener('change', handlePdfUpload);
  $('#pdfAudioInput')?.addEventListener('change', handlePdfAudioUpload);
  $('#testBundleForm')?.addEventListener('submit', createTestBundle);
  $('#bulkBundleForm')?.addEventListener('submit', createBulkTestBundles);
  $('#folderBundleForm')?.addEventListener('submit', attachAudioFoldersToBundles);
  $('#testBundleList')?.addEventListener('click', handleTestBundleClick);
  $('#pdfSegmentForm')?.addEventListener('submit', createPdfSegment);
  $('#pdfAutoSegmentBtn')?.addEventListener('click', autoCreatePdfSegments);
  $('#pdfSegmentList')?.addEventListener('click', handlePdfSegmentClick);
  $('#pdfPrevBtn')?.addEventListener('click', () => changePdfPage(-1));
  $('#pdfNextBtn')?.addEventListener('click', () => changePdfPage(1));
  $('#pdfZoomOutBtn')?.addEventListener('click', () => zoomPdf(-0.15));
  $('#pdfZoomInBtn')?.addEventListener('click', () => zoomPdf(0.15));
  $('#pdfFitBtn')?.addEventListener('click', fitPdfWidth);
  $('#pdfFocusBtn')?.addEventListener('click', togglePdfFocusMode);
  $('#pdfViewOriginalBtn')?.addEventListener('click', () => setPdfViewMode('pdf'));
  $('#pdfViewTextBtn')?.addEventListener('click', () => setPdfViewMode('text'));
  $('#pdfExtractTextBtn')?.addEventListener('click', extractCurrentPdfText);
  $('#pdfOcrCurrentBtn')?.addEventListener('click', () => ocrCurrentPdf(false));
  $('#pdfOcrSegmentBtn')?.addEventListener('click', () => ocrCurrentPdf(true));
  $('#buildAnswerSheetBtn')?.addEventListener('click', buildPdfAnswerSheet);
  $('#gradePdfBtn')?.addEventListener('click', gradePdfAnswers);
  $('#savePdfSessionBtn')?.addEventListener('click', savePdfSession);
  $('#pdfStartBtn')?.addEventListener('click', startPdfTimer);
  $('#pdfPauseBtn')?.addEventListener('click', pausePdfTimer);
  $('#pdfEndBtn')?.addEventListener('click', endPdfTimer);
  $$('[data-pdf-mode]').forEach(btn => btn.addEventListener('click', () => setPdfMode(btn.dataset.pdfMode)));
}
function bindVocabImportEvents() {
  $('#vocabImportFile')?.addEventListener('change', handleVocabFileImport);
  $('#importVocabBtn')?.addEventListener('click', importVocabFromText);
}
function setPdfMode(mode) {
  state.pdfDrill.mode = mode;
  if (!state.pdfDrill.running) state.pdfDrill.secondsLeft = mode === 'listening' ? 1800 : mode === 'reading' ? 3600 : 2700;
  $$('[data-pdf-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.pdfMode === mode));
  renderPdfDrill();
  saveState();
}
function renderPdfDrill() {
  if (!$('#pdfTimer')) return;
  const pdf = state.pdfDrill || defaultState.pdfDrill;
  const segment = activePdfSegment();
  $('#pdfTimer').textContent = formatSeconds(pdf.secondsLeft || 0);
  $('#pdfPageLabel').textContent = pdf.fileName ? (segment ? `${segment.title} · 第 ${pdf.page || segment.startPage}/${segment.endPage} 页` : `${pdf.fileName} · 第 ${pdf.page || 1}/${pdf.totalPages || '?'} 页`) : '未上传 PDF';
  syncPdfSegmentInputs();
  renderPdfViewMode();
  renderPdfAudioTracks();
  renderTestBundles();
  renderPdfSegments();
  buildPdfAnswerSheet(false);
}
async function handlePdfUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.type !== 'application/pdf') { alert('请上传 PDF 文件。'); return; }
  await loadPdfFileIntoState(file);
  await saveState();
  await ensurePdfDocument(true);
  renderPdfDrill();
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function dataUrlToUint8Array(dataUrl) {
  const base64 = String(dataUrl || '').split(',')[1];
  if (!base64) return null;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function loadPdfFileIntoState(file) {
  if (state.pdfDrill.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(state.pdfDrill.fileUrl);
  state.pdfDrill.fileName = file.name;
  state.pdfDrill.fileUrl = URL.createObjectURL(file);
  state.pdfDrill.pdfData = await fileToDataUrl(file);
  state.pdfDrill.page = 1;
  state.pdfDrill.totalPages = 1;
  state.pdfDrill.activeSegmentId = '';
  state.pdfDrill.segments = [];
  state.pdfDrill.segmentAnswers = {};
  state.pdfDrill.pageTexts = {};
  state.pdfDrill.segmentTexts = {};
  state.pdfDrill.ocrTexts = {};
  state.pdfDrill.ocrProgress = '';
  state.pdfDrill.viewMode = 'pdf';
  pdfDoc = null;
}
async function ensurePdfDocument(force = false) {
  const empty = $('#pdfCanvasEmpty');
  if (!state.pdfDrill?.pdfData || !window.pdfjsLib) {
    if (empty && state.pdfDrill?.fileName) empty.textContent = 'PDF 渲染器没有加载成功。请确认 pdf.min.js 和 pdf.worker.min.js 已一起上传到 GitHub。';
    return null;
  }
  if (pdfDoc && !force) return pdfDoc;
  if (window.pdfjsLib?.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
  }
  const data = dataUrlToUint8Array(state.pdfDrill.pdfData);
  if (!data) return null;
  try {
    pdfDoc = await window.pdfjsLib.getDocument({ data }).promise;
    state.pdfDrill.totalPages = pdfDoc.numPages || 1;
    state.pdfDrill.page = Math.min(Math.max(1, state.pdfDrill.page || 1), state.pdfDrill.totalPages);
    return pdfDoc;
  } catch (error) {
    if (empty) empty.textContent = '这个 PDF 暂时无法网页化渲染，可以重新上传或换浏览器试试。';
    return null;
  }
}

function renderPdfViewMode() {
  const mode = state.pdfDrill?.viewMode === 'text' ? 'text' : 'pdf';
  $('#pdfViewOriginalBtn')?.classList.toggle('active', mode === 'pdf');
  $('#pdfViewTextBtn')?.classList.toggle('active', mode === 'text');
  $('#pdfCanvasShell')?.classList.toggle('hidden', mode !== 'pdf');
  $('#pdfTextShell')?.classList.toggle('hidden', mode !== 'text');
  if (mode === 'text') renderPdfTextPage(); else renderPdfPage();
}
async function setPdfViewMode(mode) {
  state.pdfDrill.viewMode = mode === 'text' ? 'text' : 'pdf';
  await saveState();
  renderPdfViewMode();
}
function textCacheKey(pageNo) {
  const segment = activePdfSegment();
  return segment ? `${segment.id}:${pageNo}` : String(pageNo);
}
function getCachedPdfText(pageNo) {
  const key = textCacheKey(pageNo);
  const segment = activePdfSegment();
  return (state.pdfDrill.ocrTexts || {})[key] || (segment ? ((state.pdfDrill.segmentTexts || {})[key] || '') : ((state.pdfDrill.pageTexts || {})[key] || ''));
}
function setCachedPdfText(pageNo, text, source = 'text') {
  const key = textCacheKey(pageNo);
  const segment = activePdfSegment();
  if (source === 'ocr') { state.pdfDrill.ocrTexts ||= {}; state.pdfDrill.ocrTexts[key] = text; return; }
  if (segment) { state.pdfDrill.segmentTexts ||= {}; state.pdfDrill.segmentTexts[key] = text; }
  else { state.pdfDrill.pageTexts ||= {}; state.pdfDrill.pageTexts[key] = text; }
}
function normalizePdfTextItems(items) {
  const rows = [];
  (items || []).forEach(item => {
    const str = String(item.str || '').trim();
    if (!str) return;
    const y = Math.round((item.transform?.[5] || 0) / 3) * 3;
    const x = item.transform?.[4] || 0;
    let row = rows.find(entry => Math.abs(entry.y - y) <= 2);
    if (!row) { row = { y, parts: [] }; rows.push(row); }
    row.parts.push({ x, str });
  });
  return rows.sort((a, b) => b.y - a.y).map(row => row.parts.sort((a, b) => a.x - b.x).map(part => part.str).join(' ').replace(/\s+([,.;:?!])/g, '$1')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
async function extractPdfPageText(pageNo) {
  const cached = getCachedPdfText(pageNo);
  if (cached) return cached;
  const doc = await ensurePdfDocument(false);
  if (!doc) return '';
  const page = await doc.getPage(pageNo);
  const content = await page.getTextContent();
  const text = normalizePdfTextItems(content.items);
  if (text) { setCachedPdfText(pageNo, text); return text; }
  return ocrPdfPage(pageNo);
}

let pdfOcrWorker = null;
async function ensureOcrWorker() {
  if (!window.Tesseract) throw new Error('OCR 引擎没有加载成功，请确认 tesseract.min.js 已上传。');
  if (pdfOcrWorker) return pdfOcrWorker;
  const status = $('#pdfOcrStatus');
  pdfOcrWorker = await Tesseract.createWorker('eng', 1, {
    workerPath: './tesseract-worker.min.js',
    corePath: './tesseract-core-simd-lstm.wasm.js',
    langPath: './',
    gzip: true,
    logger: message => {
      const progress = message.progress ? ` ${Math.round(message.progress * 100)}%` : '';
      state.pdfDrill.ocrProgress = `${message.status || 'OCR'}${progress}`;
      if (status) status.textContent = state.pdfDrill.ocrProgress;
    }
  });
  await pdfOcrWorker.setParameters({
    tessedit_pageseg_mode: '6',
    preserve_interword_spaces: '1'
  });
  return pdfOcrWorker;
}
async function renderPdfPageForOcr(pageNo) {
  const doc = await ensurePdfDocument(false);
  if (!doc) return null;
  const page = await doc.getPage(pageNo);
  const viewport = page.getViewport({ scale: 2.2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}
function cleanOcrText(text) {
  return String(text || '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[|]{2,}/g, '')
    .trim();
}
async function ocrPdfPage(pageNo) {
  const cached = (state.pdfDrill.ocrTexts || {})[textCacheKey(pageNo)];
  if (cached) return cached;
  const worker = await ensureOcrWorker();
  const canvas = await renderPdfPageForOcr(pageNo);
  if (!canvas) return '';
  const result = await worker.recognize(canvas);
  const text = cleanOcrText(result?.data?.text || '');
  setCachedPdfText(pageNo, text, 'ocr');
  return text;
}
async function ocrCurrentPdf(useSegment = false) {
  if (!state.pdfDrill?.fileName || !state.pdfDrill?.pdfData) { alert('先上传或加载扫描版 PDF。'); return; }
  const shell = $('#pdfTextShell');
  const segment = useSegment ? activePdfSegment() : null;
  const start = segment ? segment.startPage : (state.pdfDrill.page || 1);
  const end = segment ? segment.endPage : (state.pdfDrill.page || 1);
  state.pdfDrill.viewMode = 'text';
  if (shell) shell.innerHTML = `<div class="pdf-ocr-working"><strong>正在 OCR 识别</strong><span id="pdfOcrStatus">准备识别第 ${start}-${end} 页……</span><small>扫描版 PDF 识别会慢一点，建议先切成 Passage / Section 再 OCR。</small></div>`;
  try {
    for (let pageNo = start; pageNo <= end; pageNo += 1) {
      const status = $('#pdfOcrStatus');
      if (status) status.textContent = `正在识别第 ${pageNo}/${end} 页……`;
      await ocrPdfPage(pageNo);
    }
    const activeBundle = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
    if (activeBundle) { activeBundle.ocrTexts = state.pdfDrill.ocrTexts || {}; activeBundle.viewMode = 'text'; }
    await saveState();
    renderPdfViewMode();
  } catch (error) {
    if (shell) shell.innerHTML = `<div class="pdf-text-empty"><strong>OCR 没有识别成功</strong><span>${escapeHTML(error.message || '可以先用原版 PDF 刷题，或只 OCR 当前页。')}</span></div>`;
  }
}
async function extractCurrentPdfText() {
  if (!state.pdfDrill?.fileName || !state.pdfDrill?.pdfData) { alert('先上传或加载 PDF。'); return; }
  const shell = $('#pdfTextShell');
  const segment = activePdfSegment();
  const start = segment ? segment.startPage : (state.pdfDrill.page || 1);
  const end = segment ? segment.endPage : (state.pdfDrill.page || 1);
  if (shell) shell.innerHTML = '<p class="empty">正在把 PDF 提取成网页文字题面……</p>';
  for (let pageNo = start; pageNo <= end; pageNo += 1) await extractPdfPageText(pageNo);
  state.pdfDrill.viewMode = 'text';
  const activeBundle = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
  if (activeBundle) { activeBundle.pageTexts = state.pdfDrill.pageTexts || {}; activeBundle.segmentTexts = state.pdfDrill.segmentTexts || {}; activeBundle.ocrTexts = state.pdfDrill.ocrTexts || {}; activeBundle.viewMode = 'text'; }
  await saveState();
  renderPdfViewMode();
}
function renderPdfTextPage() {
  const shell = $('#pdfTextShell');
  if (!shell) return;
  const pageNo = state.pdfDrill.page || activePdfSegment()?.startPage || 1;
  const text = getCachedPdfText(pageNo);
  const segment = activePdfSegment();
  if (!state.pdfDrill?.fileName) {
    shell.innerHTML = '<p class="empty">先上传 PDF，再提取文字题面。</p>';
    return;
  }
  if (!text) {
    shell.innerHTML = `<div class="pdf-text-empty"><strong>这一页还没有文字题面</strong><span>${segment ? '点击“提取当前文字”，会把当前片段全部转成网页文字。' : '点击“提取当前文字”，会把当前页转成网页文字。'}</span><button type="button" onclick="extractCurrentPdfText()">提取当前文字</button></div>`;
    return;
  }
  const paragraphs = text.split(/\n{2,}|\n/).map(line => line.trim()).filter(Boolean);
  shell.innerHTML = `<article class="pdf-text-page"><div class="pdf-text-page-head"><span>${escapeHTML(segment?.title || state.pdfDrill.fileName || 'PDF')}</span><strong>Page ${pageNo}</strong></div>${paragraphs.map(line => `<p>${escapeHTML(line)}</p>`).join('')}</article>`;
}
async function renderPdfPage() {
  const canvas = $('#pdfCanvas');
  const shell = $('#pdfCanvasShell');
  const empty = $('#pdfCanvasEmpty');
  if (!canvas || !shell) return;
  const doc = await ensurePdfDocument(false);
  if (!doc) { canvas.classList.add('hidden'); empty?.classList.remove('hidden'); return; }
  const pageNo = Math.min(Math.max(1, state.pdfDrill.page || 1), doc.numPages);
  const page = await doc.getPage(pageNo);
  const baseViewport = page.getViewport({ scale: 1 });
  if (pdfFitMode) {
    const available = Math.max(280, shell.clientWidth - 28);
    pdfScale = Math.min(2.4, Math.max(0.55, available / baseViewport.width));
  }
  const viewport = page.getViewport({ scale: pdfScale });
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;
  canvas.classList.remove('hidden');
  empty?.classList.add('hidden');
  if (pdfRenderTask) { try { pdfRenderTask.cancel(); } catch (_) {} }
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, viewport.width, viewport.height);
  pdfRenderTask = page.render({ canvasContext: context, viewport });
  try { await pdfRenderTask.promise; } catch (_) {}
  pdfRenderTask = null;
  const segment = activePdfSegment();
  $('#pdfPageLabel').textContent = segment ? `${segment.title} · 第 ${pageNo}/${segment.endPage} 页` : `${state.pdfDrill.fileName} · 第 ${pageNo}/${doc.numPages} 页`;
}

function togglePdfFocusMode() {
  const panel = $('#pdfdrill');
  panel?.classList.toggle('pdf-focus-mode');
  $('#pdfFocusBtn').textContent = panel?.classList.contains('pdf-focus-mode') ? '退出专注' : '专注刷题';
  setTimeout(() => fitPdfWidth(), 80);
}
async function zoomPdf(delta) {
  pdfFitMode = false;
  pdfScale = Math.min(3, Math.max(0.55, pdfScale + delta));
  await renderPdfPage();
}
async function fitPdfWidth() {
  pdfFitMode = true;
  await renderPdfPage();
}
async function handlePdfAudioUpload(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('audio/')) return;
  state.pdfDrill.audioTracks = [{ id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file) }];
  await saveState();
  renderPdfAudioTracks();
}
function renderPdfAudioTracks() {
  const box = $('#pdfAudioBox'); if (!box) return;
  const tracks = state.pdfDrill.audioTracks || [];
  box.classList.toggle('hidden', !tracks.length);
  box.innerHTML = tracks.map((track, index) => `<div class="pdf-audio-track"><strong>${escapeHTML(track.name || `Audio ${index + 1}`)}</strong><audio controls preload="metadata" src="${track.url}"></audio></div>`).join('');
}

function activePdfSegment() {
  const pdf = state.pdfDrill || {};
  return (pdf.segments || []).find(item => item.id === pdf.activeSegmentId) || null;
}

function detectCambridgeBookNumber(name) {
  const match = String(name || '').match(/(?:剑桥雅思真题|剑桥雅思|剑|cambridge|c|【)\s*([4-9]|1\d|2\d)/i);
  return match ? Number(match[1]) : null;
}
function inferContentStartPage(totalPages, fileName = '') {
  const book = detectCambridgeBookNumber(fileName);
  if (book && book <= 6) return Math.min(totalPages, 10);
  if (book && book <= 12) return Math.min(totalPages, 12);
  if (book) return Math.min(totalPages, 14);
  return totalPages > 150 ? 12 : totalPages > 90 ? 8 : 1;
}
function segmentTitle(testNo, type, index = '') {
  if (type === 'listening') return `Test ${testNo} Listening Section ${index}`;
  if (type === 'reading') return `Test ${testNo} Reading Passage ${index}`;
  if (type === 'writing') return `Test ${testNo} Writing`;
  if (type === 'speaking') return `Test ${testNo} Speaking`;
  return `Test ${testNo}`;
}
function buildAutoSegments(totalPages, fileName = '') {
  const start = inferContentStartPage(totalPages, fileName);
  const usable = Math.max(1, totalPages - start + 1);
  const testCount = Math.max(1, Math.min(4, Math.floor(usable / 30) || 1));
  const pagesPerTest = Math.max(24, Math.floor(usable / testCount));
  const segments = [];
  for (let t = 1; t <= testCount; t += 1) {
    const testStart = start + (t - 1) * pagesPerTest;
    const testEnd = t === testCount ? totalPages : Math.min(totalPages, testStart + pagesPerTest - 1);
    const blocks = [
      { type: 'listening', index: 1, offset: 0, len: 2, q: 10 },
      { type: 'listening', index: 2, offset: 2, len: 2, q: 10 },
      { type: 'listening', index: 3, offset: 4, len: 2, q: 10 },
      { type: 'listening', index: 4, offset: 6, len: 2, q: 10 },
      { type: 'reading', index: 1, offset: 8, len: 3, q: 13 },
      { type: 'reading', index: 2, offset: 11, len: 3, q: 13 },
      { type: 'reading', index: 3, offset: 14, len: 4, q: 14 },
      { type: 'writing', index: '', offset: 18, len: 3, q: 2 },
      { type: 'speaking', index: '', offset: 21, len: 3, q: 3 },
    ];
    blocks.forEach(block => {
      const startPage = Math.min(totalPages, testStart + block.offset);
      const endPage = Math.min(testEnd, startPage + block.len - 1);
      if (startPage <= testEnd && endPage >= startPage) {
        segments.push({
          id: crypto.randomUUID(),
          title: segmentTitle(t, block.type, block.index),
          startPage,
          endPage,
          questionCount: block.q,
          lastPage: startPage,
          createdAt: new Date().toLocaleString(),
          sourceName: state.pdfDrill.fileName,
          auto: true,
          type: block.type,
        });
      }
    });
  }
  return segments;
}
async function autoCreatePdfSegments() {
  if (!state.pdfDrill?.fileName || !state.pdfDrill?.pdfData) { alert('先上传或加载一整本 PDF，我才能自动切题。'); return; }
  await ensurePdfDocument(false);
  const total = state.pdfDrill.totalPages || pdfDoc?.numPages || 1;
  const autoSegments = buildAutoSegments(total, state.pdfDrill.fileName);
  if (!autoSegments.length) { alert('这份 PDF 页数太少，暂时无法自动切题。'); return; }
  const manualSegments = (state.pdfDrill.segments || []).filter(item => !item.auto);
  state.pdfDrill.segments = [...autoSegments, ...manualSegments];
  state.pdfDrill.activeSegmentId = autoSegments[0].id;
  state.pdfDrill.page = autoSegments[0].startPage;
  state.pdfDrill.segmentAnswers ||= {};
  autoSegments.forEach(segment => { state.pdfDrill.segmentAnswers[segment.id] ||= {}; });
  if ($('#pdfQuestionCount')) $('#pdfQuestionCount').value = autoSegments[0].questionCount || 40;
  const activeBundle = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
  if (activeBundle) { activeBundle.segments = state.pdfDrill.segments; activeBundle.segmentAnswers = state.pdfDrill.segmentAnswers; activeBundle.pageTexts = state.pdfDrill.pageTexts || {}; activeBundle.segmentTexts = state.pdfDrill.segmentTexts || {}; activeBundle.ocrTexts = state.pdfDrill.ocrTexts || {}; activeBundle.viewMode = state.pdfDrill.viewMode || 'pdf'; }
  await saveState();
  renderPdfDrill();
  const hint = $('#pdfAutoSegmentHint');
  if (hint) hint.textContent = `已自动生成 ${autoSegments.length} 个片段；如果页码不完全准，可以删除单个片段或手动补一个。`;
}
function syncPdfSegmentInputs() {
  const total = state.pdfDrill?.totalPages || pdfDoc?.numPages || 1;
  const start = $('#pdfSegmentStart');
  const end = $('#pdfSegmentEnd');
  if (start) start.max = total;
  if (end) end.max = total;
  if (start && (!start.value || Number(start.value) < 1)) start.value = state.pdfDrill?.page || 1;
  if (end && (!end.value || Number(end.value) < 1)) end.value = Math.min(total, Math.max(Number(start?.value || 1), (state.pdfDrill?.page || 1) + 2));
}
async function createPdfSegment(event) {
  event.preventDefault();
  if (!state.pdfDrill?.fileName || !state.pdfDrill?.pdfData) { alert('先上传或加载一整本 PDF，再切成小套题。'); return; }
  await ensurePdfDocument(false);
  const total = state.pdfDrill.totalPages || pdfDoc?.numPages || 1;
  const title = ($('#pdfSegmentTitle')?.value || '').trim() || `刷题片段 ${(state.pdfDrill.segments || []).length + 1}`;
  let startPage = Math.max(1, Math.min(total, Number($('#pdfSegmentStart')?.value || state.pdfDrill.page || 1)));
  let endPage = Math.max(1, Math.min(total, Number($('#pdfSegmentEnd')?.value || startPage)));
  if (endPage < startPage) [startPage, endPage] = [endPage, startPage];
  const questionCount = Math.max(1, Math.min(80, Number($('#pdfSegmentQuestions')?.value || 13)));
  const segment = { id: crypto.randomUUID(), title, startPage, endPage, questionCount, lastPage: startPage, createdAt: new Date().toLocaleString(), sourceName: state.pdfDrill.fileName };
  state.pdfDrill.segments = [segment, ...(state.pdfDrill.segments || [])];
  state.pdfDrill.activeSegmentId = segment.id;
  state.pdfDrill.page = startPage;
  state.pdfDrill.segmentAnswers ||= {};
  state.pdfDrill.segmentAnswers[segment.id] = {};
  const activeBundle = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
  if (activeBundle) { activeBundle.segments = state.pdfDrill.segments; activeBundle.segmentAnswers = state.pdfDrill.segmentAnswers; activeBundle.pageTexts = state.pdfDrill.pageTexts || {}; activeBundle.segmentTexts = state.pdfDrill.segmentTexts || {}; activeBundle.ocrTexts = state.pdfDrill.ocrTexts || {}; activeBundle.viewMode = state.pdfDrill.viewMode || 'pdf'; }
  if ($('#pdfQuestionCount')) $('#pdfQuestionCount').value = questionCount;
  event.currentTarget.reset();
  $('#pdfSegmentStart').value = startPage;
  $('#pdfSegmentEnd').value = endPage;
  $('#pdfSegmentQuestions').value = questionCount;
  await saveState();
  renderPdfDrill();
}
function renderPdfSegments() {
  const list = $('#pdfSegmentList');
  if (!list) return;
  const segments = state.pdfDrill?.segments || [];
  if (!state.pdfDrill?.fileName) {
    list.innerHTML = '<p class="empty">先上传一整本 PDF，再把它切成 Test / Passage / Section。</p>';
    return;
  }
  if (!segments.length) {
    list.innerHTML = '<p class="empty">还没有片段。建议按 Reading Passage 1-3 或 Listening Section 1-4 创建。</p>';
    return;
  }
  list.innerHTML = segments.map(segment => `<article class="pdf-segment-card ${segment.id === state.pdfDrill.activeSegmentId ? 'active' : ''} ${segment.auto ? 'is-auto' : ''}"><div><strong>${escapeHTML(segment.title)}</strong><span>${segment.auto ? '自动切题 · ' : ''}第 ${segment.startPage}-${segment.endPage} 页 · ${segment.questionCount} 题</span></div><div class="pdf-segment-actions"><button type="button" data-pdf-segment-load="${segment.id}">开始刷</button><button class="ghost-btn" type="button" data-pdf-segment-delete="${segment.id}">删除</button></div></article>`).join('');
}
async function handlePdfSegmentClick(event) {
  const loadBtn = event.target.closest('[data-pdf-segment-load]');
  const deleteBtn = event.target.closest('[data-pdf-segment-delete]');
  if (loadBtn) { await loadPdfSegment(loadBtn.dataset.pdfSegmentLoad); return; }
  if (deleteBtn) { await deletePdfSegment(deleteBtn.dataset.pdfSegmentDelete); }
}
async function loadPdfSegment(segmentId) {
  const segment = (state.pdfDrill.segments || []).find(item => item.id === segmentId);
  if (!segment) return;
  state.pdfDrill.activeSegmentId = segment.id;
  state.pdfDrill.page = Math.min(segment.endPage, Math.max(segment.startPage, segment.lastPage || segment.startPage));
  state.pdfDrill.segmentAnswers ||= {};
  state.pdfDrill.segmentAnswers[segment.id] ||= {};
  if ($('#pdfQuestionCount')) $('#pdfQuestionCount').value = segment.questionCount || 40;
  await saveState();
  renderPdfDrill();
}
async function deletePdfSegment(segmentId) {
  state.pdfDrill.segments = (state.pdfDrill.segments || []).filter(item => item.id !== segmentId);
  if (state.pdfDrill.segmentAnswers) delete state.pdfDrill.segmentAnswers[segmentId];
  if (state.pdfDrill.activeSegmentId === segmentId) state.pdfDrill.activeSegmentId = '';
  const activeBundle = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
  if (activeBundle) { activeBundle.segments = state.pdfDrill.segments; activeBundle.segmentAnswers = state.pdfDrill.segmentAnswers || {}; }
  await saveState();
  renderPdfDrill();
}
async function changePdfPage(delta) {
  const segment = activePdfSegment();
  const min = segment ? segment.startPage : 1;
  const max = segment ? segment.endPage : (state.pdfDrill.totalPages || pdfDoc?.numPages || 9999);
  state.pdfDrill.page = Math.min(max, Math.max(min, (state.pdfDrill.page || min) + delta));
  const active = (state.testBundles || []).find(item => item.id === state.pdfDrill.activeBundleId);
  if (active) active.lastPage = state.pdfDrill.page;
  if (segment) segment.lastPage = state.pdfDrill.page;
  await saveState();
  renderPdfDrill();
}
function buildPdfAnswerSheet(reset = true) {
  const box = $('#pdfAnswerSheet');
  if (!box) return;
  const segment = activePdfSegment();
  const questionInput = $('#pdfQuestionCount');
  if (segment && questionInput && Number(questionInput.value || 0) !== Number(segment.questionCount || 40)) questionInput.value = segment.questionCount || 40;
  const count = Math.max(1, Math.min(80, Number(questionInput?.value || segment?.questionCount || 40)));
  const answerBucket = segment ? (state.pdfDrill.segmentAnswers ||= {})[segment.id] ||= {} : (state.pdfDrill.answers ||= {});
  if (reset) {
    if (segment) state.pdfDrill.segmentAnswers[segment.id] = {};
    else state.pdfDrill.answers = {};
  }
  const values = segment ? (state.pdfDrill.segmentAnswers[segment.id] || {}) : (state.pdfDrill.answers || {});
  box.innerHTML = Array.from({ length: count }, (_, i) => { const n = i + 1; const val = values?.[n] || ''; return `<label><span>${n}</span><input data-pdf-answer="${n}" value="${escapeHTML(val)}" placeholder="答案"></label>`; }).join('');
  box.querySelectorAll('[data-pdf-answer]').forEach(input => input.addEventListener('input', async () => {
    const currentSegment = activePdfSegment();
    if (currentSegment) { (state.pdfDrill.segmentAnswers ||= {})[currentSegment.id] ||= {}; state.pdfDrill.segmentAnswers[currentSegment.id][input.dataset.pdfAnswer] = input.value.trim(); }
    else { (state.pdfDrill.answers ||= {})[input.dataset.pdfAnswer] = input.value.trim(); }
    await saveState();
  }));
}
function parseAnswerKey(text) {
  const raw = String(text || '').trim();
  if (!raw) return {};
  const lines = raw.includes('\n') ? raw.split(/\n+/) : raw.split(/,/);
  const key = {};
  lines.map(s => s.trim()).filter(Boolean).forEach((line, idx) => {
    const match = line.match(/^(\d+)\s*[\.|\)|:|-]?\s*(.+)$/);
    if (match) key[match[1]] = match[2].trim().toLowerCase(); else key[idx + 1] = line.trim().toLowerCase();
  });
  return key;
}
async function gradePdfAnswers() {
  const key = parseAnswerKey($('#answerKeyInput').value);
  const nums = Object.keys(key);
  if (!nums.length) { $('#pdfResult').innerHTML = '<p class="empty">请先输入答案 Key，才能自动判分。</p>'; return; }
  const segment = activePdfSegment();
  const answers = segment ? ((state.pdfDrill.segmentAnswers || {})[segment.id] || {}) : (state.pdfDrill.answers || {});
  let correct = 0;
  const details = nums.map(n => {
    const user = (answers?.[n] || '').trim().toLowerCase();
    const ok = user && user === key[n];
    if (ok) correct += 1;
    return `<li class="${ok ? 'ok' : 'bad'}">第 ${n} 题：你的答案 ${escapeHTML(user || '未填')}；正确答案 ${escapeHTML(key[n])}</li>`;
  }).join('');
  const score = Math.round(correct / nums.length * 100);
  $('#pdfResult').innerHTML = `<h3>${segment ? escapeHTML(segment.title) : 'PDF 刷题'}判分：${correct}/${nums.length} · ${score}%</h3><ol>${details}</ol>`;
}
async function savePdfSession() {
  const segment = activePdfSegment();
  const answers = segment ? ((state.pdfDrill.segmentAnswers || {})[segment.id] || {}) : (state.pdfDrill.answers || {});
  state.pdfDrill.sessions.unshift({ id: crypto.randomUUID(), fileName: state.pdfDrill.fileName || '未命名 PDF', bundleId: state.pdfDrill.activeBundleId || '', segmentId: segment?.id || '', segmentTitle: segment?.title || '', date: new Date().toLocaleString(), answers: { ...answers } });
  await saveState();
  $('#pdfResult').innerHTML = '<p class="empty">本次 PDF 刷题记录已保存。</p>';
}

async function createTestBundle(event) {
  event.preventDefault();
  const pdfFile = $('#testBundlePdf')?.files?.[0];
  const audioFiles = Array.from($('#testBundleAudio')?.files || []);
  if (!pdfFile || pdfFile.type !== 'application/pdf') { alert('请先选择这套题的 PDF。'); return; }
  const validAudio = audioFiles.filter(file => file.type.startsWith('audio/'));
  const title = $('#testBundleName').value.trim() || pdfFile.name.replace(/\.pdf$/i, '');
  const bundle = {
    id: crypto.randomUUID(),
    title,
    pdfName: pdfFile.name,
    pdfUrl: URL.createObjectURL(pdfFile),
    pdfData: await fileToDataUrl(pdfFile),
    audioTracks: validAudio.map(file => ({ id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file) })),
    createdAt: new Date().toLocaleString(),
    lastPage: 1,
    questionCount: validAudio.length ? 40 : 40,
  };
  state.testBundles.unshift(bundle);
  event.currentTarget.reset();
  await saveState();
  renderTestBundles();
  loadTestBundle(bundle.id);
}

function extractBookNumber(name) {
  const raw = String(name || '');
  const path = raw.replace(/\\/g, '/');
  const firstFolder = path.includes('/') ? path.split('/').find(Boolean) : '';
  const text = `${firstFolder} ${path}`.toLowerCase();
  const patterns = [
    /(?:剑桥雅思真题|剑桥雅思|剑|cambridge|c)\s*[\[【(（]?\s*(\d{1,2})\s*[\]】)）]?/i,
    /[\[【(（]\s*(\d{1,2})\s*[\]】)）]/,
    /(?:book|vol|册|真题)\s*(\d{1,2})/i,
    /(?:^|[\s_\-\/])(?:c)?(\d{1,2})(?=[\s_\-\/]|$)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && Number(match[1]) >= 1 && Number(match[1]) <= 30) return String(Number(match[1]));
  }
  return '';
}
function extractBookNumber(name) {
  const raw = String(name || '');
  const path = raw.replace(/\\/g, '/');
  const firstFolder = path.includes('/') ? path.split('/').find(Boolean) : '';
  const text = `${firstFolder} ${path}`.toLowerCase();
  const patterns = [
    /(?:剑桥雅思真题|剑桥雅思|剑|cambridge|c)\s*[\[【(（]?\s*(\d{1,2})\s*[\]】)）]?/i,
    /[\[【(（]\s*(\d{1,2})\s*[\]】)）]/,
    /(?:book|vol|册|真题)\s*(\d{1,2})/i,
    /(?:^|[\s_\-\/])(?:c)?(\d{1,2})(?=[\s_\-\/]|$)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && Number(match[1]) >= 1 && Number(match[1]) <= 30) return String(Number(match[1]));
  }
  return '';
}
function normalizeBundleKey(name) {
  const book = extractBookNumber(name);
  if (book) return `book-${book}`;
  let base = String(name || '').replace(/\.[^.]+$/i, '').toLowerCase();
  base = base.replace(/[【】\[\]()（）{}]/g, ' ').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cam = base.match(/(?:cambridge|剑桥|c)\s*(\d{1,2})\s*(?:test|t|套题)?\s*(\d{1,2})/i);
  if (cam) return `cambridge-${cam[1]}-test-${cam[2]}`;
  const test = base.match(/(?:test|t|套题|真题|practice test)\s*(\d{1,2})/i);
  if (test) return `test-${test[1]}`;
  return base.replace(/\b(section|part|audio|listening|reading|questions?|answer|key|track|cd)\b/gi, '').replace(/\b\d{1,2}\b/g, '').replace(/\s+/g, ' ').trim() || base;
}
function audioSortScore(file) {
  const name = file.name.toLowerCase();
  const section = name.match(/(?:section|part|track|s)\s*0?(\d{1,2})/i);
  if (section) return Number(section[1]);
  const nums = name.match(/\d{1,2}/g);
  return nums ? Number(nums[nums.length - 1]) : 99;
}

function filesToAudioGroups(files, usePath = false) {
  const audioGroups = new Map();
  files.filter(file => file.type.startsWith('audio/')).forEach(file => {
    const key = normalizeBundleKey(usePath ? (file.webkitRelativePath || file.name) : file.name);
    if (!audioGroups.has(key)) audioGroups.set(key, []);
    audioGroups.get(key).push(file);
  });
  return audioGroups;
}
function matchAudioForPdf(pdfFile, audioGroups) {
  const key = normalizeBundleKey(pdfFile.name);
  let tracks = audioGroups.get(key) || [];
  if (!tracks.length) {
    const book = extractBookNumber(pdfFile.name);
    if (book) tracks = audioGroups.get(`book-${book}`) || [];
  }
  if (!tracks.length) {
    const fuzzy = Array.from(audioGroups.entries()).find(([audioKey]) => audioKey.includes(key) || key.includes(audioKey));
    if (fuzzy) tracks = fuzzy[1];
  }
  return tracks.slice().sort((a, b) => audioSortScore(a) - audioSortScore(b));
}
async function createBundleFromFiles(pdfFile, tracks) {
  return {
    id: crypto.randomUUID(),
    title: pdfFile.name.replace(/\.pdf$/i, ''),
    pdfName: pdfFile.name,
    pdfUrl: URL.createObjectURL(pdfFile),
    pdfData: await fileToDataUrl(pdfFile),
    audioTracks: tracks.map(file => ({ id: crypto.randomUUID(), name: file.name, path: file.webkitRelativePath || file.name, url: URL.createObjectURL(file) })),
    createdAt: new Date().toLocaleString(),
    lastPage: 1,
    questionCount: 40,
    groupKey: normalizeBundleKey(pdfFile.name),
  };
}
async function createBulkTestBundles(event) {
  event.preventDefault();
  const pdfFiles = Array.from($('#bulkBundlePdf')?.files || []).filter(file => file.type === 'application/pdf');
  const audioFiles = Array.from($('#bulkBundleAudio')?.files || []).filter(file => file.type.startsWith('audio/'));
  if (!pdfFiles.length) { alert('请先批量选择 PDF。'); return; }
  const audioGroups = filesToAudioGroups(audioFiles, false);
  const bundles = await Promise.all(pdfFiles.map(pdfFile => createBundleFromFiles(pdfFile, pdfFiles.length === 1 ? audioFiles : matchAudioForPdf(pdfFile, audioGroups))));
  state.testBundles.unshift(...bundles);
  event.currentTarget.reset();
  await saveState();
  renderTestBundles();
  const matched = bundles.filter(bundle => bundle.audioTracks.length).length;
  $('#bulkBundleStatus').textContent = `已生成 ${bundles.length} 套题，其中 ${matched} 套自动匹配到音频。`;
  if (bundles[0]) await loadTestBundle(bundles[0].id);
}
async function attachAudioFoldersToBundles(event) {
  event.preventDefault();
  const files = Array.from($('#folderBundleAudio')?.files || []).filter(file => file.type.startsWith('audio/'));
  if (!files.length) { alert('请先选择音频总文件夹。'); return; }
  const audioGroups = filesToAudioGroups(files, true);
  let matched = 0;
  (state.testBundles || []).forEach(bundle => {
    const key = normalizeBundleKey(bundle.pdfName || bundle.title);
    let tracks = audioGroups.get(key) || [];
    if (!tracks.length) {
      const book = extractBookNumber(bundle.pdfName || bundle.title);
      if (book) tracks = audioGroups.get(`book-${book}`) || [];
    }
    if (tracks.length) {
      (bundle.audioTracks || []).forEach(track => { if (track.url?.startsWith('blob:')) URL.revokeObjectURL(track.url); });
      bundle.audioTracks = tracks.slice().sort((a, b) => audioSortScore(a) - audioSortScore(b)).map(file => ({ id: crypto.randomUUID(), name: file.name, path: file.webkitRelativePath || file.name, url: URL.createObjectURL(file) }));
      matched += 1;
    }
  });
  event.currentTarget.reset();
  await saveState();
  renderTestBundles();
  renderPdfDrill();
  $('#bulkBundleStatus').textContent = `已从文件夹匹配 ${matched} 套题音频。`;
}
function renderTestBundles() {
  const list = $('#testBundleList'); if (!list) return;
  const bundles = state.testBundles || [];
  if (!bundles.length) { list.innerHTML = '<p class="empty">还没有套题。选择 PDF 和音频后，会自动出现在这里。</p>'; return; }
  list.innerHTML = bundles.map(bundle => `<article class="test-bundle-card ${state.pdfDrill.activeBundleId === bundle.id ? 'active' : ''}"><div><strong>${escapeHTML(bundle.title)}</strong><span>${escapeHTML(bundle.pdfName)} · ${bundle.audioTracks?.length || 0} 条音频</span><small>${escapeHTML(bundle.createdAt || '')}</small></div><div class="test-bundle-actions"><button type="button" data-load-bundle="${bundle.id}">开始这套</button><button type="button" class="ghost-btn" data-delete-bundle="${bundle.id}">删除</button></div></article>`).join('');
}
async function handleTestBundleClick(event) {
  const load = event.target.closest('[data-load-bundle]');
  const del = event.target.closest('[data-delete-bundle]');
  if (load) { await loadTestBundle(load.dataset.loadBundle); return; }
  if (del) { await deleteTestBundle(del.dataset.deleteBundle); }
}
async function loadTestBundle(bundleId) {
  const bundle = (state.testBundles || []).find(item => item.id === bundleId); if (!bundle) return;
  state.pdfDrill.activeBundleId = bundle.id;
  state.pdfDrill.fileName = bundle.pdfName;
  state.pdfDrill.fileUrl = bundle.pdfUrl;
  state.pdfDrill.pdfData = bundle.pdfData || null;
  state.pdfDrill.activeSegmentId = '';
  state.pdfDrill.segments = bundle.segments || [];
  state.pdfDrill.segmentAnswers = bundle.segmentAnswers || {};
  state.pdfDrill.pageTexts = bundle.pageTexts || {};
  state.pdfDrill.segmentTexts = bundle.segmentTexts || {};
  state.pdfDrill.ocrTexts = bundle.ocrTexts || {};
  state.pdfDrill.viewMode = bundle.viewMode || 'pdf';
  state.pdfDrill.page = bundle.lastPage || 1;
  pdfDoc = null;
  await ensurePdfDocument(true);
  state.pdfDrill.audioTracks = bundle.audioTracks || [];
  state.pdfDrill.mode = bundle.audioTracks?.length ? 'listening' : 'reading';
  state.pdfDrill.secondsLeft = state.pdfDrill.mode === 'listening' ? 1800 : 3600;
  $('#pdfQuestionCount').value = bundle.questionCount || 40;
  await saveState();
  renderPdfDrill();
}
async function deleteTestBundle(bundleId) {
  const bundle = (state.testBundles || []).find(item => item.id === bundleId);
  if (bundle?.pdfUrl?.startsWith('blob:')) URL.revokeObjectURL(bundle.pdfUrl);
  (bundle?.audioTracks || []).forEach(track => { if (track.url?.startsWith('blob:')) URL.revokeObjectURL(track.url); });
  state.testBundles = (state.testBundles || []).filter(item => item.id !== bundleId);
  if (state.pdfDrill.activeBundleId === bundleId) { state.pdfDrill.activeBundleId = ''; state.pdfDrill.fileName = ''; state.pdfDrill.fileUrl = ''; state.pdfDrill.pdfData = null; state.pdfDrill.audioTracks = []; state.pdfDrill.activeSegmentId = ''; state.pdfDrill.segments = []; state.pdfDrill.segmentAnswers = {}; pdfDoc = null; }
  await saveState();
  renderPdfDrill();
}
function startPdfTimer() {
  clearInterval(pdfInterval);
  state.pdfDrill.running = true;
  pdfInterval = setInterval(async () => { state.pdfDrill.secondsLeft = Math.max(0, (state.pdfDrill.secondsLeft || 0) - 1); $('#pdfTimer').textContent = formatSeconds(state.pdfDrill.secondsLeft); if (state.pdfDrill.secondsLeft === 0) { clearInterval(pdfInterval); state.pdfDrill.running = false; await saveState(); } }, 1000);
}
async function pausePdfTimer() { clearInterval(pdfInterval); pdfInterval = null; state.pdfDrill.running = false; await saveState(); }
async function endPdfTimer() { clearInterval(pdfInterval); pdfInterval = null; state.pdfDrill.running = false; state.pdfDrill.secondsLeft = state.pdfDrill.mode === 'listening' ? 1800 : state.pdfDrill.mode === 'reading' ? 3600 : 2700; await saveState(); renderPdfDrill(); }
function parseVocabLines(text) {
  return String(text || '').split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.includes('|') ? line.split('|') : line.split(',');
    return { word: (parts[0] || '').trim(), meaning: (parts[1] || '').trim(), example: (parts.slice(2).join(',') || '').trim() };
  }).filter(x => x.word && x.meaning);
}
async function importVocabItems(items) {
  const existing = new Set((state.vocab || []).map(w => w.word.toLowerCase()));
  let added = 0;
  items.forEach(item => { if (!existing.has(item.word.toLowerCase())) { state.vocab.push(createWordCard(item)); existing.add(item.word.toLowerCase()); added += 1; } });
  await saveState();
  renderVocab(); renderMetrics();
  $('#vocabImportStatus').textContent = `已导入 ${added} 个新单词，重复项已自动跳过。`;
}
function handleVocabFileImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { $('#vocabImportText').value = reader.result; importVocabFromText(); };
  reader.readAsText(file);
}
function importVocabFromText() { importVocabItems(parseVocabLines($('#vocabImportText').value)); }

async function login(profile) { state.user = { name: profile.name, email: profile.email, createdAt: new Date().toISOString() }; state.target.overall = profile.band; state.target.examDate = profile.examDate || nextExamDate(); await saveState(); render(); }
function render() { $('#authScreen').classList.toggle('hidden', Boolean(state.user)); $('#app').classList.toggle('hidden', !state.user); $('#loginExam').value = state.target.examDate || nextExamDate(); if (!state.user) return; renderUser(); renderMetrics(); renderPractice(); renderMockSelect(); renderMock(); renderPdfDrill(); renderVocab(); renderWrongbook(); renderOutputs(); renderOutputPrompt(); renderAIFeedback(); renderResources(); renderTasks(); renderHeatmap(); renderReview(); renderReminder(); renderTimer(); setupScribblePad(); showCurrentView(); registerServiceWorker(); }
function showCurrentView() {
  const allowed = ['dashboard', 'practice', 'exam', 'pdfdrill', 'vocab', 'wrongbook', 'output', 'resources', 'plan', 'timer', 'review'];
  const requested = (location.hash || '#dashboard').replace('#', '').trim();
  const view = allowed.includes(requested) ? requested : 'dashboard';
  if (requested !== view) history.replaceState(null, '', `#${view}`);
  $$('.app-view').forEach(section => section.classList.toggle('active-view', section.id === view));
  $$('.dashboard-only').forEach(section => section.classList.remove('active-view'));
  $$('.sidebar nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${view}`));
  document.body.dataset.view = view;
  if (state?.user) requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function renderUser() { $('#userName').textContent = state.user.name; $('#userEmail').textContent = `${state.user.email} · 单人本地版`; $('#userInitial').textContent = state.user.name.slice(0, 1).toUpperCase(); }
function renderMetrics() { const attempts = state.practice.attempts || []; const correct = attempts.filter(a => a.correct).length; const accuracy = attempts.length ? Math.round(correct / attempts.length * 100) : 0; $('#accuracyRate').textContent = `${accuracy}%`; $('#accuracyBar').style.width = `${accuracy}%`; $('#wrongCount').textContent = (state.practice.wrongbook || []).filter(w => !w.mastered).length; $('#dueWordCount').textContent = getDueWords().length; $('#daysLeft').textContent = Math.max(0, Math.ceil((new Date(state.target.examDate) - startOfDay(new Date())) / 86400000)); $('#weeklyMinutes').textContent = recentCheckins(7).reduce((s, i) => s + Number(i.minutes || 0), 0); }
function switchPractice(set) { state.practice.currentSet = set; state.practice.currentIndex = 0; selectedAnswer = null; $$('.chip[data-practice]').forEach(c => c.classList.toggle('active', c.dataset.practice === set)); resetPractice(false); renderPractice(); }
function renderPractice() { const set = questionSets[state.practice.currentSet]; const q = set.questions[state.practice.currentIndex]; $('#practiceModule').textContent = set.module; $('#practiceTitle').textContent = set.title; $('#practicePassage').textContent = set.passage; $('#questionIndex').textContent = `${state.practice.currentIndex + 1} / ${set.questions.length}`; $('#questionType').textContent = q.type; $('#questionText').textContent = q.text; $('#answerFeedback').innerHTML = ''; selectedAnswer = null; const list = $('#optionList'); list.innerHTML = ''; q.options.forEach((option, index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'option-button'; button.textContent = `${String.fromCharCode(65 + index)}. ${option}`; button.addEventListener('click', () => { selectedAnswer = index; $$('.option-button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); }); list.appendChild(button); }); renderPracticeTimer(); }
async function submitAnswer() { if (selectedAnswer === null) { $('#answerFeedback').innerHTML = '<p class="warn">请先选择一个答案。</p>'; return; } const set = questionSets[state.practice.currentSet]; const q = set.questions[state.practice.currentIndex]; const correct = selectedAnswer === q.answer; const attempt = { id: crypto.randomUUID(), date: toDateKey(new Date()), set: state.practice.currentSet, questionId: q.id, question: q.text, selected: q.options[selectedAnswer], answer: q.options[q.answer], explanation: q.explanation, correct }; state.practice.attempts.push(attempt); if (!correct && !state.practice.wrongbook.some(w => w.questionId === q.id && !w.mastered)) state.practice.wrongbook.unshift({ ...attempt, mastered: false }); await saveState(); $('#answerFeedback').innerHTML = `<p class="${correct ? 'ok' : 'bad'}">${correct ? '回答正确' : `回答错误，正确答案：${q.options[q.answer]}`}</p><p>${q.explanation}</p>`; renderMetrics(); renderWrongbook(); }
function nextQuestion() { const set = questionSets[state.practice.currentSet]; state.practice.currentIndex = (state.practice.currentIndex + 1) % set.questions.length; selectedAnswer = null; renderPractice(); }
function togglePracticeTimer() { if (practiceInterval) { clearInterval(practiceInterval); practiceInterval = null; $('#startPracticeBtn').textContent = '继续本组计时'; return; } $('#startPracticeBtn').textContent = practiceSeconds ? '暂停本组计时' : '暂停本组计时'; practiceInterval = setInterval(() => { practiceSeconds += 1; renderPracticeTimer(); }, 1000); }
function resetPractice(renderNow = true) { clearInterval(practiceInterval); practiceInterval = null; practiceSeconds = 0; const btn = $('#startPracticeBtn'); if (btn) btn.textContent = '开始本组计时'; if (renderNow) renderPractice(); else renderPracticeTimer(); }
function endPracticeSession() { clearInterval(practiceInterval); practiceInterval = null; practiceSeconds = 0; selectedAnswer = null; state.practice.currentIndex = 0; renderPractice(); $('#answerFeedback').innerHTML = '<p class="empty">已结束本组刷题，可以切换题型或重新开始。</p>'; }
function renderPracticeTimer() { $('#practiceTimer').textContent = formatSeconds(practiceSeconds); const actions = document.querySelector('.practice-actions'); if (actions && !$('#endPracticeBtn')) { const end = document.createElement('button'); end.id = 'endPracticeBtn'; end.type = 'button'; end.className = 'text-btn'; end.textContent = '结束本组'; end.addEventListener('click', endPracticeSession); actions.appendChild(end); } }
function renderWrongbook() { const list = $('#wrongbookList'); const wrongs = (state.practice.wrongbook || []).filter(w => !w.mastered); list.innerHTML = ''; if (!wrongs.length) { list.innerHTML = '<p class="empty">暂无错题。刷题答错后会自动进入这里。</p>'; return; } const template = $('#wrongTemplate'); wrongs.forEach(item => { const node = template.content.firstElementChild.cloneNode(true); node.querySelector('span').textContent = item.set; node.querySelector('small').textContent = item.date; node.querySelector('h3').textContent = item.question; node.querySelector('p').textContent = `你的答案：${item.selected}；正确答案：${item.answer}`; node.querySelector('strong').textContent = item.explanation; node.querySelector('button').addEventListener('click', async () => { item.mastered = true; await saveState(); renderWrongbook(); renderMetrics(); }); list.appendChild(node); }); }


function renderMockSelect() { const select = $('#mockSelect'); if (!select || select.options.length) return; fullTests.forEach(test => { const option = document.createElement('option'); option.value = test.id; option.textContent = test.title; select.appendChild(option); }); if (!state.mock.currentTestId && fullTests[0]) state.mock.currentTestId = fullTests[0].id; select.value = state.mock.currentTestId; }
function currentMock() { return fullTests.find(test => test.id === state.mock.currentTestId) || fullTests[0]; }
function renderMock() { const test = currentMock(); const area = $('#mockArea'); if (!test) { area.innerHTML = '<p class="empty">暂无模拟题。</p>'; return; } $('#mockTimer').textContent = state.mock.remaining ? formatSeconds(state.mock.remaining) : `${test.minutes}:00`; area.innerHTML = `${renderMockControls()}${renderListeningSection(test)}${renderReadingSection(test)}`; area.querySelectorAll('[data-mock-q]').forEach(input => { const key = input.dataset.mockQ; input.checked = state.mock.answers[key] === Number(input.value); input.addEventListener('change', async () => { state.mock.answers[key] = Number(input.value); await saveState(); }); }); }

function renderMockControls() {
  const active = Boolean(state.mock.startedAt && state.mock.remaining > 0);
  const paused = Boolean(state.mock.paused);
  return `<div class="mock-control-strip"><strong>${active ? (paused ? '模考已暂停' : '模考进行中') : '模考控制台'}</strong><div><button type="button" class="ghost-btn" data-mock-control="pause">${paused ? '继续模考' : '暂停模考'}</button><button type="button" class="text-btn" data-mock-control="end">结束/退出模考</button></div></div>`;
}
async function handleMockControlClick(event) {
  const btn = event.target.closest('[data-mock-control]');
  if (!btn) return;
  const action = btn.dataset.mockControl;
  if (action === 'pause') {
    if (!state.mock.startedAt || state.mock.remaining <= 0) return;
    if (state.mock.paused) {
      state.mock.paused = false;
      clearInterval(mockInterval);
      mockInterval = setInterval(() => { state.mock.remaining = Math.max(0, state.mock.remaining - 1); $('#mockTimer').textContent = formatSeconds(state.mock.remaining); if (state.mock.remaining === 0) submitMock(); }, 1000);
    } else {
      state.mock.paused = true;
      clearInterval(mockInterval);
      mockInterval = null;
    }
    await saveState();
    renderMock();
  }
  if (action === 'end') {
    clearInterval(mockInterval);
    mockInterval = null;
    state.mock.paused = false;
    state.mock.startedAt = null;
    state.mock.remaining = 0;
    state.mock.answers = {};
    await saveState();
    renderMock();
    $('#mockResult').innerHTML = '<p class="empty">已结束本次模考，未计入成绩。可以重新选择套题开始。</p>';
  }
}

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
async function startMock() { const test = currentMock(); if (!test) return; state.mock.answers = {}; state.mock.startedAt = new Date().toISOString(); state.mock.remaining = test.minutes * 60; state.mock.paused = false; clearInterval(mockInterval); mockInterval = setInterval(() => { state.mock.remaining = Math.max(0, state.mock.remaining - 1); $('#mockTimer').textContent = formatSeconds(state.mock.remaining); if (state.mock.remaining === 0) submitMock(); }, 1000); await saveState(); renderMock(); $('#mockResult').innerHTML = '<p class="empty">考试已开始。可以暂停、继续或结束本次模考。</p>'; }
async function submitMock() { const test = currentMock(); if (!test) return; clearInterval(mockInterval); mockInterval = null; const all = [...test.listening.questions, ...test.reading.questions]; let correct = 0; const details = all.map(q => { const chosen = state.mock.answers[q.id]; const ok = chosen === q.answer; if (ok) correct += 1; return `<li class="${ok ? 'ok' : 'bad'}"><strong>${escapeHTML(q.text)}</strong><br>你的答案：${chosen === undefined ? '未作答' : escapeHTML(q.options[chosen])}；正确答案：${escapeHTML(q.options[q.answer])}<br>${escapeHTML(q.explanation)}</li>`; }).join(''); const score = Math.round(correct / all.length * 100); state.mock.attempts.unshift({ id: crypto.randomUUID(), date: new Date().toLocaleString(), testId: test.id, correct, total: all.length, score }); await saveState(); $('#mockResult').innerHTML = `<h3>自动判分：${correct}/${all.length} · ${score}%</h3><p>${estimateBand(score)}</p><ol>${details}</ol>`; }
function estimateBand(score) { if (score >= 90) return '估算表现：Band 8.0–9.0 区间。'; if (score >= 75) return '估算表现：Band 7.0–7.5 区间。'; if (score >= 60) return '估算表现：Band 6.0–6.5 区间。'; return '估算表现：Band 5.5 或以下，需要集中复盘错题。'; }
function setupScribblePad() { if (scribbleReady) return; const canvas = $('#scribbleCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#2d2118'; let drawing = false; const pos = event => { const rect = canvas.getBoundingClientRect(); const point = event.touches ? event.touches[0] : event; return { x: (point.clientX - rect.left) * (canvas.width / rect.width), y: (point.clientY - rect.top) * (canvas.height / rect.height) }; }; const start = event => { drawing = true; const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); event.preventDefault(); }; const move = event => { if (!drawing) return; const p = pos(event); ctx.lineTo(p.x, p.y); ctx.stroke(); event.preventDefault(); }; const end = () => { drawing = false; }; canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end); canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', end); scribbleReady = true; }
function clearScribblePad() { const canvas = $('#scribbleCanvas'); if (!canvas) return; canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); }

function createWordCard(item) { const today = toDateKey(new Date()); return { id: crypto.randomUUID(), word: item.word, meaning: item.meaning, example: item.example || '', stage: 0, due: today, correctCount: 0, missCount: 0, createdAt: today }; }
function getDueWords() { const today = toDateKey(new Date()); return (state.vocab || []).filter(w => w.due <= today); }
function currentDueWord() { return getDueWords()[0] || null; }
function setAnswerVisible(visible) {
  vocabAnswerVisible = visible;
  const card = $('.momo-review-card');
  card?.setAttribute('data-card-state', visible ? 'back' : 'front');
  $('.review-front')?.classList.toggle('hidden', visible);
  $('.review-back')?.classList.toggle('hidden', !visible);
}
function showWordAnswer() { if (currentDueWord()) setAnswerVisible(true); }
function renderVocab() {
  const due = getDueWords();
  const word = due[0];
  const total = Math.max(1, (state.vocab || []).length);
  const todayDone = Math.max(0, total - due.length);
  $('#wordDue').textContent = `今日待复习 ${due.length}`;
  $('#wordProgressBar').style.width = `${Math.min(100, Math.round(todayDone / total * 100))}%`;
  if (!word) {
    $('#wordStage').textContent = 'Done';
    $('#wordText').textContent = '今天的单词已完成';
    $('#wordMeaning').textContent = '可以选择下面任意 List，点击“背这组”后立刻进入背诵。';
    $('#wordExample').textContent = '';
    setAnswerVisible(true);
  } else {
    $('#wordStage').textContent = `第 ${word.stage + 1} 轮 · ${MEMORY_STEPS[word.stage] || 30} 天后复现`;
    $('#wordText').textContent = word.word;
    $('#wordMeaning').textContent = word.meaning;
    $('#wordExample').textContent = word.example ? `例句：${word.example}` : '';
    setAnswerVisible(vocabAnswerVisible);
  }
  renderWordList();
  renderVocabModules();
}
async function addWord(event) { event.preventDefault(); state.vocab.unshift(createWordCard({ word: $('#newWord').value.trim(), meaning: $('#newMeaning').value.trim(), example: $('#newExample').value.trim() })); event.currentTarget.reset(); vocabAnswerVisible = false; await saveState(); renderVocab(); renderMetrics(); }
async function seedMoreWords() { const existing = new Set((state.vocab || []).map(w => w.word.toLowerCase())); coreWords.filter(w => !existing.has(w.word.toLowerCase())).forEach(w => state.vocab.push(createWordCard(w))); vocabAnswerVisible = false; await saveState(); renderVocab(); renderMetrics(); }
async function reviewWord(result) {
  const word = currentDueWord(); if (!word) return;
  const mode = result === true ? 'known' : result === false ? 'forgot' : result;
  const next = new Date();
  if (mode === 'known') {
    word.correctCount += 1;
    word.stage = Math.min(word.stage + 1, MEMORY_STEPS.length - 1);
    next.setDate(next.getDate() + (MEMORY_STEPS[word.stage] || 30));
  } else if (mode === 'fuzzy') {
    word.missCount += 1;
    word.stage = Math.max(1, Math.min(word.stage, 2));
    next.setDate(next.getDate() + 1);
  } else {
    word.missCount += 1;
    word.stage = 0;
    next.setDate(next.getDate());
  }
  word.due = toDateKey(next);
  vocabAnswerVisible = false;
  await saveState(); renderVocab(); renderMetrics();
}
function renderWordList() { const list = $('#wordList'); const template = $('#wordTemplate'); list.innerHTML = ''; (state.vocab || []).slice().sort((a, b) => a.due.localeCompare(b.due)).slice(0, 12).forEach(word => { const node = template.content.firstElementChild.cloneNode(true); node.querySelector('strong').textContent = word.word; node.querySelector('span').textContent = word.meaning; node.querySelector('small').textContent = `下次：${word.due} · 第 ${word.stage + 1} 轮`; list.appendChild(node); }); }
function moduleProgress(moduleId, wordNumber) { const key = String(wordNumber); const bucket = state.vocabModuleProgress[moduleId] || {}; return bucket[key] || {}; }
function renderVocabModules() {
  const tabs = $('#vocabModuleTabs'); const box = $('#vocabModuleWords');
  if (!tabs || !box) return;
  if (!vocabModules.length) { tabs.innerHTML = ''; box.innerHTML = '<p class="empty">还没有识别到 PDF 单词模块。</p>'; return; }
  if (!activeVocabModuleId || !vocabModules.some(module => module.id === activeVocabModuleId)) activeVocabModuleId = vocabModules[0].id;
  const total = vocabModules.reduce((sum, module) => sum + module.words.length, 0);
  const doneTotal = vocabModules.reduce((sum, module) => sum + module.words.filter(word => moduleProgress(module.id, word.number).done).length, 0);
  $('#vocabModuleCount').textContent = `已提取 ${total} 个词`;
  $('#vocabModuleSummary').textContent = `已勾选 ${doneTotal}/${total} · 点 List 可选组，点词卡可单个背`;
  tabs.innerHTML = vocabModules.map(module => {
    const done = module.words.filter(word => moduleProgress(module.id, word.number).done).length;
    return `<button type="button" class="${module.id === activeVocabModuleId ? 'active' : ''}" data-vocab-module="${module.id}"><span>${escapeHTML(module.title)}</span><small>${done}/${module.count}</small></button>`;
  }).join('');
  const module = vocabModules.find(item => item.id === activeVocabModuleId) || vocabModules[0];
  const done = module.words.filter(word => moduleProgress(module.id, word.number).done).length;
  const starred = module.words.filter(word => moduleProgress(module.id, word.number).star).length;
  box.innerHTML = `<div class="vocab-module-toolbar"><div><strong>${escapeHTML(module.title)}</strong><span>${escapeHTML(module.chapter)} · ${done}/${module.count} 已勾选 · ${starred} 个重点</span></div><button type="button" data-vocab-module-add="${module.id}">背这组</button></div><div class="module-word-grid">${module.words.map(word => renderModuleWord(module.id, word)).join('')}</div>`;
}
function renderModuleWord(moduleId, word) {
  const progress = moduleProgress(moduleId, word.number);
  return `<article class="module-word ${progress.done ? 'is-done' : ''} ${progress.star ? 'is-starred' : ''}" data-module-word="${moduleId}" data-word-number="${word.number}" title="点击词卡可直接开始背这个词"><button type="button" class="word-check" data-module-done="${moduleId}" data-word-number="${word.number}" aria-label="勾选 ${escapeHTML(word.word)}">${progress.done ? '✓' : ''}</button><div><strong>${word.number}. ${escapeHTML(word.word)}</strong><span>${escapeHTML(word.meaning)}</span><small>${escapeHTML(word.example || '')}</small></div><button type="button" class="word-star" data-module-star="${moduleId}" data-word-number="${word.number}" aria-label="标重点">${progress.star ? '★' : '☆'}</button><button type="button" class="word-add" data-module-add-word="${moduleId}" data-word-number="${word.number}">背这个</button></article>`;
}
function handleVocabModuleTabClick(event) { const target = event.target.closest('[data-vocab-module]'); if (!target) return; activeVocabModuleId = target.dataset.vocabModule; renderVocabModules(); }
async function handleVocabModuleWordClick(event) {
  const doneBtn = event.target.closest('[data-module-done]');
  const starBtn = event.target.closest('[data-module-star]');
  const addWordBtn = event.target.closest('[data-module-add-word]');
  const addModuleBtn = event.target.closest('[data-vocab-module-add]');
  const wordCard = event.target.closest('[data-module-word]');
  if (doneBtn) { updateModuleProgress(doneBtn.dataset.moduleDone, doneBtn.dataset.wordNumber, 'done'); await saveState(); renderVocabModules(); return; }
  if (starBtn) { updateModuleProgress(starBtn.dataset.moduleStar, starBtn.dataset.wordNumber, 'star'); await saveState(); renderVocabModules(); return; }
  if (addWordBtn) { await addModuleWordsToMemory(addWordBtn.dataset.moduleAddWord, addWordBtn.dataset.wordNumber); return; }
  if (addModuleBtn) { await addModuleWordsToMemory(addModuleBtn.dataset.vocabModuleAdd); return; }
  if (wordCard) { await addModuleWordsToMemory(wordCard.dataset.moduleWord, wordCard.dataset.wordNumber); }
}
function updateModuleProgress(moduleId, wordNumber, field) {
  if (!state.vocabModuleProgress[moduleId]) state.vocabModuleProgress[moduleId] = {};
  const key = String(wordNumber);
  state.vocabModuleProgress[moduleId][key] = { ...(state.vocabModuleProgress[moduleId][key] || {}), [field]: !state.vocabModuleProgress[moduleId][key]?.[field] };
}
async function addModuleWordsToMemory(moduleId, wordNumber = null) {
  const module = vocabModules.find(item => item.id === moduleId); if (!module) return;
  const words = wordNumber ? module.words.filter(word => String(word.number) === String(wordNumber)) : module.words;
  if (!words.length) return;
  const today = toDateKey(new Date());
  const keyOf = item => String(item.word || '').trim().toLowerCase();
  const selectedKeys = new Set(words.map(keyOf).filter(Boolean));
  const existingByKey = new Map((state.vocab || []).map(item => [keyOf(item), item]));
  let added = 0;
  const focusQueue = words.map(word => {
    const key = keyOf(word);
    const card = existingByKey.get(key) || createWordCard(word);
    if (!existingByKey.has(key)) added += 1;
    card.word = card.word || word.word;
    card.meaning = card.meaning || word.meaning;
    card.example = card.example || word.example || '';
    card.stage = 0;
    card.due = today;
    return card;
  });
  state.vocab = [...focusQueue, ...(state.vocab || []).filter(item => !selectedKeys.has(keyOf(item)))];
  vocabAnswerVisible = false;
  await saveState(); renderVocab(); renderMetrics();
  alert(wordNumber ? '已放到当前背诵卡片。' : `已把 ${words.length} 个词放到背诵队列最前面。${added ? `新增 ${added} 个。` : ''}`);
}

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
function exportJSON() { const backup = JSON.parse(JSON.stringify(state)); (backup.testBundles || []).forEach(bundle => { bundle.pdfUrl = bundle.pdfUrl?.startsWith('blob:') ? '' : bundle.pdfUrl; (bundle.audioTracks || []).forEach(track => { if (track.url?.startsWith('blob:')) track.url = ''; }); }); if (backup.pdfDrill?.fileUrl?.startsWith('blob:')) backup.pdfDrill.fileUrl = ''; if (backup.pdfDrill?.audioTracks) backup.pdfDrill.audioTracks.forEach(track => { if (track.url?.startsWith('blob:')) track.url = ''; }); const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ielts-compass-solo-backup.json'; a.click(); URL.revokeObjectURL(url); }
function importJSON(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => { state = mergeState(JSON.parse(reader.result)); await saveState(); render(); }; reader.readAsText(file); }
function recentCheckins(days) { const keys = new Set(); const today = startOfDay(new Date()); for (let i = 0; i < days; i++) { const d = new Date(today); d.setDate(today.getDate() - i); keys.add(toDateKey(d)); } return state.checkins.filter(i => keys.has(i.date)); }
function seedCheckins() { const today = startOfDay(new Date()); return [0,45,80,120,0,150,95,60,130,0,110,160,75,125].map((v,i,a) => { const d = new Date(today); d.setDate(today.getDate() - (a.length - 1 - i)); return { date: toDateKey(d), minutes: v, words: v ? Math.round(v / 4) : 0, questions: v ? Math.round(v / 10) : 0, note: '' }; }); }
function heatLevel(m) { if (m >= 150) return 4; if (m >= 100) return 3; if (m >= 45) return 2; if (m > 0) return 1; return 0; }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function toDateKey(date) { return date.toISOString().slice(0, 10); }
function nextExamDate() { const d = new Date(); d.setDate(d.getDate() + 90); return toDateKey(d); }
function formatSeconds(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
function escapeHTML(str) { return String(str ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\'': '&#39;', '"': '&quot;' }[c])); }
