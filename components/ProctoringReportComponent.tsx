import React, { useState, useEffect, ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExamResultDetails } from '../services/api';
import { analyzeProctoringSessionWithAI } from '../services/ai';
import { Exam, ExamResult, UserRole, Language, ProctoringEvent } from '../types';
import {
    BookOpenIcon, BarChartIcon, ClipboardListIcon, ArrowLeftIcon, PlayCircleIcon,
    BriefcaseIcon, BuildingIcon, SparklesIcon
} from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from './LoadingSpinner';

const translations = {
    en: {
        analyzing: "Analyzing proctoring session...",
        errorPrefix: "Error:",
        noData: "Could not load proctoring data.",
        reportTitle: "AI Proctoring Report",
        sessionRecording: "SESSION RECORDING",
        integrityScore: "Integrity Score",
        aiSummary: "AI Analytical Summary",
        suspiciousEvents: "Flagged Events Timeline",
        severityLabel: "Severity:",
        noEvents: "No suspicious events were flagged.",
        submissionNotFound: "Submission details not found.",
        unexpectedError: "An unexpected error occurred.",
        teacher: {
            myExams: "My Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToReview: "Back to Submission Review",
            examLabel: "Exam:",
            examineeLabel: "Examinee:",
        },
        corporate: {
            skillLibrary: "Skill Library",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToReview: "Back to Submission Review",
            examLabel: "Exam:",
            candidateLabel: "Candidate:",
        },
        company: {
            courseExams: "Course Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
            backToReview: "Back to Submission Review",
            examLabel: "Exam:",
            traineeLabel: "Trainee:",
        }
    },
    ar: {
        analyzing: "جاري تحليل جلسة المراقبة...",
        errorPrefix: "خطأ:",
        noData: "تعذر تحميل بيانات المراقبة.",
        reportTitle: "تقرير المراقبة بالذكاء الاصطناعي",
        sessionRecording: "تسجيل الجلسة",
        integrityScore: "درجة النزاهة",
        aiSummary: "الملخص التحليلي الذكي",
        suspiciousEvents: "الجدول الزمني للأحداث المرصودة",
        severityLabel: "الخطورة:",
        noEvents: "لم يتم الإبلاغ عن أي أحداث مشبوهة.",
        submissionNotFound: "لم يتم العثور على تفاصيل التقديم.",
        unexpectedError: "حدث خطأ غير متوقع.",
        teacher: {
            myExams: "اختباراتي",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToReview: "العودة إلى مراجعة التقديم",
            examLabel: "الاختبار:",
            examineeLabel: "الطالب:",
        },
        corporate: {
            skillLibrary: "مكتبة المهارات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToReview: "العودة إلى مراجعة التقديم",
            examLabel: "الاختبار:",
            candidateLabel: "المرشح:",
        },
        company: {
            courseExams: "اختبارات الدورات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
            backToReview: "العودة إلى مراجعة التقديم",
            examLabel: "الاختبار:",
            traineeLabel: "المتدرب:",
        }
    }
};

