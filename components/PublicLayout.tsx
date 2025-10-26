import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserRole } from '../types';
import { BookOpenIcon, SunIcon, MoonIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';

const translations = {
    en: {
        features: "Features",
        pricing: "Pricing",
        aboutUs: "About Us",
        login: "Login / Sign Up",
        footerRights: "All Rights Reserved.",
        footerProject: "A project demonstrating modern web application development.",
        langSwitch: "العربية",
    },
    ar: {
        features: "الميزات",
        pricing: "الأسعار",
        aboutUs: "من نحن",
        login: "تسجيل الدخول / اشتراك",
        footerRights: "جميع الحقوق محفوظة.",
        footerProject: "مشروع يوضح تطوير تطبيقات الويب الحديثة.",
        langSwitch: "English",
    }
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    const { lang, toggleLang } = useLanguage();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const t = translations[lang];

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500' : ''}`;


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-primary-500"/>
                        <span className={`text-2xl font-bold ${lang === 'ar' ? 'mr-2' : 'ml-2'}`}>{theme.platformName}</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                         <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <NavLink to="/features" className={navLinkClasses}>{t.features}</NavLink>
                            <NavLink to="/pricing" className={navLinkClasses}>{t.pricing}</NavLink>
                            <NavLink to="/about" className={navLinkClasses}>{t.aboutUs}</NavLink>
                        </nav>
                         <button onClick={toggleLang} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
                            {t.langSwitch}
                        </button>
                         <button onClick={toggleDarkMode} className="text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
                            {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                        </button>
                         <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                         <Link to="/login" className="hidden md:block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                            {t.login}
                         </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500 dark:text-slate-400">
                     <p>&copy; {new Date().getFullYear()} {theme.platformName}. {t.footerRights}</p>
                     <p className="text-sm mt-1">{t.footerProject}</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;