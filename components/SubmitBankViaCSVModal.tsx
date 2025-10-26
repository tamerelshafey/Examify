import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { XCircleIcon, UploadIcon, DownloadIcon } from './icons';
import { getStructuredCategories } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface SubmitBankViaCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; price: number; specializedCategory: string; questions: Omit<Question, 'id' | 'ownerId' | 'status'>[] }) => void;
    isSubmitting: boolean;
}

const translations = {
    en: {
        title: "Submit Bank via CSV",
        description: "Package a question bank by uploading a CSV file. It will be submitted for admin review.",
        bankTitle: "Bank Title",
        bankTitlePlaceholder: "e.g., Advanced React Patterns",
        bankDescription: "Bank Description",
        bankDescriptionPlaceholder: "A short, catchy description of what this bank covers.",
        price: "Price (USD)",
        pricePlaceholder: "0 for free",
        category: "Specialized Category",
        selectCategory: "Select a category for the bank",
        uploadCSV: "Upload CSV File",
        downloadTemplate: "Download CSV Template",
        submit: "Submit for Review",
        cancel: "Cancel",
        importFailed: (message: string) => `Import failed: ${message}`,
        fileSelected: (name: string) => `File selected: ${name}`,
    },
    ar: {
        title: "إرسال بنك عبر CSV",
        description: "قم بتجميع بنك أسئلة عن طريق تحميل ملف CSV. سيتم تقديمه لمراجعة المسؤول.",
        bankTitle: "عنوان البنك",
        bankTitlePlaceholder: "مثال: أنماط React المتقدمة",
        bankDescription: "وصف البنك",
        bankDescriptionPlaceholder: "وصف قصير وجذاب لما يغطيه هذا البنك.",
        price: "السعر (بالدولار الأمريكي)",
        pricePlaceholder: "0 للمجاني",
        category: "الفئة المتخصصة",
        selectCategory: "اختر فئة للبنك",
        uploadCSV: "تحميل ملف CSV",
        downloadTemplate: "تنزيل قالب CSV",
        submit: "إرسال للمراجعة",
        cancel: "إلغاء",
        importFailed: (message: string) => `فشل الاستيراد: ${message}`,
        fileSelected: (name: string) => `الملف المختار: ${name}`,
    }
};

const parseQuestionsCSV = (csvText: string): Omit<Question, 'id' | 'ownerId' | 'status'>[] => {
    const lines = csvText.trim().split('\n');
    const header = lines.shift()?.toLowerCase().split(',').map(h => h.trim().replace(/"/g, '')) || [];
    const required = ['text', 'type', 'points', 'correctanswer'];
    if (!required.every(h => header.includes(h))) {
        throw new Error(`CSV must include headers: ${required.join(', ')}`);
    }
    return lines.map(line => {
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const row = header.reduce((obj, h, i) => {
            obj[h] = (values[i] || '').trim().replace(/"/g, '');
            return obj;
        }, {} as any);
        
        if (!Object.values(QuestionType).includes(row.type)) throw new Error(`Invalid question type: ${row.type}`);

        return {
            text: row.text,
            type: row.type as QuestionType,
            points: parseInt(row.points, 10) || 5,
            category: row.category || '', // Will be overridden by modal's category selection
            subCategory: row.subcategory || '',
            options: row.options?.split('|') || undefined,
            correctAnswer: row.correctanswer?.includes('|') ? row.correctanswer.split('|') : row.correctanswer,
            tags: row.tags?.split('|') || [],
        };
    });
};

const downloadCSVTemplate = () => {
    const header = "text,type,points,category,subCategory,correctAnswer,options,tags\n";
    const example = `"What is the capital of Spain?","multiple-choice",5,"General Knowledge","Geography","Madrid","Paris|London|Madrid|Rome","Europe|Capitals"`;
    const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "question_template.csv";
    link.click();
};

const SubmitBankViaCSVModal: React.FC<SubmitBankViaCSVModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>(0);
    const [specializedCategory, setSpecializedCategory] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<Omit<Question, 'id' | 'ownerId' | 'status'>[] | null>(null);
    const [fileName, setFileName] = useState('');
    const [allCategories, setAllCategories] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { lang } = useLanguage();
    const { addNotification } = useNotification();
    const t = translations[lang];

    useEffect(() => {
        if (isOpen) {
            getStructuredCategories().then(structured => {
                const flatList: string[] = [];
                Object.values(structured).forEach(specializedGroup => {
                    flatList.push(...Object.keys(specializedGroup));
                });
                setAllCategories(flatList.sort());
            });
        } else {
            // Reset state on close
            setTitle('');
            setDescription('');
            setPrice(0);
            setSpecializedCategory('');
            setParsedQuestions(null);
            setFileName('');
        }
    }, [isOpen]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setParsedQuestions(null);
            setFileName('');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const questions = parseQuestionsCSV(text);
                setParsedQuestions(questions);
            } catch (error: any) {
                addNotification(t.importFailed(error.message), 'error');
                setParsedQuestions(null);
                setFileName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalPrice = typeof price === 'number' ? price : 0;
        if (!parsedQuestions || parsedQuestions.length === 0) {
            addNotification('Please select a valid CSV file with questions.', 'error');
            return;
        }
        onSubmit({ title, description, price: finalPrice, specializedCategory, questions: parsedQuestions });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.title}</h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.description}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="bankTitleCsv" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.bankTitle}</label>
                        <input type="text" id="bankTitleCsv" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.bankTitlePlaceholder} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                    </div>
                     <div>
                        <label htmlFor="bankDescriptionCsv" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.bankDescription}</label>
                        <textarea id="bankDescriptionCsv" value={description} onChange={e => setDescription(e.target.value)} placeholder={t.bankDescriptionPlaceholder} rows={2} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="specializedCategoryCsv" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.category}</label>
                            <select id="specializedCategoryCsv" value={specializedCategory} onChange={e => setSpecializedCategory(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required>
                                <option value="" disabled>{t.selectCategory}</option>
                                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="bankPriceCsv" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.price}</label>
                            <input type="number" id="bankPriceCsv" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" step="0.5" placeholder={t.pricePlaceholder} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.uploadCSV}</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex justify-center items-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-500 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <UploadIcon className="w-6 h-6 me-2" />
                            {fileName ? t.fileSelected(fileName) : t.uploadCSV}
                        </button>
                        <button type="button" onClick={downloadCSVTemplate} className="text-xs text-blue-500 hover:underline mt-2 flex items-center gap-1">
                            <DownloadIcon className="w-3 h-3"/>
                            {t.downloadTemplate}
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
                        <button type="submit" disabled={isSubmitting || !parsedQuestions} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                            {isSubmitting ? "..." : t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitBankViaCSVModal;