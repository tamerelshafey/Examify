import React from 'react';
import { BookOpenIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHomeComponent from '../components/DashboardHomeComponent';
import { UserRole } from '../types';

const layoutTranslations = {
    en: {
        title: "Teacher",
        dashboard: "Dashboard",
        myExams: "My Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
    },
    ar: {
        title: "المعلم",
        dashboard: "لوحة التحكم",
        myExams: "اختباراتي",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
    }
};

const TeacherDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t_layout = layoutTranslations[lang];

    const navLinks = [
        { path: '/teacher', icon: BarChartIcon, label: t_layout.dashboard },
        { path: '/teacher/exams', icon: BookOpenIcon, label: t_layout.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t_layout.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t_layout.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{`${theme.platformName} ${t_layout.title}`}</h1>;

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