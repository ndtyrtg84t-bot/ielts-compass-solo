const IELTS_FULL_TESTS = [
  {
    id: 'mock-a',
    title: 'Academic Mock A · Campus and Climate',
    minutes: 38,
    listening: {
      title: 'Listening Section · Student Services',
      script: 'Audio script: A new student calls the student services office. She wants to join a study skills workshop. The workshop is held on Wednesday at 3:30 p.m. in Room 204 of the Learning Centre. The fee is 12 pounds, but students who book online pay only 8 pounds. The assistant reminds her to bring a notebook and her student ID card.',
      questions: [
        { id: 'ma-l1', text: 'When is the workshop?', options: ['Monday 3:30 p.m.', 'Wednesday 3:30 p.m.', 'Wednesday 4:30 p.m.', 'Friday 3:00 p.m.'], answer: 1, explanation: '脚本明确说 Wednesday at 3:30 p.m.' },
        { id: 'ma-l2', text: 'Where is the workshop held?', options: ['Library Room 204', 'Learning Centre Room 204', 'Student Union Room 240', 'Main Hall'], answer: 1, explanation: '地点是 Room 204 of the Learning Centre。' },
        { id: 'ma-l3', text: 'How much is the online booking fee?', options: ['8 pounds', '10 pounds', '12 pounds', '20 pounds'], answer: 0, explanation: '在线预订为 8 pounds。' },
        { id: 'ma-l4', text: 'What must she bring?', options: ['A laptop and passport', 'A notebook and student ID', 'A receipt and pen', 'A printed map'], answer: 1, explanation: '提醒带 notebook and student ID card。' }
      ]
    },
    reading: {
      title: 'Reading Passage · Urban Gardens',
      passage: 'Urban gardens are small green spaces created on unused land, rooftops, or community plots. Supporters argue that they improve access to fresh food and create stronger neighbourhood relationships. However, researchers warn that gardens alone cannot solve food inequality. Their impact depends on land access, long-term funding, and local participation. In some cities, successful projects are connected with schools, health centres, and public housing programmes, making them part of a wider social policy rather than a decorative environmental trend.',
      questions: [
        { id: 'ma-r1', text: 'What is the writer’s main view of urban gardens?', options: ['They are useless decorative projects.', 'They can help, but only under certain conditions.', 'They should replace supermarkets.', 'They work best without public support.'], answer: 1, explanation: '文章说有帮助，但取决于土地、资金、参与和政策连接。' },
        { id: 'ma-r2', text: 'Which factor is NOT mentioned as affecting impact?', options: ['Land access', 'Long-term funding', 'Local participation', 'International tourism'], answer: 3, explanation: '未提到 international tourism。' },
        { id: 'ma-r3', text: 'Successful projects may connect with...', options: ['schools and health centres', 'airports and hotels', 'banks and factories', 'museums only'], answer: 0, explanation: '原文提到 schools, health centres, public housing programmes。' },
        { id: 'ma-r4', text: 'The word “decorative” is closest in meaning to...', options: ['mainly for appearance', 'financially powerful', 'scientifically tested', 'legally required'], answer: 0, explanation: 'decorative 表示装饰性的、主要为了外观。' }
      ]
    }
  },
  {
    id: 'mock-b',
    title: 'Academic Mock B · Work and Technology',
    minutes: 38,
    listening: {
      title: 'Listening Section · Museum Volunteer Programme',
      script: 'Audio script: The museum is looking for volunteers for its weekend programme. Volunteers will welcome visitors, explain the map, and help children in the activity room. Training takes place on Tuesday evening from 6:00 to 8:00. Applicants should email the coordinator before the 14th of May. Previous experience is not required, but volunteers must be confident speaking to the public.',
      questions: [
        { id: 'mb-l1', text: 'When is the training?', options: ['Tuesday 6:00–8:00 p.m.', 'Thursday 6:00–8:00 p.m.', 'Tuesday 8:00–9:00 a.m.', 'Sunday afternoon'], answer: 0, explanation: 'Training takes place on Tuesday evening from 6:00 to 8:00.' },
        { id: 'mb-l2', text: 'What should applicants do before 14 May?', options: ['Visit the museum', 'Email the coordinator', 'Pay a fee', 'Attend an interview'], answer: 1, explanation: 'Applicants should email the coordinator before the 14th of May.' },
        { id: 'mb-l3', text: 'What is NOT required?', options: ['Confidence speaking to the public', 'Availability for training', 'Previous experience', 'Helping visitors'], answer: 2, explanation: 'Previous experience is not required。' },
        { id: 'mb-l4', text: 'Where will volunteers help children?', options: ['Gift shop', 'Activity room', 'Main entrance', 'Cafe'], answer: 1, explanation: 'help children in the activity room。' }
      ]
    },
    reading: {
      title: 'Reading Passage · Remote Work',
      passage: 'Remote work has moved from a temporary arrangement to a permanent feature of many industries. Employees often value the flexibility, while employers may reduce office costs. Yet the change also creates challenges. New workers can find it harder to learn informal rules, and managers may struggle to evaluate performance fairly. The most effective organisations do not simply copy office routines online; they redesign communication, mentoring, and assessment so that remote work becomes a deliberate system rather than an emergency solution.',
      questions: [
        { id: 'mb-r1', text: 'According to the passage, remote work is now...', options: ['only an emergency solution', 'a permanent feature in many industries', 'illegal in most companies', 'limited to new workers'], answer: 1, explanation: '第一句说明 remote work has moved ... to a permanent feature。' },
        { id: 'mb-r2', text: 'What difficulty may new workers face?', options: ['Finding office furniture', 'Learning informal rules', 'Choosing a computer brand', 'Avoiding all meetings'], answer: 1, explanation: '文章说 new workers can find it harder to learn informal rules。' },
        { id: 'mb-r3', text: 'Effective organisations should...', options: ['copy office routines online', 'remove mentoring', 'redesign communication and assessment', 'avoid remote work completely'], answer: 2, explanation: '结尾强调 redesign communication, mentoring, and assessment。' },
        { id: 'mb-r4', text: 'The word “deliberate” is closest to...', options: ['planned and intentional', 'quick and careless', 'expensive and rare', 'informal and hidden'], answer: 0, explanation: 'deliberate 表示有意设计的、经过计划的。' }
      ]
    }
  },
  {
    id: 'mock-c',
    title: 'Academic Mock C · Education and Health',
    minutes: 38,
    listening: {
      title: 'Listening Section · Fitness Class Booking',
      script: 'Audio script: A gym receptionist explains the new class schedule. Yoga is now on Monday and Thursday mornings. The beginner swimming class has moved from the small pool to Lane 3 in the main pool. Members should book through the app at least one day before the class. Towels are no longer provided, but lockers remain free for members.',
      questions: [
        { id: 'mc-l1', text: 'When is yoga available?', options: ['Monday and Thursday mornings', 'Monday evening only', 'Wednesday and Friday mornings', 'Every afternoon'], answer: 0, explanation: 'Yoga is now on Monday and Thursday mornings.' },
        { id: 'mc-l2', text: 'Where is beginner swimming now held?', options: ['Small pool', 'Lane 3 in the main pool', 'Outdoor pool', 'Training room'], answer: 1, explanation: 'moved ... to Lane 3 in the main pool。' },
        { id: 'mc-l3', text: 'How should members book?', options: ['By phone only', 'Through the app', 'At the door after class starts', 'By email after attending'], answer: 1, explanation: 'book through the app。' },
        { id: 'mc-l4', text: 'What is no longer provided?', options: ['Lockers', 'Towels', 'Swimming lanes', 'Yoga mats'], answer: 1, explanation: 'Towels are no longer provided。' }
      ]
    },
    reading: {
      title: 'Reading Passage · Sleep and Learning',
      passage: 'Sleep is often treated as separate from study, but research suggests that it plays an active role in learning. During sleep, the brain strengthens useful memories and weakens less relevant information. Students who reduce sleep to gain extra revision time may therefore damage the very process they are trying to improve. This does not mean that sleep alone can replace practice. Rather, effective learning depends on a cycle of focused study, rest, retrieval, and correction.',
      questions: [
        { id: 'mc-r1', text: 'What is the main idea?', options: ['Sleep replaces revision.', 'Sleep supports learning as part of a cycle.', 'Students should never study at night.', 'Correction is less important than sleep.'], answer: 1, explanation: '文章强调 sleep 是 focused study, rest, retrieval, correction 循环的一部分。' },
        { id: 'mc-r2', text: 'During sleep, the brain...', options: ['forgets all new information', 'strengthens useful memories', 'stops all learning processes', 'only processes physical skills'], answer: 1, explanation: '原文 says strengthens useful memories。' },
        { id: 'mc-r3', text: 'Reducing sleep for extra revision may...', options: ['always improve marks', 'damage learning processes', 'remove the need for practice', 'make correction unnecessary'], answer: 1, explanation: '文章说 may damage the process they want to improve。' },
        { id: 'mc-r4', text: 'The word “retrieval” means...', options: ['bringing information back from memory', 'writing information for the first time', 'ignoring old mistakes', 'sleeping longer than usual'], answer: 0, explanation: 'retrieval 在学习语境中指回忆、提取记忆。' }
      ]
    }
  }
];

if (typeof window !== 'undefined') {
  window.IELTS_FULL_TESTS = IELTS_FULL_TESTS;
}
