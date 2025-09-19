
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrainingCompanyDashboardStats } from '../services/mockApi';
import { BuildingIcon, BarChartIcon, ClipboardListIcon, SparklesIcon, UsersIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserRole } from '../types';

const translations = {
    en: {
        welcome: "Welcome, Future Skills!",
        welcomeDesc: "Here's an overview of your training center.",
        stat1: "Total Courses",
        stat2: "Avg. Completion",
        stat3: "Active Trainees",
        action1: "Create New Exam",
        action2: "Generate with AI",
        action3: "Question Bank",
        action4: "View Analytics",
        recentActivity: "Recent Activity",
        noActivity: "No recent activity to show.",
    },
    ar: {
        welcome: "أهلاً، Future Skills!",
        welcomeDesc: "إليك نظرة عامة على مركز التدريب الخاص بك.",
        stat1: "إجمالي الدورات",
        stat2: "متوسط الإكمال",
        stat3: "المتدربون النشطون",
        action1: "إنشاء اختبار جديد",
        action2: "إنشاء بالذكاء الاصطناعي",
        action3: "بنك الأسئلة",
        action4: "عرض التحليلات",
        recentActivity: "النشاط الأخير",
        noActivity: "لا يوجد نشاط حديث لعرضه.",
    }
};

const layoutTranslations = {
    en: {
        title: "for Training Companies",
        dashboard: "Dashboard",
        courseExams: "Course Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
    },
    ar: {
        title: "لشركات التدريب",
        dashboard: "لوحة التحكم",
        courseExams: "اختبارات الدورات",
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


const TrainingCompanyDashboard = () => {
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
                const data = await getTrainingCompanyDashboardStats();
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
            case 'new_exam': navigate('/company/exams'); break;
            case 'ai_exam': navigate('/company/exams'); break;
            case 'bank': navigate('/company/question-bank'); break;
            case 'analytics': navigate('/company/analytics'); break;
        }
    };
    
    const navLinks = [
        { path: '/company', icon: BarChartIcon, label: t_layout.dashboard },
        { path: '/company/exams', icon: BuildingIcon, label: t_layout.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t_layout.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t_layout.analytics },
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
                        <StatCard title={t_content.stat1} value={stats.totalCourses} icon={BuildingIcon} colorClass="bg-primary-500" />
                        <StatCard title={t_content.stat2} value={stats.averageCompletion} suffix="%" icon={BarChartIcon} colorClass="bg-teal-500" />
                        <StatCard title={t_content.stat3} value={stats.activeTrainees} icon={UsersIcon} colorClass="bg-purple-500" />
                    </div>
                )}
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t_layout.courseExams}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <ActionCard title={t_content.action1} icon={BuildingIcon} onClick={() => handleQuickAction('new_exam')} />
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

export default TrainingCompanyDashboard;
