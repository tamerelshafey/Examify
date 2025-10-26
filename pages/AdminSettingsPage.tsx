import React, { useState } from 'react';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, ClipboardListIcon, TagIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
        systemSettings: "System Settings",
        branding: "Branding & Appearance",
        brandingDesc: "Customize the look and feel of the platform.",
        platformName: "Platform Name",
        primaryColor: "Primary Color",
        saveSettings: "Save Settings",
        settingsSaved: "Settings saved successfully!",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        systemSettings: "إعدادات النظام",
        branding: "العلامة التجارية والمظهر",
        brandingDesc: "تخصيص شكل وأسلوب المنصة.",
        platformName: "اسم المنصة",
        primaryColor: "اللون الأساسي",
        saveSettings: "حفظ الإعدادات",
        settingsSaved: "تم حفظ الإعدادات بنجاح!",
    }
};

const SettingSection = ({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">{description}</p>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            {children}
        </div>
    </div>
);

const AdminSettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const [localTheme, setLocalTheme] = useState(theme);
    const [showSuccess, setShowSuccess] = useState(false);
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
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setTheme(localTheme);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };
  
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle={t.systemSettings}
            sidebarHeader={
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                    <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                </h1>
            }
        >
            <div className="space-y-6 max-w-2xl">
                <SettingSection title={t.branding} description={t.brandingDesc}>
                     <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="platformName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.platformName}</label>
                            <input 
                                type="text"
                                id="platformName"
                                value={localTheme.platformName}
                                onChange={(e) => setLocalTheme(t => ({...t, platformName: e.target.value}))}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.primaryColor}</label>
                             <div className="mt-1 flex items-center gap-2">
                                 <input 
                                    type="color"
                                    id="primaryColor"
                                    value={localTheme.primaryColor}
                                    onChange={(e) => setLocalTheme(t => ({...t, primaryColor: e.target.value}))}
                                    className="p-1 h-10 w-10 block bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                                />
                                <span className="font-mono text-sm p-2 bg-slate-100 dark:bg-slate-900 rounded">{localTheme.primaryColor}</span>
                             </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                {t.saveSettings}
                            </button>
                            {showSuccess && <p className="text-sm text-green-600 dark:text-green-400">{t.settingsSaved}</p>}
                        </div>
                     </form>
                </SettingSection>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettingsPage;