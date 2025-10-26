import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getTeacherDashboardStats, getCorporateDashboardStats, getTrainingCompanyDashboardStats, getRecentActivity } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChartIcon, BookOpenIcon, SparklesIcon, ClipboardListIcon, AlertTriangleIcon, CheckCircleIcon, UsersIcon, BriefcaseIcon, BuildingIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const translations = {
    en: {
        teacher: {
            welcome: "Welcome back, Ali!",
            welcomeDesc: "Here's a quick overview of your activity.",
            stat1: "Total Exams",
            stat2: "Average Score",
            stat3: "Students At Risk",
            action1: "Create New Exam",
            action2: "Generate with AI",
            action3: "Question Bank",
            action4: "View Analytics",
            quickActions: "Quick Actions",
        },
        corporate: {
            welcome: "Welcome, Innovate Corp.!",
            welcomeDesc: "Here's a summary of your assessment activities.",
            stat1: "Total Assessments",
            stat2: "Average Pass Rate",
            stat3: "Candidates Assessed",
            action1: "Create New Assessment",
            action2: "Generate with AI",
            action3: "Question Bank",
            action4: "View Analytics",
            quickActions: "Quick Actions",
        },
        company: {
            welcome: "Welcome, Future Skills!",
            welcomeDesc: "Here's an overview of your training center.",
            stat1: "Total Courses",
            stat2: "Avg. Completion",
            stat3: "Active Trainees",
            action1: "Create New Exam",
            action2: "Generate with AI",
            action3: "Question Bank",
            action4: "View Analytics",
            quickActions: "Quick Actions",
        },
        common: {
            recentActivity: "Recent Activity",
            noActivity: "No recent activity to show.",
        }
    },
    ar: {
        teacher: {
            welcome: "مرحباً بعودتك، علي!",
            welcomeDesc: "إليك نظرة سريعة على نشاطك.",
            stat1: "إجمالي الاختبارات",
            stat2: "متوسط الدرجات",
            stat3: "طلاب في خطر",
            action1: "إنشاء اختبار جديد",
            action2: "إنشاء بالذكاء الاصطناعي",
            action3: "بنك الأسئلة",
            action4: "عرض التحليلات",
            quickActions: "إجراءات سريعة",
        },
        corporate: {
            welcome: "أهلاً، Innovate Corp.!",
            welcomeDesc: "إليك ملخص أنشطة التقييم الخاصة بك.",
            stat1: "إجمالي التقييمات",
            stat2: "متوسط معدل النجاح",
            stat3: "مرشحون تم تقييمهم",
            action1: "إنشاء تقييم جديد",
            action2: "إنشاء بالذكاء الاصطناعي",
            action3: "بنك الأسئلة",
            action4: "عرض التحليلات",
            quickActions: "إجراءات سريعة",
        },
        company: {
            welcome: "أهلاً، Future Skills!",
            welcomeDesc: "إليك نظرة عامة على مركز التدريب الخاص بك.",
            stat1: "إجمالي الدورات",
            stat2: "متوسط الإكمال",
            stat3: "المتدربون النشطون",
            action1: "إنشاء اختبار جديد",
            action2: "إنشاء بالذكاء الاصطناعي",
            action3: "بنك الأسئلة",
            action4: "عرض التحليلات",
            quickActions: "إجراءات سريعة",
        },
        common: {
            recentActivity: "النشاط الأخير",
            noActivity: "لا يوجد نشاط حديث لعرضه.",
        }
    }
};

