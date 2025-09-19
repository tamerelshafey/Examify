

import { Exam, Question, QuestionType, StudentAnswer, ExamResult, Answer, User, UserRole, ProctoringEvent, QuestionStatus, StudentRiskProfile, LearningPath } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MOCK DATA & HELPERS ---

let mockCategories: Record<string, string[]> = {
    "Programming": ["JavaScript", "TypeScript", "Python", "CSS", "HTML"],
    "Business": ["Project Management", "Marketing", "Finance"],
    "General Knowledge": ["Geography", "History", "Science"],
};

const renderAnswer = (answer: Answer): string => {
    if (answer === undefined || answer === null) return "Not Answered";
    if (Array.isArray(answer)) return answer.join(', ');
    if (typeof answer === 'object') return JSON.stringify(answer);
    return String(answer);
};

let mockUsers: User[] = [
    { id: 'user-1', name: 'Ali Hasan', email: 'ali.hasan@example.com', role: UserRole.Teacher, createdAt: new Date('2023-01-15') },
    { id: 'user-2', name: 'Fatima Ahmed', email: 'fatima.ahmed@example.com', role: UserRole.Examinee, createdAt: new Date('2023-02-20') },
    { id: 'user-3', name: 'Yusuf Ibrahim', email: 'yusuf.i@example.com', role: UserRole.Examinee, createdAt: new Date('2023-03-10') },
    { id: 'user-4', name: 'Noor Khalid', email: 'noor.k@example.com', role: UserRole.Examinee, createdAt: new Date('2023-04-05') },
    { id: 'user-5', name: 'Future Skills Co.', email: 'contact@futureskills.com', role: UserRole.TrainingCompany, createdAt: new Date('2023-05-01') },
    { id: 'user-6', name: 'Innovate Corp.', email: 'hr@innovate.com', role: UserRole.Corporate, createdAt: new Date('2023-06-12') },
    { id: 'user-7', name: 'Admin User', email: 'admin@examify.com', role: UserRole.Admin, createdAt: new Date('2023-01-01') },
];

let mockQuestionBank: Question[] = [
    // Teacher's personal questions (user-1)
    { id: 'qb-t1', ownerId: 'user-1', text: 'What is the purpose of the `useEffect` hook in React?', type: QuestionType.Essay, category: 'Programming', subCategory: 'JavaScript', correctAnswer: 'It lets you perform side effects in function components.', points: 10, tags: ['React', 'Hooks'], status: QuestionStatus.Approved },
    { id: 'qb-t2', ownerId: 'user-1', text: 'Which CSS property is used to create space between flex items?', type: QuestionType.MultipleChoice, category: 'Programming', subCategory: 'CSS', options: ['margin', 'padding', 'gap', 'space-between'], correctAnswer: 'gap', points: 5, tags: ['CSS', 'Flexbox'], status: QuestionStatus.Approved },
    
    // Training Company's questions (user-5)
    { id: 'qb-tc1', ownerId: 'user-5', text: 'What is the main goal of a sprint retrospective in Scrum?', type: QuestionType.ShortAnswer, category: 'Business', subCategory: 'Project Management', correctAnswer: 'To reflect on the past sprint and identify improvements for the next one.', points: 10, tags: ['Scrum', 'Agile'], status: QuestionStatus.Approved },

    // Corporate's questions (user-6)
    { id: 'qb-c1', ownerId: 'user-6', text: 'Which Excel function is used to look up a value in a table by row?', type: QuestionType.MultipleChoice, category: 'Business', subCategory: 'Finance', options: ['VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH'], correctAnswer: 'HLOOKUP', points: 5, tags: ['Excel', 'Data Analysis'], status: QuestionStatus.Approved },

    // Official Marketplace Questions
    { id: 'qb-m1', ownerId: 'marketplace', text: 'What is the capital of France?', type: QuestionType.MultipleChoice, category: 'General Knowledge', subCategory: 'Geography', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris', points: 5, tags: ['Geography'], status: QuestionStatus.Approved },
    { id: 'qb-m2', ownerId: 'marketplace', text: 'The `const` keyword in JavaScript prevents object mutation.', type: QuestionType.TrueFalse, category: 'Programming', subCategory: 'JavaScript', correctAnswer: 'False', points: 5, tags: ['JavaScript', 'Programming'], status: QuestionStatus.Pending },
    { id: 'qb-m3', ownerId: 'marketplace', text: 'Explain the concept of closures in JavaScript.', type: QuestionType.Essay, category: 'Programming', subCategory: 'JavaScript', correctAnswer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).', points: 10, tags: ['JavaScript', 'Programming', 'Advanced'], status: QuestionStatus.Approved },
    { id: 'qb-m4', ownerId: 'marketplace', text: 'Which of the following are CSS preprocessors?', type: QuestionType.MultipleSelect, category: 'Programming', subCategory: 'CSS', options: ['SASS', 'LESS', 'Stylus', 'PostCSS'], correctAnswer: ['SASS', 'LESS', 'Stylus'], points: 10, tags: ['CSS', 'Web Development'], status: QuestionStatus.Pending },
    { id: 'qb-m5', ownerId: 'marketplace', text: 'Arrange the following big O notations from best to worst.', type: QuestionType.Ordering, category: 'Programming', subCategory: 'JavaScript', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctAnswer: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], points: 10, tags: ['CS', 'Algorithms'], status: QuestionStatus.Approved },
    { id: 'qb-m6', ownerId: 'marketplace', text: 'What is a Gantt chart used for in project management?', type: QuestionType.ShortAnswer, category: 'Business', subCategory: 'Project Management', correctAnswer: 'To illustrate a project schedule', points: 5, tags: ['PM', 'Charts'], status: QuestionStatus.Approved },
];

let mockExams: Exam[] = [
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

let mockCorporateExams: Exam[] = [
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

let mockExamResults: ExamResult[] = [
    { id: 'res-1', examId: '1', examTitle: 'React Fundamentals Quiz', examineeId: 'user-2', examineeName: 'Fatima Ahmed', score: 28, totalPoints: 35, answers: {q1: 'A syntax extension for Javascript', q2: 'True', q3: 'ReactDOM.createRoot().render()', q4: 'True', q5: 'It lets you perform side effects'}, submittedAt: new Date('2023-08-01T10:30:00Z'), proctoringEvents: [{type: 'tab_switch', timestamp: 300000}, {type: 'paste_content', timestamp: 600000, details: 'q1'}] },
    { id: 'res-2', examId: '1', examTitle: 'React Fundamentals Quiz', examineeId: 'user-3', examineeName: 'Yusuf Ibrahim', score: 32, totalPoints: 35, answers: {q1: 'JSX is a syntax extension for JavaScript.', q2: 'True', q3: 'ReactDOM.createRoot().render()', q4: 'False', q5: 'It lets you perform side effects in function components.'}, submittedAt: new Date('2023-08-01T11:00:00Z'), proctoringEvents: [] },
    { id: 'res-3', examId: '3', examTitle: 'Basic HTML & CSS', examineeId: 'user-2', examineeName: 'Fatima Ahmed', score: 25, totalPoints: 25, answers: {h1: 'HyperText Markup Language', h2: 'False', h3: '#demo', h4: 'It provides alternative text for an image if the user for some reason cannot view it.'}, submittedAt: new Date('2023-07-25T14:00:00Z'), proctoringEvents: [] },
    { id: 'res-4', examId: 'corp-1', examTitle: 'Project Management Principles', examineeId: 'user-4', examineeName: 'Noor Khalid', score: 25, totalPoints: 30, answers: {pm1: 'The scrum master serves the team and removes roadblocks.', pm2: 'True', pm3: 'Marketing', pm4: 'Risk mitigation is about reducing threats.'}, submittedAt: new Date('2023-08-05T09:00:00Z'), proctoringEvents: [{type: 'tab_switch', timestamp: 120000}] },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- AI Service ---

export const analyzeQuestionWithAI = async (params: { questionText: string; existingCategories: Record<string, string[]> }): Promise<{ feedback: string; category: string; subCategory: string; tags: string[] }> => {
    const { questionText, existingCategories } = params;

    const schema = {
        type: Type.OBJECT,
        properties: {
            feedback: { type: Type.STRING, description: "A brief, 1-2 sentence pedagogical analysis of the question's quality and clarity." },
            category: { type: Type.STRING, description: "The most appropriate main category for this question." },
            subCategory: { type: Type.STRING, description: "The most appropriate sub-category within the suggested main category." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 relevant topic tags." },
        },
        required: ['feedback', 'category', 'subCategory', 'tags']
    };

    const prompt = `You are an expert pedagogical assistant. Analyze the following exam question.
    
    Question Text: "${questionText}"
    
    Available Categories and Sub-categories:
    ${JSON.stringify(existingCategories)}
    
    RULES:
    - Provide a concise (1-2 sentences) pedagogical analysis of the question. Comment on its clarity, what it effectively tests, and any potential ambiguities.
    - Based on the question text, suggest the most fitting category and sub-category from the provided list.
    - If no suitable category exists, you may suggest a new, logical one.
    - Generate 2-3 relevant and specific tags for the question.
    - The final output MUST be a valid JSON object matching the provided schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (!result.feedback || !result.category || !result.subCategory || !Array.isArray(result.tags)) {
            throw new Error("AI returned an invalid data structure for question analysis.");
        }

        return result;
    } catch (error) {
        console.error("Error analyzing question with AI:", error);
        throw new Error("Failed to get AI question analysis. Please try again.");
    }
};


export const generateFullExamWithAI = async (params: { topic: string; difficulty: string; count: number }): Promise<Omit<Exam, 'id' | 'questionCount'>> => {
    const { topic, difficulty, count } = params;

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: [QuestionType.MultipleChoice, QuestionType.TrueFalse] },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
            correctAnswer: { type: Type.STRING },
            points: { type: Type.INTEGER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
         required: ['text', 'type', 'correctAnswer', 'points', 'tags']
    };

    const examSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: `A creative and relevant title for an exam about ${topic}.` },
            description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the exam's content." },
            duration: { type: Type.INTEGER, description: `A suggested exam duration in minutes, appropriate for ${count} questions.` },
            questions: { type: Type.ARRAY, items: questionSchema }
        },
        required: ['title', 'description', 'duration', 'questions']
    };

    const prompt = `You are an AI expert in creating educational assessments. Generate a complete exam based on the following specifications.
    
    Topic: ${topic}
    Difficulty: ${difficulty}
    Number of Questions: ${count}
    
    RULES:
    - Generate a creative title and a concise description for the exam.
    - Suggest an appropriate duration in minutes.
    - Generate exactly ${count} unique, high-quality questions.
    - The questions should be a mix of "multiple-choice" and "true-false" types.
    - For "multiple-choice" questions, provide exactly 4 plausible options, with one being correct.
    - For "true-false" questions, the options array should be ["True", "False"].
    - Assign points based on difficulty (5 for Easy/Medium, 10 for Hard).
    - Include relevant topic tags for each question, always including "${topic}".
    - The final output MUST be a valid JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examSchema,
            },
        });

        const jsonString = response.text.trim();
        const generatedExam = JSON.parse(jsonString);

        if (!generatedExam.title || !generatedExam.description || !Array.isArray(generatedExam.questions)) {
            throw new Error("AI returned an invalid exam structure.");
        }

        const finalExam: Omit<Exam, 'id' | 'questionCount'> = {
            ...generatedExam,
            difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
            questions: generatedExam.questions.map((q: any) => ({
                ...q,
                id: `ai-gen-${Math.random()}`, // Temporary ID
                ownerId: 'ai-generated', // Temporary owner
                category: 'AI Generated',
                subCategory: topic,
            }))
        };

        return finalExam;

    } catch (error) {
        console.error("Error generating full exam with AI:", error);
        throw new Error("Failed to generate the exam with AI. Please try again.");
    }
};

export const createAIExamVariant = async (sourceExam: Omit<Exam, 'questions'>): Promise<Exam> => {
    await sleep(1500); // Simulate longer generation time
    const { title, difficulty, questionCount } = sourceExam;

    const generatedContent = await generateFullExamWithAI({
        topic: title,
        difficulty: difficulty,
        count: questionCount
    });

    const newExam: Exam = {
        ...generatedContent,
        title: `${title} (AI Variant)`,
        id: `exam-variant-${Date.now()}`,
        questionCount: generatedContent.questions.length
    };
    
    if (sourceExam.id.startsWith('corp-')) {
        mockCorporateExams.unshift(newExam);
    } else {
        mockExams.unshift(newExam);
    }

    return newExam;
};


