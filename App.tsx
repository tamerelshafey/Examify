


import React, { useState, useEffect, createContext, useContext, useMemo, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, Language } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import DevRoleSwitcher from './components/DevRoleSwitcher';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
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
const OralExamPage = lazy(() => import('./pages/OralExamPage'));
const AIImportFromTextPage = lazy(() => import('./pages/AIImportFromTextPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

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
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route path="/teacher" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherDashboard /> : <Navigate to="/" />} />
                <Route path="/teacher/exams" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/import" element={isAuthenticated && userRole === UserRole.Teacher ? <AIImportFromTextPage /> : <Navigate to="/" />} />
                <Route path="/teacher/question-bank" element={isAuthenticated && userRole === UserRole.Teacher ? <QuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/teacher/checkout/:bankId" element={isAuthenticated && userRole === UserRole.Teacher ? <CheckoutPage /> : <Navigate to="/" />} />
                <Route path="/teacher/analytics" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherAnalyticsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/results" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamResultsPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/result/:resultId" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherExamineeResultPage /> : <Navigate to="/" />} />
                <Route path="/teacher/exam/:examId/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.Teacher ? <TeacherProctoringReportPage /> : <Navigate to="/" />} />
                
                <Route path="/examinee" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeDashboard /> : <Navigate to="/" />} />
                <Route path="/examinee/exam/:examId" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamTaker /> : <Navigate to="/" />} />
                <Route path="/examinee/result/:resultId" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeExamReviewPage /> : <Navigate to="/" />} />
                <Route path="/examinee/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.Examinee ? <ExamineeProctoringReportPage /> : <Navigate to="/" />} />
                <Route path="/examinee/oral-exam" element={isAuthenticated && userRole === UserRole.Examinee ? <OralExamPage /> : <Navigate to="/" />} />

                <Route path="/company" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyDashboard /> : <Navigate to="/" />} />
                <Route path="/company/exams" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamsPage /> : <Navigate to="/" />} />
                <Route path="/company/import" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <AIImportFromTextPage /> : <Navigate to="/" />} />
                <Route path="/company/question-bank" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyQuestionBankPage /> : <Navigate to="/" />} />
                <Route path="/company/checkout/:bankId" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <CheckoutPage /> : <Navigate to="/" />} />
                <Route path="/company/analytics" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyAnalyticsPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/results" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamResultsPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/result/:resultId" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyExamineeResultPage /> : <Navigate to="/" />} />
                <Route path="/company/exam/:examId/result/:resultId/proctoring" element={isAuthenticated && userRole === UserRole.TrainingCompany ? <TrainingCompanyProctoringReportPage /> : <Navigate to="/" />} />

                <Route path="/corporate" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateDashboard /> : <Navigate to="/" />} />
                <Route path="/corporate/assessments" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateAssessmentsPage /> : <Navigate to="/" />} />
                <Route path="/corporate/import" element={isAuthenticated && userRole === UserRole.Corporate ? <AIImportFromTextPage /> : <Navigate to="/" />} />
                <Route path="/corporate/question-bank" element={isAuthenticated && userRole === UserRole.Corporate ? <CorporateQuestionBankPage /> : <Navigate to="/" />} />
                 <Route path="/corporate/checkout/:bankId" element={isAuthenticated && userRole === UserRole.Corporate ? <CheckoutPage /> : <Navigate to="/" />} />
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