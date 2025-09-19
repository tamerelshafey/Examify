
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExamResultDetails, analyzeProctoringSessionWithAI } from '../services/mockApi';
import { Exam, ExamResult } from '../types';
import { BookOpenIcon, CheckCircleIcon, ArrowLeftIcon, PlayCircleIcon } from '../components/icons';
import { Language, useLanguage, useTheme } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const translations = {
    en: {
        availableExams: "Available Exams",
        myResults: "My Results",
        analyzing: "Analyzing your proctoring session...",
        errorPrefix: "Error:",
        noData: "Could not load proctoring data for this session.",
        backToReview: "Back to Submission Review",
        reportTitle: "Your AI Proctoring Report",
        examLabel: "Exam:",
        examineeLabel: "Examinee:",
        sessionRecording: "SESSION RECORDING",
        integrityScore: "Your Integrity Score",
        suspiciousEvents: "Flagged Events",
        severityLabel: "Severity:",
        noEvents: "Great job! No suspicious events were flagged during your session.",
        submissionNotFound: "Submission details not found.",
        unexpectedError: "An unexpected error occurred.",
    },
    ar: {
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        analyzing: "جاري تحليل جلسة المراقبة الخاصة بك...",
        errorPrefix: "خطأ:",
        noData: "تعذر تحميل بيانات المراقبة لهذه الجلسة.",
        backToReview: "العودة إلى مراجعة التقديم",
        reportTitle: "تقرير المراقبة بالذكاء الاصطناعي الخاص بك",
        examLabel: "الاختبار:",
        examineeLabel: "الطالب:",
        sessionRecording: "تسجيل الجلسة",
        integrityScore: "درجة النزاهة الخاصة بك",
        suspiciousEvents: "الأحداث التي تم رصدها",
        severityLabel: "الخطورة:",
        noEvents: "عمل رائع! لم يتم الإبلاغ عن أي أحداث مشبوهة خلال جلستك.",
        submissionNotFound: "لم يتم العثور على تفاصيل التقديم.",
        unexpectedError: "حدث خطأ غير متوقع.",
    }
};

type ProctoringData = {
    integrityScore: number;
    analyticalSummary: string;
    events: { timestamp: string; type: string; severity: 'low' | 'medium' | 'high' }[];
};

const ExamineeProctoringReportPage = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();
    const [resultDetails, setResultDetails] = useState<{ result: ExamResult, exam: Exam } | null>(null);
    const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const pageTitle = {
        ...t,
        title: `${theme.platformName} Portal`
    };

    const navLinks = [
        { path: '/examinee', icon: BookOpenIcon, label: t.availableExams },
        { path: '/examinee', icon: CheckCircleIcon, label: t.myResults },
    ];

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
    }, [resultId, navigate, t]);
    
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

        return (
            <>
                <div className="mb-6">
                    <Link to={`/examinee/result/${resultId}`} className="flex items-center text-sm text-primary-500 hover:underline mb-4">
                        <ArrowLeftIcon className="w-4 h-4 me-1" />
                        {t.backToReview}
                    </Link>
                    <h2 className="text-3xl font-bold">{t.reportTitle}</h2>
                    <p className="text-slate-500">
                        {t.examLabel} <span className="font-semibold text-slate-700 dark:text-slate-300">{resultDetails.exam.title}</span>
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Video Player */}
                    <div className="lg:col-span-2 bg-black rounded-lg shadow-lg flex items-center justify-center aspect-video relative">
                        <PlayCircleIcon className="w-20 h-20 text-slate-700" />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                            <span className="w-2 h-2 bg-red-300 rounded-full me-1.5 animate-pulse"></span>
                            {t.sessionRecording}
                        </div>
                    </div>

                    {/* Right: Analysis */}
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
                                   <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
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
    }
    
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle={""}
            sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{pageTitle.title}</h1>}
        >
            {mainContent()}
        </DashboardLayout>
    );
};

export default ExamineeProctoringReportPage;
