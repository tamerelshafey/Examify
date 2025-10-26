import React, { useState } from 'react';
import { Question } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { XCircleIcon } from './icons';

interface SubmitBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; price: number; questionIds: string[]; specializedCategory: string }) => void;
    userQuestions: Question[];
    isSubmitting: boolean;
}

const translations = {
    en: {
        title: "Submit Bank to Marketplace",
        description: "Select questions from your personal bank to package and submit for review. Approved banks will be available for other users to acquire.",
        bankTitle: "Bank Title",
        bankTitlePlaceholder: "e.g., Advanced React Patterns",
        bankDescription: "Bank Description",
        bankDescriptionPlaceholder: "A short, catchy description of what this bank covers.",
        price: "Price (USD)",
        pricePlaceholder: "0 for free",
        selectQuestions: "Select Questions to Include",
        noQuestions: "You have no questions in your bank to submit.",
        submit: "Submit for Review",
        cancel: "Cancel",
    },
    ar: {
        title: "قدّم بنكاً للمتجر",
        description: "اختر أسئلة من بنكك الشخصي لتجميعها وتقديمها للمراجعة. ستكون البنوك المعتمدة متاحة للمستخدمين الآخرين لاقتنائها.",
        bankTitle: "عنوان البنك",
        bankTitlePlaceholder: "مثال: أنماط React المتقدمة",
        bankDescription: "وصف البنك",
        bankDescriptionPlaceholder: "وصف قصير وجذاب لما يغطيه هذا البنك.",
        price: "السعر (بالدولار الأمريكي)",
        pricePlaceholder: "0 للمجاني",
        selectQuestions: "اختر الأسئلة لتضمينها",
        noQuestions: "ليس لديك أسئلة في بنكك لتقديمها.",
        submit: "إرسال للمراجعة",
        cancel: "إلغاء",
    }
};

const SubmitBankModal: React.FC<SubmitBankModalProps> = ({ isOpen, onClose, onSubmit, userQuestions, isSubmitting }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>(0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { lang } = useLanguage();
    const t = translations[lang];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const questionIds = Array.from(selectedIds);
        const finalPrice = typeof price === 'number' ? price : 0;
        if (!title.trim() || !description.trim() || questionIds.length === 0) {
            // Simple validation, could be improved with user feedback
            return;
        }

        const firstQuestionCategory = userQuestions.find(q => q.id === questionIds[0])?.category || 'Uncategorized';
        
        onSubmit({ title, description, price: finalPrice, questionIds, specializedCategory: firstQuestionCategory });
    };

    const handleSelectQuestion = (questionId: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(questionId)) {
            newSelection.delete(questionId);
        } else {
            newSelection.add(questionId);
        }
        setSelectedIds(newSelection);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.title}</h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.description}</p>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bankTitle" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.bankTitle}</label>
                                <input type="text" id="bankTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.bankTitlePlaceholder} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                            </div>
                            <div>
                                <label htmlFor="bankPrice" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.price}</label>
                                <input type="number" id="bankPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} min="0" step="0.5" placeholder={t.pricePlaceholder} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="bankDescription" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.bankDescription}</label>
                            <textarea id="bankDescription" value={description} onChange={e => setDescription(e.target.value)} placeholder={t.bankDescriptionPlaceholder} rows={2} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                        </div>
                    </div>
                    
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.selectQuestions} ({selectedIds.size})</label>
                    <div className="flex-grow overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                        {userQuestions.length > 0 ? userQuestions.map(q => (
                             <div key={q.id} className="flex items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                <input 
                                    type="checkbox"
                                    id={`q-select-${q.id}`}
                                    checked={selectedIds.has(q.id)}
                                    onChange={() => handleSelectQuestion(q.id)}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label htmlFor={`q-select-${q.id}`} className="ms-3 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">{q.text}</label>
                            </div>
                        )) : <p className="text-center text-sm text-slate-500 py-4">{t.noQuestions}</p>}
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
                        <button type="submit" disabled={isSubmitting || selectedIds.size === 0 || !title.trim()} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                            {isSubmitting ? "..." : t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitBankModal;