import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BookOpenIcon, BarChartIcon, PlusCircleIcon, ClipboardListIcon, TrashIcon, UploadIcon, DownloadIcon, EditIcon, InboxIcon, BriefcaseIcon, BuildingIcon } from './icons';
import QuestionFormModal from './QuestionFormModal';
import { useLanguage, useTheme } from '../App';
import DashboardLayout from './DashboardLayout';
import { getQuestionBank, deleteQuestionFromBank, addQuestionToBank, updateQuestionInBank, batchUploadQuestions, getCategories } from '../services/mockApi';
import { Question, QuestionStatus, QuestionType, UserRole } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

// Props Interface
interface QuestionBankComponentProps {
    userRole: UserRole.Teacher | UserRole.Corporate | UserRole.TrainingCompany;
    currentUserId: string;
}

// Translations
const translations = {
    en: {
        teacher: {
            title: "Teacher",
            myExams: "My Exams",
            searchPlaceholder: "Search my questions...",
            copyToBank: "Copy to My Bank",
            copySuccess: "Question copied to 'My Bank'!",
        },
        corporate: {
            title: "Corporate Center",
            skillLibrary: "Skill Library",
            searchPlaceholder: "Search company questions...",
            myBank: "Company Bank",
            copyToBank: "Copy to Company Bank",
            copySuccess: "Question copied to 'Company Bank'!",
        },
        company: { // TrainingCompany
            title: "for Companies",
            courseExams: "Course Exams",
            searchPlaceholder: "Search company questions...",
            myBank: "Company Bank",
            copyToBank: "Copy to Company Bank",
            copySuccess: "Question copied to 'Company Bank'!",
        },
        common: {
            questionBank: "Question Bank",
            analytics: "Analytics",
            myBank: "My Bank",
            marketplace: "Marketplace",
            importQuestions: "Import Questions",
            addNewQuestion: "Add New Question",
            downloadTemplate: "Download CSV Template",
            allCategories: "All Categories",
            allSubCategories: "All Subcategories",
            points: "Points",
            edit: "Edit",
            noQuestionsTitle: "Your Bank is Empty",
            noQuestionsMessage: "Your question bank is empty. Add a new question to get started!",
            noMarketplaceTitle: "No Questions Found",
            noMarketplaceMessage: "No marketplace questions found matching your criteria.",
            copied: "Copied!",
            confirmDelete: "Are you sure you want to delete this question?",
            importSuccess: (count: number) => `${count} questions imported successfully.`,
            importFailed: (message: string) => `Import failed: ${message}`,
            copyFailed: "Failed to copy question.",
            uncategorized: "Uncategorized",
        }
    },
    ar: {
        teacher: {
            title: "المعلم",
            myExams: "اختباراتي",
            searchPlaceholder: "ابحث في أسئلتي...",
            copyToBank: "نسخ إلى بنكي",
            copySuccess: "تم نسخ السؤال إلى 'بنكي'!",
        },
        corporate: {
            title: "المركز المؤسسي",
            skillLibrary: "مكتبة المهارات",
            searchPlaceholder: "ابحث في أسئلة الشركة...",
            myBank: "بنك الشركة",
            copyToBank: "نسخ إلى بنك الشركة",
            copySuccess: "تم نسخ السؤال إلى 'بنك الشركة'!",
        },
        company: {
            title: "للشركات",
            courseExams: "اختبارات الدورة",
            searchPlaceholder: "ابحث في أسئلة الشركة...",
            myBank: "بنك الشركة",
            copyToBank: "نسخ إلى بنك الشركة",
            copySuccess: "تم نسخ السؤال إلى 'بنك الشركة'!",
        },
        common: {
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            myBank: "بنكي",
            marketplace: "المتجر",
            importQuestions: "استيراد أسئلة",
            addNewQuestion: "إضافة سؤال جديد",
            downloadTemplate: "تنزيل قالب CSV",
            allCategories: "كل الفئات",
            allSubCategories: "كل المجالات",
            points: "نقاط",
            edit: "تعديل",
            noQuestionsTitle: "بنك الأسئلة فارغ",
            noQuestionsMessage: "بنك الأسئلة الخاص بك فارغ. أضف سؤالاً جديداً للبدء!",
            noMarketplaceTitle: "لم يتم العثور على أسئلة",
            noMarketplaceMessage: "لم يتم العثور على أسئلة في المتجر تطابق معاييرك.",
            copied: "تم النسخ!",
            confirmDelete: "هل أنت متأكد أنك تريد حذف هذا السؤال؟",
            importSuccess: (count: number) => `تم استيراد ${count} سؤال بنجاح.`,
            importFailed: (message: string) => `فشل الاستيراد: ${message}`,
            copyFailed: "فشل نسخ السؤال.",
            uncategorized: "غير مصنف",
        }
    }
};

const navLinkConfig = {
    [UserRole.Teacher]: (t: any) => [
        { path: '/teacher', icon: BookOpenIcon, label: t.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
    ],
    [UserRole.Corporate]: (t: any) => [
        { path: '/corporate', icon: BriefcaseIcon, label: t.skillLibrary },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
    ],
    [UserRole.TrainingCompany]: (t: any) => [
        { path: '/company', icon: BuildingIcon, label: t.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
    ],
};

const QuestionBankComponent: React.FC<QuestionBankComponentProps> = ({ userRole, currentUserId }) => {
    const [myBank, setMyBank] = useState<Question[]>([]);
    const [marketplace, setMarketplace] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSubCategory, setFilterSubCategory] = useState('');
    const [activeTab, setActiveTab] = useState<'myBank' | 'marketplace'>('myBank');
    const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const { addNotification } = useNotification();
    
    const roleTranslations = translations[lang][userRole] || translations[lang].teacher;
    const t = { ...translations[lang].common, ...roleTranslations };
    
    const navLinks = navLinkConfig[userRole](t);
    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName} {t.title}</h1>;

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const [myBankData, marketplaceData, categoriesData] = await Promise.all([
                getQuestionBank({ ownerId: currentUserId, searchTerm, category: filterCategory, subCategory: filterSubCategory }),
                getQuestionBank({ ownerId: 'marketplace', searchTerm, category: filterCategory, subCategory: filterSubCategory, status: QuestionStatus.Approved }),
                getCategories()
            ]);
            setMyBank(myBankData);
            setMarketplace(marketplaceData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            addNotification('Failed to load questions.', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterCategory, filterSubCategory, addNotification, currentUserId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleSaveQuestion = async (questionData: Omit<Question, 'id'> | Question) => {
        try {
            if ('id' in questionData) {
                await updateQuestionInBank(questionData);
                 addNotification('Question updated successfully!', 'success');
            } else {
                await addQuestionToBank({ ...questionData, ownerId: currentUserId });
                 addNotification('Question added successfully!', 'success');
            }
            fetchQuestions();
            setIsModalOpen(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error("Failed to save question:", error);
            addNotification('Failed to save question.', 'error');
        }
    };
    
    const handleDeleteQuestion = async (questionId: string) => {
        if (window.confirm(t.confirmDelete)) {
            try {
                await deleteQuestionFromBank(questionId);
                addNotification('Question deleted.', 'success');
                fetchQuestions();
            } catch (error) {
                console.error("Failed to delete question:", error);
                addNotification('Failed to delete question.', 'error');
            }
        }
    };

    const handleCopyQuestion = async (question: Question) => {
        try {
            await addQuestionToBank({ ...question, ownerId: currentUserId, status: QuestionStatus.Approved });
            setCopiedIds(prev => new Set(prev).add(question.id));
            addNotification(t.copySuccess, 'success');
            if(activeTab === 'myBank') fetchQuestions();
        } catch (error) {
            addNotification(t.copyFailed, 'error');
        }
    };
    
    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleAddNewQuestion = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    }
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const parsedQuestions = parseQuestionsCSV(text);
                const questionsWithOwner = parsedQuestions.map(q => ({...q, ownerId: currentUserId, status: QuestionStatus.Approved}));
                await batchUploadQuestions(questionsWithOwner);
                addNotification(t.importSuccess(parsedQuestions.length), 'success');
                fetchQuestions();
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
        let example = `"What is the capital of Spain?","multiple-choice",5,"General Knowledge","Geography","Madrid","Paris|London|Madrid|Rome","Europe|Capitals"`;
        if (userRole === UserRole.Corporate) {
            example = `"Which Excel function is used to find a value in a table?","multiple-choice",5,"Business","Finance","VLOOKUP","VLOOKUP|SUMIF|COUNT|AVERAGE","Excel|Functions"`;
        } else if (userRole === UserRole.TrainingCompany) {
            example = `"What is a primary key in a database?","short-answer",5,"Programming","Databases","A unique identifier for a record.","","database|sql|keys"`;
        }
        const header = "text,type,points,category,subCategory,correctAnswer,options,tags\n";
        const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "question_template.csv";
        link.click();
    };

    const getTypeName = (type: QuestionType) => {
        return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const QuestionCard = ({ q, isMarketplace }: { q: Question; isMarketplace: boolean }) => (
        <div key={q.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-start justify-between">
            <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{q.text}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{getTypeName(q.type)}</span>
                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">{q.category} / {q.subCategory}</span>
                    <span>{q.points} {t.points}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
                {isMarketplace ? (
                    <button onClick={() => handleCopyQuestion(q)} disabled={copiedIds.has(q.id)} className="py-1 px-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-700 text-white rounded-md text-sm font-semibold transition-colors">
                        {copiedIds.has(q.id) ? t.copied : t.copyToBank}
                    </button>
                ) : (
                    <>
                        <button onClick={() => handleEditQuestion(q)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><EditIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                    </>
                )}
            </div>
        </div>
    );
    
    const groupedBank = useMemo(() => {
        const bank = activeTab === 'myBank' ? myBank : marketplace;
        if (filterCategory) {
            return { [filterCategory]: bank };
        }
        return bank.reduce((acc, q) => {
            const category = q.category || t.uncategorized;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(q);
            return acc;
        }, {} as Record<string, Question[]>);
    }, [myBank, marketplace, activeTab, filterCategory, t.uncategorized]);

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        
        const questionsToDisplay = activeTab === 'myBank' ? myBank : marketplace;

        if (questionsToDisplay.length === 0) {
            const emptyTitle = activeTab === 'myBank' ? t.noQuestionsTitle : t.noMarketplaceTitle;
            const emptyMessage = activeTab === 'myBank' ? t.noQuestionsMessage : t.noMarketplaceMessage;
            return <EmptyState icon={InboxIcon} title={emptyTitle} message={emptyMessage} />;
        }
       
        return Object.entries(groupedBank).map(([category, questionsInCategory]) => (
            <div key={category}>
                {!filterCategory && (
                     <h3 className="text-xl font-bold mt-6 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-300">
                        {category}
                    </h3>
                )}
                 <div className="space-y-4">
                    {questionsInCategory.map(q => <QuestionCard key={q.id} q={q} isMarketplace={activeTab === 'marketplace'} />)}
                </div>
            </div>
        ));
    };

    return (
        <>
            <DashboardLayout
              navLinks={navLinks}
              pageTitle={t.questionBank}
              sidebarHeader={sidebarHeader}
            >
                {activeTab === 'myBank' && (
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
                        <button onClick={() => setActiveTab('myBank')} className={`${activeTab === 'myBank' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.myBank}</button>
                        <button onClick={() => setActiveTab('marketplace')} className={`${activeTab === 'marketplace' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.marketplace}</button>
                    </nav>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-primary-500" />
                    <select value={filterCategory} onChange={e => {setFilterCategory(e.target.value); setFilterSubCategory('');}} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500">
                        <option value="">{t.allCategories}</option>
                        {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <select value={filterSubCategory} onChange={e => setFilterSubCategory(e.target.value)} disabled={!filterCategory} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
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

export default QuestionBankComponent;