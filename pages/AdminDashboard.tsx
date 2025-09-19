
import React, { useState, useEffect } from 'react';
import { getPlatformAnalytics } from '../services/mockApi';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, CheckCircleIcon, ClipboardListIcon, TagIcon } from '../components/icons';
import { Language, useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        platformOverview: "Platform Overview",
        loading: "Loading analytics...",
        totalUsers: "Total Users",
        totalExams: "Total Exams",
        totalQuestions: "Total Questions",
        quickActions: "Quick Actions",
        quickActionsDesc: "Further admin functionalities like user management and system settings will be available here in future updates."
    },
    ar: {
        title: "مسؤول",
        dashboard: "لوحة التحكم",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        platformOverview: "نظرة عامة على المنصة",
        loading: "جاري تحميل التحليلات...",
        totalUsers: "إجمالي المستخدمين",
        totalExams: "إجمالي الاختبارات",
        totalQuestions: "إجمالي الأسئلة",
        quickActions: "الإجراءات السريعة",
        quickActionsDesc: "ستتوفر وظائف إدارية إضافية مثل إدارة المستخدمين وإعدادات النظام هنا في التحديثات المستقبلية."
    }
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalExams: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const t = translations[lang];

  const navLinks = [
    { path: '/admin', icon: BarChartIcon, label: t.dashboard },
    { path: '/admin/users', icon: UsersIcon, label: t.userManagement },
    { path: '/admin/exams', icon: BookOpenIcon, label: t.examManagement },
    { path: '/admin/question-bank', icon: ClipboardListIcon, label: t.questionBank },
    { path: '/admin/categories', icon: TagIcon, label: t.categoryManagement },
    { path: '/admin/settings', icon: SettingsIcon, label: t.settings },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getPlatformAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch platform analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  
  const StatCard = ({ icon: Icon, title, value, colorClass }: { icon: React.FC<any>, title: string, value: number, colorClass: string }) => (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
          <div className={`p-3 rounded-full ${lang === 'ar' ? 'ms-4' : 'me-4'} ${colorClass}`}>
              <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          </div>
      </div>
  );

  return (
    <DashboardLayout
      navLinks={navLinks}
      pageTitle={t.platformOverview}
      sidebarHeader={
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
            <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
        </h1>
      }
    >
      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={UsersIcon} title={t.totalUsers} value={analytics.totalUsers} colorClass="bg-blue-500" />
          <StatCard icon={BookOpenIcon} title={t.totalExams} value={analytics.totalExams} colorClass="bg-teal-500" />
          <StatCard icon={CheckCircleIcon} title={t.totalQuestions} value={analytics.totalQuestions} colorClass="bg-purple-500" />
        </div>
      )}
      
      <div className="mt-12 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">{t.quickActions}</h3>
          <p className="text-slate-600 dark:text-slate-400">
              {t.quickActionsDesc}
          </p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
