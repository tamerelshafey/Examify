import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BookOpenIcon, BarChartIcon, PlusCircleIcon, ClipboardListIcon, TrashIcon, UploadIcon, DownloadIcon, EditIcon, InboxIcon, BriefcaseIcon, BuildingIcon, ChevronDownIcon, ChevronUpIcon, UsersIcon, SparklesIcon, EyeIcon, StarIcon, AlertTriangleIcon, LightbulbIcon, SpinnerIcon, DollarSignIcon, ShoppingCartIcon } from './icons';
import QuestionFormModal from './QuestionFormModal';
import SubmitBankModal from './SubmitBankModal';
import PreviewBankModal from './PreviewBankModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './DashboardLayout';
import { getQuestionBank, deleteQuestionFromBank, addQuestionToBank, updateQuestionInBank, getStructuredCategories, getMarketplaceBanks, acquireMarketplaceBank, submitBankFromCSV, getAcquiredBankIds, rateMarketplaceBank, getMySubmissions, submitBankForReview, getAuthorStats, getSalesHistory } from '../services/api';
// Fix: Import AIRecommendedBank from types.ts where it is defined and exported.
import { findMarketplaceBanksWithAI } from '../services/ai';
import { Question, QuestionStatus, QuestionType, UserRole, MarketplaceQuestionBank, AIRecommendedBank, Sale } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import SubmitBankViaCSVModal from './SubmitBankViaCSVModal';
import { useNavigate } from 'react-router-dom';

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
            marketplace: "Bank Marketplace",
            authorZone: "Author Zone",
            importQuestions: "Import Questions",
            addNewQuestion: "Add New Question",
            downloadTemplate: "Download CSV Template",
            allSuperCategories: "All Top-level Categories",
            allCategories: "All Specialized Categories",
            allSubCategories: "All Fields of Study",
            points: "Points",
            edit: "Edit",
            noQuestionsTitle: "Your Bank is Empty",
            noQuestionsMessage: "Your question bank is empty. Add a new question to get started!",
            noMarketplaceTitle: "No Question Banks Found",
            noMarketplaceMessage: "No question banks were found matching your criteria.",
            noSubmissionsTitle: "No Submissions Yet",
            noSubmissionsMessage: "You haven't submitted any question banks to the marketplace.",
            copied: "Copied!",
            confirmDelete: "Are you sure you want to delete this question?",
            importSuccess: (count: number) => `${count} questions imported successfully.`,
            importFailed: (message: string) => `Import failed: ${message}`,
            copyFailed: "Failed to copy question.",
            uncategorized: "Uncategorized",
            acquireBank: "Acquire Bank",
            acquiring: "Acquiring...",
            acquireSuccess: "Bank acquired! Questions are now in your bank.",
            acquireFailed: "Failed to acquire bank.",
            author: "Author",
            submitBank: "Submit Bank to Marketplace",
            submitViaCsv: "Submit via CSV",
            submitSuccess: "Bank submitted for review successfully!",
            submitFailed: "Failed to submit bank for review.",
            viewDetails: "View Details",
            youOwnThis: "YOU OWN THIS BANK",
            rateSuccess: (rating: number) => `You rated this bank ${rating} stars!`,
            rateFailed: "Failed to submit your rating.",
            status: {
                pending: "Pending",
                approved: "Approved",
                rejected: "Rejected",
            },
            aiSearchAssistant: "AI Search Assistant",
            aiSearchDesc: "Describe what you're looking for, and let AI find the best question banks for you.",
            aiSearchPlaceholder: "e.g., 'An easy 10-question quiz on JavaScript promises'",
            aiSearch: "Search with AI",
            aiSearching: "Searching...",
            aiRecommendation: "AI Recommendation",
            earningsSummary: "Earnings Summary",
            totalEarnings: "Total Earnings",
            totalSales: "Total Sales",
            availableBalance: "Available Balance",
            salesHistory: "Sales History",
            bankSold: "Bank Sold",
            salePrice: "Sale Price",
            yourEarning: "Your Earning",
            date: "Date",
            mySubmittedBanks: "My Submitted Banks",
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
            marketplace: "متجر بنك الأسئلة",
            authorZone: "منطقة المؤلف",
            importQuestions: "استيراد أسئلة",
            addNewQuestion: "إضافة سؤال جديد",
            downloadTemplate: "تنزيل قالب CSV",
            allSuperCategories: "كل الفئات العليا",
            allCategories: "كل الفئات المتخصصة",
            allSubCategories: "كل مجالات التخصص",
            points: "نقاط",
            edit: "تعديل",
            noQuestionsTitle: "بنك الأسئلة فارغ",
            noQuestionsMessage: "بنك الأسئلة الخاص بك فارغ. أضف سؤالاً جديداً للبدء!",
            noMarketplaceTitle: "لم يتم العثور على بنوك أسئلة",
            noMarketplaceMessage: "لم يتم العثور على بنوك أسئلة في المتجر تطابق معاييرك.",
            noSubmissionsTitle: "لا توجد تقديمات بعد",
            noSubmissionsMessage: "لم تقم بتقديم أي بنوك أسئلة إلى المتجر.",
            copied: "تم النسخ!",
            confirmDelete: "هل أنت متأكد أنك تريد حذف هذا السؤال؟",
            importSuccess: (count: number) => `تم استيراد ${count} سؤال بنجاح.`,
            importFailed: (message: string) => `فشل الاستيراد: ${message}`,
            copyFailed: "فشل نسخ السؤال.",
            uncategorized: "غير مصنف",
            acquireBank: "اقتناء البنك",
            acquiring: "جاري الاقتناء...",
            acquireSuccess: "تم اقتناء البنك! الأسئلة الآن في بنكك الخاص.",
            acquireFailed: "فشل اقتناء البنك.",
            author: "المؤلف",
            submitBank: "قدّم بنكاً للمتجر",
            submitViaCsv: "إرسال عبر CSV",
            submitSuccess: "تم تقديم البنك للمراجعة بنجاح!",
            submitFailed: "فشل تقديم البنك للمراجعة.",
            viewDetails: "عرض التفاصيل",
            youOwnThis: "أنت تملك هذا البنك",
            rateSuccess: (rating: number) => `لقد قيمت هذا البنك بـ ${rating} نجوم!`,
            rateFailed: "فشل إرسال تقييمك.",
            status: {
                pending: "قيد المراجعة",
                approved: "معتمد",
                rejected: "مرفوض",
            },
            aiSearchAssistant: "مساعد البحث الذكي",
            aiSearchDesc: "صف ما تبحث عنه، ودع الذكاء الاصطناعي يجد أفضل بنوك الأسئلة لك.",
            aiSearchPlaceholder: "مثال: 'اختبار سهل من 10 أسئلة حول JavaScript promises'",
            aiSearch: "بحث بالذكاء الاصطناعي",
            aiSearching: "جاري البحث...",
            aiRecommendation: "توصية الذكاء الاصطناعي",
            earningsSummary: "ملخص الأرباح",
            totalEarnings: "إجمالي الأرباح",
            totalSales: "إجمالي المبيعات",
            availableBalance: "الرصيد المتاح",
            salesHistory: "سجل المبيعات",
            bankSold: "البنك المباع",
            salePrice: "سعر البيع",
            yourEarning: "ربحك",
            date: "التاريخ",
            mySubmittedBanks: "بنوكي المقدمة",
        }
    }
};

