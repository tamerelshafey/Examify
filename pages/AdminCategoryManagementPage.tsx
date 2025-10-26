import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    addTopLevelCategory, deleteTopLevelCategory, addSpecializedCategory, deleteSpecializedCategory, 
    addFieldOfStudy, deleteFieldOfStudy, getStructuredCategories, updateTopLevelCategory, 
    updateSpecializedCategory, updateFieldOfStudy, updateCategoryStructure 
} from '../services/api';
import { 
    BarChartIcon, BookOpenIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, ClipboardListIcon, 
    TagIcon, TrashIcon, PlusCircleIcon, XCircleIcon, EditIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon 
} from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
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
        pageDescription: "Drag and drop to reorder. Add, remove, or edit the hierarchical categories for organizing questions.",
        addTopLevel: "Add Top-level Category",
        topLevelName: "Top-level Name (e.g., Educational Stages)",
        addSpecialized: "Add Specialized Category",
        specializedName: "Specialized Name (e.g., Primary Education)",
        addField: "Add Field of Study",
        fieldName: "Field Name (e.g., First Grade)",
        add: "Add",
        save: "Save",
        confirmDeleteTop: "Are you sure? This will delete the top-level category and ALL specialized categories and fields within it. Associated questions will be uncategorized.",
        confirmDeleteSpecialized: "Are you sure? This will delete the specialized category and ALL fields within it. Associated questions will be uncategorized.",
        confirmDeleteField: "Are you sure you want to delete this field of study? Associated questions will have this field removed.",
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
        pageDescription: "قم بالسحب والإفلات لإعادة الترتيب. يمكنك إضافة أو إزالة أو تعديل الفئات الهرمية لتنظيم الأسئلة.",
        addTopLevel: "إضافة فئة عليا جديدة",
        topLevelName: "اسم الفئة العليا (مثال: المراحل الدراسية)",
        addSpecialized: "إضافة فئة متخصصة",
        specializedName: "اسم الفئة المتخصصة (مثال: المرحلة الابتدائية)",
        addField: "إضافة مجال تخصص",
        fieldName: "اسم مجال التخصص (مثال: الصف الأول الابتدائي)",
        add: "إضافة",
        save: "حفظ",
        confirmDeleteTop: "هل أنت متأكد؟ سيؤدي هذا إلى حذف الفئة العليا وجميع الفئات المتخصصة والمجالات بداخلها. ستصبح الأسئلة المرتبطة غير مصنفة.",
        confirmDeleteSpecialized: "هل أنت متأكد؟ سيؤدي هذا إلى حذف الفئة المتخصصة وجميع المجالات بداخلها. ستصبح الأسئلة المرتبطة غير مصنفة.",
        confirmDeleteField: "هل أنت متأكد أنك تريد حذف مجال التخصص هذا؟ ستتم إزالة هذا المجال من الأسئلة المرتبطة.",
    }
};

type EditingState = { type: 'top' | 'specialized' | 'field'; id: string; } | null;
type DraggedItem = { type: 'top' | 'specialized' | 'field'; name: string; parentName?: string; grandParentName?: string };

const DropIndicator = () => <div className="h-1 my-1 w-full bg-primary-500 rounded-full" />;

