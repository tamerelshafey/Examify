import React, { useState, useEffect, useMemo } from 'react';
import { MarketplaceQuestionBank, Question, QuestionType } from '../types';
import { getQuestionsByIds } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import { XCircleIcon, StarIcon, UsersIcon, DollarSignIcon, ListIcon } from './icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PreviewBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    bank: MarketplaceQuestionBank | null;
    onAcquire?: (bankId: string) => void;
    isAcquired?: boolean;
    isAcquiring?: boolean;
    showAcquireButton?: boolean;
}

const translations = {
    en: {
        title: "Bank Details",
        loading: "Loading questions...",
        noQuestions: "Could not load preview questions.",
        close: "Close",
        points: "pts",
        author: "Author",
        questions: "Questions",
        price: "Price",
        free: "Free",
        category: "Category",
        description: "Description",
        questionTypes: "Question Type Distribution",
        sampleQuestions: "Sample Questions",
        getForFree: "Get for Free",
        buyNow: "Buy Now",
        acquired: "Acquired",
        acquiring: "Acquiring...",
    },
    ar: {
        title: "تفاصيل البنك",
        loading: "جاري تحميل الأسئلة...",
        noQuestions: "تعذر تحميل أسئلة المعاينة.",
        close: "إغلاق",
        points: "نقطة",
        author: "المؤلف",
        questions: "أسئلة",
        price: "السعر",
        free: "مجاني",
        category: "الفئة",
        description: "الوصف",
        questionTypes: "توزيع أنواع الأسئلة",
        sampleQuestions: "عينة من الأسئلة",
        getForFree: "الحصول مجاناً",
        buyNow: "شراء الآن",
        acquired: "تم الاقتناء",
        acquiring: "جاري الاقتناء...",
    }
};

const getTypeName = (type: QuestionType) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center">
        <Icon className="w-6 h-6 mx-auto text-primary-500 mb-1" />
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-bold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
);


const PreviewBankModal: React.FC<PreviewBankModalProps> = ({ isOpen, onClose, bank, onAcquire, isAcquired = false, isAcquiring = false, showAcquireButton = true }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const { lang } = useLanguage();
    const { userRole } = useAuth();
    const navigate = useNavigate();
    const t = translations[lang];

    useEffect(() => {
        if (isOpen && bank) {
            const fetchAllQuestions = async () => {
                setLoading(true);
                try {
                    const data = await getQuestionsByIds(bank.questionIds);
                    setQuestions(data);
                } catch (error) {
                    console.error("Failed to fetch preview questions:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllQuestions();
        }
    }, [isOpen, bank]);

    const questionTypeDistribution = useMemo(() => {
        return questions.reduce((acc, q) => {
            const typeName = getTypeName(q.type);
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [questions]);
    
    const StarRatingDisplay = ({ rating }: { rating: number }) => (
        <div className="flex items-center text-yellow-400">
            {[...Array(Math.floor(rating))].map((_, i) => <StarIcon key={`f-${i}`} className="w-5 h-5 fill-current"/>)}
            {[...Array(5 - Math.floor(rating))].map((_, i) => <StarIcon key={`e-${i}`} className="w-5 h-5 text-slate-300 dark:text-slate-600 fill-current"/>)}
            <span className="text-sm text-slate-500 dark:text-slate-400 ms-1 font-semibold">({rating.toFixed(1)})</span>
        </div>
    );
    
    const handleAcquireClick = () => {
        if (!bank) return;
        if (bank.price > 0) {
            navigate(`/${userRole}/checkout/${bank.id}`);
        } else if (onAcquire) {
            onAcquire(bank.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{bank?.title}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span>{t.author}: <span className="font-semibold text-slate-700 dark:text-slate-300">{bank?.authorName}</span></span>
                            {bank && <StarRatingDisplay rating={bank.rating} />}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={DollarSignIcon} label={t.price} value={bank?.price === 0 ? t.free : `$${bank?.price.toFixed(2)}`} />
                        <StatCard icon={UsersIcon} label={t.questions} value={bank?.questionIds.length || 0} />
                        <StatCard icon={ListIcon} label={t.category} value={bank?.specializedCategory || 'N/A'} />
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">{t.description}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{bank?.description}</p>
                    </div>

                    {!loading && Object.keys(questionTypeDistribution).length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">{t.questionTypes}</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(questionTypeDistribution).map(([type, count]) => (
                                    <span key={type} className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">
                                        {count} {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                         <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">{t.sampleQuestions}</h3>
                         <div className="space-y-3">
                            {loading ? <LoadingSpinner /> : questions.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 py-4">{t.noQuestions}</p>
                            ) : (
                                questions.slice(0, 5).map((q, index) => (
                                    <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-slate-300 dark:border-slate-500">
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{index + 1}. {q.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.close}</button>
                    
                    {showAcquireButton && (isAcquired ? (
                         <button disabled className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg opacity-70">{t.acquired}</button>
                    ) : (
                         <button 
                            onClick={handleAcquireClick}
                            disabled={isAcquiring}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                         >
                            {isAcquiring ? t.acquiring : (bank?.price === 0 ? t.getForFree : `${t.buyNow} ($${bank?.price.toFixed(2)})`)}
                         </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewBankModal;
