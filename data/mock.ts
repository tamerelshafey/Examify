import { Exam, Question, QuestionType, ExamResult, User, UserRole, QuestionStatus, MarketplaceQuestionBank, ProctoringEventType, Sale } from '../types';

export let mockStructuredCategories: Record<string, Record<string, string[]>> = {
    "المراحل الدراسية": {
        "المرحلة الابتدائية": [
            "الصف الأول الابتدائي",
            "الصف الثاني الابتدائي",
            "الصف الثالث الابتدائي",
            "الصف الرابع الابتدائي",
            "الصف الخامس الابتدائي",
            "الصف السادس الابتدائي"
        ],
        "المرحلة الإعدادية": [
            "الصف الأول الإعدادي",
            "الصف الثاني الإعدادي",
            "الصف الثالث الإعدادي"
        ],
        "الثانوية العامة": [
            "الصف الأول الثانوي - علمي",
            "الصف الأول الثانوي - أدبي",
            "الصف الثاني الثانوي - علمي",
            "الصف الثاني الثانوي - أدبي",
            "الصف الثالث الثانوي - علمي",
            "الصف الثالث الثانوي - أدبي"
        ],
    },
    "التعليم الفني": {
        "التعليم الصناعي": [
            "كهرباء",
            "ميكانيكا",
            "إلكترونيات",
            "بناء وتشييد",
            "تبريد وتكييف"
        ],
        "التعليم التجاري": [
            "محاسبة",
            "سكرتارية",
            "تسويق",
            "إدارة أعمال"
        ],
        "التعليم الزراعي": [
            "إنتاج نباتي",
            "إنتاج حيواني",
            "صناعات غذائية"
        ],
        "التعليم الفندقي": [
            "إدارة فنادق",
            "خدمات طعام وشراب",
            "سياحة"
        ],
    },
    "المجالات المهنية": {
        "البرمجة والحوسبة": [
            "علم الحاسوب",
            "هندسة البرمجيات",
            "الذكاء الاصطناعي",
            "أمن الشبكات والأمن السيبراني"
        ],
        "برمجة الألعاب": [
            "تطوير الألعاب",
            "تصميم ثلاثي الأبعاد",
            "الواقع الافتراضي والواقع المعزز (VR/AR)"
        ],
        "إدارة المشاريع": [
            "أساسيات إدارة المشاريع",
            "إدارة المخاطر",
            "إدارة الموارد البشرية",
            "أدوات ومنهجيات إدارة المشاريع"
        ],
        "الهندسة والتكنولوجيا المتقدمة": [
            "الطاقة المتجددة",
            "الأمن السيبراني المتقدم",
            "الروبوتات والأتمتة",
            "تحليل البيانات الضخمة",
            "الهندسة الطبية الحيوية"
        ],
    }
};

export let mockUsers: User[] = [
    { id: 'user-1', name: 'Ali Hasan', email: 'ali.hasan@example.com', role: UserRole.Teacher, createdAt: new Date('2023-01-15'), balance: 6.99, purchasedBankIds: ['mkb-2'] },
    { id: 'user-2', name: 'Fatima Ahmed', email: 'fatima.ahmed@example.com', role: UserRole.Examinee, createdAt: new Date('2023-02-20') },
    { id: 'user-3', name: 'Yusuf Ibrahim', email: 'yusuf.i@example.com', role: UserRole.Examinee, createdAt: new Date('2023-03-10') },
    { id: 'user-4', name: 'Noor Khalid', email: 'noor.k@example.com', role: UserRole.Examinee, createdAt: new Date('2023-04-05') },
    { id: 'user-5', name: 'Future Skills Co.', email: 'contact@futureskills.com', role: UserRole.TrainingCompany, createdAt: new Date('2023-05-01'), balance: 3.49 },
    { id: 'user-6', name: 'Innovate Corp.', email: 'hr@innovate.com', role: UserRole.Corporate, createdAt: new Date('2023-06-12'), purchasedBankIds: ['mkb-1'] },
    { id: 'user-7', name: 'Admin User', email: 'admin@examify.com', role: UserRole.Admin, createdAt: new Date('2023-01-01') },
];

export let mockQuestionBank: Question[] = [
    // Teacher's personal questions (user-1)
    { id: 'qb-t1', ownerId: 'user-1', text: 'ما هو الغرض من `useEffect` hook في React؟', type: QuestionType.Essay, category: 'البرمجة والحوسبة', subCategory: 'هندسة البرمجيات', correctAnswer: 'It lets you perform side effects in function components.', points: 10, tags: ['React', 'Hooks'], status: QuestionStatus.Approved },
    { id: 'qb-t2', ownerId: 'user-1', text: 'أي خاصية CSS تستخدم لإنشاء مسافة بين عناصر flex؟', type: QuestionType.MultipleChoice, category: 'البرمجة والحوسبة', subCategory: 'هندسة البرمجيات', options: ['margin', 'padding', 'gap', 'space-between'], correctAnswer: 'gap', points: 5, tags: ['CSS', 'Flexbox'], status: QuestionStatus.Approved },
    
    // Training Company's questions (user-5)
    { id: 'qb-tc1', ownerId: 'user-5', text: 'ما هو الهدف الرئيسي من اجتماع مراجعة السبرنت (sprint retrospective) في سكروم؟', type: QuestionType.ShortAnswer, category: 'إدارة المشاريع', subCategory: 'أدوات ومنهجيات إدارة المشاريع', correctAnswer: 'To reflect on the past sprint and identify improvements for the next one.', points: 10, tags: ['Scrum', 'Agile'], status: QuestionStatus.Approved },

    // Corporate's questions (user-6)
    { id: 'qb-c1', ownerId: 'user-6', text: 'أي دالة في Excel تستخدم للبحث عن قيمة في جدول حسب الصف؟', type: QuestionType.MultipleChoice, category: 'التعليم التجاري', subCategory: 'محاسبة', options: ['VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH'], correctAnswer: 'HLOOKUP', points: 5, tags: ['Excel', 'Data Analysis'], status: QuestionStatus.Approved },

    // Official Marketplace Questions
    { id: 'qb-m1', ownerId: 'marketplace', text: 'ما هي عاصمة فرنسا؟', type: QuestionType.MultipleChoice, category: 'المرحلة الابتدائية', subCategory: 'الصف الرابع الابتدائي', options: ['برلين', 'مدريد', 'باريس', 'روما'], correctAnswer: 'باريس', points: 5, tags: ['Geography'], status: QuestionStatus.Approved },
    { id: 'qb-m2', ownerId: 'marketplace', text: 'الكلمة المفتاحية `const` في JavaScript تمنع تعديل الكائن.', type: QuestionType.TrueFalse, category: 'البرمجة والحوسبة', subCategory: 'علم الحاسوب', correctAnswer: 'False', points: 5, tags: ['JavaScript', 'Programming'], status: QuestionStatus.Approved },
    { id: 'qb-m3', ownerId: 'marketplace', text: 'اشرح مفهوم الإغلاق (closures) في JavaScript.', type: QuestionType.Essay, category: 'البرمجة والحوسبة', subCategory: 'علم الحاسوب', correctAnswer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).', points: 10, tags: ['JavaScript', 'Programming', 'Advanced'], status: QuestionStatus.Approved },
    { id: 'qb-m4', ownerId: 'marketplace', text: 'أي مما يلي يعتبر من معالجات CSS الأولية (preprocessors)؟', type: QuestionType.MultipleSelect, category: 'البرمجة والحوسبة', subCategory: 'هندسة البرمجيات', options: ['SASS', 'LESS', 'Stylus', 'PostCSS'], correctAnswer: ['SASS', 'LESS', 'Stylus'], points: 10, tags: ['CSS', 'Web Development'], status: QuestionStatus.Approved },
    { id: 'qb-m5', ownerId: 'marketplace', text: 'رتب تعقيدات Big O التالية من الأفضل إلى الأسوأ.', type: QuestionType.Ordering, category: 'البرمجة والحوسبة', subCategory: 'علم الحاسوب', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctAnswer: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], points: 10, tags: ['CS', 'Algorithms'], status: QuestionStatus.Approved },
    { id: 'qb-m6', ownerId: 'marketplace', text: 'فيمَ يُستخدم مخطط جانت (Gantt chart) في إدارة المشاريع؟', type: QuestionType.ShortAnswer, category: 'إدارة المشاريع', subCategory: 'أدوات ومنهجيات إدارة المشاريع', correctAnswer: 'To illustrate a project schedule', points: 5, tags: ['PM', 'Charts'], status: QuestionStatus.Approved },
    { id: 'qb-m7', ownerId: 'marketplace', text: 'ما هي المراحل الخمس لإدارة المشاريع؟', type: QuestionType.Ordering, category: 'إدارة المشاريع', subCategory: 'أساسيات إدارة المشاريع', options: ['البدء', 'التخطيط', 'التنفيذ', 'المراقبة والتحكم', 'الإغلاق'], correctAnswer: ['البدء', 'التخطيط', 'التنفيذ', 'المراقبة والتحكم', 'الإغلاق'], points: 10, tags: ['PM', 'Lifecycle'], status: QuestionStatus.Approved },
];

export let mockMarketplaceBanks: MarketplaceQuestionBank[] = [
    {
        id: 'mkb-1',
        authorId: 'user-1',
        authorName: 'Ali Hasan',
        specializedCategory: 'البرمجة والحوسبة',
        title: 'أساسيات علوم الحاسوب',
        description: 'مجموعة شاملة من الأسئلة تغطي المفاهيم الأساسية في علوم الحاسوب، مثالية لطلاب السنة الأولى.',
        questionIds: ['qb-m2', 'qb-m3', 'qb-m5', 'qb-t1', 'qb-t2'],
        rating: 4.8,
        price: 9.99,
        status: 'approved',
        submittedAt: new Date('2023-07-15T10:00:00Z'),
    },
    {
        id: 'mkb-2',
        authorId: 'user-5',
        authorName: 'Future Skills Co.',
        specializedCategory: 'إدارة المشاريع',
        title: 'مقدمة في إدارة المشاريع',
        description: 'أسئلة عملية لاختبار فهم منهجيات وأدوات إدارة المشاريع الحديثة.',
        questionIds: ['qb-m6', 'qb-m7', 'qb-tc1'],
        rating: 4.5,
        price: 4.99,
        status: 'approved',
        submittedAt: new Date('2023-07-20T11:00:00Z'),
    },
    {
        id: 'mkb-3',
        authorId: 'user-1',
        authorName: 'Ali Hasan',
        specializedCategory: 'البرمجة والحوسبة',
        title: 'تطوير واجهات الويب',
        description: 'بنك أسئلة يركز على تقنيات CSS الحديثة وتطوير واجهات المستخدم التفاعلية.',
        questionIds: ['qb-m4', 'qb-t2'],
        rating: 4.2,
        price: 0,
        status: 'approved',
        submittedAt: new Date('2023-08-05T18:00:00Z'),
    },
    {
        id: 'mkb-4',
        authorId: 'user-6',
        authorName: 'Innovate Corp.',
        specializedCategory: 'التعليم التجاري',
        title: 'مهارات Excel المتقدمة للمحترفين',
        description: 'بنك أسئلة لتقييم المهارات المتقدمة في Excel، بما في ذلك VLOOKUP والجداول المحورية.',
        questionIds: ['qb-c1'],
        rating: 0,
        price: 19.99,
        status: 'pending',
        submittedAt: new Date('2023-08-10T14:30:00Z'),
    },
    {
        id: 'mkb-5',
        authorId: 'user-1',
        authorName: 'Ali Hasan',
        specializedCategory: 'البرمجة والحوسبة',
        title: 'مقدمة في الذكاء الاصطناعي',
        description: 'أسئلة تغطي أساسيات الذكاء الاصطناعي ولكنها تفتقر إلى العمق.',
        questionIds: ['qb-t1'],
        rating: 0,
        price: 0,
        status: 'rejected',
        submittedAt: new Date('2023-08-01T09:00:00Z'),
        rejectionReason: 'Questions are too simplistic and do not align with the marketplace quality standards. Please add more complex scenarios.',
    }
];

export const mockSales: Sale[] = [
    {
        id: 'sale-1',
        bankId: 'mkb-1',
        bankTitle: 'أساسيات علوم الحاسوب',
        buyerId: 'user-6',
        sellerId: 'user-1',
        salePrice: 9.99,
        commission: 3.00,
        sellerEarning: 6.99,
        timestamp: new Date('2023-08-12T10:00:00Z')
    },
    {
        id: 'sale-2',
        bankId: 'mkb-2',
        bankTitle: 'مقدمة في إدارة المشاريع',
        buyerId: 'user-1',
        sellerId: 'user-5',
        salePrice: 4.99,
        commission: 1.50,
        sellerEarning: 3.49,
        timestamp: new Date('2023-08-11T15:30:00Z')
    }
];

export let mockAcquiredBanks: { [userId: string]: string[] } = {
    'user-1': ['mkb-2'], // Teacher Ali has acquired the Project Management bank
    'user-6': ['mkb-1'], // Corporate has acquired the CS bank
};

export let mockBankRatings: { [bankId: string]: { [userId: string]: number } } = {
    'mkb-2': { 'user-1': 5 },
    'mkb-1': { 'user-6': 4 },
};

export let mockExams: Exam[] = [
  {
    id: '1',
    title: 'React Fundamentals Quiz',
    description: 'Test your knowledge on the core concepts of React, including components, state, and props.',
    duration: 30,
    difficulty: 'Medium',
    questionCount: 5,
    questions: [
      { id: 'q1', ownerId: 'exam-1', category: 'Programming', subCategory: 'JavaScript', text: 'What is JSX?', type: QuestionType.Essay, correctAnswer: 'JSX is a syntax extension for JavaScript.', points: 10, tags: ['React', 'Core Concepts'] },
      { id: 'q2', ownerId: 'exam-1', category: 'Programming', subCategory: 'JavaScript', text: 'Is `useState` a Hook?', type: QuestionType.TrueFalse, correctAnswer: 'True', points: 5, tags: ['React', 'Hooks'] },
      { id: 'q3', ownerId: 'exam-1', category: 'Programming', subCategory: 'JavaScript', text: 'Which method is used to render a React element to the DOM?', type: QuestionType.MultipleChoice, options: ['ReactDOM.render()', 'React.render()', 'ReactDOM.createRoot().render()', 'React.mount()'], correctAnswer: 'ReactDOM.createRoot().render()', points: 5, tags: ['React', 'DOM'] },
      { id: 'q4', ownerId: 'exam-1', category: 'Programming', subCategory: 'JavaScript', text: 'Props are mutable.', type: QuestionType.TrueFalse, correctAnswer: 'False', points: 5, tags: ['React', 'Props'] },
      { id: 'q5', ownerId: 'exam-1', category: 'Programming', subCategory: 'JavaScript', text: 'What does `useEffect` do?', type: QuestionType.Essay, correctAnswer: 'It lets you perform side effects in function components.', points: 10, tags: ['React', 'Hooks'] },
    ],
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'A challenging quiz on advanced TypeScript features like generics, decorators, and mapped types.',
    duration: 45,
    difficulty: 'Hard',
    questionCount: 3,
    questions: [
        { id: 't1', ownerId: 'exam-2', category: 'Programming', subCategory: 'TypeScript', text: 'What is a generic in TypeScript?', type: QuestionType.Essay, correctAnswer: 'Generics allow you to create reusable components that can work with a variety of types.', points: 10, tags: ['TypeScript', 'Generics'] },
        { id: 't2', ownerId: 'exam-2', category: 'Programming', subCategory: 'TypeScript', text: '`type` and `interface` can be used interchangeably in all cases.', type: QuestionType.TrueFalse, correctAnswer: 'False', points: 5, tags: ['TypeScript', 'Types'] },
        { id: 't3', ownerId: 'exam-2', category: 'Programming', subCategory: 'TypeScript', text: 'Which of the following is a utility type in TypeScript?', type: QuestionType.MultipleChoice, options: ['Promise<T>', 'Partial<T>', 'Array<T>', 'Object<T>'], correctAnswer: 'Partial<T>', points: 10, tags: ['TypeScript', 'Utility Types'] },
    ]
  },
  {
    id: '3',
    title: 'Basic HTML & CSS',
    description: 'An introductory quiz covering the basics of HTML tags and CSS selectors.',
    duration: 15,
    difficulty: 'Easy',
    questionCount: 4,
    questions: [
        { id: 'h1', ownerId: 'exam-3', category: 'Programming', subCategory: 'HTML', text: 'What does HTML stand for?', type: QuestionType.MultipleChoice, options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperText and links Markup Language', 'None of the above'], correctAnswer: 'HyperText Markup Language', points: 5, tags: ['HTML'] },
        { id: 'h2', ownerId: 'exam-3', category: 'Programming', subCategory: 'HTML', text: 'The `<div>` tag is an inline element.', type: QuestionType.TrueFalse, correctAnswer: 'False', points: 5, tags: ['HTML'] },
        { id: 'h3', ownerId: 'exam-3', category: 'Programming', subCategory: 'CSS', text: 'How do you select an element with id "demo"?', type: QuestionType.MultipleChoice, options: ['.demo', '#demo', 'demo', '*demo'], correctAnswer: '#demo', points: 5, tags: ['CSS'] },
        { id: 'h4', ownerId: 'exam-3', category: 'Programming', subCategory: 'HTML', text: 'What is the purpose of the `alt` attribute on an `<img>` tag?', type: QuestionType.Essay, correctAnswer: 'It provides alternative text for an image if the user for some reason cannot view it.', points: 10, tags: ['HTML', 'Accessibility'] },
    ]
  }
];

export let mockCorporateExams: Exam[] = [
    {
        id: 'corp-1',
        title: 'Project Management Principles',
        description: 'Assess understanding of core project management methodologies, including Agile and Waterfall.',
        duration: 40,
        difficulty: 'Medium',
        questionCount: 4,
        questions: [
            { id: 'pm1', ownerId: 'exam-corp-1', category: 'Business', subCategory: 'Project Management', text: 'What is the primary role of a Scrum Master?', type: QuestionType.Essay, correctAnswer: 'To facilitate the Scrum process and remove impediments for the team.', points: 10 },
            { id: 'pm2', ownerId: 'exam-corp-1', category: 'Business', subCategory: 'Project Management', text: 'A Gantt chart is a key tool in Waterfall project management.', type: QuestionType.TrueFalse, correctAnswer: 'True', points: 5 },
            { id: 'pm3', ownerId: 'exam-corp-1', category: 'Business', subCategory: 'Project Management', text: 'Which of these is NOT a phase of the project management lifecycle?', type: QuestionType.MultipleChoice, options: ['Initiation', 'Planning', 'Execution', 'Marketing'], correctAnswer: 'Marketing', points: 5 },
            { id: 'pm4', ownerId: 'exam-corp-1', category: 'Business', subCategory: 'Project Management', text: 'What is risk mitigation?', type: QuestionType.Essay, correctAnswer: 'The process of developing options and actions to enhance opportunities and reduce threats to project objectives.', points: 10 },
        ]
    },
    {
        id: 'corp-2',
        title: 'Advanced Excel Skills',
        description: 'Test proficiency in advanced Excel functions, including VLOOKUP, Pivot Tables, and Macros.',
        duration: 60,
        difficulty: 'Hard',
        questionCount: 3,
        questions: [
            { id: 'ex1', ownerId: 'exam-corp-2', category: 'Business', subCategory: 'Finance', text: '`VLOOKUP` can search for a value to its left.', type: QuestionType.TrueFalse, correctAnswer: 'False', points: 10 },
            { id: 'ex2', ownerId: 'exam-corp-2', category: 'Business', subCategory: 'Finance', text: 'What is a Pivot Table used for?', type: QuestionType.Essay, correctAnswer: 'To summarize, sort, reorganize, group, count, total or average data stored in a database.', points: 10 },
            { id: 'ex3', ownerId: 'exam-corp-2', category: 'Business', subCategory: 'Finance', text: 'Which function is more versatile than VLOOKUP for complex lookups?', type: QuestionType.MultipleChoice, options: ['HLOOKUP', 'SUMIF', 'INDEX/MATCH', 'COUNTIF'], correctAnswer: 'INDEX/MATCH', points: 10 },
        ]
    },
];

export let mockExamResults: ExamResult[] = [
    { id: 'res-1', examId: '1', examTitle: 'React Fundamentals Quiz', examineeId: 'user-2', examineeName: 'Fatima Ahmed', score: 28, totalPoints: 35, answers: {q1: 'A syntax extension for Javascript', q2: 'True', q3: 'ReactDOM.createRoot().render()', q4: 'True', q5: 'It lets you perform side effects'}, submittedAt: new Date('2023-08-01T10:30:00Z'), proctoringEvents: [{type: ProctoringEventType.TabSwitch, timestamp: 300000, severity: 'medium'}, {type: ProctoringEventType.PasteContent, timestamp: 600000, details: 'q1', severity: 'high'}] },
    { id: 'res-2', examId: '1', examTitle: 'React Fundamentals Quiz', examineeId: 'user-3', examineeName: 'Yusuf Ibrahim', score: 32, totalPoints: 35, answers: {q1: 'JSX is a syntax extension for JavaScript.', q2: 'True', q3: 'ReactDOM.createRoot().render()', q4: 'False', q5: 'It lets you perform side effects in function components.'}, submittedAt: new Date('2023-08-01T11:00:00Z'), proctoringEvents: [] },
    { id: 'res-3', examId: '3', examTitle: 'Basic HTML & CSS', examineeId: 'user-2', examineeName: 'Fatima Ahmed', score: 25, totalPoints: 25, answers: {h1: 'HyperText Markup Language', h2: 'False', h3: '#demo', h4: 'It provides alternative text for an image if the user for some reason cannot view it.'}, submittedAt: new Date('2023-07-25T14:00:00Z'), proctoringEvents: [] },
    { id: 'res-4', examId: 'corp-1', examTitle: 'Project Management Principles', examineeId: 'user-4', examineeName: 'Noor Khalid', score: 25, totalPoints: 30, answers: {pm1: 'The scrum master serves the team and removes roadblocks.', pm2: 'True', pm3: 'Marketing', pm4: 'Risk mitigation is about reducing threats.'}, submittedAt: new Date('2023-08-05T09:00:00Z'), proctoringEvents: [{type: ProctoringEventType.TabSwitch, timestamp: 120000, severity: 'medium'}] },
];
