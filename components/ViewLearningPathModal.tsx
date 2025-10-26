

import React from 'react';
import { LearningPath, Language } from '../types';
import PersonalizedLearningPath from './PersonalizedLearningPath';
import LoadingSpinner from './LoadingSpinner';
import { XCircleIcon } from './icons';

interface ViewLearningPathModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    examTitle: string;
    learningPath: LearningPath | null;
    isLoading: boolean;
    error: string | null;
    lang: Language;
}

const translations = {
    en: {
        title: "Learning Path for",
        basedOn: "Based on performance in",
        loading: "Generating learning path...",
        error: "Could not generate learning path.",
    },
    ar: {
        title: "خطة التعلم لـ",
        basedOn: "بناءً على الأداء في",
        loading: "جاري إنشاء خطة التعلم...",
        error: "تعذر إنشاء خطة التعلم.",
    }
};

const ViewLearningPathModal: React.FC<ViewLearningPathModalProps> = ({
    isOpen,
    onClose,
    studentName,
    examTitle,
    learningPath,
    isLoading,
    error,
    lang
}) => {
    if (!isOpen) return null;
    const t = translations[lang];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative" 
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
                <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-slate-100">{t.title} {studentName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.basedOn} "{examTitle}"</p>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-10">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-600 dark:text-slate-300">{t.loading}</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500">{t.error}</p>}
                
                {learningPath && (
                    <PersonalizedLearningPath learningPath={learningPath} lang={lang} />
                )}
            </div>
        </div>
    );
};

export default ViewLearningPathModal;