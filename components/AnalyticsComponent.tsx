import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Exam, ExamResult, Question, Answer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChartIcon, DownloadIcon, SparklesIcon, SpinnerIcon, LightbulbIcon, InboxIcon } from './icons';
import { analyzeExamResultsWithAI } from '../services/ai';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const translations = {
    en: {
        title: "Analytics Overview",
        loadingExams: "Loading exams...",
        loadingAnalytics: "Loading analytics data...",
        allExams: "All Exams",
        selectExam: "Select an exam to analyze",
        totalSubmissions: "Total Submissions",
        averageScore: "Average Score",
        passRate: "Pass Rate (>=70%)",
        highestScore: "Highest Score",
        lowestScore: "Lowest Score",
        scoreDistribution: "Score Distribution",
        questionPerformance: "Question Performance",
        question: "Question",
        correct: "Correct",
        incorrect: "Incorrect",
        avgScore: "Avg. Score",
        exportPDF: "Export PDF",
        exportCSV: "Export CSV",
        analyzeAI: "Analyze with AI",
        analyzing: "Analyzing...",
        aiAnalysis: "AI Analysis",
        noExams: "No exams found for this user.",
        noResults: "No results submitted for this exam yet.",
    },
    ar: {
        title: "نظرة عامة على التحليلات",
        loadingExams: "جاري تحميل الاختبارات...",
        loadingAnalytics: "جاري تحميل بيانات التحليلات...",
        allExams: "كل الاختبارات",
        selectExam: "اختر اختبارًا لتحليله",
        totalSubmissions: "إجمالي التقديمات",
        averageScore: "متوسط الدرجات",
        passRate: "معدل النجاح (>=70%)",
        highestScore: "أعلى درجة",
        lowestScore: "أدنى درجة",
        scoreDistribution: "توزيع الدرجات",
        questionPerformance: "أداء الأسئلة",
        question: "السؤال",
        correct: "صحيح",
        incorrect: "غير صحيح",
        avgScore: "متوسط الدرجة",
        exportPDF: "تصدير PDF",
        exportCSV: "تصدير CSV",
        analyzeAI: "تحليل بالذكاء الاصطناعي",
        analyzing: "جاري التحليل...",
        aiAnalysis: "تحليل الذكاء الاصطناعي",
        noExams: "لم يتم العثور على اختبارات لهذا المستخدم.",
        noResults: "لم يتم تقديم أي نتائج لهذا الاختبار بعد.",
    }
};

interface AnalyticsData {
    keyMetrics: {
        totalSubmissions: number;
        averageScore: number;
        passRate: number;
        highestScore: number;
        lowestScore: number;
    };
    scoreDistribution: { name: string; count: number }[];
    questionPerformance: {
        text: string;
        correctCount: number;
        incorrectCount: number;
        correctPercentage: number;
    }[];
}

interface AnalyticsComponentProps {
    userRole: UserRole;
    getExamsApi: () => Promise<Omit<Exam, 'questions'>[]>;
    getResultsForExamApi: (examId: string) => Promise<ExamResult[]>;
    getExamDetailsApi: (examId: string) => Promise<Exam | undefined>;
}

const isAnswerCorrect = (question: Question, userAnswer: Answer): boolean => {
    // This is a simplified version. A real app might have more complex logic.
    if (userAnswer === undefined || userAnswer === null) return false;
    if (Array.isArray(question.correctAnswer)) {
        if (!Array.isArray(userAnswer)) return false;
        return JSON.stringify([...question.correctAnswer].sort()) === JSON.stringify([...userAnswer].sort());
    }
    return String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
};

const AnalyticsComponent: React.FC<AnalyticsComponentProps> = ({ userRole, getExamsApi, getResultsForExamApi, getExamDetailsApi }) => {
    const { lang } = useLanguage();
    const t = translations[lang];
    const reportRef = useRef<HTMLDivElement>(null);

    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('all');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            setLoadingExams(true);
            try {
                const examsList = await getExamsApi();
                setExams(examsList);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            } finally {
                setLoadingExams(false);
            }
        };
        fetchExams();
    }, [getExamsApi]);

    useEffect(() => {
        const processAnalytics = async () => {
            if (exams.length === 0) return;

            setLoadingAnalytics(true);
            setAnalyticsData(null);
            setAiAnalysis(null);

            try {
                let results: ExamResult[] = [];
                let examDetails: Exam | undefined;

                if (selectedExamId === 'all') {
                    const allResults = await Promise.all(exams.map(exam => getResultsForExamApi(exam.id)));
                    results = allResults.flat();
                } else {
                    [examDetails, results] = await Promise.all([
                        getExamDetailsApi(selectedExamId),
                        getResultsForExamApi(selectedExamId)
                    ]);
                }

                if (results.length === 0) {
                    setLoadingAnalytics(false);
                    return;
                }
                
                // Key Metrics
                const scores = results.map(r => (r.score / r.totalPoints) * 100);
                const totalSubmissions = results.length;
                const averageScore = scores.reduce((a, b) => a + b, 0) / totalSubmissions;
                const passRate = (scores.filter(s => s >= 70).length / totalSubmissions) * 100;
                const highestScore = Math.max(...scores);
                const lowestScore = Math.min(...scores);
                
                // Score Distribution
                const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
                    name: `${i * 10}-${i * 10 + 10}%`,
                    count: 0,
                }));
                scores.forEach(score => {
                    const index = Math.min(Math.floor(score / 10), 9);
                    scoreDistribution[index].count++;
                });

                // Question Performance
                let questionPerformance: AnalyticsData['questionPerformance'] = [];
                if (examDetails) {
                    questionPerformance = examDetails.questions.map(q => {
                        let correctCount = 0;
                        results.forEach(r => {
                            if (isAnswerCorrect(q, r.answers[q.id])) {
                                correctCount++;
                            }
                        });
                        return {
                            text: q.text,
                            correctCount: correctCount,
                            incorrectCount: totalSubmissions - correctCount,
                            correctPercentage: (correctCount / totalSubmissions) * 100,
                        };
                    });
                }
                
                setAnalyticsData({
                    keyMetrics: { totalSubmissions, averageScore, passRate, highestScore, lowestScore },
                    scoreDistribution,
                    questionPerformance,
                });

            } catch (error) {
                console.error("Failed to process analytics:", error);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        processAnalytics();
    }, [selectedExamId, exams, getResultsForExamApi, getExamDetailsApi]);
    
    const handleAnalyzeWithAI = async () => {
        if (!analyticsData) return;
        setIsAiLoading(true);
        setAiAnalysis(null);
        try {
            const examTitle = selectedExamId === 'all' ? 'All Exams' : exams.find(e => e.id === selectedExamId)?.title || 'Selected Exam';
            const { analysis } = await analyzeExamResultsWithAI({
                examTitle,
                keyMetrics: analyticsData.keyMetrics,
                questionPerformance: analyticsData.questionPerformance
            });
            setAiAnalysis(analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const exportToPDF = () => {
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;
        if (reportRef.current) {
            html2canvas(reportRef.current, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`analytics_report_${selectedExamId}.pdf`);
            });
        }
    };

    const exportToCSV = () => {
        if (!analyticsData || analyticsData.questionPerformance.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Question,Correct Count,Incorrect Count,Correct Percentage\n";
        
        analyticsData.questionPerformance.forEach(row => {
            const escapedText = `"${row.text.replace(/"/g, '""')}"`;
            csvContent += [escapedText, row.correctCount, row.incorrectCount, `${row.correctPercentage.toFixed(1)}%`].join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `question_performance_${selectedExamId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (loadingExams) {
        return <LoadingSpinner />;
    }
    if (exams.length === 0) {
        return <EmptyState icon={BarChartIcon} title={t.noExams} message="" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                    <option value="all">{t.allExams}</option>
                    {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                </select>
                <div className="flex gap-2">
                    <button onClick={exportToPDF} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-lg">
                        <DownloadIcon className="w-4 h-4" /> {t.exportPDF}
                    </button>
                    {selectedExamId !== 'all' && (
                        <button onClick={exportToCSV} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-lg">
                           <DownloadIcon className="w-4 h-4" /> {t.exportCSV}
                        </button>
                    )}
                </div>
            </div>
            
            <div ref={reportRef} className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                {loadingAnalytics && <div className="text-center py-10"><LoadingSpinner /></div>}
                
                {!loadingAnalytics && !analyticsData && <EmptyState icon={InboxIcon} title={t.noResults} message="" />}

                {analyticsData && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><p className="text-sm text-slate-500">{t.totalSubmissions}</p><p className="text-2xl font-bold">{analyticsData.keyMetrics.totalSubmissions}</p></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><p className="text-sm text-slate-500">{t.averageScore}</p><p className="text-2xl font-bold">{analyticsData.keyMetrics.averageScore.toFixed(1)}%</p></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><p className="text-sm text-slate-500">{t.passRate}</p><p className="text-2xl font-bold">{analyticsData.keyMetrics.passRate.toFixed(1)}%</p></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><p className="text-sm text-slate-500">{t.highestScore}</p><p className="text-2xl font-bold text-green-500">{analyticsData.keyMetrics.highestScore.toFixed(1)}%</p></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><p className="text-sm text-slate-500">{t.lowestScore}</p><p className="text-2xl font-bold text-red-500">{analyticsData.keyMetrics.lowestScore.toFixed(1)}%</p></div>
                        </div>

                        {/* Score Distribution Chart */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">{t.scoreDistribution}</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData.scoreDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none' }} />
                                        <Bar dataKey="count" fill="var(--color-primary-500, #3b82f6)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Question Performance Table */}
                        {analyticsData.questionPerformance.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">{t.questionPerformance}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                            <tr>
                                                <th className="px-6 py-3">{t.question}</th>
                                                <th className="px-6 py-3 text-center">{t.correct}</th>
                                                <th className="px-6 py-3 text-center">{t.incorrect}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.questionPerformance.map((q, i) => (
                                                <tr key={i} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-md truncate">{q.text}</td>
                                                    <td className="px-6 py-4 text-center text-green-600">{q.correctPercentage.toFixed(1)}% ({q.correctCount})</td>
                                                    <td className="px-6 py-4 text-center text-red-600">{(100 - q.correctPercentage).toFixed(1)}% ({q.incorrectCount})</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* AI Analysis Section */}
            {analyticsData && (
                 <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-500/30">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300 flex items-center gap-2"><LightbulbIcon className="w-5 h-5"/>{t.aiAnalysis}</h3>
                         <button onClick={handleAnalyzeWithAI} disabled={isAiLoading} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50">
                            {isAiLoading ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                            {isAiLoading ? t.analyzing : t.analyzeAI}
                        </button>
                     </div>
                     {isAiLoading && <div className="mt-4 text-center"><SpinnerIcon className="w-6 h-6 mx-auto text-primary-500"/></div>}
                     {aiAnalysis && (
                         <div className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm">
                            {aiAnalysis}
                         </div>
                     )}
                 </div>
            )}
        </div>
    );
};

export default AnalyticsComponent;