import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useLanguage } from '../contexts/LanguageContext';
// Fix: Import `CheckCircleIcon` to resolve the 'Cannot find name' error.
import { ShieldCheckIcon, SparklesIcon, DesktopIcon, Wand2Icon, MicIcon, LightbulbIcon, ClipboardListIcon, PlusCircleIcon, BarChartIcon, InboxIcon, EyeIcon, TagIcon, CheckCircleIcon } from '../components/icons';

const translations = {
    en: {
        pageTitle: "Platform Features",
        pageSubtitle: "Explore the comprehensive suite of tools designed for modern, secure, and insightful assessments.",
        
        categoryCreation: "Creation & Management",
        categoryIntegrity: "AI Integrity & Security",
        categoryAnalytics: "AI Analytics & Insights",
        
        // Creation & Management
        richQuestionBank: "Rich Question Bank",
        richQuestionBankDesc: "Create, manage, and tag your own private question banks. Import questions in bulk and reuse them across multiple exams.",
        multipleQuestionTypes: "Multiple Question Types",
        multipleQuestionTypesDesc: "From multiple choice and essays to ordering and matching, build comprehensive assessments that truly test understanding.",
        aiQuestionGeneration: "AI Question Generation",
        aiQuestionGenerationDesc: "Generate entire exams or individual questions from a simple text prompt. Create unique variants to prevent cheating.",
        importFromText: "Import from Text",
        importFromTextDesc: "AI-powered parsing allows you to copy-paste an entire exam from a document, and our system will structure it automatically.",

        // AI Integrity & Security
        smartProctoring: "Smart AI Proctoring",
        smartProctoringDesc: "Our AI analyzes visual behavior, digital patterns, and audio to detect suspicious activities and generate a comprehensive integrity report.",
        smartProctoringSub: ["Gaze & Head Pose Tracking", "Multi-Face Detection", "Mobile Phone Detection", "Audio Anomaly Analysis", "Tab & Window Switch Monitoring"],
        secureBrowser: "Secure Exam Browser",
        secureBrowserDesc: "For high-stakes exams, our dedicated desktop and mobile apps lock down the testing environment, preventing access to other applications.",
        plagiarismDetection: "Plagiarism & AI-Writing Detection",
        plagiarismDetectionDesc: "For essay questions, our AI cross-references answers with web sources and analyzes writing style to detect potential plagiarism or use of AI writers.",

        // AI Analytics & Insights
        detailedAnalytics: "Detailed Analytics",
        detailedAnalyticsDesc: "Go beyond scores with AI-powered insights into question performance, student struggles, and topic mastery.",
        personalizedGuides: "Personalized Study Guides",
        personalizedGuidesDesc: "After an exam, the AI analyzes weak points and generates a custom study plan with targeted resources to help students improve.",
        performancePrediction: "Performance Prediction",
        performancePredictionDesc: "Our AI identifies at-risk students based on performance trends, allowing educators to intervene proactively before it's too late.",
        speechAnalysis: "Speech & Voice Analysis",
        speechAnalysisDesc: "Evaluate language proficiency and presentation skills with AI-powered analysis of spoken answers for fluency, pronunciation, and accuracy.",
    },
    ar: {
        pageTitle: "ميزات المنصة",
        pageSubtitle: "استكشف المجموعة الشاملة من الأدوات المصممة للتقييمات الحديثة والآمنة والعميقة.",

        categoryCreation: "الإنشاء والإدارة",
        categoryIntegrity: "النزاهة والأمان بالذكاء الاصطناعي",
        categoryAnalytics: "التحليلات والرؤى الذكية",

        richQuestionBank: "بنك أسئلة غني",
        richQuestionBankDesc: "أنشئ وأدر وصنف بنوك أسئلة خاصة بك. استورد الأسئلة دفعة واحدة وأعد استخدامها في اختبارات متعددة.",
        multipleQuestionTypes: "أنواع أسئلة متعددة",
        multipleQuestionTypesDesc: "من الاختيار من متعدد والمقالي إلى الترتيب والمطابقة، أنشئ تقييمات شاملة تختبر الفهم الحقيقي.",
        aiQuestionGeneration: "إنشاء الأسئلة بالذكاء الاصطناعي",
        aiQuestionGenerationDesc: "أنشئ اختبارات كاملة أو أسئلة فردية من موجه نصي بسيط. أنشئ متغيرات فريدة لمنع الغش.",
        importFromText: "الاستيراد من نص",
        importFromTextDesc: "يسمح لك التحليل المدعوم بالذكاء الاصطناعي بنسخ ولصق اختبار كامل من مستند، وسيقوم نظامنا بتنظيمه تلقائيًا.",

        smartProctoring: "المراقبة الذكية بالذكاء الاصطناعي",
        smartProctoringDesc: "يحلل الذكاء الاصطناعي السلوك البصري والأنماط الرقمية والصوت لاكتشاف الأنشطة المشبوهة وإنشاء تقرير نزاهة شامل.",
        smartProctoringSub: ["تتبع النظرة ووضعية الرأس", "كشف الوجوه المتعددة", "كشف الهواتف المحمولة", "تحليل الأصوات الشاذة", "مراقبة تبديل النوافذ"],
        secureBrowser: "متصفح الاختبار الآمن",
        secureBrowserDesc: "للاختبارات عالية الأهمية، يقوم تطبيقنا المخصص لسطح المكتب والجوال بإغلاق بيئة الاختبار، مما يمنع الوصول للتطبيقات الأخرى.",
        plagiarismDetection: "كشف الانتحال والكتابة بالذكاء الاصطناعي",
        plagiarismDetectionDesc: "للأسئلة المقالية، يقوم الذكاء الاصطناعي بمقارنة الإجابات بمصادر الويب وتحليل أسلوب الكتابة للكشف عن الانتحال المحتمل أو استخدام كتّاب الذكاء الاصطناعي.",
        
        detailedAnalytics: "تحليلات مفصلة",
        detailedAnalyticsDesc: "تجاوز الدرجات مع رؤى مدعومة بالذكاء الاصطناعي حول أداء الأسئلة، وصعوبات الطلاب، وإتقان المواضيع.",
        personalizedGuides: "خطط دراسية مخصصة",
        personalizedGuidesDesc: "بعد الاختبار، يحلل الذكاء الاصطناعي نقاط الضعف وينشئ خطة دراسة مخصصة مع موارد موجهة لمساعدة الطلاب على التحسن.",
        performancePrediction: "التنبؤ بالأداء",
        performancePredictionDesc: "يحدد الذكاء الاصطناعي الطلاب المعرضين للخطر بناءً على اتجاهات الأداء، مما يسمح للمعلمين بالتدخل بشكل استباقي قبل فوات الأوان.",
        speechAnalysis: "تحليل الصوت والكلام",
        speechAnalysisDesc: "تقييم إتقان اللغة ومهارات العرض عبر تحليل الذكاء الاصطناعي للإجابات الشفهية من حيث الطلاقة والنطق والدقة.",
    }
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode, subFeatures?: string[] }> = ({ icon: Icon, title, children, subFeatures }) => (
    <div className="bg-white dark:bg-slate-900/70 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 ms-4">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 flex-grow">{children}</p>
        {subFeatures && (
            <ul className="mt-4 space-y-2">
                {subFeatures.map((sub, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 me-2 flex-shrink-0" />
                        {sub}
                    </li>
                ))}
            </ul>
        )}
    </div>
);


