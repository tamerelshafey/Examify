
import React from 'react';
import { BookOpenIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHomeComponent from '../components/DashboardHomeComponent';
import { UserRole } from '../types';

const translations = {
    en: {
        dashboard: "Dashboard",
        myExams: "My Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
    },
    ar: {
        dashboard: "لوحة التحكم",
        myExams: "اختباراتي",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
    }
};

const TeacherDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = {
        ...translations[lang],
        title: `${theme.platformName} Teacher`
    };

    const navLinks = [
        { path: '/teacher', icon: BarChartIcon, label: t.dashboard },
        { path: '/teacher/exams', icon: BookOpenIcon, label: t.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.title}</h1>;

    return (
        <DashboardLayout
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle=""
        >
            <DashboardHomeComponent userRole={UserRole.Teacher} />
        </DashboardLayout>
    );
};

export default TeacherDashboard;
