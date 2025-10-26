
import React, { useState } from 'react';
// Fix: Import from the correct AI service file.
import { generateQuestionsWithAI } from '../services/ai';
import { Question, QuestionType } from '../types';
import { SparklesIcon, SpinnerIcon } from './icons';
// Fix: Import useLanguage from its context file.
import { useLanguage } from '../contexts/LanguageContext';

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (questions: Omit<Question, 'id'>[]) => void;
}

const translations = {
    en: {
        title: "AI Question Generator",
        topicPlaceholder: "Topic (e.g., React Hooks)",
        generate: "Generate Questions",
        generating: "Generating...",
        selectPrompt: "Select the questions you want to add:",
        correctAnswer: "Correct Answer:",
        emptyState: "Enter a topic and generate questions using AI.",
        cancel: "Cancel",
        addSelected: "Add Selected Questions",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
    },
    ar: {
        title: "مولد الأسئلة بالذكاء الاصطناعي",
        topicPlaceholder: "الموضوع (مثال: React Hooks)",
        generate: "إنشاء أسئلة",
        generating: "جاري الإنشاء...",
        selectPrompt: "اختر الأسئلة التي تريد إضافتها:",
        correctAnswer: "الإجابة الصحيحة:",
        emptyState: "أدخل موضوعًا وقم بإنشاء أسئلة باستخدام الذكاء الاصطناعي.",
        cancel: "إلغاء",
        addSelected: "إضافة الأسئلة المحددة",
        easy: "سهل",
        medium: "متوسط",
        hard: "صعب",
    }
}

const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({ isOpen, onClose, onAddQuestions }) => {
  const [topic, setTopic] = useState('React Hooks');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MultipleChoice);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedQuestions([]);
    setSelectedIndices(new Set());
    try {
      const questions = await generateQuestionsWithAI({ topic, questionType, difficulty, count });
      setGeneratedQuestions(questions);
    } catch (error) {
      console.error("AI question generation failed:", error);
      // You could show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleAddSelected = () => {
    const selectedQuestions = Array.from(selectedIndices).map(index => generatedQuestions[index]);
    onAddQuestions(selectedQuestions);
    resetState();
  };

  const resetState = () => {
    setGeneratedQuestions([]);
    setSelectedIndices(new Set());
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
            <select value={questionType} onChange={e => setQuestionType(e.target.value as QuestionType)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500">
                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                <option value={QuestionType.TrueFalse}>True/False</option>
                <option value={QuestionType.Essay}>Essay</option>
                <option value={QuestionType.ShortAnswer}>Short Answer</option>
            </select>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500">
                <option value="Easy">{t.easy}</option>
                <option value="Medium">{t.medium}</option>
                <option value="Hard">{t.hard}</option>
            </select>
            <input type="number" min="1" max="10" placeholder="Count" value={count} onChange={e => setCount(parseInt(e.target.value))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-purple-500" required />
            <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                {loading ? t.generating : t.generate}
            </button>
        </form>

        <div className="flex-grow overflow-y-auto space-y-3 pr-2 border-t border-slate-200 dark:border-slate-600 pt-4">
            {loading && <div className="text-center p-8">{t.generating}...</div>}
            
            {generatedQuestions.length > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t.selectPrompt}</p>
            )}

            {generatedQuestions.map((q, index) => (
                <div key={index} className="flex items-start p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <input 
                        type="checkbox"
                        checked={selectedIndices.has(index)}
                        onChange={() => handleSelectQuestion(index)}
                        className="w-5 h-5 mt-1 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="ms-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{q.text}</p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {t.correctAnswer} <span className="font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">{JSON.stringify(q.correctAnswer)}</span>
                        </div>
                    </div>
                </div>
            ))}
            
            {!loading && generatedQuestions.length === 0 && (
                <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                    <p>{t.emptyState}</p>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <button onClick={resetState} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
            <button onClick={handleAddSelected} disabled={selectedIndices.size === 0} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {t.addSelected} {selectedIndices.size > 0 ? `(${selectedIndices.size})` : ''}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGeneratorModal;
