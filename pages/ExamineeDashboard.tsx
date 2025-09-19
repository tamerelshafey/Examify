

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExamineeExams, getExamineeResults, getInitialAiTutorMessage } from '../services/mockApi';
import { Exam, ExamResult } from '../types';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, UsersIcon, BarChartIcon, TrendingUpIcon, EyeIcon, ShieldCheckIcon, InboxIcon, BotIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { GoogleGenAI, Chat } from '@google/genai';

const translations = {
    en: {
        availableExams: "Available Exams",
        myResults: "My Results",
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
        }
    },
    ar: {
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
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
        }
    }
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

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
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    const t = { ...translations[lang], title: `${theme.platformName} Portal` };
    
    const navLinks = [
      { path: '#', label: t.availableExams, icon: BookOpenIcon, onClick: () => setActiveTab('exams'), isActive: activeTab === 'exams' },
      { path: '#', label: t.myResults, icon: CheckCircleIcon, onClick: () => setActiveTab('results'), isActive: activeTab === 'results' },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [examsData, resultsData, initialTutorMessage] = await Promise.all([
                    getExamineeExams(),
                    getExamineeResults("user-2"), // Mock user ID
                    getInitialAiTutorMessage("user-2")
                ]);
                setExams(examsData);
                setResults(resultsData);
                if (initialTutorMessage.message) {
                    setMessages([{ role: 'model', text: initialTutorMessage.message }]);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: 'You are a friendly and encouraging AI study buddy. Your goal is to help students understand concepts, not just give them answers. Keep your responses concise, positive, and focused on learning.',
            },
        });
        setChat(chatInstance);
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isAiReplying]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isAiReplying) return;

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsAiReplying(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: userInput });
            let currentResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of responseStream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: currentResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("AI chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsAiReplying(false);
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
    
    const AITutor = () => (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100">
                <BotIcon className="w-6 h-6 me-3 text-primary-500"/>{t.aiTutor.title}
            </h3>
            <div ref={chatHistoryRef} className="h-64 overflow-y-auto space-y-4 pr-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1"/>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                           <p className="text-sm">{msg.text}</p>
                           {isAiReplying && msg.role === 'model' && index === messages.length - 1 && 
                             <span className="inline-block w-2 h-4 bg-slate-600 dark:bg-slate-300 animate-pulse ms-1"></span>
                           }
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={t.aiTutor.placeholder}
                    className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-primary-500"
                    disabled={isAiReplying}
                />
                <button type="submit" disabled={isAiReplying || !userInput.trim()} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
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