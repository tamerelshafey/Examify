import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, Question, QuestionType, QuestionStatus, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { SparklesIcon, SpinnerIcon, ArrowLeftIcon, BookOpenIcon, BarChartIcon, ClipboardListIcon, BriefcaseIcon, BuildingIcon } from '../components/icons';
import { parseExamTextWithAI } from '../services/ai';
import { createTeacherExam, createCorporateExam } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

type EditableQuestion = Omit<Question, 'id' | 'ownerId' | 'category' | 'subCategory' | 'status'>;

const translations = {
    en: {
        title: "Import Exam from Text",
        step1Title: "Step 1: Paste Your Exam Content",
        step1Desc: "Copy the entire content of your exam from a Word document, PDF, or text file and paste it below. The AI will attempt to parse the questions, options, and correct answers.",
        step2Title: "Step 2: Review & Finalize",
        step2Desc: "Review the questions parsed by the AI. Make any necessary corrections before saving.",
        analyze: "Analyze Text with AI",
        analyzing: "Analyzing...",
        pasteHere: "Paste your exam text here...",
        examTitle: "Exam Title",
        description: "Description",
        duration: "Duration (minutes)",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        saveExam: "Save Exam",
        cancel: "Cancel",
        back: "Back",
        noQuestionsParsed: "The AI could not parse any questions from the text. Please check the format and try again.",
        teacher: { myExams: "My Exams", questionBank: "Question Bank", analytics: "Analytics", dashboard: "Dashboard" },
        corporate: { assessments: "Assessments", questionBank: "Question Bank", analytics: "Analytics", dashboard: "Dashboard" },
        company: { courseExams: "Course Exams", questionBank: "Question Bank", analytics: "Analytics", dashboard: "Dashboard" },
    },
    ar: {
        title: "استيراد اختبار من نص",
        step1Title: "الخطوة 1: الصق محتوى اختبارك",
        step1Desc: "انسخ المحتوى الكامل لاختبارك من مستند Word أو PDF أو ملف نصي والصقه أدناه. سيحاول الذكاء الاصطناعي تحليل الأسئلة والخيارات والإجابات الصحيحة.",
        step2Title: "الخطوة 2: مراجعة ونهائية",
        step2Desc: "راجع الأسئلة التي حللها الذكاء الاصطناعي. قم بإجراء أي تصحيحات ضرورية قبل الحفظ.",
        analyze: "تحليل النص بالذكاء الاصطناعي",
        analyzing: "جاري التحليل...",
        pasteHere: "الصق نص اختبارك هنا...",
        examTitle: "عنوان الاختبار",
        description: "الوصف",
        duration: "المدة (بالدقائق)",
        easy: "سهل",
        medium: "متوسط",
        hard: "صعب",
        saveExam: "حفظ الاختبار",
        cancel: "إلغاء",
        back: "رجوع",
        noQuestionsParsed: "لم يتمكن الذكاء الاصطناعي من تحليل أي أسئلة من النص. يرجى التحقق من التنسيق والمحاولة مرة أخرى.",
        teacher: { myExams: "اختباراتي", questionBank: "بنك الأسئلة", analytics: "التحليلات", dashboard: "لوحة التحكم" },
        corporate: { assessments: "التقييمات", questionBank: "بنك الأسئلة", analytics: "التحليلات", dashboard: "لوحة التحكم" },
        company: { courseExams: "اختبارات الدورات", questionBank: "بنك الأسئلة", analytics: "التحليلات", dashboard: "لوحة التحكم" },
    }
};

const roleConfig = {
    [UserRole.Teacher]: {
        createExamApi: createTeacherExam,
        backPath: '/teacher/exams',
        navLinks: (t: any) => [
            { path: '/teacher', icon: BarChartIcon, label: t.teacher.dashboard },
            { path: '/teacher/exams', icon: BookOpenIcon, label: t.teacher.myExams },
            { path: '/teacher/question-bank', icon: ClipboardListIcon, label: t.teacher.questionBank },
            { path: '/teacher/analytics', icon: BarChartIcon, label: t.teacher.analytics },
        ],
    },
    [UserRole.Corporate]: {
        createExamApi: createCorporateExam,
        backPath: '/corporate/assessments',
        navLinks: (t: any) => [
            { path: '/corporate', icon: BarChartIcon, label: t.corporate.dashboard },
            { path: '/corporate/assessments', icon: BriefcaseIcon, label: t.corporate.assessments },
            { path: '/corporate/question-bank', icon: ClipboardListIcon, label: t.corporate.questionBank },
            { path: '/corporate/analytics', icon: BarChartIcon, label: t.corporate.analytics },
        ],
    },
    [UserRole.TrainingCompany]: {
        createExamApi: createTeacherExam, // Mock uses teacher's create
        backPath: '/company/exams',
        navLinks: (t: any) => [
            { path: '/company', icon: BarChartIcon, label: t.company.dashboard },
            { path: '/company/exams', icon: BuildingIcon, label: t.company.courseExams },
            { path: '/company/question-bank', icon: ClipboardListIcon, label: t.company.questionBank },
            { path: '/company/analytics', icon: BarChartIcon, label: t.company.analytics },
        ],
    },
};

