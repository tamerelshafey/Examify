

import React, { useState, useEffect } from 'react';
import { Exam, Question, QuestionType, QuestionStatus } from '../types';
import { PlusCircleIcon, TrashIcon, XCircleIcon, SparklesIcon, Wand2Icon, SpinnerIcon, LightbulbIcon } from './icons';
import QuestionBankModal from './QuestionBankModal';
import AIQuestionGeneratorModal from './AIQuestionGeneratorModal';
import { getAIQuestionSuggestions, analyzeQuestionWithAI, getCategories } from '../services/mockApi';
import { useLanguage } from '../App';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Omit<Exam, 'id' | 'questionCount'>) => void;
}

const translations = {
    en: {
        createExam: "Create New Exam",
        examTitle: "Exam Title",
        description: "Description",
        duration: "Duration (minutes)",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        questions: "Questions",
        question: "Question",
        points: "Points",
        tags: "Tags (comma-separated)",
        addOption: "Add Option",
        addItem: "Add Item",
        prompts: "Prompts",
        options: "Options",
        correctMatches: "Correct Matches",
        addPrompt: "Add Prompt",
        orderingHelp: "Enter items in the correct order. Examinees will be asked to re-order them.",
        modelAnswerHelp: "Provide the model answer or grading criteria here...",
        justifyHelp: "Justify your answer...",
        modelJustification: "Model Justification",
        addManually: "Add Manually",
        addFromBank: "Add from Bank",
        aiGenerate: "AI Generate ✨",
        cancel: "Cancel",
        saveExam: "Save Exam",
        alertRequired: "Exam title and at least one question are required.",
        aiAssistTitle: "Complete with AI (min 15 chars)",
        aiAnalyzeTitle: "Analyze with AI (min 20 chars)",
        aiAnalysis: {
            title: "AI Analysis & Suggestions",
            feedback: "Pedagogical Feedback",
            category: "Suggested Category",
            tags: "Suggested Tags",
            apply: "Apply",
        },
        questionTypes: {
            [QuestionType.MultipleChoice]: 'Multiple Choice (Single)',
            [QuestionType.MultipleSelect]: 'Multiple Select',
            [QuestionType.TrueFalse]: 'True/False',
            [QuestionType.TrueFalseWithJustification]: 'True/False + Justification',
            [QuestionType.ShortAnswer]: 'Short Answer',
            [QuestionType.Essay]: 'Essay',
            [QuestionType.Ordering]: 'Ordering',
            [QuestionType.Matching]: 'Matching',
        }
    },
    ar: {
        createExam: "إنشاء اختبار جديد",
        examTitle: "عنوان الاختبار",
        description: "الوصف",
        duration: "المدة (بالدقائق)",
        easy: "سهل",
        medium: "متوسط",
        hard: "صعب",
        questions: "الأسئلة",
        question: "سؤال",
        points: "النقاط",
        tags: "الوسوم (مفصولة بفاصلة)",
        addOption: "إضافة خيار",
        addItem: "إضافة عنصر",
        prompts: "المطالبات",
        options: "الخيارات",
        correctMatches: "المطابقات الصحيحة",
        addPrompt: "إضافة مطالبة",
        orderingHelp: "أدخل العناصر بالترتيب الصحيح. سيُطلب من الممتحنين إعادة ترتيبها.",
        modelAnswerHelp: "أدخل الإجابة النموذجية أو معايير التصحيح هنا...",
        justifyHelp: "برر إجابتك...",
        modelJustification: "التبرير النموذجي",
        addManually: "إضافة يدوية",
        addFromBank: "إضافة من البنك",
        aiGenerate: "إنشاء بالذكاء الاصطناعي ✨",
        cancel: "إلغاء",
        saveExam: "حفظ الاختبار",
        alertRequired: "عنوان الاختبار وسؤال واحد على الأقل مطلوبان.",
        aiAssistTitle: "أكمل بالذكاء الاصطناعي (15 حرفًا على الأقل)",
        aiAnalyzeTitle: "تحليل بالذكاء الاصطناعي (20 حرفًا على الأقل)",
        aiAnalysis: {
            title: "تحليل ومقترحات الذكاء الاصطناعي",
            feedback: "ملاحظات تربوية",
            category: "الفئة المقترحة",
            tags: "الوسوم المقترحة",
            apply: "تطبيق",
        },
        questionTypes: {
            [QuestionType.MultipleChoice]: 'اختيار من متعدد (إجابة واحدة)',
            [QuestionType.MultipleSelect]: 'اختيار من متعدد (عدة إجابات)',
            [QuestionType.TrueFalse]: 'صح / خطأ',
            [QuestionType.TrueFalseWithJustification]: 'صح / خطأ مع تبرير',
            [QuestionType.ShortAnswer]: 'إجابة قصيرة',
            [QuestionType.Essay]: 'مقالي',
            [QuestionType.Ordering]: 'ترتيب',
            [QuestionType.Matching]: 'مطابقة',
        }
    }
};

