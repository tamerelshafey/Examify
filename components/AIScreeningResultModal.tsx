import React from 'react';
import { AIScreeningResult } from '../services/ai';
import { XCircleIcon, LightbulbIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "AI Pre-Screening Analysis",
        qualityScore: "Quality Score",
        relevanceScore: "Relevance Score",
        recommendation: "Recommendation",
        justification: "Justification",
        close: "Close",
    },
    ar: {
        title: "تحليل الفحص المسبق بالذكاء الاصطناعي",
        qualityScore: "درجة الجودة",
        relevanceScore: "درجة الصلة",
        recommendation: "التوصية",
        justification: "التبرير",
        close: "إغلاق",
    }
};

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative w-28 h-28 flex items-center justify-center`}>
                <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        className="text-slate-200 dark:text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        className={getColor(score)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray={`${score}, 100`}
                    />
                </svg>
                <span className={`absolute text-3xl font-bold ${getColor(score)}`}>{score}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
        </div>
    );
};

interface AIScreeningResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: AIScreeningResult | null;
}

const AIScreeningResultModal: React.FC<AIScreeningResultModalProps> = ({ isOpen, onClose, result }) => {
    const { lang } = useLanguage();
    const t = translations[lang];

    if (!isOpen || !result) return null;

    const recommendationConfig = {
        'Strongly Consider': { Icon: CheckCircleIcon, color: 'text-green-500' },
        'Review with Caution': { Icon: AlertTriangleIcon, color: 'text-yellow-500' },
        'Likely Reject': { Icon: XCircleIcon, color: 'text-red-500' },
    };
    
    const { Icon, color } = recommendationConfig[result.recommendation];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <LightbulbIcon className="w-6 h-6 text-primary-500"/>
                        {t.title}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="flex justify-around items-center mb-6">
                    <ScoreCircle score={result.qualityScore} label={t.qualityScore} />
                    <ScoreCircle score={result.relevanceScore} label={t.relevanceScore} />
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.recommendation}</h3>
                        <p className={`text-xl font-bold flex items-center gap-2 mt-1 ${color}`}>
                            <Icon className="w-6 h-6" />
                            {result.recommendation}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.justification}</h3>
                        <p className="mt-1 text-slate-700 dark:text-slate-300 italic">"{result.justification}"</p>
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIScreeningResultModal;