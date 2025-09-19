

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExamResultDetails, getAIExplanation, generatePersonalizedLearningPath } from '../services/mockApi';
import { Exam, ExamResult, Question, QuestionType, Answer, LearningPath } from '../types';
import { BookOpenIcon, CheckCircleIcon, ArrowLeftIcon, XCircleIcon, LightbulbIcon, Wand2Icon, SpinnerIcon } from '../components/icons';
import { useLanguage, useTheme } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import PersonalizedLearningPath from '../components/PersonalizedLearningPath';

type ReviewData = {
    result: ExamResult;
    exam: Exam;
};

const translations = {
    en: {
        availableExams: "Available Exams",
        myResults: "My Results",
        loading: "Loading review...",
        notFound: "Could not load review details.",
        backToDashboard: "Back to Dashboard",
        reviewTitle: "Review",
        submittedOn: "Submitted on",
        finalScore: "Your Final Score",
        yourAnswer: "Your Answer:",
        correctAnswer: "Correct Answer:",
        notAnswered: "Not Answered",
        ai: {
            prompt: "Why was my answer wrong? 🤔",
            loading: "Generating explanation...",
            error: "Error:",
            title: "AI Explanation"
        },
        learningPath: {
            generate: "Generate My Personalized Study Plan",
            generating: "Building your plan... This may take a moment.",
        }
    },
    ar: {
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        loading: "جاري تحميل المراجعة...",
        notFound: "تعذر تحميل تفاصيل المراجعة.",
        backToDashboard: "العودة إلى لوحة التحكم",
        reviewTitle: "مراجعة",
        submittedOn: "تم الإرسال في",
        finalScore: "درجتك النهائية",
        yourAnswer: "إجابتك:",
        correctAnswer: "الإجابة الصحيحة:",
        notAnswered: "لم تتم الإجابة",
        ai: {
            prompt: "لماذا كانت إجابتي خاطئة؟ 🤔",
            loading: "جاري إنشاء الشرح...",
            error: "خطأ:",
            title: "شرح الذكاء الاصطناعي"
        },
        learningPath: {
            generate: "أنشئ خطتي الدراسية المخصصة",
            generating: "جاري بناء خطتك... قد يستغرق هذا بعض الوقت.",
        }
    }
}

