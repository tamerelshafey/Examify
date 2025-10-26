import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import DashboardLayout from '../components/DashboardLayout';
import { BarChartIcon, BriefcaseIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCorporateExams, getResultsForExam, getExamDetails } from '../services/api';

const translations = {
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

const CorporateAnalyticsPage = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const navLinks = [
        { path: '/corporate', icon: BarChartIcon, label: t.dashboard },
        { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.assessments },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
    ];
    
    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{`${theme.platformName} ${t.title}`}</h1>;

    return (
        <DashboardLayout navLinks={navLinks} pageTitle={t.analytics} sidebarHeader={sidebarHeader}>
            <AnalyticsComponent 
                userRole={UserRole.Corporate}
                getExamsApi={getCorporateExams}
                getResultsForExamApi={getResultsForExam}
                getExamDetailsApi={getExamDetails}
            />
        </DashboardLayout>
    );
};

export default CorporateAnalyticsPage;