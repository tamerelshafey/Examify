import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import DashboardLayout from '../components/DashboardLayout';
import { BarChartIcon, BookOpenIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getTeacherExams, getResultsForExam, getExamDetails } from '../services/api';

const translations = {
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

const TeacherAnalyticsPage = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const navLinks = [
        { path: '/teacher', icon: BarChartIcon, label: t.dashboard },
        { path: '/teacher/exams', icon: BookOpenIcon, label: t.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
    ];
    
    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{`${theme.platformName} ${t.title}`}</h1>;

    return (
        <DashboardLayout navLinks={navLinks} pageTitle={t.analytics} sidebarHeader={sidebarHeader}>
            <AnalyticsComponent 
                userRole={UserRole.Teacher}
                getExamsApi={getTeacherExams}
                getResultsForExamApi={getResultsForExam}
                getExamDetailsApi={getExamDetails}
            />
        </DashboardLayout>
    );
};

export default TeacherAnalyticsPage;