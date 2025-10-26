


import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResultsForExam, getExamDetails } from '../services/api';
import { Exam, ExamResult, UserRole } from '../types';
import {
    BookOpenIcon, BarChartIcon, ClipboardListIcon, EyeIcon, ArrowLeftIcon,
    BriefcaseIcon, BuildingIcon, InboxIcon
} from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

// Translations
const translations = {
    en: {
        loading: "Loading results...",
        noResultsTitle: "No Submissions Yet",
        noResultsMessage: "No results have been submitted for this exam yet.",
        backToExams: "Back to All Exams",
        resultsFor: "Results for",
        examinee: "Examinee",
        score: "Score",
        percentage: "Percentage",
        submittedAt: "Submitted At",
        actions: "Actions",
        viewSubmission: "View Submission",
        teacher: {
            title: "Teacher",
            dashboard: "Dashboard",
            myExams: "My Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
        },
        corporate: {
            title: "Corporate Center",
            dashboard: "Dashboard",
            assessments: "Assessments",
            questionBank: "Question Bank",
            analytics: "Analytics",
        },
        company: {
            title: "for Training Companies",
            dashboard: "Dashboard",
            courseExams: "Course Exams",
            questionBank: "Question Bank",
            analytics: "Analytics",
        }
    },
    ar: {
        loading: "جاري تحميل النتائج...",
        noResultsTitle: "لا توجد تقديمات بعد",
        noResultsMessage: "لم يتم تقديم أي نتائج لهذا الاختبار بعد.",
        backToExams: "العودة إلى كل الاختبارات",
        resultsFor: "نتائج اختبار",
        examinee: "الطالب",
        score: "الدرجة",
        percentage: "النسبة المئوية",
        submittedAt: "تاريخ التقديم",
        actions: "الإجراءات",
        viewSubmission: "عرض التقديم",
        teacher: {
            title: "المعلم",
            dashboard: "لوحة التحكم",
            myExams: "اختباراتي",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
        },
        corporate: {
            title: "المركز المؤسسي",
            dashboard: "لوحة التحكم",
            assessments: "التقييمات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
        },
        company: {
            title: "لشركات التدريب",
            dashboard: "لوحة التحكم",
            courseExams: "اختبارات الدورات",
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
        }
    }
};

// Role-specific configuration
const roleConfig = {
    [UserRole.Teacher]: {
        basePath: '/teacher',
        examsPath: '/teacher/exams',
        navLinks: (t: any) => [
            { path: '/teacher', icon: BarChartIcon, label: t.dashboard },
            { path: '/teacher/exams', icon: BookOpenIcon, label: t.myExams },
            { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => t.teacher,
    },
    [UserRole.Corporate]: {
        basePath: '/corporate',
        examsPath: '/corporate/assessments',
        navLinks: (t: any) => [
            { path: '/corporate', icon: BarChartIcon, label: t.dashboard },
            { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.assessments },
            { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => t.corporate,
    },
    [UserRole.TrainingCompany]: {
        basePath: '/company',
        examsPath: '/company/exams',
        navLinks: (t: any) => [
            { path: '/company', icon: BarChartIcon, label: t.dashboard },
            { path: '/company/exams', icon: BuildingIcon, label: t.courseExams },
            { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
            { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
        ],
        getLabels: (t: any) => t.company,
    },
};


interface ExamResultsComponentProps {
    userRole: UserRole.Teacher | UserRole.Corporate | UserRole.TrainingCompany;
}

const ExamResultsComponent: React.FC<ExamResultsComponentProps> = ({ userRole }) => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const [results, setResults] = useState<ExamResult[]>([]);
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const { lang } = useLanguage();
    const { theme } = useTheme();

    const config = roleConfig[userRole];
    const roleSpecificTranslations = config.getLabels(translations[lang]);
    const t = { ...translations[lang], ...roleSpecificTranslations };
    const navLinks = config.navLinks(t);

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName} {t.title}</h1>;


    useEffect(() => {
        if (!examId) return;

        const fetchResults = async () => {
            setLoading(true);
            try {
                const [examData, resultsData] = await Promise.all([
                    getExamDetails(examId),
                    getResultsForExam(examId)
                ]);

                if (examData) {
                    setExam(examData);
                    setResults(resultsData);
                } else {
                    navigate(config.examsPath);
                }
            } catch (error) {
                console.error("Failed to fetch exam results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [examId, navigate, config.examsPath]);

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const mainContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (results.length === 0) {
            return <EmptyState icon={InboxIcon} title={t.noResultsTitle} message={t.noResultsMessage} />;
        }

        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t.examinee}</th>
                            <th scope="col" className="px-6 py-3">{t.score}</th>
                            <th scope="col" className="px-6 py-3">{t.percentage}</th>
                            <th scope="col" className="px-6 py-3">{t.submittedAt}</th>
                            <th scope="col" className="px-6 py-3">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(result => {
                            const percentage = Math.round((result.score / result.totalPoints) * 100);
                            const resultPath = `${config.basePath}/exam/${examId}/result/${result.id}`;
                            return (
                                <tr key={result.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.examineeName}</td>
                                    <td className="px-6 py-4">{result.score} / {result.totalPoints}</td>
                                    <td className={`px-6 py-4 font-bold ${getPerformanceColor(percentage)}`}>{percentage}%</td>
                                    <td className="px-6 py-4">{result.submittedAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <Link to={resultPath} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewSubmission}>
                                            <EyeIcon className="w-5 h-5"/>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle=""
        >
            <div className="mb-6">
                <Link to={config.examsPath} className="flex items-center text-sm text-primary-500 hover:underline mb-4">
                    <ArrowLeftIcon className="w-4 h-4 me-1" />
                    {t.backToExams}
                </Link>
                <h2 className="text-3xl font-bold">{t.resultsFor} "{exam?.title}"</h2>
            </div>
            {mainContent()}
        </DashboardLayout>
    );
};

export default ExamResultsComponent;