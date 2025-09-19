import React from 'react';
import { UserRole } from '../types';
import AnalyticsComponent from '../components/AnalyticsComponent';
import { 
    getTeacherExams, getExamDetails, getResultsForExam, getQuestionAnalysisWithAI, 
    getExamSummaryWithAI, predictStudentPerformance, generatePersonalizedLearningPath, getExamResultDetails 
} from '../services/mockApi';
import { useLanguage, useTheme } from '../App';
import { BookOpenIcon, BarChartIcon, ClipboardListIcon } from '../components/icons';

const translations = {
    en: {
        myExams: "My Exams",
        questionBank: "Question Bank",
        analytics: "Analytics",
        performanceAnalytics: "Performance Analytics",
        loadingExams: "Loading exams...",
        selectExam: "Select an exam",
        noDataTitle: "No Data to Display",
        noResultsMessage: "No results have been submitted for this exam yet.",
        pleaseSelectMessage: "Please select an exam to view its analytics.",
        averageScore: "Average Score",
        hardestQuestion: "Hardest Question",
        easiestQuestion: "Easiest Question",
        questionAnalysis: "Question Analysis",
        performanceByTag: "Performance by Tag",
        scoreDistribution: "Score Distribution",
        question: "Question",
        avgScore: "Avg Score",
        percentCorrect: "% Correct",
        aiInsight: "AI Insight",
        getAIInsight: "Get AI Insight",
        analyzing: "Analyzing...",
        numberOfStudents: "Number of Students",
        loadingChart: "Loading chart...",
        uncategorized: "Uncategorized",
        na: "N/A",
        aiSummary: {
            title: "AI-Powered Exam Summary",
            loading: "Generating AI summary...",
            performance: "Overall Performance",
            struggles: "Areas of Struggle",
            suggestions: "Suggestions for Improvement"
        },
        atRisk: {
            title: "Students at Risk",
            description: "AI-powered prediction of students who might need additional support based on their performance trends.",
            loading: "Analyzing student performance...",
            noStudents: "No students are currently flagged as high or medium risk. Great work!",
            viewPlan: "View Plan"
        },
        barColor1: "#3b82f6",
        barColor2: "#14b8a6",
    },
    ar: {
        myExams: "اختباراتي",
        questionBank: "بنك الأسئلة",
        analytics: "التحليلات",
        performanceAnalytics: "تحليلات الأداء",
        loadingExams: "جاري تحميل الاختبارات...",
        selectExam: "اختر اختبارًا",
        noDataTitle: "لا توجد بيانات لعرضها",
        noResultsMessage: "لم يتم تقديم أي نتائج لهذا الاختبار بعد.",
        pleaseSelectMessage: "يرجى تحديد اختبار لعرض تحليلاته.",
        averageScore: "متوسط الدرجات",
        hardestQuestion: "أصعب سؤال",
        easiestQuestion: "أسهل سؤال",
        questionAnalysis: "تحليل الأسئلة",
        performanceByTag: "الأداء حسب الوسم",
        scoreDistribution: "توزيع الدرجات",
        question: "السؤال",
        avgScore: "متوسط الدرجة",
        percentCorrect: "٪ صحيح",
        aiInsight: "رؤية الذكاء الاصطناعي",
        getAIInsight: "احصل على رؤية الذكاء الاصطناعي",
        analyzing: "جاري التحليل...",
        numberOfStudents: "عدد الطلاب",
        loadingChart: "جاري تحميل الرسم البياني...",
        uncategorized: "غير مصنف",
        na: "غير متاح",
        aiSummary: {
            title: "ملخص الاختبار المدعوم بالذكاء الاصطناعي",
            loading: "جاري إنشاء ملخص الذكاء الاصطناعي...",
            performance: "الأداء العام",
            struggles: "مجالات الصعوبة",
            suggestions: "اقتراحات للتحسين"
        },
        atRisk: {
            title: "الطلاب المعرضون للخطر",
            description: "تنبؤ مدعوم بالذكاء الاصطناعي للطلاب الذين قد يحتاجون إلى دعم إضافي بناءً على اتجاهات أدائهم.",
            loading: "جاري تحليل أداء الطلاب...",
            noStudents: "لا يوجد حاليًا أي طلاب مصنفين على أنهم معرضون لخطر كبير أو متوسط. عمل رائع!",
            viewPlan: "عرض الخطة"
        },
        barColor1: "#3b82f6",
        barColor2: "#14b8a6",
    },
};

const TeacherAnalyticsPage = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const t = translations[lang];

    const pageTitle = {
        ...t,
        title: `${theme.platformName} Teacher`
    }
    
    const navLinks = [
        { path: '/teacher', icon: BookOpenIcon, label: t.myExams },
        { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.questionBank },
        { path: '/teacher/analytics', icon: BarChartIcon, label: t.analytics },
    ];

    const sidebarHeader = <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{pageTitle.title}</h1>;

    return (
        <AnalyticsComponent
            userRole={UserRole.Teacher}
            getExamsApi={getTeacherExams}
            getExamDetailsApi={getExamDetails}
            getResultsForExamApi={getResultsForExam}
            getQuestionAnalysisApi={getQuestionAnalysisWithAI}
            getExamSummaryApi={getExamSummaryWithAI}
            predictStudentPerformanceApi={predictStudentPerformance}
            generateLearningPathApi={generatePersonalizedLearningPath}
            getExamResultDetailsApi={getExamResultDetails}
            navLinks={navLinks}
            sidebarHeader={sidebarHeader}
            translations={t}
        />
    );
};

export default TeacherAnalyticsPage;
