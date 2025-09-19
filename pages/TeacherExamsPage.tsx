
import React from 'react';
import { createTeacherExam, getTeacherExams } from '../services/mockApi';
import { BookOpenIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardComponent from '../components/DashboardComponent';
import { UserRole } from '../types';

const translations = {
    en: {
        dashboard: "Dashboard",
        myExams: "My Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
        generateExamAI: "Generate Exam with AI",
        createNewExam: "Create New Exam",
        viewResults: "View Results",
        createVariant: "Create AI Variant",
        creatingVariant: "Creating variant...",
        variantCreated: "AI variant created successfully!",
        variantFailed: "Could not create AI variant. Please try again.",
        noExamsTitle: "No Exams Found",
        noExamsMessage: "You haven't created any exams yet. Get started by creating a new one.",
    },
    ar: {
        dashboard: "لوحة التحكم",
        myExams: "اختباراتي",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        generateExamAI: "إنشاء اختبار بالذكاء الاصطناعي",
        createNewExam: "إنشاء اختبار جديد",
        viewResults: "عرض النتائج",
        createVariant: "إنشاء نسخة بالذكاء الاصطناعي",
        creatingVariant: "جاري إنشاء النسخة...",
        variantCreated: "تم إنشاء نسخة الذكاء الاصطناعي بنجاح!",
        variantFailed: "فشل إنشاء نسخة بالذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.",
        noExamsTitle: "لم يتم العثور على اختبارات",
        noExamsMessage: "لم تقم بإنشاء أي اختبارات بعد. ابدأ بإنشاء اختبار جديد.",
    }
};

const TeacherExamsPage = () => {
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
        <DashboardComponent
            userRole={UserRole.Teacher}
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            pageTitle={t.myExams}
            getExamsApi={getTeacherExams}
            createExamApi={createTeacherExam}
            translations={{
                generateExamAI: t.generateExamAI,
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

export default TeacherExamsPage;
