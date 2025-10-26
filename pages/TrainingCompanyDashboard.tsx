import React from 'react';
import { BuildingIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardLayout from '../components/DashboardLayout';
import { UserRole } from '../types';
import DashboardHomeComponent from '../components/DashboardHomeComponent';

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


const TrainingCompanyDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t_layout = {
        ...layoutTranslations[lang],
        fullTitle: `${theme.platformName} ${layoutTranslations[lang].title}`
    };
    
    const navLinks = [
        { path: '/company', icon: BarChartIcon, label: t_layout.dashboard },
        { path: '/company/exams', icon: BuildingIcon, label: t_layout.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t_layout.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t_layout.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t_layout.fullTitle}</h1>;

    return (
        <DashboardLayout
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle=""
        >
            <DashboardHomeComponent userRole={UserRole.TrainingCompany} />
        </DashboardLayout>
    );
};

export default TrainingCompanyDashboard;