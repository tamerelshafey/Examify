

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetails, submitExam } from '../services/mockApi';
import { Exam, Question, QuestionType, StudentAnswer, ExamResult, Answer, ProctoringEvent } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon, DownloadIcon } from '../components/icons';
import { Language, useLanguage } from '../App';

type ProctoringAlert = {
  message: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
};

const proctoringTranslations = {
    en: {
        rec: "REC",
        accessDenied: "Camera/Mic access denied! Please enable permissions and refresh.",
        alerts: {
            lookAway: { message: "User looked away", details: "Looking away from the screen for too long.", severity: 'medium' },
            multipleFaces: { message: "Multiple faces detected", details: "Another person may be in the room.", severity: 'high' },
            noise: { message: "Unidentified noise", details: "Potential talking or background noise.", severity: 'low' },
            phone: { message: "Phone detected", details: "Mobile device detected in the testing area.", severity: 'high' },
            gaze: { message: "Gaze off-screen", details: "Eyes not focused on the exam content.", severity: 'low' }
        }
    },
    ar: {
        rec: "تسجيل",
        accessDenied: "تم رفض الوصول للكاميرا/الميكروفون! يرجى تمكين الأذونات وتحديث الصفحة.",
        alerts: {
            lookAway: { message: "المستخدم نظر بعيدًا", details: "النظر بعيدًا عن الشاشة لفترة طويلة.", severity: 'medium' },
            multipleFaces: { message: "تم اكتشاف وجوه متعددة", details: "قد يكون هناك شخص آخر في الغرفة.", severity: 'high' },
            noise: { message: "ضوضاء غير محددة", details: "احتمال وجود حديث أو ضوضاء في الخلفية.", severity: 'low' },
            phone: { message: "تم اكتشاف هاتف", details: "تم اكتشاف جهاز محمول في منطقة الاختبار.", severity: 'high' },
            gaze: { message: "نظرة خارج الشاشة", details: "العيون ليست مركزة على محتوى الاختبار.", severity: 'high' }
        }
    }
} as const;

const ProctoringWindow: React.FC<{ isProctoringActive: boolean; lang: Language }> = ({ isProctoringActive, lang }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [alert, setAlert] = useState<ProctoringAlert | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const alertTimeoutRef = useRef<number | null>(null);
    const t = proctoringTranslations[lang];

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startCamera = async () => {
            try {
                setCameraError(null);
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera/mic:", err);
                setCameraError(t.accessDenied);
            }
        };

        if (isProctoringActive) {
            startCamera();
            // Simulate AI alerts
            alertTimeoutRef.current = window.setInterval(() => {
                const alertKeys = Object.keys(t.alerts) as (keyof typeof t.alerts)[];
                const randomKey = alertKeys[Math.floor(Math.random() * alertKeys.length)];
                const randomAlert = t.alerts[randomKey];
                setAlert(randomAlert);
                setTimeout(() => setAlert(null), 5000); // More time to read
            }, 20000);
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (alertTimeoutRef.current) {
               clearInterval(alertTimeoutRef.current);
            }
        };
    }, [isProctoringActive, t]);

    const severityClasses: Record<ProctoringAlert['severity'], string> = {
        low: 'bg-yellow-400 text-black',
        medium: 'bg-orange-500 text-white',
        high: 'bg-red-600 text-white',
    };

    return (
        <div className={`fixed bottom-4 ${lang === 'ar' ? 'left-4' : 'right-4'} w-52 h-40 bg-slate-900 rounded-lg shadow-2xl overflow-hidden border-2 border-slate-700 z-50`}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            {!cameraError && (
                <div className={`absolute top-1 ${lang === 'ar' ? 'right-1' : 'left-1'} bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center`}>
                    <span className="w-2 h-2 bg-red-300 rounded-full me-1.5 animate-pulse"></span>
                    {t.rec}
                </div>
            )}
            {alert && (
                <div className={`absolute bottom-0 left-0 w-full p-2 text-xs text-center ${severityClasses[alert.severity]}`}>
                    <p className="font-bold uppercase tracking-wide">{alert.message}</p>
                    <p className="text-xs leading-tight mt-1">{alert.details}</p>
                </div>
            )}
            {cameraError && 
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 text-center text-red-500 font-semibold text-xs">
                {cameraError}
              </div>
            }
        </div>
    );
};

