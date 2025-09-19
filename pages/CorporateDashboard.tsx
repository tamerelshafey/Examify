import React from 'react';
import { BriefcaseIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage, useTheme } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHomeComponent from '../components/DashboardHomeComponent';
import { UserRole } from '../types';

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


const CorporateDashboard = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = {
        ...translations[lang],
        fullTitle: `${theme.platformName} ${translations[lang].title}`
    };

    const navLinks = [
        { path: '/corporate', icon: BarChartIcon, label: t.dashboard },
        { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.assessments },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.fullTitle}</h1>;

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
