
import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/mockApi';
import { User, UserRole } from '../types';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, EditIcon, TrashIcon, ClipboardListIcon, TagIcon } from '../components/icons';
import { useLanguage } from '../App';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        table: {
            name: "Name",
            email: "Email",
            role: "Role",
            joinedOn: "Joined On",
            actions: "Actions"
        },
        roles: {
            [UserRole.Admin]: "Admin",
            [UserRole.Teacher]: "Teacher",
            [UserRole.Examinee]: "Examinee",
            [UserRole.Corporate]: "Corporate",
            [UserRole.TrainingCompany]: "Training Company",
        },
        noUsersTitle: "No Users Found",
        noUsersMessage: "There are no users on the platform yet.",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        table: {
            name: "الاسم",
            email: "البريد الإلكتروني",
            role: "الدور",
            joinedOn: "تاريخ الانضمام",
            actions: "الإجراءات"
        },
        roles: {
            [UserRole.Admin]: "مسؤول",
            [UserRole.Teacher]: "معلم",
            [UserRole.Examinee]: "طالب",
            [UserRole.Corporate]: "شركة",
            [UserRole.TrainingCompany]: "شركة تدريب",
        },
        noUsersTitle: "لم يتم العثور على مستخدمين",
        noUsersMessage: "لا يوجد مستخدمون على المنصة بعد.",
    }
};

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
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

    const roleColors: Record<UserRole, string> = {
        [UserRole.Teacher]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [UserRole.Corporate]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        [UserRole.TrainingCompany]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        [UserRole.Admin]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [UserRole.Examinee]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const pageContent = () => {
      if (loading) {
        return <LoadingSpinner />;
      }
      if (users.length === 0) {
        return <EmptyState icon={UsersIcon} title={t.noUsersTitle} message={t.noUsersMessage} />;
      }
      return (
        <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                <tr>
                    <th scope="col" className="px-6 py-3">{t.table.name}</th>
                    <th scope="col" className="px-6 py-3">{t.table.email}</th>
                    <th scope="col" className="px-6 py-3">{t.table.role}</th>
                    <th scope="col" className="px-6 py-3">{t.table.joinedOn}</th>
                    <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${roleColors[user.role]}`}>
                                {t.roles[user.role]}
                            </span>
                        </td>
                        <td className="px-6 py-4">{user.createdAt.toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex items-center space-x-2">
                            <button className="p-2 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><EditIcon className="w-4 h-4"/></button>
                            <button className="p-2 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4"/></button>
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
            pageTitle={t.userManagement}
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

export default AdminUserManagementPage;
