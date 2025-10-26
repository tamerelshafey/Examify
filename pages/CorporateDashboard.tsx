import React from 'react';
import { BriefcaseIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from '../components/DashboardLayout';
import { UserRole } from '../types';
import DashboardHomeComponent from '../components/DashboardHomeComponent';

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

const CorporateDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t_layout = {
        ...layoutTranslations[lang],
        fullTitle: `${theme.platformName} ${layoutTranslations[lang].title}`
    };

    const navLinks = [
        { path: '/corporate', icon: BarChartIcon, label: t_layout.dashboard },
        { path: '/corporate/assessments', icon: BriefcaseIcon, label: t_layout.assessments },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t_layout.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t_layout.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t_layout.fullTitle}</h1>;
    
    return (
        <DashboardLayout
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle=""
        >
            <DashboardHomeComponent userRole={UserRole.Corporate} />
        </DashboardLayout>
    );
};

export default CorporateDashboard;