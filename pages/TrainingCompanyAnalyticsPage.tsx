import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import { getTeacherExams, getExamDetails, getResultsForExam, getQuestionAnalysisWithAI, getExamSummaryWithAI } from '../services/mockApi';
import { useLanguage, useTheme } from '../App';
import { BuildingIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';

const translations = {
    en: {
        title: "for Companies",
        courseExams: "Course Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
        performanceAnalytics: "Trainee Analytics",
        loadingExams: "Loading exams...",
        selectExam: "Select an exam",
        noDataTitle: "No Data to Display",
        noResultsMessage: "No results have been submitted for this exam yet.",
        pleaseSelectMessage: "Please select an exam to view its analytics.",
        averageScore: "Average Score",
        hardestQuestion: "Hardest Question",
        easiestQuestion: "Easiest Question",
        questionAnalysis: "Question Analysis",
        performanceByTag: "Performance by Topic Tag",
        scoreDistribution: "Score Distribution",
        question: "Question",
        avgScore: "Avg Score",
        percentCorrect: "% Correct",
        aiInsight: "AI Insight",
        getAIInsight: "Get AI Insight",
        analyzing: "Analyzing...",
        numberOfTrainees: "Number of Trainees",
        loadingChart: "Loading chart...",
        uncategorized: "Uncategorized",
        na: "N/A",
        aiSummary: {
            title: "AI-Powered Exam Summary",
            loading: "Generating AI summary...",
            performance: "Overall Performance",
            struggles: "Common Areas of Difficulty",
            suggestions: "Teaching Suggestions"
        },
        barColor1: "#8b5cf6",
        barColor2: "#a78bfa",
    },
    ar: {
        title: "للشركات",
        courseExams: "اختبارات الدورة",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        performanceAnalytics: "تحليلات المتدربين",
        loadingExams: "جاري تحميل الاختبارات...",
        selectExam: "اختر اختبارًا",
        noDataTitle: "لا توجد بيانات لعرضها",
        noResultsMessage: "لم يتم تقديم أي نتائج لهذا الاختبار بعد.",
        pleaseSelectMessage: "يرجى تحديد اختبار لعرض تحليلاته.",
        averageScore: "متوسط الدرجات",
        hardestQuestion: "أصعب سؤال",
        easiestQuestion: "أسهل سؤال",
        questionAnalysis: "تحليل الأسئلة",
        performanceByTag: "الأداء حسب وسم الموضوع",
        scoreDistribution: "توزيع الدرجات",
        question: "السؤال",
        avgScore: "متوسط الدرجة",
        percentCorrect: "٪ صحيح",
        aiInsight: "رؤية الذكاء الاصطناعي",
        getAIInsight: "احصل على رؤية الذكاء الاصطناعي",
        analyzing: "جاري التحليل...",
        numberOfTrainees: "عدد المتدربين",
        loadingChart: "جاري تحميل الرسم البياني...",
        uncategorized: "غير مصنف",
        na: "غير متاح",
        aiSummary: {
            title: "ملخص الاختبار المدعوم بالذكاء الاصطناعي",
            loading: "جاري إنشاء ملخص الذكاء الاصطناعي...",
            performance: "الأداء العام",
            struggles: "مجالات الصعوبة الشائعة",
            suggestions: "اقتراحات التدريس"
        },
        barColor1: "#8b5cf6",
        barColor2: "#a78bfa",
    },
};

const TrainingCompanyAnalyticsPage = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const pageTitle = {
        ...t,
        fullTitle: `${theme.platformName} ${t.title}`
    }
    
    const navLinks = [
        { path: '/company', icon: BuildingIcon, label: t.courseExams },
        { path: '/company/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/company/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{pageTitle.fullTitle}</h1>;

    return (
        <AnalyticsComponent
            userRole={UserRole.TrainingCompany}
            getExamsApi={getTeacherExams} // Using teacher exams as a mock
            getExamDetailsApi={getExamDetails}
            getResultsForExamApi={getResultsForExam}
            getQuestionAnalysisApi={getQuestionAnalysisWithAI}
            getExamSummaryApi={getExamSummaryWithAI}
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            translations={t}
        />
    );
};

export default TrainingCompanyAnalyticsPage;