export const getAIQuestionSuggestions = async (params: { partialQuestionText: string }): Promise<{ text: string; options: string[]; correctAnswer: string; points: number; tags: string[]; }> => {
    const { partialQuestionText } = params;
    const schema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING, description: "The complete, well-formed question text." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 plausible answer options, including the correct one." },
            correctAnswer: { type: Type.STRING, description: "The correct answer from the provided options." },
            points: { type: Type.INTEGER, description: "Suggested points (5 for easy/medium, 10 for hard)." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant topic tags." },
        },
        required: ['text', 'options', 'correctAnswer', 'points', 'tags']
    };
    const prompt = `You are an AI assistant for creating exam questions. Based on the following partial text, generate a complete multiple-choice question.
    Partial Text: "${partialQuestionText}"
    RULES:
    - Complete the question text to be clear and unambiguous.
    - Generate exactly 4 plausible multiple-choice options. One must be correct, and the others should be logical distractors.
    - Identify the correct answer from the options you provided.
    - Suggest points based on perceived difficulty (use 5 for easy/medium, 10 for hard).
    - Provide 1-3 relevant topic tags as an array of strings.
    - The final output MUST be a valid JSON object matching the provided schema.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        
        if (!result.text || !Array.isArray(result.options) || !result.correctAnswer || typeof result.points !== 'number' || !Array.isArray(result.tags)) {
            throw new Error("AI returned an invalid data structure for question suggestion.");
        }

        return result;

    } catch(error) {
        console.error("Error getting AI question suggestions:", error);
        throw new Error("Failed to get AI question suggestion. Please try again.");
    }
};

export const generateQuestionsWithAI = async (params: { topic: string; questionType: QuestionType; difficulty: string; count: number }): Promise<Omit<Question, 'id'>[]> => {
    const { topic, questionType, difficulty, count } = params;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The question text." },
                type: { type: Type.STRING, enum: [questionType], description: `The type of question. Must be '${questionType}'.` },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 possible answers for multiple-choice questions.", nullable: true },
                correctAnswer: { type: Type.STRING, description: "The correct answer. For multiple-select, join answers with '||'." },
                points: { type: Type.INTEGER, description: "Points for the question, based on difficulty." },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant tags for the question." },
            }
        }
    };
    
    const prompt = `Generate ${count} unique, high-quality exam questions for an exam platform.
    Topic: ${topic}
    Difficulty: ${difficulty}
    Question Type: ${questionType}
    
    RULES:
    - For the "points" field, use 5 for Easy/Medium difficulty and 10 for Hard difficulty.
    - For the "tags" field, ALWAYS include the topic "${topic}" and any other relevant keywords.
    - For "multiple-choice" question type, provide exactly 4 options.
    - For "multiple-select" question type, the 'correctAnswer' field should be a string with the correct options joined by "||".
    - For "true-false", "essay", and "short-answer", the 'correctAnswer' field is a single string.
    - Ensure the 'type' field in the output is exactly '${questionType}'.
    - The output must be a valid JSON array of objects following the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const generatedQuestions = JSON.parse(jsonString);

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("AI did not return a valid array.");
        }
        
        return generatedQuestions.map((q: any) => ({
            text: q.text || '',
            type: q.type || questionType,
            options: q.options || undefined,
            correctAnswer: q.type === QuestionType.MultipleSelect ? (q.correctAnswer || '').split('||') : (q.correctAnswer || ''),
            points: q.points || 5,
            tags: q.tags || [topic],
            ownerId: 'ai-generated',
            category: 'AI Generated',
            subCategory: topic,
            status: QuestionStatus.Approved,
        }));

    } catch (error) {
        console.error("Error generating questions with AI:", error);
        throw new Error("Failed to generate questions. Please try again.");
    }
};

// --- Other AI Services (Grading, Plagiarism, etc.) remain the same ---
export const gradeAnswerWithAI = async (params: {
    questionText: string;
    studentAnswer: string;
    modelAnswer: string;
    points: number;
}): Promise<{ suggestedScore: number; feedback: string }> => {
    const { questionText, studentAnswer, modelAnswer, points } = params;

    const schema = {
        type: Type.OBJECT,
        properties: {
            suggestedScore: { type: Type.INTEGER, description: `The suggested score for the student's answer, from 0 to ${points}.` },
            feedback: { type: Type.STRING, description: "Constructive, brief feedback for the student explaining the score." },
        },
        required: ['suggestedScore', 'feedback'],
    };

    const prompt = `You are a helpful teaching assistant. Your task is to grade a student's answer for an exam question.
    
    RULES:
    - Evaluate the student's answer based on the provided model answer/grading criteria.
    - Provide a fair score out of the maximum possible points.
    - Provide concise and constructive feedback.
    - The final output MUST be a valid JSON object matching the provided schema.

    Question: "${questionText}"
    Maximum Points: ${points}
    Model Answer / Grading Criteria: "${modelAnswer}"
    
    Student's Answer: "${studentAnswer}"
    
    Now, provide the grade and feedback in JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.suggestedScore !== 'number' || typeof result.feedback !== 'string') {
             throw new Error("AI returned an invalid data structure.");
        }
        
        result.suggestedScore = Math.max(0, Math.min(points, result.suggestedScore));

        return result;

    } catch (error) {
        console.error("Error grading answer with AI:", error);
        throw new Error("Failed to get AI grading suggestion. Please try again.");
    }
};

export const checkPlagiarismWithAI = async (params: {
    studentAnswer: string;
}): Promise<{ similarityScore: number; justification: string; sources: any[] }> => {
    const { studentAnswer } = params;
    
    const prompt = `You are a plagiarism detection service. Analyze the following text and compare it against web sources.
    
    Student's Answer: "${studentAnswer}"

    RULES:
    - Check for non-original phrases, sentences, or ideas.
    - On the first line, provide ONLY a similarity score from 0 to 100 (e.g., "85").
    - On a new line, provide a brief justification for your score.
    - Do not output the response in JSON format or with any other text.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const responseText = response.text.trim();
        const lines = responseText.split('\n');
        
        let similarityScore = parseInt(lines[0], 10);
        const justification = lines.slice(1).join('\n').trim();

        if (isNaN(similarityScore) || !justification) {
             throw new Error("AI returned an invalid data structure for plagiarism check.");
        }
        
        similarityScore = Math.max(0, Math.min(100, similarityScore));
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { similarityScore, justification, sources };

    } catch (error) {
        console.error("Error checking plagiarism with AI:", error);
        throw new Error("Failed to get AI plagiarism analysis. Please try again.");
    }
};

