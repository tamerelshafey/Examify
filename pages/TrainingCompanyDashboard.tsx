import React from 'react';
import { BuildingIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHomeComponent from '../components/DashboardHomeComponent';
import { UserRole } from '../types';

const translations = {
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
    const t = {
        ...translations[lang],
        fullTitle: `${theme.platformName} ${translations[lang].title}`
    };

    const navLinks = [
        { path: '/company', icon: BarChartIcon, label: t.dashboard },
        { path: '/company/exams', icon: BuildingIcon, label: t.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.fullTitle}</h1>;

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
