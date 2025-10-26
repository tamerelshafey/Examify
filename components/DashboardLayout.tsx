import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOutIcon, SunIcon, MoonIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDarkMode } from '../contexts/DarkModeContext';

interface NavLink {
  path: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface DashboardLayoutProps {
  navLinks: NavLink[];
  pageTitle?: string;
  children: ReactNode;
  sidebarHeader?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ navLinks, pageTitle, children, sidebarHeader }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const { theme } = useTheme();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const langSwitchText = lang === 'en' ? 'العربية' : 'English';
  const langSwitchCode = lang === 'en' ? 'AR' : 'EN';
  const logoutText = lang === 'en' ? 'Logout' : 'تسجيل الخروج';
  
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <nav className="w-64 bg-white dark:bg-slate-800 p-5 shadow-lg flex flex-col flex-shrink-0">
        {sidebarHeader ? sidebarHeader : <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName}</h1>}
        <ul>
          {navLinks.map(link => {
            const effectiveIsActive = link.isActive !== undefined ? link.isActive : location.pathname === link.path;
            const linkClasses = `flex items-center p-2 text-base font-normal rounded-lg ${effectiveIsActive ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`;

            const linkContent = (
              <>
                <link.icon className="w-6 h-6" />
                <span className="ms-3">{link.label}</span>
              </>
            );

            return (
              <li key={link.label} className="mb-4">
                {link.onClick ? (
                  <button onClick={link.onClick} className={`${linkClasses} w-full text-left`}>
                    {linkContent}
                  </button>
                ) : (
                  <Link to={link.path} className={linkClasses}>
                    {linkContent}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={toggleLang} title={langSwitchText} className="flex-grow flex items-center p-2 text-base font-normal rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-sm text-slate-500 dark:text-slate-400">{langSwitchCode}</div>
                <span className="ms-3">{langSwitchText}</span>
            </button>
            <button onClick={toggleDarkMode} title="Toggle Dark Mode" className="p-2 text-base font-normal rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                {isDarkMode ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
            </button>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={logout} className="flex items-center p-2 text-base font-normal rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 w-full">
              <LogOutIcon className="w-6 h-6" />
              <span className="ms-3">{logoutText}</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-10 overflow-x-auto">
        {pageTitle && <h2 className="text-3xl font-bold mb-8">{pageTitle}</h2>}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;