export const checkAuthenticityWithAI = async (params: {
    studentAnswer: string;
}): Promise<{ authenticityScore: number; justification: string; }> => {
    const { studentAnswer } = params;

     const schema = {
        type: Type.OBJECT,
        properties: {
            authenticityScore: { type: Type.INTEGER, description: "A score from 0 (likely AI-generated) to 100 (likely human-written)." },
            justification: { type: Type.STRING, description: "A brief analysis of the text's style, complexity, and phrasing to justify the score." },
        },
        required: ['authenticityScore', 'justification'],
    };

    const prompt = `You are an expert in linguistic analysis, specializing in differentiating human-written text from AI-generated text.
    Analyze the following student's answer to determine its authenticity.

    Student's Answer: "${studentAnswer}"
    
    RULES:
    - Evaluate the text for common signs of AI generation, such as overly formal tone, repetitive sentence structures, unusual vocabulary, or lack of personal voice.
    - Also, consider signs of human writing, such as colloquialisms, minor errors, or a more natural flow.
    - Provide an "authenticity score" from 0 (very likely AI-generated) to 100 (very likely human-written).
    - Provide a concise justification for your score, highlighting the key factors you observed.
    - The final output MUST be a valid JSON object matching the provided schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.authenticityScore !== 'number' || typeof result.justification !== 'string') {
             throw new Error("AI returned an invalid data structure for authenticity check.");
        }
        
        result.authenticityScore = Math.max(0, Math.min(100, result.authenticityScore));

        return result;

    } catch (error) {
        console.error("Error checking authenticity with AI:", error);
        throw new Error("Failed to get AI authenticity analysis. Please try again.");
    }
};

export const analyzeProctoringSessionWithAI = async (params: {
    examineeName: string;
    examTitle: string;
    examDuration: number;
    proctoringEvents?: ProctoringEvent[];
}): Promise<{ integrityScore: number; analyticalSummary: string; events: { timestamp: string; type: string; severity: 'low' | 'medium' | 'high' }[] }> => {
    const { examineeName, examTitle, examDuration, proctoringEvents } = params;

    const schema = {
        type: Type.OBJECT,
        properties: {
            integrityScore: { type: Type.INTEGER, description: "Overall integrity score from 0 to 100 (100 is perfect)." },
            analyticalSummary: { type: Type.STRING, description: "An analytical, narrative summary connecting suspicious events to provide a cohesive story. Example: 'The student repeatedly looked away when answering complex questions, which may suggest consulting external materials.'" },
            events: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        timestamp: { type: Type.STRING, description: `A timestamp for the event within the exam duration of ${examDuration} minutes (e.g., '00:12:34').` },
                        type: { type: Type.STRING, description: "A description of the suspicious event (e.g., 'User looked away from screen', 'Mobile phone detected', 'Unidentified noise')." },
                        severity: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: "The severity of the event." },
                    },
                    required: ['timestamp', 'type', 'severity'],
                }
            },
        },
        required: ['integrityScore', 'analyticalSummary', 'events'],
    };

    const behavioralData = proctoringEvents && proctoringEvents.length > 0
        ? `The system also logged the following behavioral events: ${JSON.stringify(proctoringEvents)}`
        : "No specific behavioral events were logged by the system.";

    const prompt = `You are an AI proctoring analysis service.
    Simulate the results of a proctoring session for an online exam, incorporating both simulated visual analysis and actual behavioral data.
    
    Examinee: ${examineeName}
    Exam: ${examTitle}
    Exam Duration: ${examDuration} minutes
    ${behavioralData}

    RULES:
    - The analytical summary should be a narrative, connecting different events to tell a story about the session. Instead of just listing events, try to infer a pattern. For example: 'The student looked away frequently during essay questions, followed by rapid typing, suggesting external help.'
    - Create between 3 and 6 suspicious events in total. Some should be based on the provided behavioral data, and you should invent others based on simulated visual analysis (e.g., looking away, phone detected).
    - If behavioral events are provided, ensure they are included in the final event list with an appropriate severity. A 'tab_switch' should be considered medium severity, and 'paste_content' could be medium to high.
    - Timestamps must be plausible and within the exam duration.
    - Calculate a final "Integrity Score" where 100 is perfect integrity. The score should decrease based on the number and severity of events.
    - The final output MUST be a valid JSON object matching the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (typeof result.integrityScore !== 'number' || typeof result.analyticalSummary !== 'string' || !Array.isArray(result.events)) {
             throw new Error("AI returned an invalid data structure for proctoring analysis.");
        }
        
        result.integrityScore = Math.max(0, Math.min(100, result.integrityScore));

        return result;

    } catch (error) {
        console.error("Error analyzing proctoring session with AI:", error);
        throw new Error("Failed to get AI proctoring analysis. Please try again.");
    }
};

