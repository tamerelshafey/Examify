import React from 'react';
import { getTeacherExams, createTeacherExam } from '../services/api';
import { UserRole } from '../types';
import { BuildingIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardComponent from '../components/DashboardComponent';

const translations = {
    en: {
        title: "for Training Companies",
        dashboard: "Dashboard",
        courseExams: "Course Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
        importFromText: "Import from Text",
        createNewExam: "Create New Exam",
        viewResults: "View Results",
        createVariant: "Create AI Variant",
        creatingVariant: "Creating variant...",
        variantCreated: "AI variant created successfully!",
        variantFailed: "Could not create AI variant. Please try again.",
        noExamsTitle: "No Exams Found",
        noExamsMessage: "Get started by creating a new exam for one of your courses.",
    },
    ar: {
        title: "لشركات التدريب",
        dashboard: "لوحة التحكم",
        courseExams: "اختبارات الدورات",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        importFromText: "استيراد من نص",
        createNewExam: "إنشاء اختبار جديد",
        viewResults: "عرض النتائج",
        createVariant: "إنشاء نسخة بالذكاء الاصطناعي",
        creatingVariant: "جاري إنشاء النسخة...",
        variantCreated: "تم إنشاء نسخة الذكاء الاصطناعي بنجاح!",
        variantFailed: "فشل إنشاء نسخة بالذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.",
        noExamsTitle: "لم يتم العثور على اختبارات",
        noExamsMessage: "ابدأ بإنشاء اختبار جديد لإحدى دوراتك التدريبية.",
    }
};

const TrainingCompanyExamsPage = () => {
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
        <DashboardComponent
            userRole={UserRole.TrainingCompany}
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle={t.courseExams}
            getExamsApi={getTeacherExams}
            createExamApi={createTeacherExam}
            translations={{
                importFromText: t.importFromText,
                generateExamAI: t.createNewExam,
                createNewExam: t.createNewExam,
                viewResults: t.viewResults,
                createVariant: t.createVariant,
                creatingVariant: t.creatingVariant,
                variantCreated: t.variantCreated,
                variantFailed: t.variantFailed,
                noExamsTitle: t.noExamsTitle,
                noExamsMessage: t.noExamsMessage,
            }}
        />
    );
};

export default TrainingCompanyExamsPage;