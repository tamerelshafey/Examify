

import React, { useState, useEffect, createContext, useContext, useMemo, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import DevRoleSwitcher from './components/DevRoleSwitcher';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const ExamineeDashboard = lazy(() => import('./pages/ExamineeDashboard'));
const ExamTaker = lazy(() => import('./pages/ExamTaker'));
const TrainingCompanyDashboard = lazy(() => import('./pages/TrainingCompanyDashboard'));
const CorporateDashboard = lazy(() => import('./pages/CorporateDashboard'));
const QuestionBankPage = lazy(() => import('./pages/QuestionBankPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUserManagementPage = lazy(() => import('./pages/AdminUserManagementPage'));
const TeacherExamResultsPage = lazy(() => import('./pages/TeacherExamResultsPage'));
const ExamineeExamReviewPage = lazy(() => import('./pages/ExamineeExamReviewPage'));
const TeacherExamineeResultPage = lazy(() => import('./pages/TeacherExamineeResultPage'));
const CorporateExamResultsPage = lazy(() => import('./pages/CorporateExamResultsPage'));
const CorporateExamineeResultPage = lazy(() => import('./pages/CorporateExamineeResultPage'));
const TrainingCompanyExamResultsPage = lazy(() => import('./pages/TrainingCompanyExamResultsPage'));
const TrainingCompanyExamineeResultPage = lazy(() => import('./pages/TrainingCompanyExamineeResultPage'));
const TeacherProctoringReportPage = lazy(() => import('./pages/TeacherProctoringReportPage'));
const CorporateProctoringReportPage = lazy(() => import('./pages/CorporateProctoringReportPage'));
const TrainingCompanyProctoringReportPage = lazy(() => import('./pages/TrainingCompanyProctoringReportPage'));
const TeacherAnalyticsPage = lazy(() => import('./pages/TeacherAnalyticsPage'));
const AdminExamManagementPage = lazy(() => import('./pages/AdminExamManagementPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const CorporateAnalyticsPage = lazy(() => import('./pages/CorporateAnalyticsPage'));
const TrainingCompanyAnalyticsPage = lazy(() => import('./pages/TrainingCompanyAnalyticsPage'));
const AdminQuestionBankPage = lazy(() => import('./pages/AdminQuestionBankPage'));
const AdminCategoryManagementPage = lazy(() => import('./pages/AdminCategoryManagementPage'));
const ExamineeProctoringReportPage = lazy(() => import('./pages/ExamineeProctoringReportPage'));
const CorporateQuestionBankPage = lazy(() => import('./pages/CorporateQuestionBankPage'));
const TrainingCompanyQuestionBankPage = lazy(() => import('./pages/TrainingCompanyQuestionBankPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TeacherExamsPage = lazy(() => import('./pages/TeacherExamsPage'));
const CorporateAssessmentsPage = lazy(() => import('./pages/CorporateAssessmentsPage'));
const TrainingCompanyExamsPage = lazy(() => import('./pages/TrainingCompanyExamsPage'));


export type Language = 'en' | 'ar';

// --- THEME CONTEXT & PROVIDER ---
// Helper to manipulate hex color lightness for generating shades
const adjustColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, c => ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
};

// Helper to convert hex to an RGB object for use in rgba()
const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};


interface Theme {
  primaryColor: string;
  platformName: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3b82f6', // Default: blue-500
    platformName: 'Examify',
  });

  const themeStyles = useMemo(() => {
    const p500 = theme.primaryColor;
    const p600 = adjustColor(p500, -20);
    const p700 = adjustColor(p500, -40);
    const p400 = adjustColor(p500, 20);
    const p100 = adjustColor(p500, 180);
    const p800 = adjustColor(p500, -60);
    const p900 = adjustColor(p500, -80);
    const rgb = hexToRgb(p500);

    return `
      .bg-primary-100 { background-color: ${p100}; }
      .text-primary-800 { color: ${p800}; }
      .bg-primary-500 { background-color: ${p500}; }
      .hover\\:bg-primary-600:hover { background-color: ${p600}; }
      .text-primary-500 { color: ${p500}; }
      .text-primary-600 { color: ${p600}; }
      .hover\\:text-primary-500:hover { color: ${p500}; }
      .dark\\:text-primary-400 { color: ${p400}; }
      .border-primary-500 { border-color: ${p500}; }
      .focus\\:ring-primary-500:focus { --tw-ring-color: ${p500}; }
      .focus\\:border-primary-500:focus { border-color: ${p500}; }
      .from-primary-600 { --tw-gradient-from: ${p600} var(--tw-gradient-from-position); --tw-gradient-to: rgba(255, 255, 255, 0) var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
      .from-primary-700 { --tw-gradient-from: ${p700} var(--tw-gradient-from-position); --tw-gradient-to: rgba(255, 255, 255, 0) var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
      .to-primary-400 { --tw-gradient-to: ${p400} var(--tw-gradient-to-position); }
      .to-primary-900 { --tw-gradient-to: ${p900} var(--tw-gradient-to-position); }
      ${rgb ? `.hover\\:shadow-primary-500\\/50:hover { --tw-shadow-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5); --tw-shadow: var(--tw-shadow-colored); }` : ''}
    `;
  }, [theme.primaryColor]);

  useEffect(() => {
    const styleTagId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleTagId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleTagId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = themeStyles;
  }, [themeStyles]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- LANGUAGE CONTEXT & PROVIDER ---
export const LanguageContext = createContext<{ lang: Language; toggleLang: () => void; } | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');
  
  const toggleLang = () => {
    setLang(prevLang => prevLang === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const FullPageLoader = () => (
    <div className="flex justify-center items-center h-screen w-screen bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner />
    </div>
);

// --- APP CONTENT ---
function AppContent() {
  const { userRole, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { lang } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${theme.platformName} - AI-Powered Exam Platform`;
  }, [lang, theme.platformName]);

  return (
    <HashRouter>
        <Suspense fallback={<FullPageLoader />}>
            <Routes>
                <Route path="/" element={
                userRole === UserRole.Teacher ? <Navigate to="/teacher" /> :
                userRole === UserRole.Examinee ? <Navigate to="/examinee" /> :
                userRole === UserRole.TrainingCompany ? <Navigate to="/company" /> :
                userRole === UserRole.Corporate ? <Navigate to="/corporate" /> :
                userRole === UserRole.Admin ? <Navigate to="/admin" /> :
                <LandingPage />
                } />
                
                {/* Public Routes */}
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Protected Routes */}
                <Route path="/teacher" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherDashboard /> : <Navigate to="/" />} />
                <Route path="/teacher/exams" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/question-bank" element={isAuthenticated && userRole === UserRole.Teacher ? <QuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/teacher/analytics" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherAnalyticsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/results" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamResultsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/result/:resultId" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamineeResultPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherProctoringReportPage /> : <Navigate to="/" />} />
                
                <Route path="/examinee" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeDashboard /> : <Navigate to="/" />} />
                <Route path="/examinee/exam/:examId" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamTaker /> : <Navigate to="/" />} />
                <Route path="/examinee/result/:resultId" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeExamReviewPage /> : <Navigate to="/" />} />
                <Route path="/examinee/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeProctoringReportPage /> : <Navigate to="/" />} />

                <Route path="/company" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyDashboard /> : <Navigate to="/" />} />
                <Route path="/company/exams" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamsPage /> : <Navigate to="/" />} />
                <Route path="/company/question-bank" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyQuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/company/analytics" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyAnalyticsPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/results" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamResultsPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/result/:resultId" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamineeResultPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyProctoringReportPage /> : <Navigate to="/" />} />

                <Route path="/corporate" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateDashboard /> : <Navigate to="/" />} />
                <Route path="/corporate/assessments" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateAssessmentsPage /> : <Navigate to="/" />} />
                <Route path="/corporate/question-bank" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateQuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/corporate/analytics" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateAnalyticsPage /> : <Navigate to="/" />} />
                <Route path="/corporate/exam/:examId/results" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateExamResultsPage /> : <Navigate to="/" />} />
                <Route path="/corporate/exam/:examId/result/:resultId" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateExamineeResultPage /> : <Navigate to="/" />} />
                <Route path="/corporate/exam/:examId/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateProctoringReportPage /> : <Navigate to="/" />} />

                <Route path="/admin" element={isAuthenticated && userRole === UserRole.Admin ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/admin/users" element={isAuthenticated && userRole === UserRole.Admin ? <AdminUserManagementPage /> : <Navigate to="/" />} />
                <Route path="/admin/exams" element={isAuthenticated && userRole === UserRole.Admin ? <AdminExamManagementPage /> : <Navigate to="/" />} />
                <Route path="/admin/question-bank" element={isAuthenticated && userRole === UserRole.Admin ? <AdminQuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/admin/categories" element={isAuthenticated && userRole === UserRole.Admin ? <AdminCategoryManagementPage /> : <Navigate to="/" />} />
                <Route path="/admin/settings" element={isAuthenticated && userRole === UserRole.Admin ? <AdminSettingsPage /> : <Navigate to="/" />} />
            </Routes>
        </Suspense>
      <DevRoleSwitcher />
    </HashRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DarkModeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </DarkModeProvider>
    </ThemeProvider>
  )
}

export default App;