const roleConfig = {
    [UserRole.Teacher]: {
        basePath: '/teacher',
        navLinks: (t: any) => [
            { path: '/teacher/exams', icon: BookOpenIcon, label: t.myExams },
            { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        labels: (t: any) => ({
            ...t.teacher,
            examineeIdentifier: t.teacher.examineeLabel,
        })
    },
    [UserRole.Corporate]: {
        basePath: '/corporate',
        navLinks: (t: any) => [
            { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.skillLibrary },
            { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        labels: (t: any) => ({
            ...t.corporate,
            examineeIdentifier: t.corporate.candidateLabel,
        })
    },
    [UserRole.TrainingCompany]: {
        basePath: '/company',
        navLinks: (t: any) => [
            { path: '/company/exams', icon: BuildingIcon, label: t.courseExams },
            { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        labels: (t: any) => ({
            ...t.company,
            examineeIdentifier: t.company.traineeLabel,
        })
    },
};

type ProctoringData = {
    integrityScore: number;
    analyticalSummary: string;
    events: { timestamp: string; type: string; severity: 'low' | 'medium' | 'high' }[];
};

const getSeverityStyles = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
        case 'low': return { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-800 dark:text-green-200', bgWeak: 'bg-green-100 dark:bg-green-900/50' };
        case 'medium': return { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-800 dark:text-yellow-200', bgWeak: 'bg-yellow-100 dark:bg-yellow-900/50' };
        case 'high': return { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-800 dark:text-red-200', bgWeak: 'bg-red-100 dark:bg-red-900/50' };
    }
};

const Timeline: React.FC<{ events: ProctoringEvent[], duration: number }> = ({ events, duration }) => {
    const totalSeconds = duration * 60;
    
    return (
        <div className="relative w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-full mt-4">
            {events.map((event, index) => {
                const eventSeconds = event.timestamp / 1000;
                const position = (eventSeconds / totalSeconds) * 100;
                const severityStyles = getSeverityStyles(event.severity);

                return (
                     <div
                        key={index}
                        className="group absolute top-1/2 -translate-y-1/2"
                        style={{ left: `${position}%` }}
                    >
                        <div className={`w-4 h-4 rounded-full ${severityStyles.bg} border-2 border-white dark:border-slate-800 cursor-pointer`}></div>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <p className="font-bold">{event.type.replace(/_/g, ' ')}</p>
                            <p>{event.details}</p>
                            <p className="font-semibold capitalize">{event.severity} severity</p>
                            <p className="text-slate-400">@ {new Date(event.timestamp).toISOString().substr(14, 5)}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

interface ProctoringReportComponentProps {
    userRole: UserRole.Teacher | UserRole.Corporate | UserRole.TrainingCompany;
}

const ProctoringReportComponent: React.FC<ProctoringReportComponentProps> = ({ userRole }) => {
    const { resultId, examId } = useParams<{ resultId: string, examId: string }>();
    const navigate = useNavigate();
    const [resultDetails, setResultDetails] = useState<{ result: ExamResult, exam: Exam } | null>(null);
    const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lang } = useLanguage();
    const { theme } = useTheme();
    
    const config = roleConfig[userRole];
    const t = { ...translations[lang], ...config.labels(translations[lang]) };
    const navLinks = config.navLinks(t);

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName}</h1>;

    useEffect(() => {
        if (!resultId) return;

        const fetchAndAnalyze = async () => {
            try {
                setLoading(true);
                setError(null);
                const details = await getExamResultDetails(resultId);
                if (!details) {
                    throw new Error(t.submissionNotFound);
                }
                setResultDetails(details);
                
                const analysis = await analyzeProctoringSessionWithAI({
                    examineeName: details.result.examineeName,
                    examTitle: details.exam.title,
                    examDuration: details.exam.duration,
                    proctoringEvents: details.result.proctoringEvents
                });
                setProctoringData(analysis);
            } catch (err: any) {
                console.error("Failed to fetch or analyze proctoring session:", err);
                setError(err.message || t.unexpectedError);
            } finally {
                setLoading(false);
            }
        };
        fetchAndAnalyze();
    }, [resultId, navigate, t.submissionNotFound, t.unexpectedError]);
    
    const getIntegrityColorStyles = (score: number) => {
        if (score >= 85) return getSeverityStyles('low');
        if (score >= 60) return getSeverityStyles('medium');
        return getSeverityStyles('high');
    };

    const mainContent = () => {
        if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        if (error) return <p className="text-red-500">{t.errorPrefix} {error}</p>;
        if (!resultDetails || !proctoringData) return <p>{t.noData}</p>;

        const integrityColorStyles = getIntegrityColorStyles(proctoringData.integrityScore);
        const backPath = `${config.basePath}/exam/${examId}/result/${resultId}`;

        return (
            <>
                <div className="mb-6">
                    <Link to={backPath} className="flex items-center text-sm text-primary-500 hover:underline mb-4">
                        <ArrowLeftIcon className="w-4 h-4 me-1" />
                        {t.backToReview}
                    </Link>
                    <h2 className="text-3xl font-bold">{t.reportTitle}</h2>
                    <p className="text-slate-500">
                        {t.examLabel} <span className="font-semibold text-slate-700 dark:text-slate-300">{resultDetails.exam.title}</span> | {t.examineeIdentifier} <span className="font-semibold text-slate-700 dark:text-slate-300">{resultDetails.result.examineeName}</span>
                    </p>
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Left Column: Summary and Player */}
                     <div className="lg:col-span-2 space-y-8">
                         <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-t-4 ${integrityColorStyles.border}`}>
                             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.aiSummary}</h3>
                              <p className="mt-2 text-slate-600 dark:text-slate-400 italic">"{proctoringData.analyticalSummary}"</p>
                         </div>
                         <div className="bg-black rounded-lg shadow-lg flex items-center justify-center aspect-video relative">
                            <PlayCircleIcon className="w-20 h-20 text-slate-700" />
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                                <span className="w-2 h-2 bg-red-300 rounded-full me-1.5 animate-pulse"></span>
                                {t.sessionRecording}
                            </div>
                        </div>
                     </div>
                     {/* Right Column: Score and Events */}
                     <div className="space-y-6">
                        <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center`}>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.integrityScore}</h3>
                            <p className={`text-6xl font-extrabold my-2 ${integrityColorStyles.text}`}>{proctoringData.integrityScore}%</p>
                        </div>
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">{t.suspiciousEvents}</h3>
                            <Timeline events={resultDetails.result.proctoringEvents || []} duration={resultDetails.exam.duration} />
                            <div className="space-y-3 max-h-96 overflow-y-auto mt-4">
                               {(resultDetails.result.proctoringEvents || []).length > 0 ? (resultDetails.result.proctoringEvents || []).map((event, index) => {
                                   const severityStyles = getSeverityStyles(event.severity);
                                   return (
                                       <div key={index} className={`flex items-start p-3 ${severityStyles.bgWeak} rounded-md border-s-4 ${severityStyles.border}`}>
                                           <div className="flex-grow">
                                               <p className={`font-semibold text-sm ${severityStyles.text}`}>{event.type.replace(/_/g, ' ')}</p>
                                               <p className="text-xs text-slate-500 dark:text-slate-400">{event.details}</p>
                                           </div>
                                           <span className="text-sm font-mono text-slate-500 dark:text-slate-400 ms-2">{new Date(event.timestamp).toISOString().substr(14, 5)}</span>
                                       </div>
                                   )
                               }) : <p className="text-sm text-slate-500">{t.noEvents}</p>}
                            </div>
                        </div>
                    </div>
                 </div>
            </>
        );
    };
    
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle=""
            sidebarHeader={sidebarHeader}
        >
            {mainContent()}
        </DashboardLayout>
    );
};

export default ProctoringReportComponent;