const AdminCategoryManagementPage = () => {
    const [categories, setCategories] = useState<Record<string, Record<string, string[]>>>({});
    const [loading, setLoading] = useState(true);
    const [newTopLevel, setNewTopLevel] = useState('');
    const [newSpecialized, setNewSpecialized] = useState<Record<string, string>>({});
    const [newField, setNewField] = useState<Record<string, string>>({});
    const [editing, setEditing] = useState<EditingState>(null);
    const [editValue, setEditValue] = useState('');
    const [collapsedTop, setCollapsedTop] = useState<Record<string, boolean>>({});
    const [dropIndicator, setDropIndicator] = useState<{ id: string; index: number } | null>(null);
    const draggedItem = useRef<DraggedItem | null>(null);

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
            const data = await getStructuredCategories();
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

    const toggleTopLevel = (name: string) => {
        setCollapsedTop(prev => ({ ...prev, [name]: !prev[name] }));
    };
    
    const handleDragStart = (e: React.DragEvent, item: DraggedItem) => {
        draggedItem.current = item;
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLElement).classList.add('opacity-50', 'bg-slate-200', 'dark:bg-slate-600');
    };

    const handleDragOver = (e: React.DragEvent, id: string, itemsCount: number) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const dropZoneHeight = rect.height;
        const itemHeight = itemsCount > 0 ? dropZoneHeight / itemsCount : dropZoneHeight;
        let index = Math.floor(y / itemHeight);
        index = Math.max(0, Math.min(itemsCount, index));
        setDropIndicator({ id, index });
    };

    const handleDrop = async (e: React.DragEvent, dropZoneId: string, allowedDropType: 'top' | 'specialized' | 'field' | 'root') => {
        e.preventDefault();
        if (!draggedItem.current || !dropIndicator) {
            setDropIndicator(null);
            return;
        }

        const dragged = draggedItem.current;
        const { id, index } = dropIndicator;
        setDropIndicator(null);

        if(id.startsWith(dragged.name)) {
             draggedItem.current = null;
             return;
        }
        
        const dropIsValid = (dragged.type === 'top' && allowedDropType === 'root') ||
                            (dragged.type === 'specialized' && allowedDropType === 'top') ||
                            (dragged.type === 'field' && allowedDropType === 'specialized');

        if (!dropIsValid) {
            draggedItem.current = null;
            return;
        }

        const newCategories = JSON.parse(JSON.stringify(categories));
        
        try {
            if (dragged.type === 'top') {
                const itemData = newCategories[dragged.name];
                delete newCategories[dragged.name];
                let entries = Object.entries(newCategories);
                entries.splice(index, 0, [dragged.name, itemData]);
                await updateCategoryStructure(Object.fromEntries(entries) as Record<string, Record<string, string[]>>);
            } else if (dragged.type === 'specialized' && dragged.parentName) {
                const targetTopLevel = dropZoneId;
                const itemData = newCategories[dragged.parentName][dragged.name];
                delete newCategories[dragged.parentName][dragged.name];
                
                let entries = Object.entries(newCategories[targetTopLevel]);
                entries.splice(index, 0, [dragged.name, itemData]);
                newCategories[targetTopLevel] = Object.fromEntries(entries) as Record<string, string[]>;
                await updateCategoryStructure(newCategories);
            } else if (dragged.type === 'field' && dragged.grandParentName && dragged.parentName) {
                const [targetTopLevel, targetSpecialized] = dropZoneId.split('::');
                const itemData = dragged.name;
                const oldFields = newCategories[dragged.grandParentName][dragged.parentName];
                const itemIndex = oldFields.indexOf(itemData);
                if (itemIndex > -1) oldFields.splice(itemIndex, 1);
                newCategories[targetTopLevel][targetSpecialized].splice(index, 0, itemData);
                await updateCategoryStructure(newCategories);
            }
            addNotification('Categories reordered!', 'success');
            fetchCategories();
        } catch(err: any) {
            addNotification(err.message || "Could not reorder categories.", 'error');
            fetchCategories();
        } finally {
            draggedItem.current = null;
        }
    };

    const handleAddTopLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopLevel.trim()) return;
        try {
            await addTopLevelCategory(newTopLevel.trim());
            addNotification(`Category "${newTopLevel.trim()}" added.`, 'success');
            setNewTopLevel('');
            fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    const handleAddSpecialized = async (e: React.FormEvent, topLevelName: string) => {
        e.preventDefault();
        const specializedName = newSpecialized[topLevelName]?.trim();
        if (!specializedName) return;
        try {
            await addSpecializedCategory(topLevelName, specializedName);
            addNotification(`"${specializedName}" added to "${topLevelName}".`, 'success');
            setNewSpecialized(prev => ({ ...prev, [topLevelName]: '' }));
            fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

     const handleAddField = async (e: React.FormEvent, topLevelName: string, specializedName: string) => {
        e.preventDefault();
        const fieldName = newField[`${topLevelName}-${specializedName}`]?.trim();
        if (!fieldName) return;
        try {
            await addFieldOfStudy(topLevelName, specializedName, fieldName);
            addNotification(`"${fieldName}" added to "${specializedName}".`, 'success');
            setNewField(prev => ({ ...prev, [`${topLevelName}-${specializedName}`]: '' }));
            fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    const handleDeleteTopLevel = async (name: string) => {
        if (window.confirm(t.confirmDeleteTop)) {
            try {
                await deleteTopLevelCategory(name);
                addNotification(`Category "${name}" deleted.`, 'success');
                fetchCategories();
            } catch (error: any) {
                addNotification(error.message, 'error');
            }
        }
    };

    const handleDeleteSpecialized = async (topLevelName: string, specializedName: string) => {
        if (window.confirm(t.confirmDeleteSpecialized)) {
            try {
                await deleteSpecializedCategory(topLevelName, specializedName);
                addNotification(`"${specializedName}" deleted.`, 'success');
                fetchCategories();
            } catch (error: any) {
                addNotification(error.message, 'error');
            }
        }
    };

    const handleDeleteField = async (topLevelName: string, specializedName: string, fieldName: string) => {
        if (window.confirm(t.confirmDeleteField)) {
             try {
                await deleteFieldOfStudy(topLevelName, specializedName, fieldName);
                addNotification(`"${fieldName}" deleted.`, 'success');
                fetchCategories();
            } catch (error: any) {
                addNotification(error.message, 'error');
            }
        }
    };
    
    const handleStartEdit = (type: 'top' | 'specialized' | 'field', id: string, currentValue: string) => {
        setEditing({ type, id });
        setEditValue(currentValue);
    };

    const handleCancelEdit = () => {
        setEditing(null);
        setEditValue('');
    };
    
    const handleSaveEdit = async () => {
        if (!editing) return;
        try {
            const { type, id } = editing;
            const originalName = id.split('::').pop()!;
            const newName = editValue.trim();

            if (!newName || newName === originalName) {
                handleCancelEdit();
                return;
            }
            
            if (type === 'top') {
                await updateTopLevelCategory(originalName, newName);
            } else if (type === 'specialized') {
                const [topLevelName, specializedName] = id.split('::');
                await updateSpecializedCategory(topLevelName, specializedName, newName);
            } else if (type === 'field') {
                const [topLevelName, specializedName, fieldName] = id.split('::');
                await updateFieldOfStudy(topLevelName, specializedName, fieldName, newName);
            }
            addNotification('Category updated successfully!', 'success');
            await fetchCategories();
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            handleCancelEdit();
        }
    };

    const renderEditableField = (currentValue: string, id: string, type: 'top'|'specialized'|'field', textClass: string) => {
        if (editing?.type === type && editing.id === id) {
            return (
                <div className="flex items-center gap-2 flex-grow min-w-0">
                    <input 
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className={`p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 w-full ${textClass}`}
                        autoFocus
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSaveEdit(); } else if (e.key === 'Escape') { handleCancelEdit(); }}}
                        onBlur={handleCancelEdit}
                    />
                     <button type="button" onMouseDown={handleSaveEdit} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-slate-900 rounded-full">
                        <CheckCircleIcon className="w-5 h-5"/>
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-900 rounded-full">
                        <XCircleIcon className="w-5 h-5"/>
                    </button>
                </div>
            )
        }
        return (
             <div className="flex items-center gap-2 min-w-0">
                <p className={`${textClass} truncate`} title={currentValue}>{currentValue}</p>
                <button onClick={() => handleStartEdit(type, id, currentValue)} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditIcon className="w-4 h-4"/>
                </button>
            </div>
        )
    }

    const pageContent = () => {
      if (loading) {
        return <LoadingSpinner />;
      }
      return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t.addTopLevel}</h3>
                <form onSubmit={handleAddTopLevel} className="flex items-center gap-4">
                    <input type="text" value={newTopLevel} onChange={(e) => setNewTopLevel(e.target.value)} placeholder={t.topLevelName} className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500"/>
                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusCircleIcon className="w-5 h-5" /> {t.add}</button>
                </form>
            </div>
            <div 
                className="space-y-4"
                onDragOver={(e) => handleDragOver(e, 'root', Object.keys(categories).length)}
                onDragLeave={() => setDropIndicator(null)}
                onDrop={(e) => handleDrop(e, 'root', 'root')}
            >
                {Object.entries(categories).map(([topLevel, specializedCats], index) => (
                   <React.Fragment key={topLevel}>
                        {dropIndicator?.id === 'root' && dropIndicator.index === index && <DropIndicator />}
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, { type: 'top', name: topLevel })}
                            onDragEnd={(e) => { 
                                (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'bg-slate-200', 'dark:bg-slate-600');
                                draggedItem.current = null; 
                                setDropIndicator(null); 
                            }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md group cursor-grab"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <button 
                                        onClick={() => toggleTopLevel(topLevel)} 
                                        className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                        title={collapsedTop[topLevel] ? "Expand" : "Collapse"}
                                    >
                                        {collapsedTop[topLevel] ? <ChevronDownIcon className="w-6 h-6" /> : <ChevronUpIcon className="w-6 h-6" />}
                                    </button>
                                    {renderEditableField(topLevel, topLevel, 'top', 'text-xl font-bold text-slate-800 dark:text-slate-100')}
                                </div>
                                <button onClick={() => handleDeleteTopLevel(topLevel)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title={`Delete ${topLevel}`}><TrashIcon className="w-5 h-5"/></button>
                            </div>
                            
                            {!collapsedTop[topLevel] && (
                                <div 
                                    className="ps-12 space-y-4"
                                    onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, topLevel, Object.keys(specializedCats).length); }}
                                    onDragLeave={(e) => { e.stopPropagation(); setDropIndicator(null); }}
                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, topLevel, 'top'); }}
                                >
                                    {Object.entries(specializedCats).map(([specialized, fields], sIndex) => (
                                        <React.Fragment key={specialized}>
                                            {dropIndicator?.id === topLevel && dropIndicator.index === sIndex && <DropIndicator />}
                                            <div 
                                                draggable
                                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, { type: 'specialized', name: specialized, parentName: topLevel }); }}
                                                onDragEnd={(e) => {
                                                    e.stopPropagation();
                                                    (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'bg-slate-200', 'dark:bg-slate-600');
                                                    draggedItem.current = null;
                                                    setDropIndicator(null);
                                                }}
                                                className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg group cursor-grab"
                                            >
                                                <div className="flex justify-between items-center">
                                                    {renderEditableField(specialized, `${topLevel}::${specialized}`, 'specialized', 'font-semibold text-slate-700 dark:text-slate-200')}
                                                    <button onClick={() => handleDeleteSpecialized(topLevel, specialized)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full" title={`Delete ${specialized}`}><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                                <div 
                                                    className="ps-8 mt-4 space-y-2"
                                                    onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, `${topLevel}::${specialized}`, fields.length); }}
                                                    onDragLeave={(e) => { e.stopPropagation(); setDropIndicator(null); }}
                                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, `${topLevel}::${specialized}`, 'specialized'); }}
                                                >
                                                    {fields.map((field, fIndex) => (
                                                        <React.Fragment key={field}>
                                                            {dropIndicator?.id === `${topLevel}::${specialized}` && dropIndicator.index === fIndex && <DropIndicator />}
                                                            <div 
                                                                draggable
                                                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, { type: 'field', name: field, parentName: specialized, grandParentName: topLevel }); }}
                                                                onDragEnd={(e) => {
                                                                    e.stopPropagation();
                                                                    (e.currentTarget as HTMLElement).classList.remove('opacity-50', 'bg-slate-200', 'dark:bg-slate-600');
                                                                    draggedItem.current = null;
                                                                    setDropIndicator(null);
                                                                }}
                                                                className="flex justify-between items-center group bg-slate-100 dark:bg-slate-600 p-2 rounded cursor-grab"
                                                            >
                                                                {renderEditableField(field, `${topLevel}::${specialized}::${field}`, 'field', 'text-sm text-slate-600 dark:text-slate-300')}
                                                                <button onClick={() => handleDeleteField(topLevel, specialized, field)} className="p-1 text-red-500/50 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-500 rounded-full" title={`Delete ${field}`}><TrashIcon className="w-4 h-4"/></button>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}
                                                    {dropIndicator?.id === `${topLevel}::${specialized}` && dropIndicator.index === fields.length && <DropIndicator />}
                                                    <form onSubmit={(e) => handleAddField(e, topLevel, specialized)} className="flex items-center gap-2">
                                                        <input type="text" value={newField[`${topLevel}-${specialized}`] || ''} onChange={e => setNewField(prev => ({ ...prev, [`${topLevel}-${specialized}`]: e.target.value }))} placeholder={t.addField} className="flex-grow p-1 text-sm bg-white dark:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-1 focus:ring-red-500"/>
                                                        <button type="submit" className="text-green-500 hover:text-green-600"><PlusCircleIcon className="w-5 h-5"/></button>
                                                    </form>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    {dropIndicator?.id === topLevel && dropIndicator.index === Object.keys(specializedCats).length && <DropIndicator />}
                                    <form onSubmit={(e) => handleAddSpecialized(e, topLevel)} className="flex items-center gap-4 pt-4">
                                        <input type="text" value={newSpecialized[topLevel] || ''} onChange={e => setNewSpecialized(prev => ({...prev, [topLevel]: e.target.value}))} placeholder={t.addSpecialized} className="flex-grow p-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-red-500"/>
                                        <button type="submit" className="bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-300 hover:bg-red-500/30 font-semibold py-2 px-3 rounded-lg flex items-center gap-2 text-sm"><PlusCircleIcon className="w-5 h-5" /> {t.add}</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                ))}
                 {dropIndicator?.id === 'root' && dropIndicator.index === Object.keys(categories).length && <DropIndicator />}
            </div>
        </div>
      );
    }
  
    return (
        <DashboardLayout
            navLinks={navLinks}
            pageTitle={t.pageTitle}
            sidebarHeader={
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-10 flex items-center">
                    <ShieldCheckIcon className="w-8 h-8 me-2"/> {t.title}
                </h1>
            }
        >
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">{t.pageDescription}</p>
            {pageContent()}
        </DashboardLayout>
    );
};

export default AdminCategoryManagementPage;