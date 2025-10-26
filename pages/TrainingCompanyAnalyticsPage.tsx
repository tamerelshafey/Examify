import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import DashboardLayout from '../components/DashboardLayout';
import { BarChartIcon, BuildingIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getTeacherExams, getResultsForExam, getExamDetails } from '../services/api';


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

const TrainingCompanyAnalyticsPage = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const navLinks = [
        { path: '/company', icon: BarChartIcon, label: t.dashboard },
        { path: '/company/exams', icon: BuildingIcon, label: t.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
    ];
    
    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{`${theme.platformName} ${t.title}`}</h1>;

    return (
        <DashboardLayout navLinks={navLinks} pageTitle={t.analytics} sidebarHeader={sidebarHeader}>
            <AnalyticsComponent 
                userRole={UserRole.TrainingCompany}
                getExamsApi={getTeacherExams} // Using teacher exams as a mock for now
                getResultsForExamApi={getResultsForExam}
                getExamDetailsApi={getExamDetails}
            />
        </DashboardLayout>
    );
};

export default TrainingCompanyAnalyticsPage;