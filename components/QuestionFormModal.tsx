

import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { XCircleIcon, Wand2Icon, SpinnerIcon, LightbulbIcon } from './icons';
// Fix: Split API calls into their correct modules.
import { getAIQuestionSuggestions, analyzeQuestionWithAI } from '../services/ai';
import { getStructuredCategories } from '../services/api';
// Fix: Import useLanguage from its context file.
import { useLanguage } from '../contexts/LanguageContext';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Omit<Question, 'id'> | Question) => void;
  question: Question | null;
}

const translations = {
    en: {
        editTitle: "Edit Question",
        createTitle: "Create New Question",
        questionText: "Question Text",
        aiAssist: "Complete with AI (min 15 chars)",
        aiAnalyze: "Analyze with AI (min 20 chars)",
        questionType: "Question Type",
        points: "Points",
        tags: "Tags (comma-separated)",
        topLevelCategory: "Top-level Category",
        category: "Specialized Category",
        subCategory: "Field of Study",
        selectTopLevel: "Select Top-level",
        selectCategory: "Select Category",
        selectSubCategory: "Select Field",
        answerConfig: "Answer Configuration",
        addOption: "Add Option",
        addItem: "Add Item",
        addPrompt: "Add Prompt",
        orderingHelp: "Enter items in the correct order. Examinees will be asked to re-order them.",
        prompts: "Prompts",
        options: "Options",
        correctMatches: "Correct Matches",
        selectMatch: "Select a match",
        modelJustification: "Model Justification",
        modelAnswerHelp: "Provide the model answer or grading criteria here...",
        cancel: "Cancel",
        save: "Save Question",
        aiAnalysis: {
            title: "AI Analysis & Suggestions",
            feedback: "Pedagogical Feedback",
            category: "Suggested Category",
            tags: "Suggested Tags",
            apply: "Apply",
        },
    },
    ar: {
        editTitle: "تعديل السؤال",
        createTitle: "إنشاء سؤال جديد",
        questionText: "نص السؤال",
        aiAssist: "أكمل بالذكاء الاصطناعي (15 حرفًا على الأقل)",
        aiAnalyze: "تحليل بالذكاء الاصطناعي (20 حرفًا على الأقل)",
        questionType: "نوع السؤال",
        points: "النقاط",
        tags: "الوسوم (مفصولة بفاصلة)",
        topLevelCategory: "الفئة العليا",
        category: "الفئة المتخصصة",
        subCategory: "مجال التخصص",
        selectTopLevel: "اختر الفئة العليا",
        selectCategory: "اختر الفئة المتخصصة",
        selectSubCategory: "اختر مجال التخصص",
        answerConfig: "إعدادات الإجابة",
        addOption: "إضافة خيار",
        addItem: "إضافة عنصر",
        addPrompt: "إضافة مطالبة",
        orderingHelp: "أدخل العناصر بالترتيب الصحيح. سيُطلب من الممتحنين إعادة ترتيبها.",
        prompts: "المطالبات",
        options: "الخيارات",
        correctMatches: "المطابقات الصحيحة",
        selectMatch: "اختر مطابقة",
        modelJustification: "التبرير النموذجي",
        modelAnswerHelp: "أدخل الإجابة النموذجية أو معايير التصحيح هنا...",
        cancel: "إلغاء",
        save: "حفظ السؤال",
        aiAnalysis: {
            title: "تحليل ومقترحات الذكاء الاصطناعي",
            feedback: "ملاحظات تربوية",
            category: "الفئة المقترحة",
            tags: "الوسوم المقترحة",
            apply: "تطبيق",
        },
    }
}
type AnalysisResult = { feedback: string; category: string; subCategory: string; tags: string[] };
type EditableQuestion = Omit<Question, 'id'>;
const DEFAULT_QUESTION: EditableQuestion = {
    ownerId: '', // Will be set on save
    text: '',
    type: QuestionType.MultipleChoice,
    category: '',
    subCategory: '',
    options: ['', ''],
    correctAnswer: '',
    points: 5,
    tags: [],
};

const findTopLevelCategory = (specializedCategory: string, structuredCategories: Record<string, Record<string, string[]>>) => {
    for (const topLevel in structuredCategories) {
        if (Object.keys(structuredCategories[topLevel]).includes(specializedCategory)) {
            return topLevel;
        }
    }
    return '';
};


