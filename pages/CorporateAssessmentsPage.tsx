import React from 'react';
import { getCorporateExams, createCorporateExam } from '../services/api';
import { UserRole } from '../types';
import { BriefcaseIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardComponent from '../components/DashboardComponent';

const translations = {
    en: {
        title: "Corporate Center",
        dashboard: "Dashboard",
        assessments: "Assessments",
        questionBank: "Question Bank",
        analytics: "Analytics",
        importFromText: "Import from Text",
        assignNewTest: "Assign New Test",
        viewResults: "View Results",
        createVariant: "Create AI Variant",
        creatingVariant: "Creating variant...",
        variantCreated: "AI variant created successfully!",
        variantFailed: "Could not create AI variant. Please try again.",
        noAssessmentsTitle: "No Assessments Found",
        noAssessmentsMessage: "Get started by creating a new professional skill assessment.",
    },
    ar: {
        title: "المركز المؤسسي",
        dashboard: "لوحة التحكم",
        assessments: "التقييمات",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        importFromText: "استيراد من نص",
        assignNewTest: "تعيين اختبار جديد",
        viewResults: "عرض النتائج",
        createVariant: "إنشاء نسخة بالذكاء الاصطناعي",
        creatingVariant: "جاري إنشاء النسخة...",
        variantCreated: "تم إنشاء نسخة الذكاء الاصطناعي بنجاح!",
        variantFailed: "فشل إنشاء نسخة بالذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.",
        noAssessmentsTitle: "لم يتم العثور على تقييمات",
        noAssessmentsMessage: "ابدأ بإنشاء تقييم مهارات مهنية جديد.",
    }
};

const CorporateAssessmentsPage = () => {
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
        <DashboardComponent
            userRole={UserRole.Corporate}
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle={t.assessments}
            getExamsApi={getCorporateExams}
            createExamApi={createCorporateExam}
            translations={{
                importFromText: t.importFromText,
                generateExamAI: t.assignNewTest,
                createNewExam: t.assignNewTest,
                viewResults: t.viewResults,
                createVariant: t.createVariant,
                creatingVariant: t.creatingVariant,
                variantCreated: t.variantCreated,
                variantFailed: t.variantFailed,
                noExamsTitle: t.noAssessmentsTitle,
                noExamsMessage: t.noAssessmentsMessage,
            }}
        />
    );
};

export default CorporateAssessmentsPage;