const FeaturesPage: React.FC = () => {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [activeCategory, setActiveCategory] = useState('creation');

    const features = {
        creation: [
            { icon: ClipboardListIcon, title: t.richQuestionBank, desc: t.richQuestionBankDesc },
            { icon: PlusCircleIcon, title: t.multipleQuestionTypes, desc: t.multipleQuestionTypesDesc },
            { icon: SparklesIcon, title: t.aiQuestionGeneration, desc: t.aiQuestionGenerationDesc },
            { icon: InboxIcon, title: t.importFromText, desc: t.importFromTextDesc },
        ],
        integrity: [
            { icon: ShieldCheckIcon, title: t.smartProctoring, desc: t.smartProctoringDesc, subFeatures: t.smartProctoringSub },
            { icon: DesktopIcon, title: t.secureBrowser, desc: t.secureBrowserDesc },
            { icon: EyeIcon, title: t.plagiarismDetection, desc: t.plagiarismDetectionDesc },
        ],
        analytics: [
            { icon: BarChartIcon, title: t.detailedAnalytics, desc: t.detailedAnalyticsDesc },
            { icon: LightbulbIcon, title: t.personalizedGuides, desc: t.personalizedGuidesDesc },
            { icon: Wand2Icon, title: t.performancePrediction, desc: t.performancePredictionDesc },
            { icon: MicIcon, title: t.speechAnalysis, desc: t.speechAnalysisDesc },
        ]
    };

    const categories = [
        { id: 'creation', label: t.categoryCreation },
        { id: 'integrity', label: t.categoryIntegrity },
        { id: 'analytics', label: t.categoryAnalytics },
    ];

    return (
        <PublicLayout>
            <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.pageTitle}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">{t.pageSubtitle}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {/* Sticky Nav */}
                        <div className="md:w-1/4">
                            <ul className="md:sticky md:top-24 space-y-2">
                                {categories.map(cat => (
                                     <li key={cat.id}>
                                         <button 
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full text-left font-semibold p-3 rounded-lg transition-colors ${activeCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                         >
                                             {cat.label}
                                         </button>
                                     </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Features Grid */}
                        <div className="md:w-3/4">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {features[activeCategory as keyof typeof features].map(feature => (
                                    <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} subFeatures={(feature as any).subFeatures}>
                                        {feature.desc}
                                    </FeatureCard>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default FeaturesPage;