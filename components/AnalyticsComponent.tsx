import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { SparklesIcon, LightbulbIcon, TrendingDownIcon, SpinnerIcon, BarChartIcon, AlertTriangleIcon, EyeIcon } from './icons';
import { Language, useLanguage } from '../App';
import { Exam, ExamResult, Question, StudentRiskProfile, LearningPath, UserRole } from '../types';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ViewLearningPathModal from './ViewLearningPathModal';

interface AnalyticsComponentProps {
    userRole: UserRole;
    getExamsApi: () => Promise<Omit<Exam, 'questions'>[]>;
    getExamDetailsApi: (id: string) => Promise<Exam | undefined>;
    getResultsForExamApi: (id: string) => Promise<ExamResult[]>;
    getQuestionAnalysisApi: (params: { question: Question; results: ExamResult[] }) => Promise<{ insight: string }>;
    getExamSummaryApi: (params: { examTitle: string; results: ExamResult[] }) => Promise<{ summary: string; struggles: string; suggestions: string }>;
    predictStudentPerformanceApi?: () => Promise<StudentRiskProfile[]>;
    generateLearningPathApi?: (params: { exam: Exam, result: ExamResult }) => Promise<LearningPath>;
    getExamResultDetailsApi?: (resultId: string) => Promise<{ result: ExamResult, exam: Exam } | null>;
    navLinks: any[];
    sidebarHeader: ReactNode;
    translations: any;
}

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
    </div>
);

type SummaryData = { summary: string; struggles: string; suggestions: string };

const AIExamSummaryCard = ({ summary, loading, lang, t }: { summary: SummaryData | null, loading: boolean, lang: Language, t: any }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 mb-8 flex items-center justify-center">
                <SpinnerIcon className="w-6 h-6 text-primary-500 me-3" />
                <p className="text-slate-600 dark:text-slate-300 font-semibold">{t.aiSummary.loading}</p>
            </div>
        );
    }
    if (!summary) return null;

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100"><SparklesIcon className="w-6 h-6 me-2 text-primary-500"/>{t.aiSummary.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold flex items-center text-slate-600 dark:text-slate-300"><BarChartIcon className="w-5 h-5 me-2 text-teal-500"/>{t.aiSummary.performance}</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic">"{summary.summary}"</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold flex items-center text-slate-600 dark:text-slate-300"><TrendingDownIcon className="w-5 h-5 me-2 text-red-500"/>{t.aiSummary.struggles}</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic">"{summary.struggles}"</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold flex items-center text-slate-600 dark:text-slate-300"><LightbulbIcon className="w-5 h-5 me-2 text-yellow-500"/>{t.aiSummary.suggestions}</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic">"{summary.suggestions}"</p>
                </div>
            </div>
        </div>
    );
};

const AnalyticsComponent: React.FC<AnalyticsComponentProps> = ({
    userRole,
    getExamsApi,
    getExamDetailsApi,
    getResultsForExamApi,
    getQuestionAnalysisApi,
    getExamSummaryApi,
    predictStudentPerformanceApi,
    generateLearningPathApi,
    getExamResultDetailsApi,
    navLinks,
    sidebarHeader,
    translations: t,
}) => {
    const { lang } = useLanguage();
    const Recharts = (window as any).Recharts;
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts || {};
    
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [examDetails, setExamDetails] = useState<Exam | null>(null);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [aiInsights, setAiInsights] = useState<Record<string, { loading: boolean; insight: string | null; error: string | null }>>({});
    const [atRiskStudents, setAtRiskStudents] = useState<StudentRiskProfile[]>([]);
    const [loadingAtRisk, setLoadingAtRisk] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ studentName: string; examTitle: string; learningPath: LearningPath | null; isLoading: boolean; error: string | null }>({ studentName: '', examTitle: '', learningPath: null, isLoading: false, error: null });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoadingExams(true);
                if (predictStudentPerformanceApi) setLoadingAtRisk(true);
                
                const promises: Promise<any>[] = [getExamsApi()];
                if (predictStudentPerformanceApi) {
                    promises.push(predictStudentPerformanceApi());
                }

                const [examsData, atRiskData] = await Promise.all(promises);
                
                setExams(examsData);
                if(atRiskData) setAtRiskStudents(atRiskData);

            } catch (error) {
                console.error("Failed to fetch initial analytics data:", error);
            } finally {
                setLoadingExams(false);
                if (predictStudentPerformanceApi) setLoadingAtRisk(false);
            }
        };
        fetchInitialData();
    }, [getExamsApi, predictStudentPerformanceApi]);

     useEffect(() => {
        if (selectedExamId) {
            const fetchExamData = async () => {
                try {
                    setLoadingResults(true);
                    setLoadingSummary(true);
                    setAiInsights({});
                    setSummary(null);
                    const [details, examResults] = await Promise.all([
                        getExamDetailsApi(selectedExamId),
                        getResultsForExamApi(selectedExamId),
                    ]);
                    setExamDetails(details || null);
                    setResults(examResults);

                    if (details && examResults.length > 0) {
                        const summaryData = await getExamSummaryApi({ examTitle: details.title, results: examResults });
                        setSummary(summaryData);
                    }
                } catch (error) {
                    console.error("Failed to fetch exam data:", error);
                } finally {
                    setLoadingResults(false);
                    setLoadingSummary(false);
                }
            };
            fetchExamData();
        } else {
            setResults([]);
            setExamDetails(null);
        }
    }, [selectedExamId, getExamDetailsApi, getResultsForExamApi, getExamSummaryApi]);

    const handleGetInsight = async (question: Question) => {
        setAiInsights(prev => ({ ...prev, [question.id]: { loading: true, insight: null, error: null } }));
        try {
            const res = await getQuestionAnalysisApi({ question, results });
            setAiInsights(prev => ({ ...prev, [question.id]: { loading: false, insight: res.insight, error: null } }));
        } catch (error: any) {
            setAiInsights(prev => ({ ...prev, [question.id]: { loading: false, insight: null, error: error.message || "An error occurred" } }));
        }
    };

    const handleViewLearningPath = async (student: StudentRiskProfile) => {
        if (!student.lastResultId || !getExamResultDetailsApi || !generateLearningPathApi) return;
        
        setModalData({ studentName: student.examineeName, examTitle: '', learningPath: null, isLoading: true, error: null });
        setIsModalOpen(true);
        
        try {
            const resultDetails = await getExamResultDetailsApi(student.lastResultId);
            if (!resultDetails) throw new Error("Could not find student's last result.");
            
            setModalData(prev => ({...prev, examTitle: resultDetails.exam.title}));
            
            const path = await generateLearningPathApi({ exam: resultDetails.exam, result: resultDetails.result });
            setModalData(prev => ({...prev, learningPath: path, isLoading: false}));
        } catch (err: any) {
            setModalData(prev => ({...prev, isLoading: false, error: err.message}));
        }
    };
    
    const examAnalytics = useMemo(() => {
        if (!examDetails || results.length === 0) {
            return {
                averageScore: 0,
                hardestQuestion: t.na,
                easiestQuestion: t.na,
                questionPerformance: [],
                tagPerformance: [],
                scoreDistribution: [],
            };
        }

        const questionPerformance = examDetails.questions.map(q => {
            const questionResults = results.map(r => {
                const answer = r.answers[q.id];
                const isCorrect = JSON.stringify(answer)?.toLowerCase() === JSON.stringify(q.correctAnswer)?.toLowerCase();
                return isCorrect ? q.points : 0;
            });
            const averageScore = questionResults.reduce((sum, score) => sum + score, 0) / results.length;
            const percentCorrect = (questionResults.filter(s => s > 0).length / results.length) * 100;
            return { id: q.id, text: q.text, question: q, averageScore, percentCorrect };
        });
        
        const sortedByPerf = [...questionPerformance].sort((a, b) => a.averageScore - b.averageScore);
        const hardestQuestion = sortedByPerf[0]?.text || t.na;
        const easiestQuestion = sortedByPerf[sortedByPerf.length - 1]?.text || t.na;

        const tagPerformanceMap: Record<string, { totalScore: number, totalPoints: number, count: number }> = {};
        examDetails.questions.forEach(q => {
            const tags = q.tags && q.tags.length > 0 ? q.tags : [t.uncategorized];
            tags.forEach(tag => {
                if (!tagPerformanceMap[tag]) {
                    tagPerformanceMap[tag] = { totalScore: 0, totalPoints: 0, count: 0 };
                }
                const questionScores = results.map(r => {
                    const answer = r.answers[q.id];
                    const isCorrect = JSON.stringify(answer)?.toLowerCase() === JSON.stringify(q.correctAnswer)?.toLowerCase();
                    return isCorrect ? q.points : 0;
                });
                tagPerformanceMap[tag].totalScore += questionScores.reduce((sum, s) => sum + s, 0);
                tagPerformanceMap[tag].totalPoints += q.points * results.length;
            });
        });

        const tagPerformance = Object.entries(tagPerformanceMap).map(([tag, data]) => ({
            name: tag,
            avg: (data.totalScore / data.totalPoints) * 100
        }));

        const scoreDistribution = results.reduce((acc, result) => {
            const percentage = (result.score / result.totalPoints) * 100;
            const bin = Math.floor(percentage / 10) * 10;
            const binName = `${bin}-${bin + 10}%`;
            acc[binName] = (acc[binName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedScoreDistribution = Object.entries(scoreDistribution)
            .map(([name, count]) => ({ name, count }))
            .sort((a,b) => parseInt(a.name) - parseInt(b.name));

        return {
            averageScore: (results.reduce((acc, r) => acc + r.score, 0) / (results.length * examDetails.questions.reduce((sum, q) => sum + q.points, 0))) * 100,
            hardestQuestion,
            easiestQuestion,
            questionPerformance,
            tagPerformance,
            scoreDistribution: sortedScoreDistribution,
        };
    }, [results, examDetails, t.na, t.uncategorized]);

    const renderQuestionAnalysis = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t.question}</th>
                        <th scope="col" className="px-6 py-3">{t.avgScore}</th>
                        <th scope="col" className="px-6 py-3">{t.percentCorrect}</th>
                        <th scope="col" className="px-6 py-3">{t.aiInsight}</th>
                    </tr>
                </thead>
                <tbody>
                    {examAnalytics.questionPerformance.map(q => {
                        const insightState = aiInsights[q.id];
                        return(
                            <tr key={q.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-md truncate">{q.text}</td>
                                <td className="px-6 py-4">{q.averageScore.toFixed(2)} / {q.question.points}</td>
                                <td className="px-6 py-4">{q.percentCorrect.toFixed(1)}%</td>
                                <td className="px-6 py-4">
                                    {!insightState ? (
                                        <button onClick={() => handleGetInsight(q.question)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                                            <SparklesIcon className="w-3 h-3"/> {t.getAIInsight}
                                        </button>
                                    ) : insightState.loading ? (
                                        <span className="text-xs">{t.analyzing}</span>
                                    ) : insightState.error ? (
                                        <span className="text-xs text-red-500">{insightState.error}</span>
                                    ) : (
                                        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                            <LightbulbIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5"/> 
                                            <p className="italic">"{insightState.insight}"</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
    
    const renderTagPerformance = () => (
        <div className="h-96">
            {Recharts ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examAnalytics.tagPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff' }}/>
                        <Legend />
                        <Bar dataKey="avg" fill={t.barColor1 || "#3b82f6"} name={t.averageScore} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <p>{t.loadingChart}</p>}
        </div>
    );

    const renderScoreDistribution = () => (
         <div className="h-96">
            {Recharts ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examAnalytics.scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff' }}/>
                        <Legend />
                        <Bar dataKey="count" fill={t.barColor2 || "#14b8a6"} name={t.numberOfStudents || t.numberOfCandidates || t.numberOfTrainees} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <p>{t.loadingChart}</p>}
        </div>
    );

    const renderAtRiskStudents = () => {
        if (userRole !== UserRole.Teacher) return null;

        const riskColors = {
            high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        };

        return (
            <div className="mt-12">
                 <h3 className="text-2xl font-bold mb-2 flex items-center"><AlertTriangleIcon className="w-6 h-6 me-3 text-yellow-500"/>{t.atRisk.title}</h3>
                 <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-3xl">{t.atRisk.description}</p>
                 {loadingAtRisk ? (
                     <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                         <SpinnerIcon className="w-6 h-6 text-primary-500 me-3" />
                         <p>{t.atRisk.loading}</p>
                     </div>
                 ) : atRiskStudents.length === 0 ? (
                     <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                         <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{t.atRisk.noStudents}</h3>
                     </div>
                 ) : (
                     <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {atRiskStudents.map(student => (
                                <li key={student.examineeId} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{student.examineeName}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">"{student.justification}"</p>
                                        </div>
                                        <div className="flex items-center gap-4 ms-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskColors[student.riskLevel]}`}>{student.riskLevel}</span>
                                            {student.hasGeneratedLearningPath && (
                                                <button 
                                                    onClick={() => handleViewLearningPath(student)} 
                                                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    {t.atRisk.viewPlan}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                navLinks={navLinks}
                pageTitle=""
                sidebarHeader={sidebarHeader}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">{t.performanceAnalytics}</h2>
                    <select
                        value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500"
                        disabled={loadingExams}
                    >
                        <option value="">{loadingExams ? t.loadingExams : t.selectExam}</option>
                        {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                    </select>
                </div>
                {loadingResults ? <LoadingSpinner /> :
                 !selectedExamId || results.length === 0 ? (
                    <div>
                        <EmptyState 
                            icon={BarChartIcon}
                            title={t.noDataTitle}
                            message={selectedExamId ? t.noResultsMessage : t.pleaseSelectMessage}
                        />
                        {renderAtRiskStudents()}
                    </div>
                 ) : (
                    <>
                    <AIExamSummaryCard summary={summary} loading={loadingSummary} lang={lang} t={t} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard title={t.averageScore} value={`${examAnalytics.averageScore.toFixed(1)}%`} />
                        <StatCard title={t.hardestQuestion} value={examAnalytics.hardestQuestion} />
                        <StatCard title={t.easiestQuestion} value={examAnalytics.easiestQuestion} />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('questions')} className={`${activeTab === 'questions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {t.questionAnalysis}
                                </button>
                                <button onClick={() => setActiveTab('tags')} className={`${activeTab === 'tags' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {t.performanceByTag}
                                </button>
                                 <button onClick={() => setActiveTab('distribution')} className={`${activeTab === 'distribution' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {t.scoreDistribution}
                                </button>
                            </nav>
                        </div>
                        {activeTab === 'questions' && renderQuestionAnalysis()}
                        {activeTab === 'tags' && renderTagPerformance()}
                        {activeTab === 'distribution' && renderScoreDistribution()}
                    </div>
                    {renderAtRiskStudents()}
                    </>
                 )}
            </DashboardLayout>
            <ViewLearningPathModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studentName={modalData.studentName}
                examTitle={modalData.examTitle}
                learningPath={modalData.learningPath}
                isLoading={modalData.isLoading}
                error={modalData.error}
                lang={lang}
            />
        </>
    );
};

export default AnalyticsComponent;