export const getAIExplanation = async (params: {
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
}): Promise<{ explanation: string }> => {
    const { questionText, studentAnswer, correctAnswer } = params;
    const schema = {
        type: Type.OBJECT,
        properties: {
            explanation: { type: Type.STRING, description: "A concise, helpful explanation for the student in an encouraging tone." },
        },
        required: ['explanation'],
    };
    const prompt = `You are a friendly and encouraging AI tutor. A student has answered a question incorrectly. Explain why their answer is wrong and why the correct answer is right. Be concise (2-3 sentences) and use a positive tone.

    Question: "${questionText}"
    Student's Incorrect Answer: "${studentAnswer}"
    Correct Answer: "${correctAnswer}"

    Provide the explanation in JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (typeof result.explanation !== 'string') {
            throw new Error("AI returned an invalid data structure.");
        }
        return result;
    } catch (error) {
        console.error("Error getting AI explanation:", error);
        throw new Error("Failed to get AI explanation. Please try again.");
    }
};

export const getQuestionAnalysisWithAI = async (params: {
    question: Question;
    results: ExamResult[];
}): Promise<{ insight: string }> => {
    const { question, results } = params;

    const isCorrect = (q: Question, ans: Answer) => {
         switch (q.type) {
            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
            case QuestionType.Essay:
            case QuestionType.TrueFalse:
                return typeof ans === 'string' && typeof q.correctAnswer === 'string' && ans.toLowerCase() === q.correctAnswer.toLowerCase();
            case QuestionType.MultipleSelect:
                if (Array.isArray(ans) && Array.isArray(q.correctAnswer)) {
                    return JSON.stringify([...ans].sort()) === JSON.stringify([...q.correctAnswer].sort());
                } return false;
            case QuestionType.Ordering:
                if (Array.isArray(ans) && Array.isArray(q.correctAnswer)) {
                    return JSON.stringify(ans) === JSON.stringify(q.correctAnswer);
                } return false;
            default: return false;
        }
    }

    const incorrectAnswers = results
        .map(r => r.answers[question.id])
        .filter(answer => answer !== undefined && !isCorrect(question, answer))
        .map(answer => `"${renderAnswer(answer)}"`).slice(0, 20);

    if (incorrectAnswers.length < 3) {
        return { insight: "Not enough incorrect answer data for a meaningful analysis. At least 3 incorrect answers are needed to identify patterns." };
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            insight: { type: Type.STRING, description: "A brief, actionable pedagogical insight for the teacher." },
        },
        required: ['insight'],
    };

    const prompt = `You are an expert pedagogical analyst for an exam platform.
    Your task is to analyze common mistakes students made on a specific question and provide an actionable insight for the teacher.

    Question: "${question.text}"
    Correct Answer: "${renderAnswer(question.correctAnswer)}"
    
    Here is a list of incorrect answers from students:
    [${incorrectAnswers.join(', ')}]

    RULES:
    - Analyze these incorrect answers to identify any common patterns, misconceptions, or themes.
    - Provide a concise (1-2 sentences) and actionable pedagogical insight. For example, "Students seem to be confusing concept A with concept B," or "Many students are forgetting to apply the final step in the formula."
    - The output MUST be a valid JSON object matching the provided schema.
    `;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (typeof result.insight !== 'string') {
            throw new Error("AI returned an invalid data structure for question analysis.");
        }
        return result;
    } catch (error) {
        console.error("Error getting question analysis with AI:", error);
        throw new Error("Failed to get AI question analysis. Please try again.");
    }
};

export const getExamSummaryWithAI = async (params: {
    examTitle: string;
    results: ExamResult[];
}): Promise<{ summary: string; struggles: string; suggestions: string }> => {
    const { examTitle, results } = params;

    if (results.length < 3) {
        return {
            summary: "Not enough data for a summary.",
            struggles: "At least 3 submissions are needed to identify patterns.",
            suggestions: "Encourage more students to complete the exam for a detailed analysis."
        };
    }

    const performanceData = results.map(r => ({
        examinee: r.examineeName,
        scorePercentage: (r.score / r.totalPoints * 100).toFixed(1)
    }));

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A brief, 2-sentence overall summary of the group's performance on the exam." },
            struggles: { type: Type.STRING, description: "A single sentence identifying the most common area of difficulty or misconception based on the performance data." },
            suggestions: { type: Type.STRING, description: "A single, actionable pedagogical or training suggestion for the instructor to help address the identified struggles." },
        },
        required: ['summary', 'struggles', 'suggestions'],
    };

    const prompt = `You are an expert pedagogical analyst. Analyze the following exam results for "${examTitle}" and provide a high-level summary for the instructor.
    
    Exam Performance Data (Score %):
    ${JSON.stringify(performanceData)}

    RULES:
    - Provide a concise (2 sentences) summary of the overall performance.
    - Identify the single most significant area of struggle or common misconception in one sentence.
    - Offer one clear, actionable suggestion for the instructor to address this struggle in one sentence.
    - Do not mention specific students by name.
    - The final output MUST be a valid JSON object matching the provided schema.
    `;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (typeof result.summary !== 'string' || typeof result.struggles !== 'string' || typeof result.suggestions !== 'string') {
            throw new Error("AI returned an invalid data structure for exam summary.");
        }
        return result;
    } catch (error) {
        console.error("Error getting exam summary with AI:", error);
        throw new Error("Failed to get AI exam summary. Please try again.");
    }
}

export const generatePersonalizedLearningPath = async (params: { exam: Exam, result: ExamResult }): Promise<LearningPath> => {
    await sleep(1500); // Simulate generation time
    const { exam, result } = params;

    const isCorrect = (q: Question, ans: Answer) => {
        if (ans === undefined || ans === null) return false;
        switch (q.type) {
            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
            case QuestionType.Essay:
            case QuestionType.TrueFalse:
                return typeof ans === 'string' && typeof q.correctAnswer === 'string' && ans.toLowerCase() === q.correctAnswer.toLowerCase();
            case QuestionType.MultipleSelect:
                return Array.isArray(ans) && Array.isArray(q.correctAnswer) && JSON.stringify([...ans].sort()) === JSON.stringify([...q.correctAnswer].sort());
            case QuestionType.Ordering:
                return Array.isArray(ans) && Array.isArray(q.correctAnswer) && JSON.stringify(ans) === JSON.stringify(q.correctAnswer);
            default: return false;
        }
    };

    const incorrectAnswers = exam.questions
        .filter(q => !isCorrect(q, result.answers[q.id]))
        .map(q => ({
            question: q.text,
            studentAnswer: renderAnswer(result.answers[q.id]),
            correctAnswer: renderAnswer(q.correctAnswer)
        }));

    if (incorrectAnswers.length === 0) {
        return {
            identifiedWeaknesses: ["No specific weaknesses identified! Great job!"],
            learningPlan: []
        };
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            identifiedWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-4 key concepts or knowledge gaps identified from the incorrect answers." },
            learningPlan: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        concept: { type: Type.STRING, description: "The specific concept or topic to address." },
                        explanation: { type: Type.STRING, description: "A concise, easy-to-understand explanation of the concept for the student." },
                        suggestedResources: { type: Type.ARRAY, items: { 
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                uri: { type: Type.STRING }
                            },
                             required: ['title', 'uri']
                        }, description: "Use Google Search to find 1-2 relevant, high-quality online articles or videos. Provide their titles and URIs." },
                        practiceQuestions: { type: Type.ARRAY, items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING, description: "A new, simple practice question to test understanding." },
                                answer: { type: Type.STRING, description: "The correct answer to the practice question." }
                            },
                            required: ['text', 'answer']
                        }, description: "Create 1-2 new practice questions based on the concept." }
                    },
                    required: ['concept', 'explanation', 'practiceQuestions']
                }
            }
        },
        required: ['identifiedWeaknesses', 'learningPlan']
    };

    const prompt = `You are an expert AI tutor. A student has completed an exam titled "${exam.title}" and made some mistakes. Your task is to analyze their incorrect answers and generate a personalized learning path to help them improve.
    
    Here are the questions the student answered incorrectly:
    ${JSON.stringify(incorrectAnswers)}

    RULES:
    - Act as a friendly and encouraging tutor.
    - Identify the core underlying concepts the student is struggling with.
    - For each concept, provide a simple explanation.
    - Use Google Search to find 1-2 high-quality, relevant online resources (articles or videos) for each concept.
    - Create 1-2 new, simple practice questions for each concept to reinforce learning.
    - The final output MUST be a valid JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                tools: [{googleSearch: {}}],
            },
        });
        const jsonString = response.text.trim();
        const learningPath = JSON.parse(jsonString);

        if (!learningPath.identifiedWeaknesses || !learningPath.learningPlan) {
            throw new Error("AI returned an invalid learning path structure.");
        }
        return learningPath;
    } catch (error) {
        console.error("Error generating personalized learning path:", error);
        throw new Error("Failed to generate your personalized learning path. Please try again.");
    }
};


