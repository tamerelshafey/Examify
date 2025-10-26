
import React, { useState } from 'react';
// Fix: Import from the correct AI service file.
import { generateFullExamWithAI } from '../services/ai';
import { Exam } from '../types';
import { SparklesIcon, SpinnerIcon } from './icons';
// Fix: Import useLanguage from its context file.
import { useLanguage } from '../contexts/LanguageContext';

interface AIGenerateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Omit<Exam, 'id' | 'questionCount'>) => void;
}

const translations = {
    en: {
        title: "AI Exam Generator",
        topicPlaceholder: "Topic (e.g., React Fundamentals)",
        generate: "Generate Exam",
        generating: "Generating...",
        cancel: "Cancel",
        save: "Save Exam",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
    },
    ar: {
        title: "مولد الاختبارات بالذكاء الاصطناعي",
        topicPlaceholder: "الموضوع (مثال: أساسيات React)",
        generate: "إنشاء اختبار",
        generating: "جاري الإنشاء...",
        cancel: "إلغاء",
        save: "حفظ الاختبار",
        easy: "سهل",
        medium: "متوسط",
        hard: "صعب",
    }
};

const AIGenerateExamModal: React.FC<AIGenerateExamModalProps> = ({ isOpen, onClose, onSave }) => {
  const [topic, setTopic] = useState('React Fundamentals');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<Omit<Exam, 'id' | 'questionCount'> | null>(null);
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedExam(null);
    try {
      const exam = await generateFullExamWithAI({ topic, difficulty, count });
      setGeneratedExam(exam);
    } catch (error) {
      console.error("AI exam generation failed:", error);
      alert("Failed to generate exam with AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
      if(generatedExam) {
          onSave(generatedExam);
          resetState();
      }
  };

  const resetState = () => {
    setGeneratedExam(null);
    setTopic('React Fundamentals');
    setDifficulty('Medium');
    setCount(5);
    setLoading(false);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center" onClick={resetState}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
          <SparklesIcon className="w-6 h-6 me-3 text-purple-500"/>
          {t.title}
        </h2>
        
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder={t.topicPlaceholder} value={topic} onChange={e => setTopic(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500" required />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500">
                <option value="Easy">{t.easy}</option>
                <option value="Medium">{t.medium}</option>
                <option value="Hard">{t.hard}</option>
            </select>
            <input type="number" min="1" max="15" placeholder="Count" value={count} onChange={e => setCount(parseInt(e.target.value))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500" required />
            <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex justify-center items-center">
                {loading ? <SpinnerIcon className="w-5 h-5"/> : t.generate}
            </button>
        </form>

        <div className="flex-grow overflow-y-auto space-y-3 pr-2 border-t border-slate-200 dark:border-slate-600 pt-4">
            {loading && <div className="text-center p-8"><SpinnerIcon className="w-8 h-8 mx-auto text-purple-500"/></div>}
            
            {generatedExam && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{generatedExam.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{generatedExam.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{generatedExam.questions.length} questions, {generatedExam.duration} minutes</p>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <button onClick={resetState} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
            <button onClick={handleSave} disabled={!generatedExam || loading} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {t.save}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateExamModal;
