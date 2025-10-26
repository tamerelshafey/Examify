import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExamineeExams, getExamineeResults, getExamDetails, getQuestionBank } from '../services/api';
import { getInitialAiTutorMessage, generateSingleQuestionWithAI } from '../services/ai';
import { Exam, ExamResult, Question, QuestionType, Answer, QuestionStatus } from '../types';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, UsersIcon, BarChartIcon, TrendingUpIcon, EyeIcon, ShieldCheckIcon, InboxIcon, BotIcon, SpeechIcon, SpinnerIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from '@google/genai';

const translations = {
    en: {
        availableExams: "Available Exams",
        myResults: "My Results",
        oralPractice: "Oral Practice",
        startExam: "Start Exam",
        minutes: "minutes",
        questions: "questions",
        welcome: "Welcome back, Fatima!",
        examsCompleted: "Exams Completed",
        averageScore: "Average Score",
        bestScore: "Best Score",
        examTitle: "Exam Title",
        score: "Score",
        percentage: "Percentage",
        dateSubmitted: "Date Submitted",
        actions: "Actions",
        viewDetails: "View Details",
        viewProctoring: "View Proctoring Report",
        noResultsTitle: "No Results Yet",
        noResultsMessage: "You haven't completed any exams yet. Go to 'Available Exams' to get started.",
        noExamsTitle: "No Available Exams",
        noExamsMessage: "There are no available exams for you at the moment. Please check back later.",
        aiTutor: {
            title: "AI Study Buddy",
            placeholder: "Ask about a concept or for a practice question...",
            sendMessage: "Send",
            thinking: "Searching for a question...",
            generating: "Generating a new question...",
            evaluating: "Evaluating your answer...",
            initializing: "Initializing Study Buddy...",
            answerPlaceholder: (text: string) => `Your answer for "${text.substring(0, 40)}..."`,
        }
    },
    ar: {
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        oralPractice: "تدريب شفهي",
        startExam: "ابدأ الاختبار",
        minutes: "دقيقة",
        questions: "أسئلة",
        welcome: "مرحباً بعودتك، فاطمة!",
        examsCompleted: "الاختبارات المكتملة",
        averageScore: "متوسط الدرجات",
        bestScore: "أفضل درجة",
        examTitle: "عنوان الاختبار",
        score: "الدرجة",
        percentage: "النسبة المئوية",
        dateSubmitted: "تاريخ الإرسال",
        actions: "الإجراءات",
        viewDetails: "عرض التفاصيل",
        viewProctoring: "عرض تقرير المراقبة",
        noResultsTitle: "لا توجد نتائج بعد",
        noResultsMessage: "لم تكمل أي اختبارات بعد. انتقل إلى 'الاختبارات المتاحة' للبدء.",
        noExamsTitle: "لا توجد اختبارات متاحة",
        noExamsMessage: "لا توجد اختبارات متاحة لك في الوقت الحالي. يرجى التحقق مرة أخرى لاحقًا.",
        aiTutor: {
            title: "مساعد الدراسة الذكي",
            placeholder: "اسأل عن مفهوم أو اطلب سؤالاً تدريبياً...",
            sendMessage: "إرسال",
            thinking: "جاري البحث عن سؤال...",
            generating: "جاري إنشاء سؤال جديد...",
            evaluating: "جاري تقييم إجابتك...",
            initializing: "جاري تهيئة مساعد الدراسة...",
            answerPlaceholder: (text: string) => `إجابتك على "${text.substring(0, 40)}..."`,
        }
    }
}

interface Message {
    role: 'user' | 'model';
    text: string;
    question?: Question;
}

const searchQuestionBankTool: FunctionDeclaration = {
    name: 'search_question_bank',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches the official marketplace question bank for a relevant practice question.',
        properties: {
            topic: {
                type: Type.STRING,
                description: 'The topic of the question to search for, e.g., "React Hooks", "CSS Flexbox".',
            },
            difficulty: {
                type: Type.STRING,
                description: 'The desired difficulty of the question. Can be "Easy", "Medium", or "Hard".',
            },
        },
        required: ['topic'],
    },
};

const generatePracticeQuestionTool: FunctionDeclaration = {
    name: 'generate_practice_question',
    parameters: {
        type: Type.OBJECT,
        description: 'Generates a new practice question when a suitable one is not found in the bank.',
        properties: {
            topic: {
                type: Type.STRING,
                description: 'The topic for the new question, e.g., "React Hooks".',
            },
            difficulty: {
                type: Type.STRING,
                description: 'The desired difficulty. Can be "Easy", "Medium", or "Hard". Default is "Medium".',
            },
            type: {
                type: Type.STRING,
                description: `The desired question type. Can be "${QuestionType.MultipleChoice}", "${QuestionType.TrueFalse}", "${QuestionType.ShortAnswer}", or "${QuestionType.Essay}". Default is "${QuestionType.MultipleChoice}".`,
            }
        },
        required: ['topic'],
    },
};

const submitAnswerTool: FunctionDeclaration = {
    name: 'submit_answer',
    parameters: {
        type: Type.OBJECT,
        description: 'Submits the user\'s answer to the current practice question for evaluation.',
        properties: {
            answer: {
                type: Type.STRING,
                description: 'The user\'s provided answer. For multiple-select, it should be a comma-separated string.',
            },
        },
        required: ['answer'],
    },
};


const StatCard = ({ icon: Icon, title, value, colorClass, suffix='' }: { icon: React.FC<any>, title: string, value: string | number, colorClass: string, suffix?: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full me-4 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}{suffix}</p>
        </div>
    </div>
);

// Helper function to check if an answer is correct
const isAnswerCorrect = (question: Question, userAnswer: Answer): boolean => {
    if (userAnswer === undefined || userAnswer === null) return false;
    let processedUserAnswer = userAnswer;
    // Handle case where AI stringifies an array for multiple-select
    if (question.type === QuestionType.MultipleSelect && typeof userAnswer === 'string') {
        processedUserAnswer = userAnswer.split(',').map(s => s.trim());
    }

    const correctAnswer = question.correctAnswer;
    switch (question.type) {
        case QuestionType.MultipleChoice:
        case QuestionType.ShortAnswer:
        case QuestionType.Essay:
        case QuestionType.TrueFalse:
            return typeof processedUserAnswer === 'string' && typeof correctAnswer === 'string' && processedUserAnswer.toLowerCase() === correctAnswer.toLowerCase();
        case QuestionType.MultipleSelect:
            if (Array.isArray(processedUserAnswer) && Array.isArray(correctAnswer)) {
                return JSON.stringify([...processedUserAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
            }
            return false;
        case QuestionType.Ordering:
            if (Array.isArray(processedUserAnswer) && Array.isArray(correctAnswer)) {
                return JSON.stringify(processedUserAnswer) === JSON.stringify(correctAnswer);
            }
            return false;
        default:
            return false;
    }
};


const ExamineeDashboard = () => {
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { lang } = useLanguage();
    
    // AI Tutor State
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiReplying, setIsAiReplying] = useState(false);
    const [isTutorLoading, setIsTutorLoading] = useState(true);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [thinkingMessage, setThinkingMessage] = useState('');
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    const t = { ...translations[lang], title: `${theme.platformName} Portal` };
    
    const navLinks = [
      { path: '#', label: t.availableExams, icon: BookOpenIcon, onClick: () => setActiveTab('exams'), isActive: activeTab === 'exams' },
      { path: '#', label: t.myResults, icon: CheckCircleIcon, onClick: () => setActiveTab('results'), isActive: activeTab === 'results' },
      { path: '/examinee/oral-exam', label: t.oralPractice, icon: SpeechIcon },
    ];

    // Effect 1: Fetch core data for the dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [examsData, resultsData] = await Promise.all([
                    getExamineeExams(),
                    getExamineeResults("user-2"), // Mock user ID
                ]);
                setExams(examsData);
                setResults(resultsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Effect 2: Initialize AI tutor in the background after main data is loaded
    useEffect(() => {
        if (loading) return; // Wait for main data to load

        const initTutor = async () => {
            setIsTutorLoading(true);
            const genericSystemInstruction = `You are a friendly and encouraging AI study buddy. Your goal is to help students learn.

            You have two toolsets:
            1. Finding questions: You MUST use \`search_question_bank\` first. If it returns "No question found", you MUST use \`generate_practice_question\`.
            2. Evaluating answers: After presenting a question, you MUST wait for the user to answer, then call \`submit_answer\`.

            Your workflow is:
            1. User asks for a question.
            2. You use a question-finding tool.
            3. You present the question text and its JSON object.
            4. You wait for the user's answer.
            5. User answers.
            6. You call \`submit_answer\`.
            7. The tool gives you the evaluation result.
            8. You provide friendly feedback based on the result. Then ask if they want another question.`;
            
            try {
                const initialTutorMessage = await getInitialAiTutorMessage(results, exams);
                if (initialTutorMessage.message) {
                    setMessages([{ role: 'model', text: initialTutorMessage.message }]);
                }

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const chatInstance = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                         systemInstruction: genericSystemInstruction,
                         tools: [{ functionDeclarations: [searchQuestionBankTool, generatePracticeQuestionTool, submitAnswerTool] }],
                    },
                });
                setChat(chatInstance);
                
            } catch (error) {
                console.error("Failed to initialize AI Tutor:", error);
                setMessages([{ role: 'model', text: "Sorry, the AI Study Buddy failed to initialize. Please refresh the page to try again." }]);
            } finally {
                setIsTutorLoading(false);
            }
        };

        initTutor();
    }, [loading, results, exams]);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isAiReplying, isAiThinking, isTutorLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isAiReplying) return;

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsAiReplying(true);
        setIsAiThinking(false);
        setThinkingMessage('');

        // If user is not answering a question, clear any stale active question
        if (!activeQuestion) {
             const keywords = ['question', 'what is', 'explain', 'how does'];
             if (keywords.some(k => currentInput.toLowerCase().includes(k))) {
                setActiveQuestion(null);
             }
        }
       
        try {
            const stream = await chat.sendMessageStream({ message: currentInput });
            
            let responseText = '';
            let functionCalls: any[] = [];

            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                responseText += chunk.text;
                if (chunk.functionCalls) {
                    functionCalls.push(...chunk.functionCalls);
                }
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = responseText;
                    return newMessages;
                });
            }
            
            if(responseText.trim() === '' && functionCalls.length > 0) {
                setMessages(prev => prev.slice(0, -1));
            }

            if (functionCalls.length > 0) {
                const fc = functionCalls[0];
                let toolResponseResult;
                const toolName = fc.name;

                if (toolName === 'search_question_bank' || toolName === 'generate_practice_question') {
                    setThinkingMessage(toolName === 'search_question_bank' ? t.aiTutor.thinking : t.aiTutor.generating);
                    setIsAiThinking(true);
                    const { topic, difficulty, type } = fc.args;
                     const questionResult = toolName === 'search_question_bank'
                        ? (await getQuestionBank({ ownerId: 'marketplace', status: QuestionStatus.Approved, searchTerm: topic as string }))[0]
                        : await generateSingleQuestionWithAI({ topic: topic as string, difficulty: (difficulty || 'Medium') as any, questionType: (type || QuestionType.MultipleChoice) as any });
                    toolResponseResult = questionResult ? JSON.stringify(questionResult) : "No question found on that topic.";
                } else if (toolName === 'submit_answer') {
                    setThinkingMessage(t.aiTutor.evaluating);
                    setIsAiThinking(true);
                    if (!activeQuestion) {
                         toolResponseResult = JSON.stringify({ error: "No active question to answer." });
                    } else {
                         const isCorrect = isAnswerCorrect(activeQuestion, fc.args.answer as Answer);
                         toolResponseResult = JSON.stringify({ isCorrect: isCorrect, correctAnswer: activeQuestion.correctAnswer });
                    }
                }

                setIsAiThinking(false);
                
                const toolResponse = { functionResponses: { id: fc.id, name: toolName, response: { result: toolResponseResult } } };
                const finalStream = await chat.sendMessageStream({ toolResponse });

                let finalResponseText = '';
                setMessages(prev => [...prev, { role: 'model', text: '' }]);
                let questionForDisplay: Question | undefined = undefined;

                for await (const chunk of finalStream) {
                    finalResponseText += chunk.text;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = finalResponseText;
                        return newMessages;
                    });
                }
                
                try {
                    const jsonMatch = finalResponseText.match(/\{"text":[\s\S]*?\}/);
                    if (jsonMatch) {
                        const questionJson = jsonMatch[0];
                        questionForDisplay = JSON.parse(questionJson);
                        finalResponseText = finalResponseText.replace(questionJson, '').trim();
                    }
                } catch (e) { console.warn("Could not parse question from AI response", e); }
                
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: finalResponseText, question: questionForDisplay };
                    return newMessages;
                });

                if (questionForDisplay) {
                    setActiveQuestion(questionForDisplay);
                }
                if (toolName === 'submit_answer') {
                    setActiveQuestion(null);
                }
            }
        } catch (error) {
            console.error("AI chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsAiReplying(false);
            setIsAiThinking(false);
        }
    };
    
    const stats = useMemo(() => {
        const completedCount = results.length;
        if (completedCount === 0) return { completed: 0, average: 0, best: 0 };
        const totalPercentage = results.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0);
        const averageScore = totalPercentage / completedCount;
        const bestScore = Math.max(...results.map(r => (r.score / r.totalPoints) * 100));
        return { completed: completedCount, average: averageScore.toFixed(1), best: bestScore.toFixed(1) };
    }, [results]);

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
        return (
            <div className="mt-2 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-200 dark:bg-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{question.text}</p>
                {question.type === QuestionType.MultipleChoice && question.options && (
                    <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                        {question.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{question.points} points</p>
            </div>
        );
    };
    
    const AITutor = () => (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100">
                <BotIcon className="w-6 h-6 me-3 text-primary-500"/>{t.aiTutor.title}
            </h3>
            <div ref={chatHistoryRef} className="h-64 overflow-y-auto space-y-4 pr-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                {isTutorLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <SpinnerIcon className="w-5 h-5 me-2" />
                        {t.aiTutor.initializing}
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1"/>}
                                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                   {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                   {msg.question && <QuestionCard question={msg.question} />}
                                </div>
                            </div>
                        ))}
                         {isAiThinking && (
                            <div className="flex items-start gap-3">
                                <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1"/>
                                <div className="max-w-md p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                                   <p className="text-sm italic text-slate-500">{thinkingMessage}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={activeQuestion ? t.aiTutor.answerPlaceholder(activeQuestion.text) : t.aiTutor.placeholder}
                    className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-primary-500"
                    disabled={isAiReplying || isTutorLoading || !chat}
                />
                <button type="submit" disabled={isAiReplying || !userInput.trim() || isTutorLoading || !chat} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {t.aiTutor.sendMessage}
                </button>
            </form>
        </div>
    );

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        
        const renderAvailableExams = () => {
            if (exams.length === 0) return <EmptyState icon={InboxIcon} title={t.noExamsTitle} message={t.noExamsMessage} />;
            return (
                <div className="space-y-4">
                    {exams.map(exam => (
                        <div key={exam.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center justify-between transition-shadow hover:shadow-lg">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{exam.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exam.description}</p>
                                <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-300">
                                    <span className="flex items-center"><ClockIcon className="w-4 h-4 me-1"/> {exam.duration} {t.minutes}</span>
                                    <span className="flex items-center"><UsersIcon className="w-4 h-4 me-1"/> {exam.questionCount} {t.questions}</span>
                                    <span className={`font-semibold px-2 py-1 rounded-full text-xs ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{exam.difficulty}</span>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/examinee/exam/${exam.id}`)} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">{t.startExam}</button>
                        </div>
                    ))}
                </div>
            );
        };
        
        const renderMyResults = () => {
            if (results.length === 0) return <EmptyState icon={InboxIcon} title={t.noResultsTitle} message={t.noResultsMessage} action={<button onClick={() => setActiveTab('exams')} className="text-primary-500 font-semibold">{t.availableExams}</button>} />;
            return (
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr><th scope="col" className="px-6 py-3">{t.examTitle}</th><th scope="col" className="px-6 py-3">{t.score}</th><th scope="col" className="px-6 py-3">{t.percentage}</th><th scope="col" className="px-6 py-3">{t.dateSubmitted}</th><th scope="col" className="px-6 py-3">{t.actions}</th></tr>
                        </thead>
                        <tbody>
                            {results.map(result => {
                                const percentage = Math.round((result.score / result.totalPoints) * 100);
                                return (
                                    <tr key={result.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.examTitle}</td>
                                        <td className="px-6 py-4">{result.score} / {result.totalPoints}</td>
                                        <td className={`px-6 py-4 font-bold ${getPerformanceColor(percentage)}`}>{percentage}%</td>
                                        <td className="px-6 py-4">{result.submittedAt.toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/examinee/result/${result.id}`)} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewDetails}><EyeIcon className="w-5 h-5"/></button>
                                            <button onClick={() => navigate(`/examinee/result/${result.id}/proctoring`)} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewProctoring}><ShieldCheckIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        };

        return (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={CheckCircleIcon} title={t.examsCompleted} value={stats.completed} colorClass="bg-primary-500" />
                    <StatCard icon={BarChartIcon} title={t.averageScore} value={stats.average} suffix="%" colorClass="bg-blue-500" />
                    <StatCard icon={TrendingUpIcon} title={t.bestScore} value={stats.best} suffix="%" colorClass="bg-purple-500" />
                </div>
                
                <AITutor />

                <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('exams')} className={`${activeTab === 'exams' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.availableExams}</button>
                        <button onClick={() => setActiveTab('results')} className={`${activeTab === 'results' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.myResults}</button>
                    </nav>
                </div>
                {activeTab === 'exams' ? renderAvailableExams() : renderMyResults()}
            </div>
        );
    }

    return (
        <DashboardLayout navLinks={navLinks} pageTitle={t.welcome} sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.title}</h1>}>
          {pageContent()}
        </DashboardLayout>
    );
};

export default ExamineeDashboard;