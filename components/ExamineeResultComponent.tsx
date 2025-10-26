import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExamResultDetails } from '../services/api';
import { gradeAnswerWithAI, checkPlagiarismWithAI, checkAuthenticityWithAI, generateAICertificateCommendation } from '../services/ai';
import { Exam, ExamResult, Question, QuestionType, Answer, UserRole } from '../types';
import { 
    BookOpenIcon, BarChartIcon, ClipboardListIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon, 
    SparklesIcon, SearchCheckIcon, ShieldCheckIcon, BriefcaseIcon, BuildingIcon, AwardIcon, SpinnerIcon 
} from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './DashboardLayout';
import CertificateModal from './CertificateModal';
import { useNotification } from '../contexts/NotificationContext';

// Translations
const translations = {
    en: {
        loading: "Loading review...",
        notFound: "Could not load review details for this submission.",
        submissionReview: "Submission Review:",
        showingResultsFor: "Showing results for",
        viewProctoring: "View Proctoring Report",
        generateCertificate: "Generate Certificate",
        generatingCertificate: "Generating...",
        finalScore: "Final Score",
        correctAnswer: "Correct Answer:",
        gradeWithAI: "Grade with AI",
        grading: "Grading...",
        error: "Error:",
        aiGrade: "AI Grade",
        score: "Score:",
        feedback: "Feedback:",
        checkPlagiarism: "Check for Plagiarism",
        checking: "Checking...",
        plagiarismReport: "Plagiarism Report",
        similarity: "Similarity:",
        justification: "Justification:",
        citedSources: "Cited Sources:",
        notAnswered: "Not Answered",
        unknownError: "An unknown error occurred.",
        authenticityCheck: "Check Authenticity",
        authenticityReport: "Content Authenticity Report",
        authenticityScore: "Authenticity (Human-Written):",
        teacher: {
            title: "Teacher",
            myExams: "My Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToResults: "Back to All Results",
            studentAnswer: "Student's Answer:",
        },
        corporate: {
            title: "Corporate Center",
            skillLibrary: "Skill Library",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToResults: "Back to All Results",
            candidateAnswer: "Candidate's Answer:",
        },
        company: {
            title: "for Companies",
            courseExams: "Course Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToResults: "Back to All Results",
            traineeAnswer: "Trainee's Answer:",
        }
    },
    ar: {
        loading: "جاري تحميل المراجعة...",
        notFound: "تعذر تحميل تفاصيل المراجعة لهذا التقديم.",
        submissionReview: "مراجعة التقديم:",
        showingResultsFor: "عرض نتائج لـ",
        viewProctoring: "عرض تقرير المراقبة",
        generateCertificate: "إصدار شهادة",
        generatingCertificate: "جاري الإنشاء...",
        finalScore: "الدرجة النهائية",
        correctAnswer: "الإجابة الصحيحة:",
        gradeWithAI: "تصحيح بالذكاء الاصطناعي",
        grading: "جاري التصحيح...",
        error: "خطأ:",
        aiGrade: "درجة الذكاء الاصطناعي",
        score: "الدرجة:",
        feedback: "الملاحظات:",
        checkPlagiarism: "التحقق من الانتحال",
        checking: "جاري التحقق...",
        plagiarismReport: "تقرير الانتحال",
        similarity: "التشابه:",
        justification: "التبرير:",
        citedSources: "المصادر المذكورة:",
        notAnswered: "لم تتم الإجابة",
        unknownError: "حدث خطأ غير معروف.",
        authenticityCheck: "التحقق من الأصالة",
        authenticityReport: "تقرير أصالة المحتوى",
        authenticityScore: "الأصالة (كتابة بشرية):",
        teacher: {
            title: "المعلم",
            myExams: "اختباراتي",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToResults: "العودة إلى كل النتائج",
            studentAnswer: "إجابة الطالب:",
        },
        corporate: {
            title: "المركز المؤسسي",
            skillLibrary: "مكتبة المهارات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToResults: "العودة إلى كل النتائج",
            candidateAnswer: "إجابة المرشح:",
        },
        company: {
            title: "للشركات",
            courseExams: "اختبارات الدورات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToResults: "العودة إلى كل النتائج",
            traineeAnswer: "إجابة المتدرب:",
        }
    }
};

