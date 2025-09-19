
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getQuestionBank, reviewQuestion, deleteQuestionFromBank, addQuestionToBank, updateQuestionInBank, batchUploadQuestions, getCategories } from '../services/mockApi';
import { Question, QuestionStatus, QuestionType } from '../types';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, ClipboardListIcon, CheckCircleIcon, XCircleIcon, TrashIcon, PlusCircleIcon, EditIcon, UploadIcon, DownloadIcon, InboxIcon, TagIcon } from '../components/icons';
import { useLanguage } from '../App';
import QuestionFormModal from '../components/QuestionFormModal';
import { useNotification } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        approved: "Approved",
        pendingReview: "Pending Review",
        searchPlaceholder: "Search marketplace questions...",
        allTypes: "All Types",
        allCategories: "All Categories",
        allSubCategories: "All Subcategories",
        points: "Points",
        approve: "Approve",
        reject: "Reject",
        delete: "Delete",
        edit: "Edit",
        confirmDelete: "Are you sure you want to permanently delete this question?",
        noQuestionsTitle: "No Questions Found",
        noQuestionsMessage: "No questions found in this category matching your filters.",
        addNewQuestion: "Add New Question",
        importQuestions: "Import Questions",
        downloadTemplate: "Download CSV Template",
        importSuccess: (count: number) => `${count} questions imported successfully.`,
        importFailed: (message: string) => `Import failed: ${message}`,
        uncategorized: "Uncategorized",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        approved: "معتمد",
        pendingReview: "قيد المراجعة",
        searchPlaceholder: "ابحث في أسئلة المتجر...",
        allTypes: "جميع الأنواع",
        allCategories: "كل الفئات",
        allSubCategories: "كل المجالات",
        points: "نقاط",
        approve: "موافقة",
        reject: "رفض",
        delete: "حذف",
        edit: "تعديل",
        confirmDelete: "هل أنت متأكد أنك تريد حذف هذا السؤال نهائيًا؟",
        noQuestionsTitle: "لم يتم العثور على أسئلة",
        noQuestionsMessage: "لا توجد أسئلة في هذه الفئة تطابق الفلاتر الخاصة بك.",
        addNewQuestion: "إضافة سؤال جديد",
        importQuestions: "استيراد أسئلة",
        downloadTemplate: "تنزيل قالب CSV",
        importSuccess: (count: number) => `تم استيراد ${count} سؤال بنجاح.`,
        importFailed: (message: string) => `فشل الاستيراد: ${message}`,
        uncategorized: "غير مصنف",
    }
};

const AdminQuestionBankPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSubCategory, setFilterSubCategory] = useState('');
    const [filterType, setFilterType] = useState<QuestionType | ''>('');
    const [activeTab, setActiveTab] = useState<QuestionStatus.Pending | QuestionStatus.Approved>(QuestionStatus.Pending);
    const { addNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const fetchPageData = useCallback(async () => {
        try {
            setLoading(true);
            const [questionsData, categoriesData] = await Promise.all([
                getQuestionBank({
                    ownerId: 'marketplace',
                    searchTerm,
                    category: filterCategory || undefined,
                    subCategory: filterSubCategory || undefined,
                    questionType: filterType || undefined,
                    status: activeTab
                }),
                getCategories()
            ]);
            setQuestions(questionsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to fetch question bank data:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterCategory, filterSubCategory, filterType, activeTab]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);


    const handleReview = async (questionId: string, newStatus: QuestionStatus.Approved | QuestionStatus.Rejected) => {
        let reason;
        if (newStatus === QuestionStatus.Rejected) {
            reason = prompt("Please provide a reason for rejection (optional):");
        }
        try {
            await reviewQuestion(questionId, newStatus, reason || undefined);
            fetchPageData(); // Refresh the list
        } catch (error) {
            console.error("Failed to review question:", error);
        }
    };
    
    const handleDelete = async (questionId: string) => {
        if (window.confirm(t.confirmDelete)) {
            try {
                await deleteQuestionFromBank(questionId);
                fetchPageData(); // Refresh the list
            } catch (error) {
                console.error("Failed to delete question:", error);
            }
        }
    };

    const handleSaveQuestion = async (questionData: Omit<Question, 'id'> | Question) => {
        try {
            if ('id' in questionData) {
                await updateQuestionInBank(questionData);
            } else {
                await addQuestionToBank({
                    ...questionData,
                    ownerId: 'marketplace',
                    status: QuestionStatus.Approved // New questions from admin are pre-approved
                });
            }
            fetchPageData();
            setIsModalOpen(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error("Failed to save question:", error);
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleAddNewQuestion = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const parsedQuestions = parseQuestionsCSV(text);
                const questionsWithOwner = parsedQuestions.map(q => ({...q, ownerId: 'marketplace', status: QuestionStatus.Approved}));
                await batchUploadQuestions(questionsWithOwner);
                addNotification(t.importSuccess(parsedQuestions.length), 'success');
                fetchPageData();
            } catch (error: any) {
                 addNotification(t.importFailed(error.message), 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const parseQuestionsCSV = (csvText: string): Omit<Question, 'id' | 'ownerId' | 'status'>[] => {
        const lines = csvText.trim().split('\n');
        const header = lines.shift()?.toLowerCase().split(',').map(h => h.trim().replace(/"/g, '')) || [];
        const required = ['text', 'type', 'points', 'category', 'subcategory', 'correctanswer'];
        if (!required.every(h => header.includes(h))) {
            throw new Error(`CSV must include headers: ${required.join(', ')}`);
        }
        return lines.map(line => {
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            const row = header.reduce((obj, h, i) => {
                obj[h] = (values[i] || '').trim().replace(/"/g, '');
                return obj;
            }, {} as any);
            
            if (!Object.values(QuestionType).includes(row.type)) throw new Error(`Invalid question type: ${row.type}`);

            return {
                text: row.text,
                type: row.type as QuestionType,
                points: parseInt(row.points, 10) || 5,
                category: row.category,
                subCategory: row.subcategory,
                options: row.options?.split('|') || undefined,
                correctAnswer: row.correctanswer?.includes('|') ? row.correctanswer.split('|') : row.correctanswer,
                tags: row.tags?.split('|') || [],
            };
        });
    };

    const downloadCSVTemplate = () => {
        const header = "text,type,points,category,subCategory,correctAnswer,options,tags\n";
        const example = `"What is the capital of Spain?","multiple-choice",5,"General Knowledge","Geography","Madrid","Paris|London|Madrid|Rome","Europe|Capitals"`;
        const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "question_template.csv";
        link.click();
    };

    const getTypeName = (type: QuestionType) => {
        return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
     const groupedQuestions = useMemo(() => {
        if (filterCategory) {
            return { [filterCategory]: questions };
        }
        return questions.reduce((acc, q) => {
            const category = q.category || t.uncategorized;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(q);
            return acc;
        }, {} as Record<string, Question[]>);
    }, [questions, filterCategory, t.uncategorized]);

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        if (questions.length === 0) return <EmptyState icon={InboxIcon} title={t.noQuestionsTitle} message={t.noQuestionsMessage} />;
        
        return Object.entries(groupedQuestions).map(([category, questionsInCategory]) => (
            <div key={category}>
                {!filterCategory && (
                    <h3 className="text-xl font-bold mt-6 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-300">
                        {category}
                    </h3>
                )}
                <div className="space-y-4">
                    {questionsInCategory.map(q => (
                         <div key={q.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{q.text}</p>
                                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{getTypeName(q.type)}</span>
                                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">{q.category} / {q.subCategory}</span>
                                    <span>{q.points} {t.points}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                {activeTab === QuestionStatus.Pending && (
                                    <>
                                        <button onClick={() => handleReview(q.id, QuestionStatus.Approved)} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-slate-700 rounded-full" title={t.approve}><CheckCircleIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleReview(q.id, QuestionStatus.Rejected)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 rounded-full" title={t.reject}><XCircleIcon className="w-5 h-5"/></button>
                                    </>
                                )}
                                <button onClick={() => handleEditQuestion(q)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.edit}><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title={t.delete}><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };
    
    return (
        <>
            <DashboardLayout
                navLinks={navLinks}
                pageTitle={t.questionBank}
                sidebarHeader={
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                        <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                    </h1>
                }
            >
                {activeTab === QuestionStatus.Approved && (
                    <div className="flex justify-between items-center mb-4">
                       <button onClick={downloadCSVTemplate} className="text-sm text-blue-500 hover:underline"><DownloadIcon className="w-4 h-4 inline-block me-1"/>{t.downloadTemplate}</button>
                       <div className="flex gap-2">
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                           <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                               <UploadIcon className="w-4 h-4 me-2"/> {t.importQuestions}
                           </button>
                           <button onClick={handleAddNewQuestion} className="flex items-center bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                                <PlusCircleIcon className="w-4 h-4 me-2"/> {t.addNewQuestion}
                           </button>
                        </div>
                    </div>
                )}
                
                <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab(QuestionStatus.Pending)} className={`${activeTab === QuestionStatus.Pending ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.pendingReview}</button>
                        <button onClick={() => setActiveTab(QuestionStatus.Approved)} className={`${activeTab === QuestionStatus.Approved ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.approved}</button>
                    </nav>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-red-500" />
                    <select value={filterType} onChange={e => setFilterType(e.target.value as QuestionType | '')} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500">
                        <option value="">{t.allTypes}</option>
                        {Object.values(QuestionType).map(type => <option key={type} value={type}>{getTypeName(type)}</option>)}
                    </select>
                    <select value={filterCategory} onChange={e => {setFilterCategory(e.target.value); setFilterSubCategory('');}} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500">
                        <option value="">{t.allCategories}</option>
                        {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <select value={filterSubCategory} onChange={e => setFilterSubCategory(e.target.value)} disabled={!filterCategory} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                        <option value="">{t.allSubCategories}</option>
                        {(categories[filterCategory] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                </div>
                
                <div>
                    {pageContent()}
                </div>
            </DashboardLayout>
            <QuestionFormModal
                isOpen={isModalOpen}
                onClose={() => {setIsModalOpen(false); setEditingQuestion(null);}}
                onSave={handleSaveQuestion}
                question={editingQuestion}
            />
        </>
    );
};

export default AdminQuestionBankPage;