const AIImportFromTextPage: React.FC = () => {
    const { lang } = useLanguage();
    const { theme } = useTheme();
    const { addNotification } = useNotification();
    const { userRole } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(30);
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [questions, setQuestions] = useState<EditableQuestion[]>([]);
    
    const config = userRole ? roleConfig[userRole as keyof typeof roleConfig] : null;
    const t = translations[lang];

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setIsLoading(true);
        try {
            const parsed = await parseExamTextWithAI({ rawText });
            if (parsed.length === 0) {
                addNotification(t.noQuestionsParsed, 'error');
            } else {
                setQuestions(parsed);
                setTitle('Imported Exam');
                setStep(2);
            }
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveExam = async () => {
        if (!title.trim() || questions.length === 0) {
            addNotification("Exam title and at least one question are required.", 'error');
            return;
        }
        if (!config || !userRole) {
            addNotification("User role not identified.", 'error');
            return;
        }

        const MOCK_USER_ID_MAP = {
            [UserRole.Teacher]: 'user-1',
            [UserRole.Corporate]: 'user-6',
            [UserRole.TrainingCompany]: 'user-5',
        };
        const currentUserId = MOCK_USER_ID_MAP[userRole as keyof typeof MOCK_USER_ID_MAP] || 'unknown-user';
        
        const finalQuestions: Question[] = questions.map((q, index) => ({
            ...q,
            id: `imported-${Date.now()}-${index}`,
            ownerId: currentUserId,
            category: 'Imported',
            subCategory: 'AI Parsed',
            status: QuestionStatus.Approved,
        }));

        try {
            await config.createExamApi({ title, description, duration, difficulty, questions: finalQuestions });
            addNotification('Exam created successfully!', 'success');
            navigate(config.backPath);
        } catch (error) {
            addNotification('Failed to create exam from imported text.', 'error');
        }
    };

    if (!config) {
        return <p>Invalid user role configuration.</p>;
    }

    const renderStep1 = () => (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t.step1Title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.step1Desc}</p>
            <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={t.pasteHere}
                className="w-full h-80 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => navigate(config.backPath)} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
                <button onClick={handleAnalyze} disabled={isLoading || !rawText.trim()} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                    {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    {isLoading ? t.analyzing : t.analyze}
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t.step2Title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.step2Desc}</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <input type="text" placeholder={t.examTitle} value={title} onChange={e => setTitle(e.target.value)} className="p-2 bg-white dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                <input type="text" placeholder={t.description} value={description} onChange={e => setDescription(e.target.value)} className="p-2 bg-white dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" />
                <input type="number" placeholder={t.duration} value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="p-2 bg-white dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required/>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="p-2 bg-white dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500">
                    <option value="Easy">{t.easy}</option>
                    <option value="Medium">{t.medium}</option>
                    <option value="Hard">{t.hard}</option>
                </select>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {questions.map((q, qIndex) => (
                     <div key={qIndex} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <textarea value={q.text} onChange={e => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].text = e.target.value;
                            setQuestions(newQuestions);
                        }} className="p-2 bg-white dark:bg-slate-600 rounded-md w-full mb-2" />
                        {(q.type === QuestionType.MultipleChoice || q.type === QuestionType.MultipleSelect) && q.options?.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 mb-1">
                                <input type="radio" name={`correct-answer-${qIndex}`} checked={q.correctAnswer === opt} onChange={() => {
                                    const newQuestions = [...questions];
                                    newQuestions[qIndex].correctAnswer = opt;
                                    setQuestions(newQuestions);
                                }} />
                                <input type="text" value={opt} onChange={e => {
                                    const newQuestions = [...questions];
                                    if(newQuestions[qIndex].options) {
                                        newQuestions[qIndex].options![oIndex] = e.target.value;
                                        setQuestions(newQuestions);
                                    }
                                }} className="p-1 bg-white dark:bg-slate-600 text-sm rounded-md w-full" />
                            </div>
                        ))}
                     </div>
                ))}
            </div>
             <div className="flex justify-between items-center mt-6">
                 <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:underline">
                    <ArrowLeftIcon className="w-4 h-4" />
                    {t.back}
                 </button>
                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(config.backPath)} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-lg">{t.cancel}</button>
                    <button onClick={handleSaveExam} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg">{t.saveExam}</button>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout
            navLinks={config.navLinks(t)}
            sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{theme.platformName}</h1>}
            pageTitle={t.title}
        >
           {step === 1 ? renderStep1() : renderStep2()}
        </DashboardLayout>
    );
};

export default AIImportFromTextPage;
