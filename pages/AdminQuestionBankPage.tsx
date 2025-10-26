import React, { useState, useEffect, useCallback } from 'react';
import { getPendingMarketplaceBanks, reviewSubmittedBank, getQuestionBank, reviewQuestion } from '../services/api';
import { preScreenSubmittedBankWithAI, AIScreeningResult } from '../services/ai';
import { MarketplaceQuestionBank, Question, QuestionStatus } from '../types';
import { 
    BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, 
    ClipboardListIcon, TagIcon, CheckCircleIcon, XCircleIcon, EyeIcon, LightbulbIcon, SpinnerIcon, InboxIcon 
} from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import PreviewBankModal from '../components/PreviewBankModal';
import AIScreeningResultModal from '../components/AIScreeningResultModal';

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        pageTitle: "Marketplace Submissions",
        pendingBanks: "Pending Banks",
        pendingQuestions: "Pending Questions",
        approve: "Approve",
        reject: "Reject",
        preview: "Preview",
        aiScreen: "AI Pre-screen",
        screening: "Screening...",
        noPendingBanks: "No banks are pending review.",
        noPendingQuestions: "No individual questions are pending review.",
        reviewSuccess: (name: string, status: string) => `"${name}" has been ${status}.`,
        reviewError: "Review action failed.",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        pageTitle: "تقديمات المتجر",
        pendingBanks: "البنوك قيد المراجعة",
        pendingQuestions: "الأسئلة قيد المراجعة",
        approve: "موافقة",
        reject: "رفض",
        preview: "معاينة",
        aiScreen: "فحص أولي بالذكاء الاصطناعي",
        screening: "جاري الفحص...",
        noPendingBanks: "لا توجد بنوك قيد المراجعة.",
        noPendingQuestions: "لا توجد أسئلة فردية قيد المراجعة.",
        reviewSuccess: (name: string, status: string) => `تم ${status} "${name}".`,
        reviewError: "فشل إجراء المراجعة.",
    }
};

const AdminQuestionBankPage = () => {
    const [activeTab, setActiveTab] = useState<'banks' | 'questions'>('banks');
    const [pendingBanks, setPendingBanks] = useState<MarketplaceQuestionBank[]>([]);
    const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [previewingBank, setPreviewingBank] = useState<MarketplaceQuestionBank | null>(null);
    const [isScreening, setIsScreening] = useState<string | null>(null);
    const [screeningResult, setScreeningResult] = useState<AIScreeningResult | null>(null);

    const { addNotification } = useNotification();
    const { lang } = useLanguage();
    const t = translations[lang];

    const navLinks = [
        { path: '/admin', icon: BarChartIcon, label: t.dashboard },
        { path: '/admin/users', icon: UsersIcon, label: t.userManagement },
        { path: '/admin/exams', icon: BookOpenIcon, label: t.examManagement },
        { path: '/admin/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/admin/categories', icon: TagIcon, label: t.categoryManagement },
        { path: '/admin/settings', icon: SettingsIcon, label: t.settings },
    ];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'banks') {
                const data = await getPendingMarketplaceBanks();
                setPendingBanks(data);
            } else {
                const data = await getQuestionBank({ status: QuestionStatus.Pending });
                setPendingQuestions(data);
            }
        } catch (error) {
            addNotification('Failed to load pending submissions.', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab, addNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReviewBank = async (bankId: string, status: 'approved' | 'rejected') => {
        try {
            await reviewSubmittedBank(bankId, status);
            const bankName = pendingBanks.find(b => b.id === bankId)?.title || 'Bank';
            addNotification(t.reviewSuccess(bankName, status), 'success');
            fetchData();
        } catch (error) {
            addNotification(t.reviewError, 'error');
        }
    };
    
    const handleReviewQuestion = async (questionId: string, status: QuestionStatus.Approved | QuestionStatus.Rejected) => {
        try {
            await reviewQuestion(questionId, status);
            addNotification(t.reviewSuccess('Question', status), 'success');
            fetchData();
        } catch (error) {
            addNotification(t.reviewError, 'error');
        }
    };
    
    const handleAiScreen = async (bank: MarketplaceQuestionBank) => {
        setIsScreening(bank.id);
        setScreeningResult(null);
        try {
            const result = await preScreenSubmittedBankWithAI(bank);
            setScreeningResult(result);
        } catch (err) {
            addNotification('AI screening failed.', 'error');
        } finally {
            setIsScreening(null);
        }
    };
    
    const renderPendingBanks = () => {
        if (loading) return <LoadingSpinner />;
        if (pendingBanks.length === 0) return <EmptyState icon={InboxIcon} title={t.noPendingBanks} message="" />;
        return (
            <div className="space-y-4">
                {pendingBanks.map(bank => (
                    <div key={bank.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{bank.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">by {bank.authorName} | {bank.questionIds.length} questions</p>
                                <p className="text-sm italic mt-1 text-slate-600 dark:text-slate-300">"{bank.description}"</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleAiScreen(bank)} className="p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-slate-700 rounded-full" title={t.aiScreen} disabled={isScreening === bank.id}>
                                    {isScreening === bank.id ? <SpinnerIcon className="w-5 h-5"/> : <LightbulbIcon className="w-5 h-5"/>}
                                </button>
                                <button onClick={() => setPreviewingBank(bank)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.preview}><EyeIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleReviewBank(bank.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title={t.reject}><XCircleIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleReviewBank(bank.id, 'approved')} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-slate-700 rounded-full" title={t.approve}><CheckCircleIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    const renderPendingQuestions = () => {
        if (loading) return <LoadingSpinner />;
        if (pendingQuestions.length === 0) return <EmptyState icon={InboxIcon} title={t.noPendingQuestions} message="" />;
        return (
            <div className="space-y-4">
                {pendingQuestions.map(q => (
                    <div key={q.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <p className="flex-grow font-medium text-slate-800 dark:text-slate-100">{q.text}</p>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <button onClick={() => handleReviewQuestion(q.id, QuestionStatus.Rejected)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title={t.reject}><XCircleIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleReviewQuestion(q.id, QuestionStatus.Approved)} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-slate-700 rounded-full" title={t.approve}><CheckCircleIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <DashboardLayout
                navLinks={navLinks}
                pageTitle={t.pageTitle}
                sidebarHeader={
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                        <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                    </h1>
                }
            >
                <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('banks')} className={`${activeTab === 'banks' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.pendingBanks}</button>
                        <button onClick={() => setActiveTab('questions')} className={`${activeTab === 'questions' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.pendingQuestions}</button>
                    </nav>
                </div>
                {activeTab === 'banks' ? renderPendingBanks() : renderPendingQuestions()}
            </DashboardLayout>
            <PreviewBankModal 
                isOpen={!!previewingBank}
                onClose={() => setPreviewingBank(null)}
                bank={previewingBank}
                showAcquireButton={false}
            />
            <AIScreeningResultModal
                isOpen={!!screeningResult}
                onClose={() => setScreeningResult(null)}
                result={screeningResult}
            />
        </>
    );
};

export default AdminQuestionBankPage;
