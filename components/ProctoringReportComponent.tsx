
import React, { useState, useEffect, ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExamResultDetails, analyzeProctoringSessionWithAI } from '../services/mockApi';
import { Exam, ExamResult, UserRole } from '../types';
import {
    BookOpenIcon, BarChartIcon, ClipboardListIcon, ArrowLeftIcon, PlayCircleIcon,
    BriefcaseIcon, BuildingIcon
} from './icons';
import { useLanguage, useTheme } from '../App';
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
        suspiciousEvents: "Suspicious Events",
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
        suspiciousEvents: "الأحداث المشبوهة",
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
            courseExams: "اختبارات الدورة",
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
            { path: '/teacher', icon: BookOpenIcon, label: t.myExams },
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
            { path: '/corporate', icon: BriefcaseIcon, label: t.skillLibrary },
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
            { path: '/company', icon: BuildingIcon, label: t.courseExams },
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
    
    const getIntegrityColor = (score: number) => {
        if (score >= 85) return { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500' };
        if (score >= 60) return { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500' };
        return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' };
    };

    const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
        switch(severity) {
            case 'low': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-red-500';
        }
    };

    const mainContent = () => {
        if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        if (error) return <p className="text-red-500">{t.errorPrefix} {error}</p>;
        if (!resultDetails || !proctoringData) return <p>{t.noData}</p>;

        const integrityColor = getIntegrityColor(proctoringData.integrityScore);
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
                    <div className="lg:col-span-2 bg-black rounded-lg shadow-lg flex items-center justify-center aspect-video relative">
                        <PlayCircleIcon className="w-20 h-20 text-slate-700" />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                            <span className="w-2 h-2 bg-red-300 rounded-full me-1.5 animate-pulse"></span>
                            {t.sessionRecording}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-t-4 ${integrityColor.border}`}>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.integrityScore}</h3>
                            <p className={`text-6xl font-extrabold my-2 ${integrityColor.text}`}>{proctoringData.integrityScore}%</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{proctoringData.analyticalSummary}"</p>
                        </div>
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">{t.suspiciousEvents}</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                               {proctoringData.events.map((event, index) => (
                                   <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                       <span className={`w-3 h-3 rounded-full me-3 flex-shrink-0 ${getSeverityColor(event.severity)}`}></span>
                                       <div className="flex-grow">
                                           <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{event.type}</p>
                                           <p className="text-xs text-slate-500 dark:text-slate-400">{t.severityLabel} {event.severity}</p>
                                       </div>
                                       <span className="text-sm font-mono text-slate-500 dark:text-slate-400 ms-2">{event.timestamp}</span>
                                   </div>
                               ))}
                               {proctoringData.events.length === 0 && <p className="text-sm text-slate-500">{t.noEvents}</p>}
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
