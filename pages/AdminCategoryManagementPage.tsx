
import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, addCategory, deleteCategory, addSubCategory, deleteSubCategory } from '../services/mockApi';
import { BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, ClipboardListIcon, TagIcon, TrashIcon, PlusCircleIcon, XCircleIcon } from '../components/icons';
import { useLanguage } from '../App';
import { useNotification } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const translations = {
    en: {
        title: "Admin",
        dashboard: "Dashboard",
        userManagement: "User Management",
        examManagement: "Exam Management",
        questionBank: "Question Bank",
        categoryManagement: "Category Management",
        settings: "Settings",
        pageTitle: "Manage Question Categories",
        pageDescription: "Add, remove, or edit the scientific categories (Sciences) and their sub-categories (Sections) used for organizing questions.",
        addCategory: "Add New Category",
        categoryName: "Category Name (e.g., Programming)",
        add: "Add",
        addSubCategory: "Add Sub-category",
        subCategoryName: "Sub-category name",
        confirmDeleteCategory: "Are you sure you want to delete this category and all its sub-categories? This cannot be undone.",
        confirmDeleteSubCategory: "Are you sure you want to delete this sub-category?",
    },
    ar: {
        title: "مسؤول",
        dashboard: "Dashboard",
        userManagement: "إدارة المستخدمين",
        examManagement: "إدارة الاختبارات",
        questionBank: "بنك الأسئلة",
        categoryManagement: "إدارة الفئات",
        settings: "الإعدادات",
        pageTitle: "إدارة فئات الأسئلة",
        pageDescription: "إضافة أو إزالة أو تعديل الفئات العلمية (العلوم) وفئاتها الفرعية (الأقسام) المستخدمة لتنظيم الأسئلة.",
        addCategory: "إضافة فئة جديدة",
        categoryName: "اسم الفئة (مثال: البرمجة)",
        add: "إضافة",
        addSubCategory: "إضافة قسم فرعي",
        subCategoryName: "اسم القسم الفرعي",
        confirmDeleteCategory: "هل أنت متأكد أنك تريد حذف هذه الفئة وجميع أقسامها الفرعية؟ لا يمكن التراجع عن هذا الإجراء.",
        confirmDeleteSubCategory: "هل أنت متأكد أنك تريد حذف هذا القسم الفرعي؟",
    }
};

const AdminCategoryManagementPage = () => {
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategories, setNewSubCategories] = useState<Record<string, string>>({});
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
    
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            addNotification('Failed to load categories.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await addCategory(newCategory.trim());
            addNotification(`Category "${newCategory.trim()}" added.`, 'success');
            setNewCategory('');
            fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    const handleDeleteCategory = async (categoryName: string) => {
        if (window.confirm(t.confirmDeleteCategory)) {
            try {
                await deleteCategory(categoryName);
                addNotification(`Category "${categoryName}" deleted.`, 'success');
                fetchCategories();
            } catch (error: any) {
                addNotification(error.message, 'error');
            }
        }
    };

    const handleAddSubCategory = async (e: React.FormEvent, categoryName: string) => {
        e.preventDefault();
        const subCategoryName = newSubCategories[categoryName]?.trim();
        if (!subCategoryName) return;
        try {
            await addSubCategory(categoryName, subCategoryName);
            addNotification(`Sub-category "${subCategoryName}" added to "${categoryName}".`, 'success');
            setNewSubCategories(prev => ({...prev, [categoryName]: ''}));
            fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    const handleDeleteSubCategory = async (categoryName: string, subCategoryName: string) => {
        if (window.confirm(t.confirmDeleteSubCategory)) {
            try {
                await deleteSubCategory(categoryName, subCategoryName);
                addNotification(`Sub-category "${subCategoryName}" deleted.`, 'success');
                fetchCategories();
            } catch (error: any) {
                addNotification(error.message, 'error');
            }
        }
    };

    const pageContent = () => {
      if (loading) {
        return <LoadingSpinner />;
      }
      return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t.addCategory}</h3>
                <form onSubmit={handleAddCategory} className="flex items-center gap-4">
                    <input 
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder={t.categoryName}
                        className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500"
                    />
                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5" /> {t.add}
                    </button>
                </form>
            </div>
            <div className="space-y-4">
                {Object.entries(categories).map(([name, subs]) => (
                    <div key={name} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{name}</h4>
                            <button onClick={() => handleDeleteCategory(name)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title={`Delete ${name}`}>
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-600 space-y-2">
                            {subs.map(sub => (
                                <div key={sub} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                                    <p className="text-slate-700 dark:text-slate-300">{sub}</p>
                                     <button onClick={() => handleDeleteSubCategory(name, sub)} className="p-1 text-slate-500 hover:text-red-500" title={`Delete ${sub}`}>
                                        <XCircleIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                             <form onSubmit={(e) => handleAddSubCategory(e, name)} className="flex items-center gap-2 pt-2">
                                <input 
                                    type="text"
                                    value={newSubCategories[name] || ''}
                                    onChange={(e) => setNewSubCategories(prev => ({...prev, [name]: e.target.value}))}
                                    placeholder={t.subCategoryName}
                                    className="flex-grow p-2 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500"
                                />
                                <button type="submit" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 text-sm rounded-lg">
                                    {t.add}
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
    }
  
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle=""
            sidebarHeader={
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                    <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                </h1>
            }
        >
             <div className="mb-8">
                <h2 className="text-3xl font-bold">{t.pageTitle}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.pageDescription}</p>
            </div>
            {pageContent()}
        </DashboardLayout>
    );
};

export default AdminCategoryManagementPage;
