
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExamDetails, getResultsForExam } from '../services/mockApi';
import { Exam, ExamResult, UserRole } from '../types';
import { 
    BarChartIcon, BookOpenIcon, ClipboardListIcon, EyeIcon, TrendingUpIcon, 
    UsersIcon, InboxIcon, BriefcaseIcon, BuildingIcon 
} from './icons';
import { Language, useTheme, useLanguage } from '../App';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const translations = {
    en: {
        resultsFor: "Results for:",
        averageScore: "Average Score",
        highestScore: "Highest Score",
        score: "Score",
        percentage: "Percentage",
        submittedOn: "Submitted On",
        actions: "Actions",
        viewDetails: "View Submission Details",
        common: {
            questionBank: "Question Bank",
            analytics: "Analytics",
        },
        teacher: {
            title: "Teacher",
            myExams: "My Exams",
            totalSubmissions: "Total Submissions",
            studentName: "Student Name",
            noSubmissionsTitle: "No Submissions Yet",
            noSubmissionsMessage: "No students have submitted this exam yet. Check back later for results.",
            examNotFound: "Exam not found.",
        },
        corporate: {
            title: "Corporate Center",
            skillLibrary: "Skill Library",
            totalCandidates: "Total Candidates",
            candidateName: "Candidate Name",
            noSubmissionsTitle: "No Submissions Yet",
            noSubmissionsMessage: "No candidates have submitted this assessment yet.",
            assessmentNotFound: "Assessment not found.",
        },
        company: {
            title: "for Companies",
            courseExams: "Course Exams",
            totalTrainees: "Total Trainees",
            traineeName: "Trainee Name",
            noSubmissionsTitle: "No Submissions Yet",
            noSubmissionsMessage: "No trainees have submitted this exam yet.",
            examNotFound: "Exam not found.",
        }
    },
    ar: {
        resultsFor: "نتائج اختبار:",
        averageScore: "متوسط الدرجات",
        highestScore: "أعلى درجة",
        score: "الدرجة",
        percentage: "النسبة المئوية",
        submittedOn: "تاريخ التقديم",
        actions: "الإجراءات",
        viewDetails: "عرض تفاصيل التقديم",
        common: {
            questionBank: "بنك الأسئلة",
            analytics: "التحليلات",
        },
        teacher: {
            title: "المعلم",
            myExams: "اختباراتي",
            totalSubmissions: "إجمالي التقديمات",
            studentName: "اسم الطالب",
            noSubmissionsTitle: "لا توجد تقديمات بعد",
            noSubmissionsMessage: "لم يقم أي طالب بتقديم هذا الاختبار بعد.",
            examNotFound: "الاختبار غير موجود.",
        },
        corporate: {
            title: "المركز المؤسسي",
            skillLibrary: "مكتبة المهارات",
            totalCandidates: "إجمالي المرشحين",
            candidateName: "اسم المرشح",
            noSubmissionsTitle: "لا توجد تقديمات بعد",
            noSubmissionsMessage: "لم يقم أي مرشح بتقديم هذا التقييم بعد.",
            assessmentNotFound: "التقييم غير موجود.",
        },
        company: {
            title: "للشركات",
            courseExams: "اختبارات الدورة",
            totalTrainees: "إجمالي المتدربين",
            traineeName: "اسم المتدرب",
            noSubmissionsTitle: "لا توجد تقديمات بعد",
            noSubmissionsMessage: "لم يقم أي متدرب بتقديم هذا الاختبار بعد.",
            examNotFound: "الاختبار غير موجود.",
        }
    }
};

const StatCard = ({ icon: Icon, title, value, colorClass, suffix='', lang }: { icon: React.FC<any>, title: string, value: string | number, colorClass: string, suffix?: string, lang: Language }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${lang === 'ar' ? 'ms-4' : 'me-4'} ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}{suffix}</p>
        </div>
    </div>
);

const roleConfig: any = {
    [UserRole.Teacher]: {
        basePath: '/teacher',
        navLinks: (t: any) => [
            { path: '/teacher', icon: BookOpenIcon, label: t.teacher.myExams },
            { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.common.questionBank },
            { path: '/teacher/analytics', icon: BarChartIcon, label: t.common.analytics },
        ],
        translations: (t: any) => ({ ...t, ...t.teacher, examineeName: t.teacher.studentName, totalSubmissions: t.teacher.totalSubmissions }),
        sidebarTitle: (t: any) => t.teacher.title
    },
    [UserRole.Corporate]: {
        basePath: '/corporate',
        navLinks: (t: any) => [
            { path: '/corporate', icon: BriefcaseIcon, label: t.corporate.skillLibrary },
            { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.common.questionBank },
            { path: '/corporate/analytics', icon: BarChartIcon, label: t.common.analytics },
        ],
        translations: (t: any) => ({ ...t, ...t.corporate, examineeName: t.corporate.candidateName, totalSubmissions: t.corporate.totalCandidates }),
        sidebarTitle: (t: any) => t.corporate.title
    },
    [UserRole.TrainingCompany]: {
        basePath: '/company',
        navLinks: (t: any) => [
            { path: '/company', icon: BuildingIcon, label: t.company.courseExams },
            { path: '/company/question-bank', icon: ClipboardListIcon, label: t.common.questionBank },
            { path: '/company/analytics', icon: BarChartIcon, label: t.common.analytics },
        ],
        translations: (t: any) => ({ ...t, ...t.company, examineeName: t.company.traineeName, totalSubmissions: t.company.totalTrainees }),
        sidebarTitle: (t: any) => t.company.title
    },
};

interface ExamResultsComponentProps {
    userRole: UserRole.Teacher | UserRole.Corporate | UserRole.TrainingCompany;
}

const ExamResultsComponent: React.FC<ExamResultsComponentProps> = ({ userRole }) => {
    const { examId } = useParams<{ examId: string }>();
    const [exam, setExam] = useState<Exam | null>(null);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { lang } = useLanguage();

    const config = roleConfig[userRole];
    const t = config.translations({ ...translations[lang], common: translations[lang].common });
    const navLinks = config.navLinks({ ...translations[lang].common, ...translations[lang][userRole]});
    
    useEffect(() => {
        if (!examId) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const [examDetails, examResults] = await Promise.all([
                    getExamDetails(examId),
                    getResultsForExam(examId)
                ]);
                setExam(examDetails || null);
                setResults(examResults);
            } catch (error) {
                console.error("Failed to fetch exam results:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [examId]);

    const analytics = useMemo(() => ({
        submissions: results.length,
        averageScore: results.length > 0 ? (results.reduce((acc, r) => acc + (r.score / r.totalPoints), 0) / results.length * 100).toFixed(1) : 0,
        highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
    }), [results]);

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        if (!exam) return <p>{t.examNotFound || t.assessmentNotFound}</p>;
        
        if (results.length === 0) {
            return <EmptyState icon={InboxIcon} title={t.noSubmissionsTitle} message={t.noSubmissionsMessage} />;
        }

        const totalPoints = results.length > 0 ? results[0].totalPoints : exam.questions.reduce((total, q) => total + q.points, 0);

        return (
            <>
                <p className="text-slate-500 dark:text-slate-400 -mt-6 mb-8">{exam.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                   <StatCard icon={UsersIcon} title={t.totalSubmissions} value={analytics.submissions} colorClass="bg-primary-500" lang={lang} />
                   <StatCard icon={BarChartIcon} title={t.averageScore} value={analytics.averageScore} suffix="%" colorClass="bg-teal-500" lang={lang} />
                   <StatCard icon={TrendingUpIcon} title={t.highestScore} value={`${analytics.highestScore} / ${totalPoints}`} colorClass="bg-purple-500" lang={lang} />
                </div>
                
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                   <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t.examineeName}</th>
                                <th scope="col" className="px-6 py-3">{t.score}</th>
                                <th scope="col" className="px-6 py-3">{t.percentage}</th>
                                <th scope="col" className="px-6 py-3">{t.submittedOn}</th>
                                <th scope="col" className="px-6 py-3">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => {
                              const percentage = (result.score / result.totalPoints * 100).toFixed(1);
                              return (
                                <tr key={result.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.examineeName}</td>
                                    <td className="px-6 py-4">{result.score} / {result.totalPoints}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-20 bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 me-2">
                                                <div className="bg-primary-500 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                                            </div>
                                            <span>{percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{result.submittedAt.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`${config.basePath}/exam/${examId}/result/${result.id}`} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewDetails}>
                                            <EyeIcon className="w-5 h-5"/>
                                        </Link>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                   </table>
                </div>
            </>
        );
    }

    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle={loading ? "" : `${t.resultsFor} ${exam?.title}`}
            sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName} {config.sidebarTitle(translations[lang])}</h1>}
        >
            {pageContent()}
        </DashboardLayout>
    );
};

export default ExamResultsComponent;