const StatCard = ({ title, value, icon: Icon, colorClass, suffix = '' }: any) => (
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

const ActionCard = ({ title, icon: Icon, onClick }: any) => (
     <button onClick={onClick} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    </button>
);


const DashboardHomeComponent: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { lang } = useLanguage();
    const navigate = useNavigate();
    
    // Fallback to teacher if role is not one of the main dashboard roles
    const validRole = [UserRole.Teacher, UserRole.Corporate, UserRole.TrainingCompany].includes(userRole) ? userRole : UserRole.Teacher;
    const t = { ...translations[lang].common, ...translations[lang][validRole] };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                let statsPromise;
                if (userRole === UserRole.Teacher) {
                    statsPromise = getTeacherDashboardStats();
                } else if (userRole === UserRole.Corporate) {
                    statsPromise = getCorporateDashboardStats();
                } else if (userRole === UserRole.TrainingCompany) {
                    statsPromise = getTrainingCompanyDashboardStats();
                } else {
                    statsPromise = Promise.resolve(null); // Default case
                }

                const [statsData, activityData] = await Promise.all([
                    statsPromise,
                    getRecentActivity(userRole)
                ]);

                setStats(statsData);
                setActivities(activityData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userRole]);
    
    const handleQuickAction = (action: string) => {
        const basePaths: { [key in UserRole]?: string } = {
            [UserRole.Teacher]: 'teacher',
            [UserRole.Corporate]: 'corporate',
            [UserRole.TrainingCompany]: 'company',
        };
        const basePath = basePaths[userRole];
        if (!basePath) return;

        const examPath = userRole === UserRole.Corporate ? 'assessments' : 'exams';

        switch (action) {
            case 'new_exam': navigate(`/${basePath}/${examPath}`); break;
            case 'ai_exam': navigate(`/${basePath}/${examPath}`); break;
            case 'bank': navigate(`/${basePath}/question-bank`); break;
            case 'analytics': navigate(`/${basePath}/analytics`); break;
        }
    };

    const renderStats = () => {
        if (!stats) return null;

        switch (userRole) {
            case UserRole.Teacher:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t.stat1} value={stats.totalExams} icon={BookOpenIcon} colorClass="bg-primary-500" />
                        <StatCard title={t.stat2} value={stats.averageScore} suffix="%" icon={BarChartIcon} colorClass="bg-teal-500" />
                        <StatCard title={t.stat3} value={stats.atRiskStudents} icon={AlertTriangleIcon} colorClass="bg-red-500" />
                    </div>
                );
            case UserRole.Corporate:
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t.stat1} value={stats.totalAssessments} icon={BriefcaseIcon} colorClass="bg-primary-500" />
                        <StatCard title={t.stat2} value={stats.averagePassRate} suffix="%" icon={CheckCircleIcon} colorClass="bg-teal-500" />
                        <StatCard title={t.stat3} value={stats.candidatesAssessed} icon={UsersIcon} colorClass="bg-indigo-500" />
                    </div>
                );
            case UserRole.TrainingCompany:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title={t.stat1} value={stats.totalCourses} icon={BuildingIcon} colorClass="bg-primary-500" />
                        <StatCard title={t.stat2} value={stats.averageCompletion} suffix="%" icon={BarChartIcon} colorClass="bg-teal-500" />
                        <StatCard title={t.stat3} value={stats.activeTrainees} icon={UsersIcon} colorClass="bg-purple-500" />
                    </div>
                );
            default: return null;
        }
    };
    
    const actionIcons: { [key in UserRole]?: React.FC<any> } = {
        [UserRole.Teacher]: BookOpenIcon,
        [UserRole.Corporate]: BriefcaseIcon,
        [UserRole.TrainingCompany]: BuildingIcon,
    };
    const ActionIcon = actionIcons[userRole] || BookOpenIcon;

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t.welcome}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.welcomeDesc}</p>
            </div>

            {renderStats()}
            
            <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t.quickActions}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <ActionCard title={t.action1} icon={ActionIcon} onClick={() => handleQuickAction('new_exam')} />
                    <ActionCard title={t.action2} icon={SparklesIcon} onClick={() => handleQuickAction('ai_exam')} />
                    <ActionCard title={t.action3} icon={ClipboardListIcon} onClick={() => handleQuickAction('bank')} />
                    <ActionCard title={t.action4} icon={BarChartIcon} onClick={() => handleQuickAction('analytics')} />
                </div>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t.recentActivity}</h3>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    {activities.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center">{t.noActivity}</p>
                    ) : (
                        <ul className="space-y-4">
                            {activities.map(activity => (
                               <li key={activity.id} className="flex items-center">
                                   <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 p-2 rounded-full me-4">
                                       <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                   </div>
                                   <div>
                                       <p className="text-sm text-slate-700 dark:text-slate-300">{activity.description}</p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400">{activity.relativeTime}</p>
                                   </div>
                               </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeComponent;