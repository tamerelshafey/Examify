
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExamineeExams, getExamineeResults } from '../services/mockApi';
import { Exam, ExamResult } from '../types';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, UsersIcon, BarChartIcon, TrendingUpIcon, EyeIcon, ShieldCheckIcon, InboxIcon, PlusCircleIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';


const translations = {
    en: {
        availableExams: "Available Exams",
        myResults: "My Results",
        startExam: "Start Exam",
        minutes: "minutes",
        questions: "questions",
        welcome: "Welcome back, Fatima!",
        examsCompleted: "Exams Completed",
        averageScore: "Average Score",
        bestScore: "Best Score",
        examTitle: "Exam Title",
        score: "Score",
        percentage: "Percentage",
        dateSubmitted: "Date Submitted",
        actions: "Actions",
        viewDetails: "View Details",
        viewProctoring: "View Proctoring Report",
        noResultsTitle: "No Results Yet",
        noResultsMessage: "You haven't completed any exams yet. Go to 'Available Exams' to get started.",
        noExamsTitle: "No Available Exams",
        noExamsMessage: "There are no available exams for you at the moment. Please check back later.",
    },
    ar: {
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        startExam: "ابدأ الاختبار",
        minutes: "دقيقة",
        questions: "أسئلة",
        welcome: "مرحباً بعودتك، فاطمة!",
        examsCompleted: "الاختبارات المكتملة",
        averageScore: "متوسط الدرجات",
        bestScore: "أفضل درجة",
        examTitle: "عنوان الاختبار",
        score: "الدرجة",
        percentage: "النسبة المئوية",
        dateSubmitted: "تاريخ الإرسال",
        actions: "الإجراءات",
        viewDetails: "عرض التفاصيل",
        viewProctoring: "عرض تقرير المراقبة",
        noResultsTitle: "لا توجد نتائج بعد",
        noResultsMessage: "لم تكمل أي اختبارات بعد. انتقل إلى 'الاختبارات المتاحة' للبدء.",
        noExamsTitle: "لا توجد اختبارات متاحة",
        noExamsMessage: "لا توجد اختبارات متاحة لك في الوقت الحالي. يرجى التحقق مرة أخرى لاحقًا.",
    }
}

const StatCard = ({ icon: Icon, title, value, colorClass, suffix='' }: { icon: React.FC<any>, title: string, value: string | number, colorClass: string, suffix?: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full me-4 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}{suffix}</p>
        </div>
    </div>
);


const ExamineeDashboard = () => {
  const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { lang } = useLanguage();
  
  const t = {
    ...translations[lang],
    title: `${theme.platformName} Portal`
  };
  
  const navLinks = [
      { 
        path: '#',
        label: t.availableExams,
        icon: BookOpenIcon,
        onClick: () => setActiveTab('exams'),
        isActive: activeTab === 'exams',
      },
      { 
        path: '#',
        label: t.myResults,
        icon: CheckCircleIcon,
        onClick: () => setActiveTab('results'),
        isActive: activeTab === 'results',
      },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [examsData, resultsData] = await Promise.all([
            getExamineeExams(),
            getExamineeResults("user-2") // Mock user ID
        ]);
        setExams(examsData);
        setResults(resultsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const completedCount = results.length;
    if (completedCount === 0) {
        return { completed: 0, average: 0, best: 0 };
    }
    const totalPercentage = results.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0);
    const averageScore = totalPercentage / completedCount;
    const bestScore = Math.max(...results.map(r => (r.score / r.totalPoints) * 100));
    return {
        completed: completedCount,
        average: averageScore.toFixed(1),
        best: bestScore.toFixed(1)
    };
  }, [results]);

  const startExam = (examId: string) => {
    navigate(`/examinee/exam/${examId}`);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  const pageContent = () => {
    if (loading) return <LoadingSpinner />;
    
    const renderAvailableExams = () => {
        if (exams.length === 0) {
            return <EmptyState icon={InboxIcon} title={t.noExamsTitle} message={t.noExamsMessage} />;
        }
        return (
            <div className="space-y-4">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center justify-between transition-shadow hover:shadow-lg">
                        <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{exam.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exam.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-300">
                            <span className="flex items-center"><ClockIcon className="w-4 h-4 me-1"/> {exam.duration} {t.minutes}</span>
                            <span className="flex items-center"><UsersIcon className="w-4 h-4 me-1"/> {exam.questionCount} {t.questions}</span>
                            <span className={`font-semibold px-2 py-1 rounded-full text-xs ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {exam.difficulty}
                            </span>
                        </div>
                        </div>
                        <button 
                        onClick={() => startExam(exam.id)}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                        {t.startExam}
                        </button>
                    </div>
                ))}
            </div>
        );
    };
    
    const renderMyResults = () => {
        if (results.length === 0) {
            return <EmptyState 
                icon={InboxIcon} 
                title={t.noResultsTitle} 
                message={t.noResultsMessage} 
                action={<button onClick={() => setActiveTab('exams')} className="text-primary-500 font-semibold">{t.availableExams}</button>}
            />;
        }
        return (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t.examTitle}</th>
                            <th scope="col" className="px-6 py-3">{t.score}</th>
                            <th scope="col" className="px-6 py-3">{t.percentage}</th>
                            <th scope="col" className="px-6 py-3">{t.dateSubmitted}</th>
                            <th scope="col" className="px-6 py-3">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(result => {
                            const percentage = Math.round((result.score / result.totalPoints) * 100);
                            return (
                                <tr key={result.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.examTitle}</td>
                                    <td className="px-6 py-4">{result.score} / {result.totalPoints}</td>
                                    <td className={`px-6 py-4 font-bold ${getPerformanceColor(percentage)}`}>
                                        {percentage}%
                                    </td>
                                    <td className="px-6 py-4">{result.submittedAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => navigate(`/examinee/result/${result.id}`)} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewDetails}>
                                          <EyeIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => navigate(`/examinee/result/${result.id}/proctoring`)} className="p-2 inline-block text-primary-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewProctoring}>
                                          <ShieldCheckIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={CheckCircleIcon} title={t.examsCompleted} value={stats.completed} colorClass="bg-primary-500" />
                <StatCard icon={BarChartIcon} title={t.averageScore} value={stats.average} suffix="%" colorClass="bg-blue-500" />
                <StatCard icon={TrendingUpIcon} title={t.bestScore} value={stats.best} suffix="%" colorClass="bg-purple-500" />
            </div>
            
            <h3 className="text-2xl font-bold mb-4">{activeTab === 'exams' ? t.availableExams : t.myResults}</h3>

            {activeTab === 'exams' ? renderAvailableExams() : renderMyResults()}
        </div>
    );
  }

  return (
    <DashboardLayout
      navLinks={navLinks}
      pageTitle={t.welcome}
      sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.title}</h1>}
    >
      {pageContent()}
    </DashboardLayout>
  );
};

export default ExamineeDashboard;
