

import React, { useState, useEffect } from 'react';
import { getAllExamsForAdmin, deleteExamAsAdmin } from '../services/api';
import { Exam, UserRole } from '../types';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, EyeIcon, TrashIcon, ClipboardListIcon, TagIcon } from '../components/icons';
// Fix: Import useLanguage from its context file.
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

type AdminExam = Omit<Exam, 'questions'> & { createdBy: UserRole };

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        confirmDelete: (title: string) => `Are you sure you want to delete the exam "${title}"? This action cannot be undone.`,
        deleteSuccess: "Exam deleted successfully.",
        deleteError: "Failed to delete exam.",
        table: {
            title: "Title",
            createdBy: "Created By",
            questions: "Questions",
            difficulty: "Difficulty",
            actions: "Actions"
        },
        roles: {
            [UserRole.Teacher]: "Teacher",
            [UserRole.Corporate]: "Corporate",
            [UserRole.TrainingCompany]: "Training Co.",
            [UserRole.Admin]: "Admin",
            [UserRole.Examinee]: "Examinee",
        },
        noExamsTitle: "No Exams Found",
        noExamsMessage: "There are currently no exams created on the platform.",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        confirmDelete: (title: string) => `هل أنت متأكد من أنك تريد حذف اختبار "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        deleteSuccess: "تم حذف الاختبار بنجاح.",
        deleteError: "فشل حذف الاختبار.",
        table: {
            title: "العنوان",
            createdBy: "تم إنشاؤه بواسطة",
            questions: "الأسئلة",
            difficulty: "الصعوبة",
            actions: "الإجراءات"
        },
        roles: {
            [UserRole.Teacher]: "معلم",
            [UserRole.Corporate]: "شركة",
            [UserRole.TrainingCompany]: "شركة تدريب",
            [UserRole.Admin]: "مسؤول",
            [UserRole.Examinee]: "طالب",
        },
        noExamsTitle: "لم يتم العثور على اختبارات",
        noExamsMessage: "لا توجد حاليًا اختبارات تم إنشاؤها على المنصة.",
    }
};

const AdminExamManagementPage = () => {
    const [exams, setExams] = useState<AdminExam[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
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

    // Fix: Completed the roleColors object to satisfy the Record<UserRole, string> type.
    const roleColors: Record<UserRole, string> = {
        [UserRole.Teacher]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [UserRole.Corporate]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        [UserRole.TrainingCompany]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        [UserRole.Admin]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [UserRole.Examinee]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await getAllExamsForAdmin();
            setExams(data);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
            addNotification("Failed to load exams.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async (examId: string, title: string) => {
        if (window.confirm(t.confirmDelete(title))) {
            try {
                await deleteExamAsAdmin(examId);
                addNotification(t.deleteSuccess, "success");
                await fetchExams(); // Re-fetch exams list
            } catch (error) {
                console.error("Failed to delete exam:", error);
                addNotification(t.deleteError, "error");
            }
        }
    };

    const pageContent = () => {
        if (loading) return <LoadingSpinner />;
        if (exams.length === 0) return <EmptyState icon={BookOpenIcon} title={t.noExamsTitle} message={t.noExamsMessage} />;
        return (
            <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t.table.title}</th>
                        <th scope="col" className="px-6 py-3">{t.table.createdBy}</th>
                        <th scope="col" className="px-6 py-3">{t.table.questions}</th>
                        <th scope="col" className="px-6 py-3">{t.table.difficulty}</th>
                        <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map(exam => (
                        <tr key={exam.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{exam.title}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${roleColors[exam.createdBy]}`}>
                                    {t.roles[exam.createdBy]}
                                </span>
                            </td>
                            <td className="px-6 py-4">{exam.questionCount}</td>
                            <td className="px-6 py-4">{exam.difficulty}</td>
                            <td className="px-6 py-4 flex items-center space-x-2">
                                <button className="p-2 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><EyeIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(exam.id, exam.title)} className="p-2 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
  
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle={t.examManagement}
            sidebarHeader={
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                    <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                </h1>
            }
        >
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                {pageContent()}
            </div>
        </DashboardLayout>
    );
};

export default AdminExamManagementPage;