const roleConfig = {
    [UserRole.Teacher]: {
        basePath: '/teacher',
        getNavLinks: (t: any) => [
            { path: '/teacher', icon: BookOpenIcon, label: t.myExams },
            { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => ({ ...t.teacher, examineeAnswerLabel: t.teacher.studentAnswer }),
    },
    [UserRole.Corporate]: {
        basePath: '/corporate',
        getNavLinks: (t: any) => [
            { path: '/corporate', icon: BriefcaseIcon, label: t.skillLibrary },
            { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => ({ ...t.corporate, examineeAnswerLabel: t.corporate.candidateAnswer }),
    },
    [UserRole.TrainingCompany]: {
        basePath: '/company',
        getNavLinks: (t: any) => [
            { path: '/company', icon: BuildingIcon, label: t.courseExams },
            { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => ({ ...t.company, examineeAnswerLabel: t.company.traineeAnswer }),
    },
};

type ReviewData = {
    result: ExamResult;
    exam: Exam;
};

interface ExamineeResultComponentProps {
    userRole: UserRole.Teacher | UserRole.Corporate | UserRole.TrainingCompany;
}

const ExamineeResultComponent: React.FC<ExamineeResultComponentProps> = ({ userRole }) => {
    const { resultId, examId } = useParams<{ resultId: string, examId: string }>();
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiGrades, setAiGrades] = useState<Record<string, { loading: boolean; score: number | null; feedback: string | null; error: string | null }>>({});
    const [plagiarismChecks, setPlagiarismChecks] = useState<Record<string, { loading: boolean; score: number | null; justification: string | null; sources: any[] | null; error: string | null }>>({});
    const [authenticityChecks, setAuthenticityChecks] = useState<Record<string, { loading: boolean; score: number | null; justification: string | null; error: string | null }>>({});
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [aiCommendation, setAiCommendation] = useState('');
    const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const { addNotification } = useNotification();

    const config = roleConfig[userRole];
    const roleSpecificTranslations = translations[lang][userRole] || translations[lang].teacher;
    const t = { ...translations[lang], ...config.getLabels(translations[lang]) };
    const navLinks = config.getNavLinks(roleSpecificTranslations);

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName} {roleSpecificTranslations.title}</h1>;

    useEffect(() => {
        if (!resultId) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getExamResultDetails(resultId);
                if (data) {
                    setReviewData(data);
                } else {
                    navigate(`${config.basePath}/exam/${examId}/results`);
                }
            } catch (error) {
                console.error("Failed to fetch exam review details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [resultId, examId, navigate, config.basePath]);
    
    const handleGenerateCertificate = async () => {
        if (!reviewData) return;
        setIsGeneratingCertificate(true);
        try {
            const scorePercentage = Math.round((reviewData.result.score / reviewData.result.totalPoints) * 100);
            const { commendation } = await generateAICertificateCommendation({
                examineeName: reviewData.result.examineeName,
                examTitle: reviewData.exam.title,
                scorePercentage: scorePercentage
            });
            setAiCommendation(commendation);
            setIsCertificateModalOpen(true);
        } catch (error) {
            addNotification("Failed to generate AI commendation.", "error");
        } finally {
            setIsGeneratingCertificate(false);
        }
    };

    const handleAiGrade = async (question: Question, userAnswer: Answer) => {
        if (!question.id || typeof userAnswer !== 'string' || userAnswer.trim() === '') return;
        setAiGrades(prev => ({ ...prev, [question.id]: { loading: true, score: null, feedback: null, error: null } }));
        try {
            const result = await gradeAnswerWithAI({
                questionText: question.text,
                studentAnswer: userAnswer,
                modelAnswer: question.correctAnswer as string,
                points: question.points
            });
            setAiGrades(prev => ({ ...prev, [question.id]: { loading: false, score: result.suggestedScore, feedback: result.feedback, error: null } }));
        } catch (error: any) {
            setAiGrades(prev => ({ ...prev, [question.id]: { loading: false, score: null, feedback: null, error: error.message || t.unknownError } }));
        }
    };

    const handlePlagiarismCheck = async (questionId: string, userAnswer: Answer) => {
        if (typeof userAnswer !== 'string' || userAnswer.trim() === '') return;
        setPlagiarismChecks(prev => ({ ...prev, [questionId]: { loading: true, score: null, justification: null, sources: null, error: null } }));
        try {
            const result = await checkPlagiarismWithAI({ studentAnswer: userAnswer });
            setPlagiarismChecks(prev => ({ ...prev, [questionId]: { loading: false, score: result.similarityScore, justification: result.justification, sources: result.sources, error: null } }));
        } catch (error: any) {
            setPlagiarismChecks(prev => ({ ...prev, [questionId]: { loading: false, score: null, justification: null, sources: null, error: error.message || t.unknownError } }));
        }
    };

    const handleAuthenticityCheck = async (questionId: string, userAnswer: Answer) => {
        if (typeof userAnswer !== 'string' || userAnswer.trim() === '') return;
        setAuthenticityChecks(prev => ({ ...prev, [questionId]: { loading: true, score: null, justification: null, error: null } }));
        try {
            const result = await checkAuthenticityWithAI({ studentAnswer: userAnswer });
            setAuthenticityChecks(prev => ({ ...prev, [questionId]: { loading: false, score: result.authenticityScore, justification: result.justification, error: null } }));
        } catch (error: any) {
            setAuthenticityChecks(prev => ({ ...prev, [questionId]: { loading: false, score: null, justification: null, error: error.message || t.unknownError } }));
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

    const getScoreColor = (score: number, higherIsWorse: boolean = true) => {
        const isBad = higherIsWorse ? score > 70 : score < 30;
        const isOk = higherIsWorse ? score > 30 : score < 70;
        if (isBad) return 'text-red-500';
        if (isOk) return 'text-yellow-500';
        return 'text-green-500';
    };

    const pageContent = () => {
        if (loading) return <p>{t.loading}</p>;
        if (!reviewData) return <p>{t.notFound}</p>;

        const backPath = `${config.basePath}/exam/${examId}/results`;
        const proctoringPath = `${config.basePath}/exam/${examId}/result/${resultId}/proctoring`;
        
        const percentage = Math.round((reviewData.result.score / reviewData.result.totalPoints) * 100);
        const passed = percentage >= 70;

        return (
            <>
                <div className="mb-6">
                    <Link to={backPath} className="flex items-center text-sm text-primary-500 hover:underline mb-4">
                        <ArrowLeftIcon className="w-4 h-4 me-1" />
                        {t.backToResults}
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold">{t.submissionReview} {reviewData.exam.title}</h2>
                            <p className="text-slate-500">
                                {t.showingResultsFor} <span className="font-semibold text-slate-700 dark:text-slate-300">{reviewData.result.examineeName}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             {passed && (
                                <button
                                    onClick={handleGenerateCertificate}
                                    disabled={isGeneratingCertificate}
                                    className="flex items-center gap-2 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg shadow-md transition-all disabled:opacity-50"
                                >
                                    {isGeneratingCertificate ? <SpinnerIcon className="w-5 h-5" /> : <AwardIcon className="w-5 h-5" />}
                                    {isGeneratingCertificate ? t.generatingCertificate : t.generateCertificate}
                                </button>
                            )}
                            <Link to={proctoringPath} className="flex items-center gap-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg shadow-md transition-all">
                                <ShieldCheckIcon className="w-5 h-5" />
                                {t.viewProctoring}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 mb-8 text-center">
                    <p className="text-lg">{t.finalScore}</p>
                    <p className="text-5xl font-extrabold text-primary-500">{reviewData.result.score} / {reviewData.result.totalPoints}</p>
                </div>

                <div className="space-y-6">
                    {reviewData.exam.questions.map((question, index) => {
                        const userAnswer = reviewData.result.answers[question.id];
                        const correct = isAnswerCorrect(question, userAnswer);
                        const isGradable = (question.type === QuestionType.Essay || question.type === QuestionType.ShortAnswer) && userAnswer;
                        const aiGradeState = aiGrades[question.id];
                        const plagiarismState = plagiarismChecks[question.id];
                        const authenticityState = authenticityChecks[question.id];

                        return (
                            <div key={question.id} className={`bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border-s-4 ${correct ? 'border-green-500' : 'border-red-500'}`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {question.text}</p>
                                    {correct ? <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 ms-4" /> : <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 ms-4" />}
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <strong className="text-slate-600 dark:text-slate-300">{t.examineeAnswerLabel} </strong>
                                        <span className={`${correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{renderAnswer(userAnswer)}</span>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                                        <strong className="text-green-800 dark:text-green-300">{t.correctAnswer} </strong>
                                        <span className="text-green-800 dark:text-green-300">{renderAnswer(question.correctAnswer)}</span>
                                    </div>
                                    {isGradable && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* AI Grading */}
                                                <div>
                                                    {!aiGradeState ? (
                                                        <button onClick={() => handleAiGrade(question, userAnswer)} className="flex w-full justify-center items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 px-3 py-1.5 rounded-lg shadow-md transition-all">
                                                            <SparklesIcon className="w-4 h-4" /> {t.gradeWithAI}
                                                        </button>
                                                    ) : aiGradeState.loading ? (
                                                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">{t.grading}</div>
                                                    ) : aiGradeState.error ? (
                                                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md text-red-700 dark:text-red-300"><strong>{t.error}</strong> {aiGradeState.error}</div>
                                                    ) : (
                                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
                                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2"><SparklesIcon className="w-4 h-4" />{t.aiGrade}</h4>
                                                            <p className="mt-1"><strong className="text-slate-700 dark:text-slate-200">{t.score} </strong><span className="font-bold text-lg text-blue-700 dark:text-blue-300">{aiGradeState.score} / {question.points}</span></p>
                                                            <p className="mt-1"><strong className="text-slate-700 dark:text-slate-200">{t.feedback} </strong><span className="text-slate-600 dark:text-slate-300 italic">"{aiGradeState.feedback}"</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Integrity Checks */}
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg space-y-3">
                                                    <div>
                                                        {!plagiarismState ? (
                                                            <button onClick={() => handlePlagiarismCheck(question.id, userAnswer)} className="flex w-full justify-center items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 px-3 py-1.5 rounded-lg shadow-sm transition-all">
                                                                <SearchCheckIcon className="w-4 h-4" /> {t.checkPlagiarism}
                                                            </button>
                                                        ) : plagiarismState.loading ? (
                                                            <div className="p-2 text-center bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 text-xs">{t.checking}</div>
                                                        ) : plagiarismState.error ? (
                                                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-md text-red-700 dark:text-red-300 text-xs"><strong>{t.error}</strong> {plagiarismState.error}</div>
                                                        ) : (
                                                            <div>
                                                                <h5 className="font-semibold text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5"><SearchCheckIcon className="w-4 h-4 text-yellow-600"/>{t.plagiarismReport}</h5>
                                                                <p className="text-xs mt-1"><strong className="text-slate-600 dark:text-slate-300">{t.similarity} </strong><span className={`font-bold text-sm ${getScoreColor(plagiarismState.score ?? 0)}`}>{plagiarismState.score}%</span></p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {!authenticityState ? (
                                                            <button onClick={() => handleAuthenticityCheck(question.id, userAnswer)} className="flex w-full justify-center items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 px-3 py-1.5 rounded-lg shadow-sm transition-all">
                                                                <ShieldCheckIcon className="w-4 h-4" /> {t.authenticityCheck}
                                                            </button>
                                                        ) : authenticityState.loading ? (
                                                            <div className="p-2 text-center bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 text-xs">{t.checking}</div>
                                                        ) : authenticityState.error ? (
                                                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-md text-red-700 dark:text-red-300 text-xs"><strong>{t.error}</strong> {authenticityState.error}</div>
                                                        ) : (
                                                            <div>
                                                                <h5 className="font-semibold text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4 text-green-600"/>{t.authenticityReport}</h5>
                                                                <p className="text-xs mt-1"><strong className="text-slate-600 dark:text-slate-300">{t.authenticityScore} </strong><span className={`font-bold text-sm ${getScoreColor(authenticityState.score ?? 0, false)}`}>{authenticityState.score}%</span></p>
                                                                <p className="text-xs mt-1 italic text-slate-500">"{authenticityState.justification}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }
    
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle=""
            sidebarHeader={sidebarHeader}
        >
            {pageContent()}
            {reviewData && (
                <CertificateModal
                    isOpen={isCertificateModalOpen}
                    onClose={() => setIsCertificateModalOpen(false)}
                    examineeName={reviewData.result.examineeName}
                    examTitle={reviewData.exam.title}
                    completionDate={reviewData.result.submittedAt}
                    organizationName={theme.platformName}
                    aiCommendation={aiCommendation}
                    scorePercentage={Math.round((reviewData.result.score / reviewData.result.totalPoints) * 100)}
                />
            )}
        </DashboardLayout>
    );
};

export default ExamineeResultComponent;