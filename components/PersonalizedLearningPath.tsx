import React, { useState } from 'react';
import { LearningPath, PracticeQuestion } from '../types';
import { Language } from '../App';
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, Wand2Icon } from './icons';

const translations = {
    en: {
        title: "Your Personalized Learning Path",
        weaknesses: "Identified Weaknesses",
        plan: "Your Learning Plan",
        resources: "Suggested Resources",
        practice: "Practice Questions",
        showAnswer: "Show Answer",
        hideAnswer: "Hide Answer",
    },
    ar: {
        title: "خطة التعلم المخصصة لك",
        weaknesses: "نقاط الضعف المحددة",
        plan: "خطة التعلم الخاصة بك",
        resources: "المصادر المقترحة",
        practice: "أسئلة للممارسة",
        showAnswer: "أظهر الإجابة",
        hideAnswer: "إخفاء الإجابة",
    }
};

const PracticeQuestionItem: React.FC<{ question: PracticeQuestion, lang: Language }> = ({ question, lang }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const t = translations[lang];
    return (
        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            <p className="text-sm text-slate-800 dark:text-slate-200">{question.text}</p>
            <button onClick={() => setShowAnswer(!showAnswer)} className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:underline mt-2">
                {showAnswer ? t.hideAnswer : t.showAnswer}
                {showAnswer ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
            </button>
            {showAnswer && (
                <p className="mt-2 text-sm p-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md">{question.answer}</p>
            )}
        </div>
    );
};


interface PersonalizedLearningPathProps {
    learningPath: LearningPath;
    lang: Language;
}

const PersonalizedLearningPath: React.FC<PersonalizedLearningPathProps> = ({ learningPath, lang }) => {
    const t = translations[lang];

    return (
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Wand2Icon className="w-6 h-6 text-primary-500" />
                {t.title}
            </h3>
            
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t.weaknesses}</h4>
                <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    {learningPath.identifiedWeaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)}
                </ul>
            </div>
            
            <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">{t.plan}</h4>
            <div className="space-y-4">
                {learningPath.learningPlan.map((item, i) => (
                    <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h5 className="font-bold text-lg text-primary-600 dark:text-primary-400">{item.concept}</h5>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.explanation}</p>
                        
                        {item.suggestedResources && item.suggestedResources.length > 0 && (
                            <div className="mt-4">
                                <h6 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t.resources}</h6>
                                <ul className="mt-2 space-y-1">
                                    {item.suggestedResources.map((res, j) => (
                                        <li key={j}>
                                            <a href={res.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                                                <LinkIcon className="w-4 h-4" /> {res.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-4">
                            <h6 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t.practice}</h6>
                            <div className="mt-2 space-y-2">
                                {item.practiceQuestions.map((q, k) => <PracticeQuestionItem key={k} question={q} lang={lang} />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PersonalizedLearningPath;
