
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCorporateDashboardStats } from '../services/mockApi';
import { BriefcaseIcon, BarChartIcon, ClipboardListIcon, SparklesIcon, CheckCircleIcon, UsersIcon } from '../components/icons';
import { useLanguage, useTheme } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserRole } from '../types';

const translations = {
    en: {
        welcome: "Welcome, Innovate Corp.!",
        welcomeDesc: "Here's a summary of your assessment activities.",
        stat1: "Total Assessments",
        stat2: "Average Pass Rate",
        stat3: "Candidates Assessed",
        action1: "Create New Assessment",
        action2: "Generate with AI",
        action3: "Question Bank",
        action4: "View Analytics",
        recentActivity: "Recent Activity",
        noActivity: "No recent activity to show.",
    },
    ar: {
        welcome: "أهلاً، Innovate Corp.!",
        welcomeDesc: "إليك ملخص أنشطة التقييم الخاصة بك.",
        stat1: "إجمالي التقييمات",
        stat2: "متوسط معدل النجاح",
        stat3: "مرشحون تم تقييمهم",
        action1: "إنشاء تقييم جديد",
        action2: "إنشاء بالذكاء الاصطناعي",
        action3: "بنك الأسئلة",
        action4: "عرض التحليلات",
        recentActivity: "النشاط الأخير",
        noActivity: "لا يوجد نشاط حديث لعرضه.",
    }
};

const layoutTranslations = {
    en: {
        title: "Corporate Center",
        dashboard: "Dashboard",
        assessments: "Assessments",
        questionBank: "Question Bank",
        analytics: "Analytics",
    },
    ar: {
        title: "المركز المؤسسي",
        dashboard: "لوحة التحكم",
        assessments: "التقييمات",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
    }
};

const StatCard = ({ title, value, icon: Icon, colorClass, suffix = '' }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full me-4 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}{suffix}</p>
        </div>
    </div>
);

const ActionCard = ({ title, icon: Icon, onClick }: any) => (
     <button onClick={onClick} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    </button>
);


const CorporateDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const t_layout = {
        ...layoutTranslations[lang],
        fullTitle: `${theme.platformName} ${layoutTranslations[lang].title}`
    };
    const t_content = translations[lang];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getCorporateDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'new_exam': navigate('/corporate/assessments'); break;
            case 'ai_exam': navigate('/corporate/assessments'); break;
            case 'bank': navigate('/corporate/question-bank'); break;
            case 'analytics': navigate('/corporate/analytics'); break;
        }
    };

    const navLinks = [
        { path: '/corporate', icon: BarChartIcon, label: t_layout.dashboard },
        { path: '/corporate/assessments', icon: BriefcaseIcon, label: t_layout.assessments },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t_layout.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t_layout.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t_layout.fullTitle}</h1>;

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t_content.welcome}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t_content.welcomeDesc}</p>
                </div>
                 {stats && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t_content.stat1} value={stats.totalAssessments} icon={BriefcaseIcon} colorClass="bg-primary-500" />
                        <StatCard title={t_content.stat2} value={stats.averagePassRate} suffix="%" icon={CheckCircleIcon} colorClass="bg-teal-500" />
                        <StatCard title={t_content.stat3} value={stats.candidatesAssessed} icon={UsersIcon} colorClass="bg-indigo-500" />
                    </div>
                 )}
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t_layout.assessments}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <ActionCard title={t_content.action1} icon={BriefcaseIcon} onClick={() => handleQuickAction('new_exam')} />
                        <ActionCard title={t_content.action2} icon={SparklesIcon} onClick={() => handleQuickAction('ai_exam')} />
                        <ActionCard title={t_content.action3} icon={ClipboardListIcon} onClick={() => handleQuickAction('bank')} />
                        <ActionCard title={t_content.action4} icon={BarChartIcon} onClick={() => handleQuickAction('analytics')} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t_content.recentActivity}</h3>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                        <p className="text-slate-500 dark:text-slate-400">{t_content.noActivity}</p>
                    </div>
                </div>
            </div>
        )
    };
    

    return (
        <DashboardLayout
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle=""
        >
            {pageContent()}
        </DashboardLayout>
    );
};

export default CorporateDashboard;