const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ isOpen, onClose, onSave, question }) => {
  const [formData, setFormData] = useState<EditableQuestion | Question>(DEFAULT_QUESTION);
  const [aiLoading, setAiLoading] = useState<'assist' | 'analyze' | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [categories, setCategories] = useState<Record<string, Record<string, string[]>>>({});
  const [selectedTopLevel, setSelectedTopLevel] = useState('');
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
        const fetchCats = async () => {
            const data = await getStructuredCategories();
            setCategories(data);
            if (question) {
                const topLevel = findTopLevelCategory(question.category, data);
                setSelectedTopLevel(topLevel);
            }
        };
        fetchCats();
        setFormData(question ? { ...question } : DEFAULT_QUESTION);
        if(!question) setSelectedTopLevel('');
        setAnalysisResult(null);
    }
  }, [isOpen, question]);
  
  const handleChange = (field: keyof EditableQuestion, value: any) => {
    const newData = {...formData, [field]: value};
    if (field === 'category') {
        (newData as EditableQuestion).subCategory = ''; // Reset subcategory when category changes
    }
    setFormData(newData);
  };
  
  const handleOptionChange = (oIndex: number, value: string, field: 'options' | 'prompts' = 'options') => {
    const newFormData = {...formData};
    if (newFormData[field]) {
      newFormData[field]![oIndex] = value;
      setFormData(newFormData);
    }
  };

  const addListItem = (field: 'options' | 'prompts' = 'options') => {
    const newFormData = {...formData};
    if (newFormData[field]) {
      newFormData[field]!.push('');
    } else {
        (newFormData as any)[field] = [''];
    }
    setFormData(newFormData);
  };

  const removeListItem = (oIndex: number, field: 'options' | 'prompts' = 'options') => {
    const newFormData = {...formData};
    if (newFormData[field]) {
      newFormData[field]!.splice(oIndex, 1);
      setFormData(newFormData);
    }
  };
  
  const handleTypeChange = (type: QuestionType) => {
    let q: Partial<EditableQuestion> = { type };
    const baseQuestion = { ...DEFAULT_QUESTION, text: formData.text, points: formData.points, category: formData.category, subCategory: formData.subCategory, type, tags: formData.tags };

    switch (type) {
        case QuestionType.MultipleChoice: q = { ...baseQuestion, options: ['', ''], correctAnswer: '' }; break;
        case QuestionType.MultipleSelect: q = { ...baseQuestion, options: ['', ''], correctAnswer: [] }; break;
        case QuestionType.TrueFalse: q = { ...baseQuestion, options: ['True', 'False'], correctAnswer: 'True' }; break;
        case QuestionType.TrueFalseWithJustification: q = { ...baseQuestion, correctAnswer: 'True', correctJustification: '' }; break;
        case QuestionType.ShortAnswer:
        case QuestionType.Essay: q = { ...baseQuestion, correctAnswer: '' }; break;
        case QuestionType.Ordering: q = { ...baseQuestion, options: ['', ''], correctAnswer: [] }; break;
        case QuestionType.Matching: q = { ...baseQuestion, prompts: ['', ''], options: ['', ''], correctAnswer: [] }; break;
    }
    setFormData(q as EditableQuestion);
  };

  const handleAiAssist = async () => {
      if (formData.text.length < 15) return;
      setAiLoading('assist');
      try {
          const suggestions = await getAIQuestionSuggestions({ partialQuestionText: formData.text });
          setFormData(prev => ({
              ...(prev as EditableQuestion),
              text: suggestions.text,
              options: suggestions.options,
              correctAnswer: suggestions.correctAnswer,
              points: suggestions.points,
              tags: suggestions.tags,
              type: QuestionType.MultipleChoice,
          }));
      } catch (error) {
          alert("AI assistance failed. Please try again.");
      } finally {
          setAiLoading(null);
      }
  };

  const handleAiAnalyze = async () => {
    if (formData.text.length < 20) return;
    const flatCategories: Record<string, string[]> = {};
    Object.values(categories).forEach(specializedGroup => {
        Object.assign(flatCategories, specializedGroup);
    });

    setAiLoading('analyze');
    setAnalysisResult(null);
    try {
        const result = await analyzeQuestionWithAI({ questionText: formData.text, existingCategories: flatCategories });
        setAnalysisResult(result);
    } catch (error) {
        alert("AI analysis failed. Please try again.");
    } finally {
        setAiLoading(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalData = { ...formData };
    if (finalData.type === QuestionType.Ordering) {
      finalData.correctAnswer = finalData.options || [];
    }
    onSave(finalData);
  };
  
  if (!isOpen) return null;
  const q = formData; // alias for brevity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{question ? t.editTitle : t.createTitle}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.questionText}</label>
                <textarea placeholder={t.questionText} value={q.text} onChange={e => handleChange('text', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full h-24" required />
                <div className="absolute top-8 right-2 flex gap-1">
                    <button type="button" onClick={handleAiAssist} disabled={!!aiLoading || q.text.length < 15} className="p-1.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50" title={t.aiAssist}>
                        {aiLoading === 'assist' ? <SpinnerIcon className="w-4 h-4" /> : <Wand2Icon className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={handleAiAnalyze} disabled={!!aiLoading || q.text.length < 20} className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50" title={t.aiAnalyze}>
                         {aiLoading === 'analyze' ? <SpinnerIcon className="w-4 h-4" /> : <LightbulbIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            {analysisResult && (
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center"><LightbulbIcon className="w-5 h-5 me-2 text-yellow-500" />{t.aiAnalysis.title}</h4>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.feedback}</p>
                        <p className="text-sm italic text-slate-700 dark:text-slate-200">"{analysisResult.feedback}"</p>
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.category}:</p>
                        <span className="text-sm font-mono bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">{analysisResult.category} &gt; {analysisResult.subCategory}</span>
                        <button onClick={() => { handleChange('category', analysisResult.category); handleChange('subCategory', analysisResult.subCategory); setSelectedTopLevel(findTopLevelCategory(analysisResult.category, categories)) }} type="button" className="text-xs font-bold text-primary-500 hover:underline">{t.aiAnalysis.apply}</button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.tags}:</p>
                        <div className="flex flex-wrap gap-1">
                            {analysisResult.tags.map(tag => <span key={tag} className="text-sm font-mono bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">{tag}</span>)}
                        </div>
                        <button onClick={() => handleChange('tags', analysisResult.tags)} type="button" className="text-xs font-bold text-primary-500 hover:underline">{t.aiAnalysis.apply}</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.questionType}</label><select value={q.type} onChange={e => handleTypeChange(e.target.value as QuestionType)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full">{Object.values(QuestionType).map(type => (<option key={type} value={type}>{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>))}</select></div>
                <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.points}</label><input type="number" placeholder="Points" value={q.points} onChange={e => handleChange('points', parseInt(e.target.value))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full" required /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.topLevelCategory}</label><select value={selectedTopLevel} onChange={e => { setSelectedTopLevel(e.target.value); handleChange('category', ''); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full" required><option value="" disabled>{t.selectTopLevel}</option>{Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.category}</label><select value={q.category} onChange={e => handleChange('category', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full" disabled={!selectedTopLevel} required><option value="" disabled>{t.selectCategory}</option>{Object.keys(categories[selectedTopLevel] || {}).map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.subCategory}</label><select value={q.subCategory} onChange={e => handleChange('subCategory', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full" disabled={!q.category} required><option value="" disabled>{t.selectSubCategory}</option>{(categories[selectedTopLevel]?.[q.category] || []).map(field => <option key={field} value={field}>{field}</option>)}</select></div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-semibold mb-3">{t.answerConfig}</h3>
                {q.type === QuestionType.MultipleChoice && (<div className="space-y-2">{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="radio" name={`correct-answer`} value={opt} checked={q.correctAnswer === opt} onChange={e => handleChange('correctAnswer', e.target.value)} /><input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem()} className="text-sm text-blue-500 hover:text-blue-600 font-semibold mt-2">{t.addOption}</button></div>)}
                {q.type === QuestionType.MultipleSelect && (<div className="space-y-2">{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="checkbox" name={`correct-answer`} value={opt} checked={(q.correctAnswer as string[]).includes(opt)} onChange={e => { const currentAnswers = (q.correctAnswer as string[] || []); const newAnswers = e.target.checked ? [...currentAnswers, opt] : currentAnswers.filter(a => a !== opt); handleChange('correctAnswer', newAnswers); }} /><input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem()} className="text-sm text-blue-500 hover:text-blue-600 font-semibold mt-2">{t.addOption}</button></div>)}
                {q.type === QuestionType.TrueFalse && (<div className="flex gap-4"><label className="flex items-center"><input type="radio" name={`correct-answer`} value="True" checked={q.correctAnswer === 'True'} onChange={e => handleChange('correctAnswer', 'True')} className="mr-2" /> True</label><label className="flex items-center"><input type="radio" name={`correct-answer`} value="False" checked={q.correctAnswer === 'False'} onChange={e => handleChange('correctAnswer', 'False')} className="mr-2" /> False</label></div>)}
                {q.type === QuestionType.TrueFalseWithJustification && (<div><div className="flex gap-4 mb-2"><label className="flex items-center"><input type="radio" name={`correct-answer`} value="True" checked={q.correctAnswer === 'True'} onChange={e => handleChange('correctAnswer', 'True')} className="mr-2" /> True</label><label className="flex items-center"><input type="radio" name={`correct-answer`} value="False" checked={q.correctAnswer === 'False'} onChange={e => handleChange('correctAnswer', 'False')} className="mr-2" /> False</label></div><textarea placeholder={t.modelJustification} value={q.correctJustification || ''} onChange={e => handleChange('correctJustification', e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full h-24" /></div>)}
                {(q.type === QuestionType.Essay || q.type === QuestionType.ShortAnswer) && (<textarea placeholder={t.modelAnswerHelp} value={q.correctAnswer as string} onChange={e => handleChange('correctAnswer', e.target.value)} className={`p-2 bg-white dark:bg-slate-600 rounded-md w-full ${q.type === QuestionType.ShortAnswer ? 'h-16' : 'h-24'}`} required />)}
                {q.type === QuestionType.Ordering && (<div className="space-y-2"><p className="text-sm text-slate-500 dark:text-slate-400">{t.orderingHelp}</p>{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><span className="text-slate-500">{oIndex+1}.</span><input type="text" placeholder={`${t.addItem} ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem()} className="text-sm text-blue-500 hover:text-blue-600 font-semibold mt-2">{t.addItem}</button></div>)}
                {q.type === QuestionType.Matching && (<div className="grid grid-cols-2 gap-6"><div><h4 className="font-semibold mb-2">{t.prompts}</h4>{q.prompts?.map((prompt, pIndex) => (<div key={pIndex} className="flex items-center gap-2 mb-2"><input type="text" placeholder={`${t.prompts} ${pIndex+1}`} value={prompt} onChange={e => handleOptionChange(pIndex, e.target.value, 'prompts')} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(pIndex, 'prompts')} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.prompts && q.prompts.length <= 1}><XCircleIcon className="w-5 h-5"/></button></div>))}<button type="button" onClick={() => addListItem('prompts')} className="text-sm text-blue-500 hover:text-blue-600 font-semibold mt-2">{t.addPrompt}</button></div><div><h4 className="font-semibold mb-2">{t.options}</h4>{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2 mb-2"><input type="text" placeholder={`${t.options} ${oIndex+1}`} value={opt} onChange={e => handleOptionChange(oIndex, e.target.value, 'options')} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(oIndex, 'options')} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 1}><XCircleIcon className="w-5 h-5"/></button></div>))}<button type="button" onClick={() => addListItem('options')} className="text-sm text-blue-500 hover:text-blue-600 font-semibold mt-2">{t.addOption}</button></div><div className="col-span-2"><h4 className="font-semibold mb-2">{t.correctMatches}</h4>{q.prompts?.map((prompt, pIndex) => (<div key={pIndex} className="flex items-center gap-4 mb-2"><span className="w-1/3 truncate" title={prompt}>{prompt || `${t.prompts} ${pIndex+1}`}</span><select value={(q.correctAnswer as string[])[pIndex] || ''} onChange={e => { const newAnswers = [...(q.correctAnswer as string[])]; newAnswers[pIndex] = e.target.value; handleChange('correctAnswer', newAnswers); }} className="p-2 bg-white dark:bg-slate-600 rounded-md w-2/3"><option value="" disabled>{t.selectMatch}</option>{q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>))}</div></div>)}
            </div>
          
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionFormModal;