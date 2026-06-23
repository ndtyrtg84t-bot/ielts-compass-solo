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
,
  {
    id: 'mock-d',
    title: 'Academic Mock D · Transport and Housing',
    minutes: 38,
    listening: {
      title: 'Listening Section · Apartment Viewing',
      script: 'Audio script: A tenant calls a property manager about a small apartment near the train station. The manager explains that the rent includes water but not electricity. The apartment is available from the first of next month. The tenant asks about noise, and the manager says the bedroom faces a quiet courtyard. A viewing is arranged for Thursday at half past four.',
      questions: [
        { id: 'd-l1', text: 'What is included in the rent?', options: ['Electricity', 'Water', 'Internet', 'Gas'], answer: 1, explanation: 'The manager says water is included but electricity is not.' },
        { id: 'd-l2', text: 'When is the apartment available?', options: ['Immediately', 'Next week', 'The first of next month', 'In three months'], answer: 2, explanation: 'The availability date is the first of next month.' },
        { id: 'd-l3', text: 'Why might the apartment be quieter than expected?', options: ['It is underground', 'It has no windows', 'The bedroom faces a courtyard', 'It is far from transport'], answer: 2, explanation: 'The bedroom faces a quiet courtyard.' },
        { id: 'd-l4', text: 'When is the viewing?', options: ['Tuesday at 4:30', 'Thursday at 4:30', 'Thursday at 5:30', 'Friday at 4:00'], answer: 1, explanation: 'A viewing is arranged for Thursday at half past four.' }
      ]
    },
    reading: {
      title: 'Reading Passage · Car-Free Neighbourhoods',
      passage: 'Several cities are experimenting with car-free neighbourhoods to reduce pollution and improve public space. Critics worry that restrictions may inconvenience residents, especially those with limited mobility. However, pilot projects suggest that when reliable buses, safe cycling lanes and shared delivery points are provided, many residents adapt quickly. Local shops can also benefit from slower streets because pedestrians spend more time in the area. The main lesson is that car-free design works best when it is introduced with practical alternatives rather than as a simple ban.',
      questions: [
        { id: 'd-r1', text: 'What is the main purpose of car-free neighbourhoods?', options: ['To increase parking fees', 'To reduce pollution and improve public space', 'To close local shops', 'To remove all buses'], answer: 1, explanation: 'The passage states the goal is reducing pollution and improving public space.' },
        { id: 'd-r2', text: 'What concern do critics raise?', options: ['Residents may be inconvenienced', 'Shops may become too busy', 'Cycling lanes are too safe', 'Buses are too reliable'], answer: 0, explanation: 'Critics worry about inconvenience, especially for people with limited mobility.' },
        { id: 'd-r3', text: 'Why can local shops benefit?', options: ['Cars move faster', 'Pedestrians spend more time there', 'Delivery points disappear', 'Rent becomes free'], answer: 1, explanation: 'Pedestrians staying longer can help shops.' },
        { id: 'd-r4', text: 'What condition supports successful car-free design?', options: ['A simple ban only', 'No public transport', 'Practical alternatives', 'More private parking'], answer: 2, explanation: 'The final sentence stresses practical alternatives.' }
      ]
    }
  },
  {
    id: 'mock-e',
    title: 'Academic Mock E · Food and Sustainability',
    minutes: 38,
    listening: {
      title: 'Listening Section · Community Cooking Course',
      script: 'Audio script: A community centre is offering a four-week cooking course about reducing food waste. The tutor will show participants how to plan meals, store vegetables properly and use leftovers safely. The course costs twenty pounds, but students and retired residents can pay half price. Participants should bring a notebook, while knives and ingredients are provided.',
      questions: [
        { id: 'e-l1', text: 'How long is the course?', options: ['Two weeks', 'Four weeks', 'Six weeks', 'One weekend'], answer: 1, explanation: 'It is a four-week cooking course.' },
        { id: 'e-l2', text: 'What is the course mainly about?', options: ['Restaurant management', 'Reducing food waste', 'Baking cakes', 'Growing vegetables'], answer: 1, explanation: 'The main topic is reducing food waste.' },
        { id: 'e-l3', text: 'Who can pay half price?', options: ['Tourists', 'Students and retired residents', 'Only children', 'Professional chefs'], answer: 1, explanation: 'Students and retired residents get a discount.' },
        { id: 'e-l4', text: 'What should participants bring?', options: ['A knife', 'Ingredients', 'A notebook', 'A cooking pot'], answer: 2, explanation: 'Participants should bring a notebook.' }
      ]
    },
    reading: {
      title: 'Reading Passage · Vertical Farming',
      passage: 'Vertical farming grows crops in stacked layers under controlled light and temperature. Supporters argue that it uses less land and can place food production closer to urban consumers. The method also reduces the need for pesticides because the growing environment is enclosed. Nevertheless, energy use remains a challenge, particularly when farms rely on artificial lighting. Researchers are therefore testing renewable power and more efficient LED systems. Vertical farming is unlikely to replace traditional agriculture, but it may become an important supplement for leafy vegetables and herbs.',
      questions: [
        { id: 'e-r1', text: 'What is vertical farming?', options: ['Growing crops in stacked layers', 'Farming only on mountains', 'Fishing in cities', 'Traditional field agriculture'], answer: 0, explanation: 'The first sentence defines it as growing crops in stacked layers.' },
        { id: 'e-r2', text: 'Why may fewer pesticides be needed?', options: ['The farms are enclosed', 'The crops are not edible', 'The soil is removed from cities', 'The plants grow outside'], answer: 0, explanation: 'An enclosed environment reduces pest exposure.' },
        { id: 'e-r3', text: 'What challenge remains?', options: ['Too much land use', 'Energy use', 'No urban consumers', 'Too many herbs'], answer: 1, explanation: 'The passage identifies energy use as a challenge.' },
        { id: 'e-r4', text: 'What is the likely future role of vertical farming?', options: ['Replacing all agriculture', 'Supplementing some crops', 'Ending LED research', 'Increasing pesticide use'], answer: 1, explanation: 'It may supplement leafy vegetables and herbs.' }
      ]
    }
  },
  {
    id: 'mock-f',
    title: 'Academic Mock F · Media and Culture',
    minutes: 38,
    listening: {
      title: 'Listening Section · Local Film Festival',
      script: 'Audio script: The local film festival will open on Friday evening with a documentary about coastal towns. Most screenings take place at the central library, but children’s films will be shown at the arts centre. Tickets are cheaper before five o’clock. Volunteers are needed to check tickets and guide visitors between rooms.',
      questions: [
        { id: 'f-l1', text: 'What film opens the festival?', options: ['A comedy', 'A documentary about coastal towns', 'A children’s cartoon', 'A historical drama'], answer: 1, explanation: 'The festival opens with a documentary about coastal towns.' },
        { id: 'f-l2', text: 'Where are most screenings held?', options: ['Central library', 'Arts centre', 'Town hall', 'University theatre'], answer: 0, explanation: 'Most screenings take place at the central library.' },
        { id: 'f-l3', text: 'When are tickets cheaper?', options: ['After eight', 'Before five', 'Only on Sunday', 'At midnight'], answer: 1, explanation: 'Tickets are cheaper before five o’clock.' },
        { id: 'f-l4', text: 'What will volunteers do?', options: ['Write reviews', 'Check tickets and guide visitors', 'Make films', 'Cook meals'], answer: 1, explanation: 'Volunteers check tickets and guide visitors.' }
      ]
    },
    reading: {
      title: 'Reading Passage · Museum Labels',
      passage: 'Museum labels may seem minor, but they strongly influence how visitors understand objects. A short label can make an unfamiliar artefact approachable, while a technical label may discourage non-specialists. Some museums now use layered labels: a brief explanation for casual visitors followed by optional deeper information. This approach respects different levels of interest without oversimplifying the collection. Digital labels can also provide audio, translations and images of how objects were used.',
      questions: [
        { id: 'f-r1', text: 'What do museum labels influence?', options: ['Ticket prices', 'Visitor understanding', 'Building size', 'Opening hours'], answer: 1, explanation: 'Labels influence how visitors understand objects.' },
        { id: 'f-r2', text: 'What may discourage non-specialists?', options: ['A technical label', 'A short label', 'A clear translation', 'An audio guide'], answer: 0, explanation: 'Technical labels may discourage non-specialists.' },
        { id: 'f-r3', text: 'What are layered labels designed to do?', options: ['Remove all detail', 'Serve different interest levels', 'Hide the collection', 'Replace museums'], answer: 1, explanation: 'They provide brief and deeper information for different visitors.' },
        { id: 'f-r4', text: 'What can digital labels provide?', options: ['Only prices', 'Audio, translations and images', 'Parking spaces', 'Food orders'], answer: 1, explanation: 'Digital labels can provide audio, translations and images.' }
      ]
    }
  }

];

if (typeof window !== 'undefined') {
  window.IELTS_FULL_TESTS = IELTS_FULL_TESTS;
}