const translations = {
    en: {
        loadingExam: "Loading Exam...",
        examNotFound: "Exam not found.",
        duration: "Duration",
        minutes: "minutes",
        questions: "Questions",
        proctoringWarning: "This exam is AI-proctored. Please ensure your camera and microphone are enabled and that you are in a quiet, well-lit room.",
        startExam: "Start Exam",
        question: "Question",
        of: "of",
        previous: "Previous",
        next: "Next",
        submitExam: "Submit Exam",
        submitting: "Submitting...",
        resultTitle: "Exam Result:",
        submittedOn: "Submitted on:",
        yourScore: "Your Score",
        yourAnswers: "Your Answers:",
        yourAnswer: "Your answer:",
        notAnswered: "Not answered",
        downloadPdf: "Download PDF",
        backToDashboard: "Back to Dashboard",
        justifyPlaceholder: "Justify your answer...",
        typeAnswerPlaceholder: "Type your answer here...",
        selectMatchPlaceholder: "Select a match...",
    },
    ar: {
        loadingExam: "جاري تحميل الاختبار...",
        examNotFound: "الاختبار غير موجود.",
        duration: "المدة",
        minutes: "دقيقة",
        questions: "أسئلة",
        proctoringWarning: "هذا الاختبار مراقب بالذكاء الاصطناعي. يرجى التأكد من تمكين الكاميرا والميكروفون وأنك في غرفة هادئة ومضاءة جيدًا.",
        startExam: "ابدأ الاختبار",
        question: "سؤال",
        of: "من",
        previous: "السابق",
        next: "التالي",
        submitExam: "إرسال الاختبار",
        submitting: "جاري الإرسال...",
        resultTitle: "نتيجة الاختبار:",
        submittedOn: "تم الإرسال في:",
        yourScore: "درجتك",
        yourAnswers: "إجاباتك:",
        yourAnswer: "إجابتك:",
        notAnswered: "لم تتم الإجابة",
        downloadPdf: "تحميل PDF",
        backToDashboard: "العودة إلى لوحة التحكم",
        justifyPlaceholder: "برر إجابتك...",
        typeAnswerPlaceholder: "اكتب إجابتك هنا...",
        selectMatchPlaceholder: "اختر مطابقة...",
    }
}