type AnalysisResult = { feedback: string; category: string; subCategory: string; tags: string[] };
type EditableQuestion = Omit<Question, 'id'>;

const ExamFormModal: React.FC<ExamFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<number, 'assist' | 'analyze' | null>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<number, AnalysisResult | null>>({});
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const { lang } = useLanguage();
  const t = translations[lang];


  useEffect(() => {
    if (isOpen) {
        getCategories().then(setCategories);
    } else {
      setTitle('');
      setDescription('');
      setDuration(30);
      setDifficulty('Medium');
      setQuestions([]);
      setAnalysisResults({});
    }
  }, [isOpen]);

  const handleQuestionChange = (index: number, field: keyof EditableQuestion, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, value: string, field: 'options' | 'prompts' = 'options') => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question[field]) {
      question[field]![oIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const addListItem = (qIndex: number, field: 'options' | 'prompts' = 'options') => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question[field]) {
      question[field]!.push('');
    } else {
        (question as any)[field] = [''];
    }
    setQuestions(newQuestions);
  };

  const removeListItem = (qIndex: number, oIndex: number, field: 'options' | 'prompts' = 'options') => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    if (question[field]) {
      question[field]!.splice(oIndex, 1);
      setQuestions(newQuestions);
    }
  };


  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      type: QuestionType.MultipleChoice,
      options: ['', ''],
      correctAnswer: '',
      points: 5,
      tags: [],
      ownerId: '',
      category: '',
      subCategory: '',
    }]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };
  
  const handleTypeChange = (index: number, type: QuestionType) => {
    const newQuestions = [...questions];
    const q: Partial<EditableQuestion> = { type };

    switch (type) {
        case QuestionType.MultipleChoice: q.options = ['', '']; q.correctAnswer = ''; break;
        case QuestionType.MultipleSelect: q.options = ['', '']; q.correctAnswer = []; break;
        case QuestionType.TrueFalse: q.options = ['True', 'False']; q.correctAnswer = 'True'; break;
        case QuestionType.TrueFalseWithJustification: q.correctAnswer = 'True'; q.correctJustification = ''; break;
        case QuestionType.ShortAnswer:
        case QuestionType.Essay: q.correctAnswer = ''; delete q.options; break;
        case QuestionType.Ordering: q.options = ['', '']; q.correctAnswer = []; break;
        case QuestionType.Matching: q.prompts = ['', '']; q.options = ['', '']; q.correctAnswer = []; break;
    }
    newQuestions[index] = {...newQuestions[index], ...q};
    setQuestions(newQuestions);
  };

  const handleAddQuestionsFromBank = (bankQuestions: Question[]) => {
      const newEditableQuestions = bankQuestions.map(({ id, ...rest }) => rest);
      setQuestions(prev => [...prev, ...newEditableQuestions]);
      setIsBankModalOpen(false);
  };

  const handleAddQuestionsFromAI = (aiQuestions: Omit<Question, 'id'>[]) => {
    setQuestions(prev => [...prev, ...aiQuestions]);
    setIsAiModalOpen(false);
  };

  const handleAiAssist = async (qIndex: number) => {
      const partialText = questions[qIndex].text;
      if (partialText.length < 15) return;
      setAiLoading(prev => ({ ...prev, [qIndex]: 'assist' }));
      try {
          const suggestions = await getAIQuestionSuggestions({ partialQuestionText: partialText });
          const newQuestions = [...questions];
          newQuestions[qIndex] = {
              ...newQuestions[qIndex],
              text: suggestions.text,
              options: suggestions.options,
              correctAnswer: suggestions.correctAnswer,
              points: suggestions.points,
              tags: suggestions.tags,
              type: QuestionType.MultipleChoice,
          };
          setQuestions(newQuestions);
      } catch (error) {
          alert("AI assistance failed. Please try again.");
      } finally {
          setAiLoading(prev => ({ ...prev, [qIndex]: null }));
      }
  };

  const handleAiAnalyze = async (qIndex: number) => {
    const questionText = questions[qIndex].text;
    if (questionText.length < 20) return;
    setAiLoading(prev => ({ ...prev, [qIndex]: 'analyze' }));
    setAnalysisResults(prev => ({...prev, [qIndex]: null}));
    try {
        const result = await analyzeQuestionWithAI({ questionText, existingCategories: categories });
        setAnalysisResults(prev => ({...prev, [qIndex]: result}));
    } catch (error) {
        alert("AI analysis failed. Please try again.");
    } finally {
        setAiLoading(prev => ({ ...prev, [qIndex]: null }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || questions.length === 0) {
      alert(t.alertRequired);
      return;
    }
    const finalQuestions = questions.map((q, index) => {
      let finalQ: Question = { ...q, id: `q-${index}-${Date.now()}`};
      if (q.type === QuestionType.Ordering) {
        finalQ.correctAnswer = q.options || [];
      }
      return finalQ;
    });

    onSave({ title, description, duration, difficulty, questions: finalQuestions });
  };
  
  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">{t.createExam}</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input type="text" placeholder={t.examTitle} value={title} onChange={e => setTitle(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
            <input type="text" placeholder={t.description} value={description} onChange={e => setDescription(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" />
            <input type="number" placeholder={t.duration} value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required/>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500">
              <option value="Easy">{t.easy}</option>
              <option value="Medium">{t.medium}</option>
              <option value="Hard">{t.hard}</option>
            </select>
          </div>
          <hr className="my-6 border-slate-200 dark:border-slate-600"/>
          <h3 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">{t.questions}</h3>
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg border border-slate-200 dark:border-slate-600 relative">
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-3 right-3 text-red-500 hover:text-red-700"><TrashIcon className="w-6 h-6" /></button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative md:col-span-2">
                        <textarea placeholder={`${t.question} ${qIndex + 1}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full h-24" required />
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button type="button" onClick={() => handleAiAssist(qIndex)} disabled={!!aiLoading[qIndex] || q.text.length < 15} className="p-1.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50" title={t.aiAssistTitle}>
                               {aiLoading[qIndex] === 'assist' ? <SpinnerIcon className="w-4 h-4" /> : <Wand2Icon className="w-4 h-4" />}
                            </button>
                            <button type="button" onClick={() => handleAiAnalyze(qIndex)} disabled={!!aiLoading[qIndex] || q.text.length < 20} className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50" title={t.aiAnalyzeTitle}>
                               {aiLoading[qIndex] === 'analyze' ? <SpinnerIcon className="w-4 h-4" /> : <LightbulbIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <select value={q.type} onChange={e => handleTypeChange(qIndex, e.target.value as QuestionType)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full">
                            {Object.entries(t.questionTypes).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                        </select>
                        <input type="number" placeholder={t.points} value={q.points} onChange={e => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required />
                        <input type="text" placeholder={t.tags} value={q.tags?.join(', ') || ''} onChange={e => handleQuestionChange(qIndex, 'tags', e.target.value.split(',').map(t => t.trim()))} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" />
                    </div>
                </div>
                
                {analysisResults[qIndex] && (
                    <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-600 rounded-lg space-y-3">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center"><LightbulbIcon className="w-5 h-5 me-2 text-yellow-500" />{t.aiAnalysis.title}</h4>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.feedback}</p>
                            <p className="text-sm italic text-slate-700 dark:text-slate-200">"{analysisResults[qIndex]?.feedback}"</p>
                        </div>
                         <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.category}:</p>
                            <span className="text-sm font-mono bg-slate-200 dark:bg-slate-500 px-2 py-0.5 rounded">{analysisResults[qIndex]?.category} &gt; {analysisResults[qIndex]?.subCategory}</span>
                            <button onClick={() => { handleQuestionChange(qIndex, 'category', analysisResults[qIndex]?.category); handleQuestionChange(qIndex, 'subCategory', analysisResults[qIndex]?.subCategory); }} type="button" className="text-xs font-bold text-primary-500 hover:underline">{t.aiAnalysis.apply}</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t.aiAnalysis.tags}:</p>
                            <div className="flex flex-wrap gap-1">
                                {analysisResults[qIndex]?.tags.map(tag => <span key={tag} className="text-sm font-mono bg-slate-200 dark:bg-slate-500 px-2 py-0.5 rounded">{tag}</span>)}
                            </div>
                            <button onClick={() => handleQuestionChange(qIndex, 'tags', analysisResults[qIndex]?.tags)} type="button" className="text-xs font-bold text-primary-500 hover:underline">{t.aiAnalysis.apply}</button>
                        </div>
                    </div>
                )}

                {/* Answer Fields */}
                {q.type === QuestionType.MultipleChoice && (<div className="space-y-2">{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="radio" name={`correct-answer-${qIndex}`} value={opt} checked={q.correctAnswer === opt} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} /><input type="text" placeholder={`${t.options} ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(qIndex, oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem(qIndex)} className="text-sm text-primary-500 hover:text-primary-600 font-semibold mt-2">{t.addOption}</button></div>)}
                {q.type === QuestionType.MultipleSelect && (<div className="space-y-2">{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="checkbox" name={`correct-answer-${qIndex}`} value={opt} checked={(q.correctAnswer as string[]).includes(opt)} onChange={e => { const currentAnswers = (q.correctAnswer as string[] || []); const newAnswers = e.target.checked ? [...currentAnswers, opt] : currentAnswers.filter(a => a !== opt); handleQuestionChange(qIndex, 'correctAnswer', newAnswers); }} /><input type="text" placeholder={`${t.options} ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(qIndex, oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem(qIndex)} className="text-sm text-primary-500 hover:text-primary-600 font-semibold mt-2">{t.addOption}</button></div>)}
                {q.type === QuestionType.TrueFalse && (<div className="flex gap-4"><label className="flex items-center"><input type="radio" name={`correct-answer-${qIndex}`} value="True" checked={q.correctAnswer === 'True'} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', 'True')} className="me-2" /> True</label><label className="flex items-center"><input type="radio" name={`correct-answer-${qIndex}`} value="False" checked={q.correctAnswer === 'False'} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', 'False')} className="me-2" /> False</label></div>)}
                {q.type === QuestionType.TrueFalseWithJustification && (<div><div className="flex gap-4 mb-2"><label className="flex items-center"><input type="radio" name={`correct-answer-${qIndex}`} value="True" checked={q.correctAnswer === 'True'} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', 'True')} className="me-2" /> True</label><label className="flex items-center"><input type="radio" name={`correct-answer-${qIndex}`} value="False" checked={q.correctAnswer === 'False'} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', 'False')} className="me-2" /> False</label></div><textarea placeholder={t.modelJustification} value={q.correctJustification || ''} onChange={e => handleQuestionChange(qIndex, 'correctJustification', e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full h-24" /></div>)}
                {(q.type === QuestionType.Essay || q.type === QuestionType.ShortAnswer) && (<textarea placeholder={t.modelAnswerHelp} value={q.correctAnswer as string} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} className={`p-2 bg-white dark:bg-slate-600 rounded-md w-full ${q.type === QuestionType.ShortAnswer ? 'h-16' : 'h-24'}`} required />)}
                {q.type === QuestionType.Ordering && (<div className="space-y-2"><p className="text-sm text-slate-500 dark:text-slate-400">{t.orderingHelp}</p>{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><span className="text-slate-500">{oIndex+1}.</span><input type="text" placeholder={`${t.addItem} ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(qIndex, oIndex)} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 2}><XCircleIcon className="w-5 h-5" /></button></div>))}<button type="button" onClick={() => addListItem(qIndex)} className="text-sm text-primary-500 hover:text-primary-600 font-semibold mt-2">{t.addItem}</button></div>)}
                {q.type === QuestionType.Matching && (<div className="grid grid-cols-2 gap-6"><div><h4 className="font-semibold mb-2">{t.prompts}</h4>{q.prompts?.map((prompt, pIndex) => (<div key={pIndex} className="flex items-center gap-2 mb-2"><input type="text" placeholder={`${t.prompts} ${pIndex+1}`} value={prompt} onChange={e => handleOptionChange(qIndex, pIndex, e.target.value, 'prompts')} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(qIndex, pIndex, 'prompts')} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.prompts && q.prompts.length <= 1}><XCircleIcon className="w-5 h-5"/></button></div>))}<button type="button" onClick={() => addListItem(qIndex, 'prompts')} className="text-sm text-primary-500 hover:text-primary-600 font-semibold mt-2">{t.addPrompt}</button></div><div><h4 className="font-semibold mb-2">{t.options}</h4>{q.options?.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2 mb-2"><input type="text" placeholder={`${t.options} ${oIndex+1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value, 'options')} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full" required/><button type="button" onClick={() => removeListItem(qIndex, oIndex, 'options')} className="text-red-500 hover:text-red-600 disabled:opacity-50" disabled={q.options && q.options.length <= 1}><XCircleIcon className="w-5 h-5"/></button></div>))}<button type="button" onClick={() => addListItem(qIndex, 'options')} className="text-sm text-primary-500 hover:text-primary-600 font-semibold mt-2">{t.addOption}</button></div><div className="col-span-2"><h4 className="font-semibold mb-2">{t.correctMatches}</h4>{q.prompts?.map((prompt, pIndex) => (<div key={pIndex} className="flex items-center gap-4 mb-2"><span className="w-1/3">{prompt || `${t.prompts} ${pIndex+1}`}</span><select value={(q.correctAnswer as string[])[pIndex] || ''} onChange={e => { const newAnswers = [...(q.correctAnswer as string[])]; newAnswers[pIndex] = e.target.value; handleQuestionChange(qIndex, 'correctAnswer', newAnswers); }} className="p-2 bg-white dark:bg-slate-600 rounded-md w-2/3"><option value="" disabled>Select a match</option>{q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>))}</div></div>)}
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button type="button" onClick={addQuestion} className="w-full flex justify-center items-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-500 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><PlusCircleIcon className="w-6 h-6 me-2" />{t.addManually}</button>
               <button type="button" onClick={() => setIsBankModalOpen(true)} className="w-full flex justify-center items-center p-3 border-2 border-dashed border-primary-500 dark:border-primary-500 rounded-lg text-primary-500 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-slate-700 transition-colors"><PlusCircleIcon className="w-6 h-6 me-2" />{t.addFromBank}</button>
              <button type="button" onClick={() => setIsAiModalOpen(true)} className="w-full flex justify-center items-center p-3 border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-lg text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors font-semibold"><SparklesIcon className="w-6 h-6 me-2" />{t.aiGenerate}</button>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg">{t.saveExam}</button>
          </div>
        </form>
      </div>
    </div>
    <QuestionBankModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} onAddQuestions={handleAddQuestionsFromBank}/>
    <AIQuestionGeneratorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onAddQuestions={handleAddQuestionsFromAI}/>
    </>
  );
};

export default ExamFormModal;