export const predictStudentPerformance = async (): Promise<StudentRiskProfile[]> => {
    await sleep(800);

    const resultsByStudent = mockExamResults.reduce((acc, result) => {
        if (!acc[result.examineeId]) {
            acc[result.examineeId] = [];
        }
        acc[result.examineeId].push(result);
        return acc;
    }, {} as Record<string, ExamResult[]>);

    const schema = {
        type: Type.OBJECT,
        properties: {
            riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            justification: { type: Type.STRING, description: "A brief, 1-sentence justification for the risk level based on the data." },
        },
        required: ['riskLevel', 'justification'],
    };

    const riskProfiles: StudentRiskProfile[] = [];

    for (const examineeId in resultsByStudent) {
        const studentResults = resultsByStudent[examineeId];
        if (studentResults.length < 2) continue; // Only analyze students with at least 2 results
        
        // Sort to find the most recent result
        studentResults.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        const lastResult = studentResults[0];

        const studentName = studentResults[0].examineeName;
        const performanceData = studentResults.map(r => ({
            exam: r.examTitle,
            scorePercentage: (r.score / r.totalPoints * 100).toFixed(1),
        }));
        
        const prompt = `You are an expert educational analyst. Analyze the following exam performance data for a student named ${studentName}.
        
        Performance Data: ${JSON.stringify(performanceData)}
        
        RULES:
        - Determine if the student is at "low", "medium", or "high" risk of failing or struggling based on their performance trends.
        - "low" risk: Consistently high scores or clear improvement.
        - "medium" risk: Mixed results, slight decline, or average scores.
        - "high" risk: Consistently low scores or a significant downward trend.
        - Provide a single, concise sentence justifying your assessment.
        - The output MUST be a valid JSON object matching the provided schema.`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            const jsonString = response.text.trim();
            const result = JSON.parse(jsonString);
            
            if (result.riskLevel && result.justification) {
                 if (result.riskLevel === 'medium' || result.riskLevel === 'high') {
                    riskProfiles.push({
                        examineeId,
                        examineeName: studentName,
                        riskLevel: result.riskLevel,
                        justification: result.justification,
                        hasGeneratedLearningPath: Math.random() > 0.5, // Simulate if student generated a plan
                        lastResultId: lastResult.id,
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to analyze performance for ${studentName}:`, error);
        }
    }

    return riskProfiles;
};


export const reviewQuestion = async (questionId: string, newStatus: QuestionStatus, reason?: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const index = mockQuestionBank.findIndex(q => q.id === questionId);
    if (index !== -1) {
        mockQuestionBank[index].status = newStatus;
        console.log(`Question ${questionId} status updated to ${newStatus}. Reason: ${reason}`);
        return { success: true };
    }
    throw new Error("Question not found for review.");
};

export const getTeacherDashboardStats = async (): Promise<{ totalExams: number, averageScore: number, atRiskStudents: number }> => {
    await sleep(400);
    
    const totalExams = mockExams.length;

    if (mockExamResults.length === 0) {
        return { totalExams, averageScore: 0, atRiskStudents: 0 };
    }

    const totalPercentage = mockExamResults.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0);
    const averageScore = totalPercentage / mockExamResults.length;
    
    // A simple mock for at-risk students count.
    const riskProfiles = await predictStudentPerformance();
    const atRiskStudents = riskProfiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium').length;

    return {
        totalExams,
        averageScore: Math.round(averageScore),
        atRiskStudents,
    };
};

export const getCorporateDashboardStats = async (): Promise<{ totalAssessments: number, averagePassRate: number, candidatesAssessed: number }> => {
    await sleep(400);
    const totalAssessments = mockCorporateExams.length;
    const relevantResults = mockExamResults.filter(r => r.examId.startsWith('corp-'));
    if (relevantResults.length === 0) {
        return { totalAssessments, averagePassRate: 0, candidatesAssessed: 0 };
    }
    const passingThreshold = 0.7; // 70%
    const passedCount = relevantResults.filter(r => (r.score / r.totalPoints) >= passingThreshold).length;
    const averagePassRate = (passedCount / relevantResults.length) * 100;
    const candidatesAssessed = new Set(relevantResults.map(r => r.examineeId)).size;

    return {
        totalAssessments,
        averagePassRate: Math.round(averagePassRate),
        candidatesAssessed,
    };
};


export const getTrainingCompanyDashboardStats = async (): Promise<{ totalCourses: number, averageCompletion: number, activeTrainees: number }> => {
    await sleep(400);
    // These are mock values as we don't have course/trainee models
    return {
        totalCourses: 5, // Mock value
        averageCompletion: 88, // Mock value
        activeTrainees: 152, // Mock value
    };
};

export const getInitialAiTutorMessage = async (examineeId: string): Promise<{ message: string }> => {
    await sleep(1200);
    const userResults = mockExamResults.filter(r => r.examineeId === examineeId)
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    if (userResults.length === 0) {
        return { message: "Welcome! I'm your AI Study Buddy. Feel free to ask me anything about your courses or exams." };
    }

    const lastResult = userResults[0];
    const allExams = [...mockExams, ...mockCorporateExams];
    const exam = allExams.find(e => e.id === lastResult.examId);
    if (!exam) {
        return { message: "Welcome back! I'm your AI Study Buddy. Ready to tackle your next exam?" };
    }

    const isCorrect = (q: Question, ans: Answer) => {
        if (!ans) return false;
        return JSON.stringify(ans).toLowerCase() === JSON.stringify(q.correctAnswer).toLowerCase();
    };

    const incorrectAnswers = exam.questions
        .filter(q => !isCorrect(q, lastResult.answers[q.id]))
        .map(q => q.text);
    
    const scorePercentage = (lastResult.score / lastResult.totalPoints) * 100;

    const schema = {
        type: Type.OBJECT, properties: { message: { type: Type.STRING } }, required: ['message']
    };

    const prompt = `You are a friendly and encouraging AI Study Buddy for a student named Fatima.
    
    Her last exam result:
    - Exam: "${lastResult.examTitle}"
    - Score: ${scorePercentage.toFixed(0)}%
    - Questions she answered incorrectly: ${JSON.stringify(incorrectAnswers)}
    
    Based on this, generate a single, short, welcoming message (2-3 sentences).
    - Start by greeting her.
    - Mention her performance on the exam (positively if the score is > 70%, encouragingly otherwise).
    - Proactively offer to help with one of the specific topics she struggled with.
    - Keep it concise and friendly.
    - Example for good score: "Hi Fatima! Great job on the React Fundamentals exam. I see you've got a good handle on most topics. Would you like to quickly review props or hooks to solidify your knowledge?"
    - Example for lower score: "Hi Fatima! Welcome back. The React Fundamentals exam can be tricky, but you're making good progress. I noticed a couple of questions about hooks were tough. Would you like to go over them together?"
    - The output must be a valid JSON object matching the schema.`;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        if (typeof result.message !== 'string') throw new Error("Invalid AI response");
        return result;
    } catch (error) {
        console.error("Error generating initial tutor message:", error);
        return { message: `Welcome back! I'm here to help you study for your next exam.` };
    }
}

// --- API Methods ---

// Category Management API
export const getCategories = async (): Promise<Record<string, string[]>> => {
    await sleep(200);
    return JSON.parse(JSON.stringify(mockCategories)); // Return a copy
};

export const addCategory = async (categoryName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (mockCategories[categoryName]) {
        throw new Error("Category already exists.");
    }
    mockCategories[categoryName] = [];
    return { success: true };
};

export const deleteCategory = async (categoryName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockCategories[categoryName]) {
        throw new Error("Category not found.");
    }
    delete mockCategories[categoryName];
    // Also update any questions that used this category
    mockQuestionBank.forEach(q => {
        if (q.category === categoryName) {
            q.category = '';
            q.subCategory = '';
        }
    });
    return { success: true };
};

export const addSubCategory = async (categoryName: string, subCategoryName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockCategories[categoryName]) {
        throw new Error("Category not found.");
    }
    if (mockCategories[categoryName].includes(subCategoryName)) {
        throw new Error("Subcategory already exists.");
    }
    mockCategories[categoryName].push(subCategoryName);
    return { success: true };
};

export const deleteSubCategory = async (categoryName: string, subCategoryName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockCategories[categoryName]) {
        throw new Error("Category not found.");
    }
    mockCategories[categoryName] = mockCategories[categoryName].filter(s => s !== subCategoryName);
     // Also update any questions that used this subcategory
    mockQuestionBank.forEach(q => {
        if (q.category === categoryName && q.subCategory === subCategoryName) {
            q.subCategory = '';
        }
    });
    return { success: true };
};

// Question Bank API
export const getQuestionBank = async (filters: { ownerId?: string; searchTerm?: string; category?: string; subCategory?: string; questionType?: QuestionType; status?: QuestionStatus }): Promise<Question[]> => {
    await sleep(300);
    let questions = [...mockQuestionBank];
    
    if (filters.ownerId) {
        // Allow fetching from multiple owners, e.g., personal and marketplace
        const owners = filters.ownerId.split(',');
        questions = questions.filter(q => owners.includes(q.ownerId));
    }
    if (filters.searchTerm) {
        questions = questions.filter(q => q.text.toLowerCase().includes(filters.searchTerm!.toLowerCase()));
    }
    if (filters.category) {
        questions = questions.filter(q => q.category === filters.category);
    }
    if (filters.subCategory) {
        questions = questions.filter(q => q.subCategory === filters.subCategory);
    }
    if (filters.questionType) {
        questions = questions.filter(q => q.type === filters.questionType);
    }
    if (filters.status) {
        questions = questions.filter(q => q.status === filters.status);
    }
    return [...questions].reverse(); // Show newest first
};

export const addQuestionToBank = async (questionData: Omit<Question, 'id'>): Promise<Question> => {
    await sleep(400);
    const newQuestion: Question = {
        ...questionData,
        id: `qb-${Date.now()}`,
    };
    mockQuestionBank.push(newQuestion);
    return newQuestion;
};

export const batchUploadQuestions = async (questionsData: Omit<Question, 'id'>[]): Promise<{ success: boolean }> => {
    await sleep(800);
    const newQuestions: Question[] = questionsData.map((q, i) => ({
      ...q,
      id: `qb-upload-${Date.now()}-${i}`,
    }));
    mockQuestionBank.push(...newQuestions);
    return { success: true };
};

export const updateQuestionInBank = async (updatedQuestion: Question): Promise<Question> => {
    await sleep(400);
    const index = mockQuestionBank.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) {
        throw new Error("Question not found in bank");
    }
    mockQuestionBank[index] = updatedQuestion;
    return updatedQuestion;
};

export const deleteQuestionFromBank = async (questionId: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const initialLength = mockQuestionBank.length;
    mockQuestionBank = mockQuestionBank.filter(q => q.id !== questionId);
    if (mockQuestionBank.length === initialLength) {
        throw new Error("Question not found to delete");
    }
    return { success: true };
};


// Exam API
export const createTeacherExam = async (exam: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await sleep(500);
    const newExam: Exam = {
        ...exam,
        id: `exam-${Date.now()}`,
        questionCount: exam.questions.length
    };
    mockExams = [newExam, ...mockExams];
    return newExam;
};

export const createCorporateExam = async (exam: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await sleep(500);
    const newExam: Exam = {
        ...exam,
        id: `corp-${Date.now()}`,
        questionCount: exam.questions.length
    };
    mockCorporateExams = [newExam, ...mockCorporateExams];
    return newExam;
}

export const getTeacherExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  return mockExams.map(({ questions, ...rest }) => rest);
};

export const getExamineeExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  const allExams = [...mockExams, ...mockCorporateExams];
  return allExams.map(({ questions, ...rest }) => rest);
};

export const getCorporateExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  return mockCorporateExams.map(({ questions, ...rest }) => rest);
};


export const getExamDetails = async (id: string): Promise<Exam | undefined> => {
  await sleep(500);
  const allExams = [...mockExams, ...mockCorporateExams];
  return allExams.find(exam => exam.id === id);
};

