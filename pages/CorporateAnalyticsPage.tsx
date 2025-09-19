import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import { getCorporateExams, getExamDetails, getResultsForExam, getQuestionAnalysisWithAI, getExamSummaryWithAI } from '../services/mockApi';
import { useLanguage } from '../App';
import { BriefcaseIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';

const translations = {
    en: {
        title: "Corporate Center",
        skillLibrary: "Skill Library",
        questionBank: "Question Bank",
        analytics: "Analytics",
        performanceAnalytics: "Candidate Analytics",
        loadingExams: "Loading assessments...",
        selectExam: "Select an assessment",
        noDataTitle: "No Data to Display",
        noResultsMessage: "No results have been submitted for this assessment yet.",
        pleaseSelectMessage: "Please select an assessment to view its analytics.",
        averageScore: "Average Score",
        hardestQuestion: "Hardest Question",
        easiestQuestion: "Easiest Question",
        questionAnalysis: "Question Analysis",
        performanceByTag: "Performance by Skill Tag",
        scoreDistribution: "Score Distribution",
        question: "Question",
        avgScore: "Avg Score",
        percentCorrect: "% Correct",
        aiInsight: "AI Insight",
        getAIInsight: "Get AI Insight",
        analyzing: "Analyzing...",
        numberOfCandidates: "Number of Candidates",
        loadingChart: "Loading chart...",
        uncategorized: "Uncategorized",
        na: "N/A",
        aiSummary: {
            title: "AI-Powered Assessment Summary",
            loading: "Generating AI summary...",
            performance: "Overall Performance",
            struggles: "Common Weaknesses",
            suggestions: "Training Suggestions"
        },
        barColor1: "#6366f1",
        barColor2: "#818cf8",
    },
    ar: {
        title: "المركز المؤسسي",
        skillLibrary: "مكتبة المهارات",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        performanceAnalytics: "تحليلات المرشحين",
        loadingExams: "جاري تحميل التقييمات...",
        selectExam: "اختر تقييمًا",
        noDataTitle: "لا توجد بيانات لعرضها",
        noResultsMessage: "لم يتم تقديم أي نتائج لهذا التقييم بعد.",
        pleaseSelectMessage: "يرجى تحديد تقييم لعرض تحليلاته.",
        averageScore: "متوسط الدرجات",
        hardestQuestion: "أصعب سؤال",
        easiestQuestion: "أسهل سؤال",
        questionAnalysis: "تحليل الأسئلة",
        performanceByTag: "الأداء حسب وسم المهارة",
        scoreDistribution: "توزيع الدرجات",
        question: "السؤال",
        avgScore: "متوسط الدرجة",
        percentCorrect: "٪ صحيح",
        aiInsight: "رؤية الذكاء الاصطناعي",
        getAIInsight: "احصل على رؤية الذكاء الاصطناعي",
        analyzing: "جاري التحليل...",
        numberOfCandidates: "عدد المرشحين",
        loadingChart: "جاري تحميل الرسم البياني...",
        uncategorized: "غير مصنف",
        na: "غير متاح",
        aiSummary: {
            title: "ملخص التقييم المدعوم بالذكاء الاصطناعي",
            loading: "جاري إنشاء ملخص الذكاء الاصطناعي...",
            performance: "الأداء العام",
            struggles: "نقاط الضعف الشائعة",
            suggestions: "اقتراحات التدريب"
        },
        barColor1: "#6366f1",
        barColor2: "#818cf8",
    },
};

const CorporateAnalyticsPage = () => {
    const { lang } = useLanguage();
    const t = translations[lang];
    
    const navLinks = [
        { path: '/corporate', icon: BriefcaseIcon, label: t.skillLibrary },
        { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/corporate/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.title}</h1>;

    return (
        <AnalyticsComponent
            userRole={UserRole.Corporate}
            getExamsApi={getCorporateExams}
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

export default CorporateAnalyticsPage;