const ExamTaker = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Exam | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<StudentAnswer>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examStarted, setExamStarted] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
    const examStartTime = useRef<number | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const { lang } = useLanguage();
    const t = translations[lang];

    useEffect(() => {
        if (!examId) return;
        const fetchExam = async () => {
            try {
                const data = await getExamDetails(examId);
                if (data) {
                    setExam(data);
                    setTimeLeft(data.duration * 60);
                } else {
                    navigate('/examinee');
                }
            } catch (error) {
                console.error("Failed to fetch exam details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExam();
    }, [examId, navigate]);

    // Timer and proctoring event listeners
    useEffect(() => {
        if (!examStarted) return;
        
        examStartTime.current = Date.now();

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setProctoringEvents(prev => [...prev, { type: 'tab_switch', timestamp: Date.now() - (examStartTime.current ?? 0) }]);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [examStarted]);

    const handleAnswerChange = (questionId: string, answer: Answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handlePaste = (questionId: string) => {
        setProctoringEvents(prev => [...prev, { type: 'paste_content', timestamp: Date.now() - (examStartTime.current ?? 0), details: `Question ${questionId}` }]);
    };

    const handleDragSort = (questionId: string) => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const currentAnswer = (answers[questionId] as string[] || exam?.questions[currentQuestionIndex].options || []);
        const newAnswer = [...currentAnswer];
        const draggedItemContent = newAnswer.splice(dragItem.current, 1)[0];
        newAnswer.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        handleAnswerChange(questionId, newAnswer);
    };


    const handleSubmit = useCallback(async () => {
        if (!examId) return;
        setIsSubmitting(true);
        try {
            const res = await submitExam(examId, answers, proctoringEvents);
            setResult(res);
        } catch (error) {
            console.error("Failed to submit exam", error);
        } finally {
            setIsSubmitting(false);
            setExamStarted(false);
        }
    }, [examId, answers, proctoringEvents]);
    
    useEffect(() => {
      if (timeLeft === 0 && examStarted) {
        handleSubmit();
      }
    }, [timeLeft, examStarted, handleSubmit]);

    const downloadPdf = () => {
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        if (resultRef.current) {
            html2canvas(resultRef.current).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Exam_Result_${exam?.title.replace(' ', '_')}.pdf`);
            });
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><p>{t.loadingExam}</p></div>;
    if (!exam) return <div className="flex justify-center items-center h-screen"><p>{t.examNotFound}</p></div>;
    
    if (result) {
        const percentage = Math.round((result.score / result.totalPoints) * 100);
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center p-4">
                <div className="w-full max-w-4xl">
                     <div ref={resultRef} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl">
                        <h2 className="text-3xl font-bold text-center mb-2">{t.resultTitle} {result.examTitle}</h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">{t.submittedOn} {result.submittedAt.toLocaleString()}</p>
                        <div className="text-center bg-slate-100 dark:bg-slate-700 p-6 rounded-lg mb-6">
                            <p className="text-lg">{t.yourScore}</p>
                            <p className="text-6xl font-extrabold text-primary-500">{result.score} / {result.totalPoints}</p>
                            <p className={`text-2xl font-bold mt-2 ${percentage >= 50 ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">{t.yourAnswers}</h3>
                            {exam.questions.map(q => {
                                const userAnswer = result.answers[q.id];
                                return (
                                <div key={q.id} className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <p className="font-semibold">{q.text}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{t.yourAnswer} {JSON.stringify(userAnswer) || t.notAnswered}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button onClick={downloadPdf} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <DownloadIcon className="w-5 h-5 me-2"/> {t.downloadPdf}
                        </button>
                        <button onClick={() => navigate('/examinee')} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {t.backToDashboard}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!examStarted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center">
                <h2 className="text-4xl font-bold mb-2">{exam.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl mb-6">{exam.description}</p>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-8 text-left space-y-2">
                    <p><span className="font-bold">{t.duration}:</span> {exam.duration} {t.minutes}</p>
                    <p><span className="font-bold">{t.questions}:</span> {exam.questionCount}</p>
                    <p className="text-yellow-600 dark:text-yellow-400 font-semibold mt-4">
                        {t.proctoringWarning}
                    </p>
                </div>
                <button onClick={() => setExamStarted(true)} className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-lg py-3 px-10 rounded-lg transition-transform transform hover:scale-105">
                    {t.startExam}
                </button>
            </div>
        )
    }

    const currentQuestion: Question = exam.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex flex-col">
            <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <div className="flex items-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-bold px-4 py-2 rounded-lg">
                    <ClockIcon className="w-5 h-5 me-2" />
                    <span>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.question} {currentQuestionIndex + 1} {t.of} {exam.questions.length}</p>
                    <p className="text-2xl font-semibold my-4">{currentQuestion.text}</p>
                    
                    <div className="space-y-4">
                        {currentQuestion.type === QuestionType.MultipleChoice && currentQuestion.options?.map(option => (
                            <label key={option} className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                <input type="radio" name={currentQuestion.id} value={option} onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)} checked={currentAnswer === option} className="w-5 h-5 text-primary-500 focus:ring-primary-500"/>
                                <span className="ms-4 text-lg">{option}</span>
                            </label>
                        ))}
                        {currentQuestion.type === QuestionType.MultipleSelect && currentQuestion.options?.map(option => (
                            <label key={option} className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                <input type="checkbox" name={currentQuestion.id} value={option} 
                                    onChange={e => {
                                        const currentSelections = (currentAnswer as string[] || []);
                                        const newSelections = e.target.checked ? [...currentSelections, option] : currentSelections.filter(item => item !== option);
                                        handleAnswerChange(currentQuestion.id, newSelections);
                                    }}
                                    checked={(currentAnswer as string[] || []).includes(option)} 
                                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                                />
                                <span className="ms-4 text-lg">{option}</span>
                            </label>
                        ))}
                        {currentQuestion.type === QuestionType.TrueFalse && ['True', 'False'].map(option => (
                             <label key={option} className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                <input type="radio" name={currentQuestion.id} value={option} onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)} checked={currentAnswer === option} className="w-5 h-5 text-primary-500 focus:ring-primary-500"/>
                                <span className="ms-4 text-lg">{lang === 'ar' ? (option === 'True' ? 'صح' : 'خطأ') : option}</span>
                            </label>
                        ))}
                         {currentQuestion.type === QuestionType.TrueFalseWithJustification && (
                            <div>
                                {['True', 'False'].map(option => (
                                     <label key={option} className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors mb-4">
                                        <input type="radio" name={`${currentQuestion.id}-selection`} value={option} 
                                            onChange={e => handleAnswerChange(currentQuestion.id, {...(currentAnswer as object || {justification: ''}), selection: e.target.value})}
                                            checked={(currentAnswer as any)?.selection === option} 
                                            className="w-5 h-5 text-primary-500 focus:ring-primary-500"/>
                                        <span className="ms-4 text-lg">{lang === 'ar' ? (option === 'True' ? 'صح' : 'خطأ') : option}</span>
                                    </label>
                                ))}
                                <textarea
                                    value={(currentAnswer as any)?.justification || ''}
                                    onPaste={() => handlePaste(currentQuestion.id)}
                                    onChange={e => handleAnswerChange(currentQuestion.id, {...(currentAnswer as object || {selection: ''}), justification: e.target.value})}
                                    className="w-full h-24 mt-2 p-4 border-2 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder={t.justifyPlaceholder}
                                ></textarea>
                            </div>
                        )}
                        {(currentQuestion.type === QuestionType.Essay || currentQuestion.type === QuestionType.ShortAnswer) && (
                            <textarea
                                value={(currentAnswer as string) || ''}
                                onPaste={() => handlePaste(currentQuestion.id)}
                                onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className={`w-full p-4 border-2 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 ${currentQuestion.type === QuestionType.ShortAnswer ? 'h-20' : 'h-40'}`}
                                placeholder={t.typeAnswerPlaceholder}
                            ></textarea>
                        )}
                        {currentQuestion.type === QuestionType.Ordering && (
                            <div className="space-y-2">
                                {(answers[currentQuestion.id] as string[] || currentQuestion.options || []).map((option, index) => (
                                    <div key={option} 
                                        className="flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-700 cursor-grab"
                                        draggable
                                        onDragStart={() => dragItem.current = index}
                                        onDragEnter={() => dragOverItem.current = index}
                                        onDragEnd={() => handleDragSort(currentQuestion.id)}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <span className="me-4 text-slate-500">☰</span>
                                        <span className="text-lg">{option}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentQuestion.type === QuestionType.Matching && (
                             <div className="space-y-4">
                                {currentQuestion.prompts?.map(prompt => (
                                    <div key={prompt} className="flex items-center justify-between p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                                        <span className="text-lg">{prompt}</span>
                                        <select
                                            value={(currentAnswer as Record<string, string>)?.[prompt] || ''}
                                            onChange={e => handleAnswerChange(currentQuestion.id, {...(currentAnswer as Record<string,string> || {}), [prompt]: e.target.value})}
                                            className="p-2 bg-slate-100 dark:bg-slate-600 rounded-md focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="" disabled>{t.selectMatchPlaceholder}</option>
                                            {currentQuestion.options?.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-4xl mt-8 flex justify-between">
                    <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {t.previous}
                    </button>
                    {currentQuestionIndex === exam.questions.length - 1 ? (
                        <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                            {isSubmitting ? t.submitting : t.submitExam}
                        </button>
                    ) : (
                        <button onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg">
                            {t.next}
                        </button>
                    )}
                </div>
            </main>
            <ProctoringWindow isProctoringActive={examStarted && !result} lang={lang}/>
        </div>
    );
};

export default ExamTaker;