const navLinkConfig = {
    [UserRole.Teacher]: (t: any) => [
        { path: '/teacher/exams', icon: BookOpenIcon, label: t.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
    ],
    [UserRole.Corporate]: (t: any) => [
        { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.skillLibrary },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
    ],
    [UserRole.TrainingCompany]: (t: any) => [
        { path: '/company/exams', icon: BuildingIcon, label: t.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
    ],
};

const QuestionBankComponent: React.FC<QuestionBankComponentProps> = ({ userRole, currentUserId }) => {
    const [myBank, setMyBank] = useState<Question[]>([]);
    const [marketplaceBanks, setMarketplaceBanks] = useState<MarketplaceQuestionBank[]>([]);
    const [mySubmissions, setMySubmissions] = useState<MarketplaceQuestionBank[]>([]);
    const [authorStats, setAuthorStats] = useState<{ totalEarnings: number; totalSales: number; balance: number } | null>(null);
    const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitCsvModalOpen, setIsSubmitCsvModalOpen] = useState(false);
    const [isSubmittingBank, setIsSubmittingBank] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [structuredCategoriesData, setStructuredCategoriesData] = useState<Record<string, Record<string, string[]>>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSuperCategory, setFilterSuperCategory] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSubCategory, setFilterSubCategory] = useState('');
    const [activeTab, setActiveTab] = useState<'myBank' | 'marketplace' | 'authorZone'>('myBank');
    const [acquiringBankId, setAcquiringBankId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const [previewingBank, setPreviewingBank] = useState<MarketplaceQuestionBank | null>(null);
    const [acquiredBankIds, setAcquiredBankIds] = useState<Set<string>>(new Set());
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<AIRecommendedBank[]>([]);
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    
    const roleTranslations = translations[lang][userRole] || translations[lang].teacher;
    const t = { ...translations[lang].common, ...roleTranslations };
    
    const navLinks = navLinkConfig[userRole](t);
    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName} {t.title}</h1>;

    const fetchCategories = useCallback(async () => {
        try {
            const cats = await getStructuredCategories();
            setStructuredCategoriesData(cats);
        } catch(error) {
            console.error(error);
            addNotification('Failed to load categories.', 'error');
        }
    }, [addNotification]);
    
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setAiSearchQuery('');
        setAiSearchResults([]);
        const fetchDataForTab = async () => {
            setLoading(true);
            try {
                if (activeTab === 'myBank') {
                    const data = await getQuestionBank({ ownerId: currentUserId, searchTerm, category: filterCategory, subCategory: filterSubCategory, status: QuestionStatus.Approved });
                    setMyBank(data);
                } else if (activeTab === 'marketplace') {
                    const [bankData, acquiredIds] = await Promise.all([
                        getMarketplaceBanks({ specializedCategory: filterCategory || undefined }),
                        getAcquiredBankIds(currentUserId)
                    ]);
                    setMarketplaceBanks(bankData);
                    setAcquiredBankIds(new Set(acquiredIds));
                } else if (activeTab === 'authorZone') {
                     const [submissions, stats, history] = await Promise.all([
                        getMySubmissions(currentUserId),
                        getAuthorStats(currentUserId),
                        getSalesHistory(currentUserId)
                    ]);
                    setMySubmissions(submissions);
                    setAuthorStats(stats);
                    setSalesHistory(history);
                }
            } catch (error) {
                console.error("Data fetching error:", error);
                addNotification('Failed to load data for this tab.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDataForTab();
    }, [activeTab, currentUserId, searchTerm, filterCategory, filterSubCategory, addNotification]);

    const toggleCategory = (categoryName: string) => {
        setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };

    const handleSaveQuestion = async (questionData: Omit<Question, 'id'> | Question) => {
        try {
            if ('id' in questionData) {
                await updateQuestionInBank(questionData);
                 addNotification('Question updated successfully!', 'success');
            } else {
                await addQuestionToBank({ ...questionData, ownerId: currentUserId, status: QuestionStatus.Approved });
                 addNotification('Question added successfully!', 'success');
            }
            if(activeTab === 'myBank') {
                const data = await getQuestionBank({ ownerId: currentUserId, searchTerm, category: filterCategory, subCategory: filterSubCategory, status: QuestionStatus.Approved });
                setMyBank(data);
            }
            setIsFormModalOpen(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error("Failed to save question:", error);
            addNotification('Failed to save question.', 'error');
        }
    };

    const handleSubmitBank = async (data: { title: string; description: string; price: number; questionIds: string[]; specializedCategory: string }) => {
        setIsSubmittingBank(true);
        try {
            await submitBankForReview({
                ...data,
                authorId: currentUserId,
            });
            addNotification(t.submitSuccess, 'success');
            setIsSubmitModalOpen(false);
        } catch (error) {
            addNotification(t.submitFailed, 'error');
            console.error(error);
        } finally {
            setIsSubmittingBank(false);
        }
    };

    const handleSubmitBankFromCSV = async (data: { title: string; description: string; price: number; specializedCategory: string; questions: Omit<Question, 'id' | 'ownerId' | 'status'>[] }) => {
        setIsSubmittingBank(true);
        try {
            await submitBankFromCSV({
                ...data,
                authorId: currentUserId,
            });
            addNotification(t.submitSuccess, 'success');
            setIsSubmitCsvModalOpen(false);
        } catch (error) {
            addNotification(t.submitFailed, 'error');
            console.error(error);
        } finally {
            setIsSubmittingBank(false);
        }
    };
    
    const handleDeleteQuestion = async (questionId: string) => {
        if (window.confirm(t.confirmDelete)) {
            try {
                await deleteQuestionFromBank(questionId);
                addNotification('Question deleted.', 'success');
                const data = await getQuestionBank({ ownerId: currentUserId, searchTerm, category: filterCategory, subCategory: filterSubCategory });
                setMyBank(data);
            } catch (error) {
                console.error("Failed to delete question:", error);
                addNotification('Failed to delete question.', 'error');
            }
        }
    };

    const handleAcquireBank = async (bankId: string) => {
        const bank = marketplaceBanks.find(b => b.id === bankId);
        if (!bank) return;

        if (bank.price > 0) {
            navigate(`/${userRole}/checkout/${bankId}`);
            return;
        }

        setAcquiringBankId(bankId);
        try {
            await acquireMarketplaceBank(currentUserId, bankId);
            addNotification(t.acquireSuccess, 'success');
            setAcquiredBankIds(prev => new Set(prev).add(bankId));
            if (previewingBank?.id === bankId) {
                setPreviewingBank(null); // Close modal on success
            }
        } catch (error) {
            console.error("Failed to acquire bank:", error);
            addNotification(t.acquireFailed, 'error');
        } finally {
            setAcquiringBankId(null);
        }
    };

    const handleRateBank = async (bankId: string, rating: number) => {
        try {
            await rateMarketplaceBank(currentUserId, bankId, rating);
            addNotification(t.rateSuccess(rating), 'success');
            const data = await getMarketplaceBanks({ specializedCategory: filterCategory || undefined });
            setMarketplaceBanks(data);
        } catch (error) {
            addNotification(t.rateFailed, 'error');
        }
    };
    
    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsFormModalOpen(true);
    };

    const handleAddNewQuestion = () => {
        setEditingQuestion(null);
        setIsFormModalOpen(true);
    }
    
    const handleAiSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiSearchQuery.trim()) return;
        
        setIsAiSearching(true);
        setAiSearchResults([]);
        try {
            const results = await findMarketplaceBanksWithAI(aiSearchQuery);
            if (results.length === 0) {
                addNotification('AI could not find any matching banks for your query.', 'error');
            } else {
                setAiSearchResults(results);
            }
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            setIsAiSearching(false);
        }
    };

    const getTypeName = (type: QuestionType) => {
        return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const StarRatingDisplay = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex items-center text-yellow-400">
                {[...Array(fullStars)].map((_, i) => <StarIcon key={`f-${i}`} className="w-4 h-4 fill-current"/>)}
                {halfStar && <StarIcon className="w-4 h-4 fill-current"/>}
                {[...Array(emptyStars)].map((_, i) => <StarIcon key={`e-${i}`} className="w-4 h-4 text-slate-300 dark:text-slate-500 fill-current"/>)}
                <span className="text-xs text-slate-500 dark:text-slate-400 ms-1">({rating.toFixed(1)})</span>
            </div>
        );
    };

    const StarRatingInput: React.FC<{ onRate: (rating: number) => void }> = ({ onRate }) => {
        const [hoverRating, setHoverRating] = useState(0);
        return (
            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => onRate(star)}
                        className="p-1"
                        aria-label={`Rate ${star} stars`}
                    >
                        <StarIcon
                            className={`w-6 h-6 transition-colors ${
                                star <= hoverRating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-slate-300 dark:text-slate-500'
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const MarketplaceBankCard: React.FC<{ bank: MarketplaceQuestionBank & { justification?: string } }> = ({ bank }) => {
        const isAcquired = acquiredBankIds.has(bank.id);
        return (
             <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col ${isAcquired ? 'border-2 border-primary-500' : ''}`}>
                {bank.justification && (
                    <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-500/10 rounded-md border-l-4 border-primary-400">
                        <p className="text-xs font-semibold text-primary-800 dark:text-primary-300">{t.aiRecommendation}</p>
                        <p className="text-sm italic text-primary-700 dark:text-primary-400">"{bank.justification}"</p>
                    </div>
                )}
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{bank.title}</h3>
                    <StarRatingDisplay rating={bank.rating} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.author}: <span className="font-semibold">{bank.authorName}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow">{bank.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                     <span className="flex items-center text-sm text-slate-500 dark:text-slate-300"><UsersIcon className="w-4 h-4 me-2"/> {bank.questionIds.length} Questions</span>
                     {isAcquired ? (
                         <div className="text-right">
                             <p className="text-xs font-semibold text-primary-500 mb-1">{t.youOwnThis}</p>
                             <StarRatingInput onRate={(rating) => handleRateBank(bank.id, rating)} />
                         </div>
                     ) : (
                         <button 
                             onClick={() => setPreviewingBank(bank)}
                             className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                         >
                            {t.viewDetails}
                         </button>
                     )}
                </div>
            </div>
        );
    };
    
    const groupedBank = useMemo(() => {
        if (filterCategory) {
            return { [filterCategory]: myBank };
        }
        return myBank.reduce((acc, q) => {
            const category = q.category || t.uncategorized;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(q);
            return acc;
        }, {} as Record<string, Question[]>);
    }, [myBank, filterCategory, t.uncategorized]);
    
    // Fix: Explicitly type the Map to help TypeScript inference.
    const displayedMarketplaceBanks = useMemo((): Array<MarketplaceQuestionBank & { justification?: string }> => {
        if (aiSearchResults.length > 0) {
            const recommendedBankMap = new Map<string, AIRecommendedBank>(aiSearchResults.map(r => [r.bankId, r]));
            return marketplaceBanks
                .filter(bank => recommendedBankMap.has(bank.id))
                .sort((a, b) => {
                    const aIndex = aiSearchResults.findIndex(r => r.bankId === a.id);
                    const bIndex = aiSearchResults.findIndex(r => r.bankId === b.id);
                    return aIndex - bIndex;
                })
                .map(bank => ({ ...bank, justification: recommendedBankMap.get(bank.id)?.justification }));
        }
        return marketplaceBanks.map(bank => ({ ...bank, justification: undefined }));
    }, [marketplaceBanks, aiSearchResults]);

    const StatCard = ({ icon: Icon, title, value, colorClass, prefix = '' }: any) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
            <div className={`p-3 rounded-full me-4 ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{prefix}{value}</p>
            </div>
        </div>
    );

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;

        if (activeTab === 'marketplace') {
            if (marketplaceBanks.length === 0) return <EmptyState icon={InboxIcon} title={t.noMarketplaceTitle} message={t.noMarketplaceMessage} />;
            return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{displayedMarketplaceBanks.map((bank) => <MarketplaceBankCard key={bank.id} bank={bank} />)}</div>;
        }

        if (activeTab === 'authorZone') {
            const statusStyles = {
                pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            };
            return (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">{t.earningsSummary}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <StatCard icon={DollarSignIcon} title={t.totalEarnings} value={authorStats?.totalEarnings.toFixed(2)} prefix="$" colorClass="bg-green-500" />
                           <StatCard icon={ShoppingCartIcon} title={t.totalSales} value={authorStats?.totalSales} colorClass="bg-blue-500" />
                           <StatCard icon={DollarSignIcon} title={t.availableBalance} value={authorStats?.balance.toFixed(2)} prefix="$" colorClass="bg-purple-500" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">{t.salesHistory}</h3>
                        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t.bankSold}</th>
                                        <th scope="col" className="px-6 py-3">{t.salePrice}</th>
                                        <th scope="col" className="px-6 py-3">{t.yourEarning}</th>
                                        <th scope="col" className="px-6 py-3">{t.date}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesHistory.map(sale => (
                                        <tr key={sale.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{sale.bankTitle}</td>
                                            <td className="px-6 py-4">${sale.salePrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 font-semibold text-green-600">${sale.sellerEarning.toFixed(2)}</td>
                                            <td className="px-6 py-4">{sale.timestamp.toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {salesHistory.length === 0 && <p className="text-center p-4 text-slate-500">{t.noSubmissionsMessage}</p>}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold mb-4">{t.mySubmittedBanks}</h3>
                        {mySubmissions.length === 0 ? <EmptyState icon={InboxIcon} title={t.noSubmissionsTitle} message={t.noSubmissionsMessage} /> : (
                            <div className="space-y-4">
                                {mySubmissions.map(bank => (
                                    <div key={bank.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{bank.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Submitted on: {bank.submittedAt?.toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[bank.status || 'pending']}`}>
                                                {t.status[bank.status || 'pending']}
                                            </span>
                                        </div>
                                         {bank.status === 'rejected' && bank.rejectionReason && (
                                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 rounded-r-lg">
                                                <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2 text-sm"><AlertTriangleIcon className="w-4 h-4"/> Rejection Reason</p>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{bank.rejectionReason}</p>
                                            </div>
                                         )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        // My Bank View
        if (myBank.length === 0 && !searchTerm && !filterCategory) return <EmptyState icon={InboxIcon} title={t.noQuestionsTitle} message={t.noQuestionsMessage} />;
       
        // Fix: Correctly type the destructured parameters from Object.entries to avoid 'any'.
        return Object.entries(groupedBank).map(([category, questionsInCategory]: [string, Question[]]) => (
             <div key={category}>
                {!filterCategory ? (
                    <button 
                        onClick={() => toggleCategory(category)}
                        className="w-full text-left flex justify-between items-center text-xl font-bold mt-6 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 p-2 rounded-t-lg"
                    >
                        <div className="flex items-center gap-3">
                            {collapsedCategories[category] ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            <span>{category}</span>
                        </div>
                        <span className="text-sm font-medium bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full">{questionsInCategory?.length}</span>
                    </button>
                ) : null}
                 
                {(!filterCategory ? !collapsedCategories[category] : true) && (
                    <div className="space-y-4">
                        {questionsInCategory?.map((q: Question) => (
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
                                    <button onClick={() => handleEditQuestion(q)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                       <div/>
                       <div className="flex gap-2">
                           <button onClick={() => setIsSubmitCsvModalOpen(true)} className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                               <UploadIcon className="w-4 h-4 me-2"/> {t.submitViaCsv}
                           </button>
                           <button onClick={() => setIsSubmitModalOpen(true)} className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                               <SparklesIcon className="w-4 h-4 me-2"/> {t.submitBank}
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
                        <button onClick={() => setActiveTab('authorZone')} className={`${activeTab === 'authorZone' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.authorZone}</button>
                    </nav>
                </div>

                {activeTab === 'marketplace' && (
                    <div className="mb-6 p-4 bg-primary-100 dark:bg-primary-500/10 rounded-lg border border-primary-200 dark:border-primary-500/20">
                        <h3 className="text-lg font-bold mb-2 text-primary-800 dark:text-primary-300 flex items-center gap-2">
                            <LightbulbIcon className="w-5 h-5" />
                            {t.aiSearchAssistant}
                        </h3>
                        <p className="text-sm text-primary-700 dark:text-primary-400 mb-3">{t.aiSearchDesc}</p>
                        <form onSubmit={handleAiSearch} className="flex gap-2">
                            <input 
                                type="text"
                                value={aiSearchQuery}
                                onChange={(e) => setAiSearchQuery(e.target.value)}
                                placeholder={t.aiSearchPlaceholder}
                                className="flex-grow p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-primary-500"
                            />
                            <button type="submit" disabled={isAiSearching || !aiSearchQuery.trim()} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                {isAiSearching ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                {isAiSearching ? t.aiSearching : t.aiSearch}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab !== 'authorZone' && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className={`${activeTab === 'myBank' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                            {activeTab === 'myBank' && <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full focus:ring-2 focus:ring-primary-500 md:col-span-2 lg:col-span-4" />}
                            
                            <select value={filterSuperCategory} onChange={e => { setFilterSuperCategory(e.target.value); setFilterCategory(''); setFilterSubCategory(''); }} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500">
                                <option value="">{t.allSuperCategories}</option>
                                {Object.keys(structuredCategoriesData).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterSubCategory(''); }} disabled={!filterSuperCategory} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                                <option value="">{t.allCategories}</option>
                                {filterSuperCategory && structuredCategoriesData[filterSuperCategory] && Object.keys(structuredCategoriesData[filterSuperCategory]).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            {activeTab === 'myBank' &&
                            <select value={filterSubCategory} onChange={e => setFilterSubCategory(e.target.value)} disabled={!filterCategory} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                                <option value="">{t.allSubCategories}</option>
                                {filterSuperCategory && filterCategory && structuredCategoriesData[filterSuperCategory]?.[filterCategory] &&
                                    structuredCategoriesData[filterSuperCategory][filterCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                            }
                        </div>
                    </div>
                )}
                
                <div>
                    {pageContent()}
                </div>
            </DashboardLayout>
            <QuestionFormModal
                isOpen={isFormModalOpen}
                onClose={() => {setIsFormModalOpen(false); setEditingQuestion(null);}}
                onSave={handleSaveQuestion}
                question={editingQuestion}
            />
            <SubmitBankModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSubmit={handleSubmitBank}
                userQuestions={myBank.filter(q => q.status === QuestionStatus.Approved)}
                isSubmitting={isSubmittingBank}
            />
            <PreviewBankModal 
                isOpen={!!previewingBank}
                onClose={() => setPreviewingBank(null)}
                bank={previewingBank}
                onAcquire={handleAcquireBank}
                isAcquired={previewingBank ? acquiredBankIds.has(previewingBank.id) : false}
                isAcquiring={previewingBank ? acquiringBankId === previewingBank.id : false}
            />
            <SubmitBankViaCSVModal
                isOpen={isSubmitCsvModalOpen}
                onClose={() => setIsSubmitCsvModalOpen(false)}
                onSubmit={handleSubmitBankFromCSV}
                isSubmitting={isSubmittingBank}
            />
        </>
    );
};

export default QuestionBankComponent;