const ExamineeExamReviewPage = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiExplanations, setAiExplanations] = useState<Record<string, { loading: boolean; explanation: string | null; error: string | null }>>({});
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [isGeneratingPath, setIsGeneratingPath] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const pageTitle = {
        ...t,
        portalTitle: `${theme.platformName} Portal`
    };
    
    const navLinks = [
        { path: '/examinee', icon: BookOpenIcon, label: t.availableExams },
        { path: '/examinee', icon: CheckCircleIcon, label: t.myResults },
    ];


    useEffect(() => {
        if (!resultId) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getExamResultDetails(resultId);
                if (data) {
                    setReviewData(data);
                } else {
                    navigate('/examinee');
                }
            } catch (error) {
                console.error("Failed to fetch exam review details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [resultId, navigate]);

    const handleGetExplanation = async (question: Question, userAnswer: Answer) => {
        if (typeof userAnswer !== 'string' || userAnswer.trim() === '' || typeof question.correctAnswer !== 'string') return;
        setAiExplanations(prev => ({ ...prev, [question.id]: { loading: true, explanation: null, error: null } }));
        try {
            const result = await getAIExplanation({
                questionText: question.text,
                studentAnswer: userAnswer as string,
                correctAnswer: question.correctAnswer as string,
            });
            setAiExplanations(prev => ({ ...prev, [question.id]: { loading: false, explanation: result.explanation, error: null } }));
        } catch (error: any) {
            setAiExplanations(prev => ({ ...prev, [question.id]: { loading: false, explanation: null, error: error.message || 'An unknown error occurred.' } }));
        }
    };

    const handleGeneratePath = async () => {
        if (!reviewData) return;
        setIsGeneratingPath(true);
        setGenerationError(null);
        setLearningPath(null);
        try {
            const path = await generatePersonalizedLearningPath({ exam: reviewData.exam, result: reviewData.result });
            setLearningPath(path);
        } catch (error: any) {
            setGenerationError(error.message || 'Failed to generate learning path.');
        } finally {
            setIsGeneratingPath(false);
        }
    };

    const isAnswerCorrect = (question: Question, userAnswer: Answer): boolean => {
        const correctAnswer = question.correctAnswer;
        switch (question.type) {
            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
            case QuestionType.Essay:
            case QuestionType.TrueFalse:
                return typeof userAnswer === 'string' && typeof correctAnswer === 'string' && userAnswer.toLowerCase() === correctAnswer.toLowerCase();
            case QuestionType.MultipleSelect:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    return JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
                }
                return false;
            case QuestionType.Ordering:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
                }
                return false;
            default:
                return false;
        }
    };

    const renderAnswer = (answer: Answer) => {
        if (answer === undefined || answer === null) {
            return <span className="text-slate-500 italic">{t.notAnswered}</span>;
        }
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        if (typeof answer === 'object') {
            return JSON.stringify(answer);
        }
        return String(answer);
    };
    
    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        if (!reviewData) return <p>{t.notFound}</p>;

        return (
            <>
                <div className="mb-6">
                     <button onClick={() => navigate(-1)} className="flex items-center text-sm text-primary-500 hover:underline mb-4">
                        <ArrowLeftIcon className="w-4 h-4 me-1" />
                        {t.backToDashboard}
                    </button>
                    <h2 className="text-3xl font-bold">{reviewData.exam.title} {t.reviewTitle}</h2>
                    <p className="text-slate-500">{t.submittedOn} {new Date(reviewData.result.submittedAt).toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 mb-8 text-center">
                    <p className="text-lg">{t.finalScore}</p>
                    <p className="text-5xl font-extrabold text-primary-500">{reviewData.result.score} / {reviewData.result.totalPoints}</p>
                </div>
                
                <div className="space-y-6">
                    {reviewData.exam.questions.map((question, index) => {
                        const userAnswer = reviewData.result.answers[question.id];
                        const correct = isAnswerCorrect(question, userAnswer);
                        const aiExplanationState = aiExplanations[question.id];
                        const canExplain = !correct && (question.type === QuestionType.MultipleChoice || question.type === QuestionType.TrueFalse || question.type === QuestionType.ShortAnswer || question.type === QuestionType.Essay)

                        return (
                            <div key={question.id} className={`bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border-s-4 ${correct ? 'border-green-500' : 'border-red-500'}`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {question.text}</p>
                                    {correct ? 
                                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 ms-4" /> : 
                                        <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 ms-4" />}
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <strong className="text-slate-600 dark:text-slate-300">{t.yourAnswer} </strong>
                                        <span className={`${correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{renderAnswer(userAnswer)}</span>
                                    </div>
                                     <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                                        <strong className="text-green-800 dark:text-green-300">{t.correctAnswer} </strong>
                                        <span className="text-green-800 dark:text-green-300">{renderAnswer(question.correctAnswer)}</span>
                                    </div>
                                    {canExplain && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                            {!aiExplanationState ? (
                                                <button onClick={() => handleGetExplanation(question, userAnswer)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                                                    {t.ai.prompt}
                                                </button>
                                            ) : aiExplanationState.loading ? (
                                                <div className="p-3 rounded-md text-slate-600 dark:text-slate-300">{t.ai.loading}</div>
                                            ) : aiExplanationState.error ? (
                                                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md text-red-700 dark:text-red-300"><strong>{t.ai.error}</strong> {aiExplanationState.error}</div>
                                            ) : (
                                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">
                                                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><LightbulbIcon className="w-4 h-4" /> {t.ai.title}</h4>
                                                    <p className="mt-1 text-slate-600 dark:text-slate-300 italic">"{aiExplanationState.explanation}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="my-10 text-center">
                    <button
                        onClick={handleGeneratePath}
                        disabled={isGeneratingPath}
                        className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    >
                        {isGeneratingPath ? <SpinnerIcon className="w-6 h-6"/> : <Wand2Icon className="w-6 h-6" />}
                        {isGeneratingPath ? t.learningPath.generating : t.learningPath.generate}
                    </button>
                </div>
                
                {isGeneratingPath && <LoadingSpinner />}
                {generationError && <p className="text-center text-red-500">{generationError}</p>}

                {learningPath && <PersonalizedLearningPath learningPath={learningPath} lang={lang} />}
            </>
        );
    }
    
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle=""
            sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{pageTitle.portalTitle}</h1>}
        >
            {pageContent()}
        </DashboardLayout>
    );
};

export default ExamineeExamReviewPage;