export const submitExam = async (examId: string, answers: StudentAnswer, proctoringEvents: ProctoringEvent[]): Promise<ExamResult> => {
    await sleep(1000);
    const allExams = [...mockExams, ...mockCorporateExams];
    const exam = allExams.find(e => e.id === examId);
    if (!exam) {
        throw new Error("Exam not found");
    }

    let score = 0;
    const totalPoints = exam.questions.reduce((total, q) => total + q.points, 0);

    exam.questions.forEach(question => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;
        let isCorrect = false;

        switch (question.type) {
            case QuestionType.Essay:
                isCorrect = false; // Essays must be graded manually or by AI, default to 0 points on submission.
                break;
            
            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
            case QuestionType.TrueFalse:
                if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
                    isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
                }
                break;

            case QuestionType.MultipleSelect:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    const sortedUserAnswer = [...userAnswer].sort();
                    const sortedCorrectAnswer = [...correctAnswer].sort();
                    isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
                }
                break;
            
            case QuestionType.Ordering:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
                }
                break;
            
            case QuestionType.TrueFalseWithJustification:
                if (userAnswer && typeof userAnswer === 'object' && 'selection' in userAnswer) {
                    isCorrect = (userAnswer as {selection: string}).selection.toLowerCase() === (correctAnswer as string).toLowerCase();
                }
                break;

            case QuestionType.Matching:
                 if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer) && question.prompts && Array.isArray(correctAnswer)) {
                    const userAnswersMap = userAnswer as Record<string, string>;
                    if (Object.keys(userAnswersMap).length !== question.prompts.length) {
                        isCorrect = false;
                        break;
                    }
                    isCorrect = question.prompts.every((prompt, index) => userAnswersMap[prompt] === correctAnswer[index]);
                }
                break;
        }

        if (isCorrect) {
            score += question.points;
        }
    });
    
    const mockExaminee = mockUsers.find(u => u.role === UserRole.Examinee) || {id: 'temp-user', name: 'Guest Student'};

    const newResult: ExamResult = {
        id: `res-${Date.now()}`,
        examId,
        examTitle: exam.title,
        examineeId: mockExaminee.id,
        examineeName: mockExaminee.name,
        score,
        totalPoints,
        answers,
        submittedAt: new Date(),
        proctoringEvents,
    };
    
    mockExamResults.push(newResult);
    return newResult;
};

// Admin API
export const getAllExamsForAdmin = async (): Promise<(Omit<Exam, 'questions'> & { createdBy: UserRole })[]> => {
    await sleep(500);
    const teacherExams = mockExams.map(({ questions, ...rest }) => ({ ...rest, createdBy: UserRole.Teacher }));
    const corporateExams = mockCorporateExams.map(({ questions, ...rest }) => ({ ...rest, createdBy: UserRole.Corporate }));
    
    const allExams = [...teacherExams, ...corporateExams];
    return allExams.sort((a, b) => (b.id > a.id) ? 1 : -1);
};

export const deleteExamAsAdmin = async (examId: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const initialTeacherLength = mockExams.length;
    const initialCorporateLength = mockCorporateExams.length;

    mockExams = mockExams.filter(e => e.id !== examId);
    mockCorporateExams = mockCorporateExams.filter(e => e.id !== examId);

    if (mockExams.length < initialTeacherLength || mockCorporateExams.length < initialCorporateLength) {
        return { success: true };
    }
    
    throw new Error("Exam not found to delete");
};

export const getPlatformAnalytics = async (): Promise<{ totalUsers: number, totalExams: number, totalQuestions: number }> => {
    await sleep(400);
    return {
        totalUsers: mockUsers.length,
        totalExams: mockExams.length + mockCorporateExams.length,
        totalQuestions: mockQuestionBank.length,
    }
}

export const getAllUsers = async(): Promise<User[]> => {
    await sleep(600);
    return [...mockUsers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Results API
export const getResultsForExam = async(examId: string): Promise<ExamResult[]> => {
    await sleep(500);
    return mockExamResults.filter(r => r.examId === examId).sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const getExamineeResults = async(examineeId: string): Promise<ExamResult[]> => {
    await sleep(500);
    return mockExamResults.filter(r => r.examineeId.startsWith('user-')).sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

export const getExamResultDetails = async(resultId: string): Promise<{ result: ExamResult, exam: Exam } | null> => {
    await sleep(600);
    const result = mockExamResults.find(r => r.id === resultId);
    if (!result) {
        return null;
    }
    const allExams = [...mockExams, ...mockCorporateExams];
    const exam = allExams.find(e => e.id === result.examId);
    if (!exam) {
        return null;
    }
    return { result, exam };
};
