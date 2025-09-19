
import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { useLanguage } from '../App';
import { ShieldCheckIcon, SparklesIcon, DesktopIcon, Wand2Icon, MicIcon, LightbulbIcon, ClipboardListIcon, PlusCircleIcon, BarChartIcon, InboxIcon, EyeIcon, TagIcon } from '../components/icons';

const translations = {
    en: {
        featuresTitle: "An AI-Powered Toolkit for Absolute Integrity",
        featuresSubtitle: "Our multi-layered security system ensures every assessment is fair, secure, and authentic.",
        
        smartProctoring: "Smart AI Proctoring",
        smartProctoringDesc: "Our AI analyzes visual behavior, digital patterns, and audio to detect suspicious activities and generate a comprehensive integrity report.",
        dynamicQuestions: "Dynamic Questions",
        dynamicQuestionsDesc: "Combat group cheating with unique exams for each student, generated in real-time by Gemini models, making answer sharing futile.",
        secureBrowser: "Secure Exam Browser",
        secureBrowserDesc: "For high-stakes exams, our dedicated desktop and mobile apps lock down the testing environment, preventing access to other applications.",
        adaptiveTesting: "Adaptive Testing",
        adaptiveTestingDesc: "The AI selects the next question based on the student's previous answer, providing a more accurate assessment with fewer questions.",
        speechAnalysis: "Speech & Voice Analysis",
        speechAnalysisDesc: "Evaluate language proficiency and presentation skills with AI-powered analysis of spoken answers for fluency, pronunciation, and accuracy.",
        personalizedGuides: "Personalized Study Guides",
        personalizedGuidesDesc: "After an exam, the AI analyzes weak points and generates a custom study plan with targeted resources to help students improve.",
        richQuestionBank: "Rich Question Bank",
        richQuestionBankDesc: "Create, manage, and tag your own private question banks. Import questions in bulk and reuse them across multiple exams.",
        multipleQuestionTypes: "Multiple Question Types",
        multipleQuestionTypesDesc: "From multiple choice and essays to ordering and matching, build comprehensive assessments that truly test understanding.",
        detailedAnalytics: "Detailed Analytics",
        detailedAnalyticsDesc: "Go beyond scores with AI-powered insights into question performance, student struggles, and topic mastery.",

        roadmapTitle: "The Future of Learning",
        roadmapSubtitle: "We are constantly innovating to bring you the most advanced assessment tools.",
        roadmapIntegration: "LMS & ATS Integration",
        roadmapIntegrationDesc: "Seamlessly connect with systems like Moodle, Canvas, and Workday to streamline your assessment workflow.",
        roadmapLiveProctoring: "Live Proctoring Center",
        roadmapLiveProctoringDesc: "A command center for human proctors, assisted by AI that flags suspicious activities in real-time.",
        roadmapMarketplace: "Verified Question Marketplace",
        roadmapMarketplaceDesc: "A marketplace for educators and experts to buy and sell high-quality, verified question banks.",
        soon: "SOON",
    },
    ar: {
        featuresTitle: "نظام متكامل للنزاهة مدعوم بالذكاء الاصطناعي",
        featuresSubtitle: "يضمن نظام الأمان متعدد الطبقات لدينا أن كل تقييم عادل وآمن وأصلي.",

        smartProctoring: "المراقبة الذكية بالذكاء الاصطناعي",
        smartProctoringDesc: "يحلل الذكاء الاصطناعي السلوك البصري والأنماط الرقمية والصوت لاكتشاف الأنشطة المشبوهة وإنشاء تقرير نزاهة شامل.",
        dynamicQuestions: "الأسئلة الديناميكية",
        dynamicQuestionsDesc: "لمكافحة الغش الجماعي، تولد المنصة نسخة فريدة من الاختبار لكل طالب في الوقت الفعلي باستخدام نماذج Gemini، مما يجعل تبادل الإجابات عديم الجدوى.",
        secureBrowser: "متصفح الاختبار الآمن",
        secureBrowserDesc: "للاختبارات عالية الأهمية، يقوم تطبيقنا المخصص لسطح المكتب والجوال بإغلاق بيئة الاختبار، مما يمنع الوصول للتطبيقات الأخرى.",
        adaptiveTesting: "الاختبارات التكيفية",
        adaptiveTestingDesc: "يختار الذكاء الاصطناعي السؤال التالي بناءً على إجابة الطالب السابقة، مما يوفر تقييمًا أكثر دقة بأسئلة أقل.",
        speechAnalysis: "تحليل الصوت والكلام",
        speechAnalysisDesc: "تقييم إتقان اللغة ومهارات العرض عبر تحليل الذكاء الاصطناعي للإجابات الشفهية من حيث الطلاقة والنطق والدقة.",
        personalizedGuides: "خطط دراسية مخصصة",
        personalizedGuidesDesc: "بعد الاختبار، يحلل الذكاء الاصطناعي نقاط الضعف وينشئ خطة دراسة مخصصة مع موارد موجهة لمساعدة الطلاب على التحسن.",
        richQuestionBank: "بنك أسئلة غني",
        richQuestionBankDesc: "أنشئ وأدر وصنف بنوك أسئلة خاصة بك. استورد الأسئلة دفعة واحدة وأعد استخدامها في اختبارات متعددة.",
        multipleQuestionTypes: "أنواع أسئلة متعددة",
        multipleQuestionTypesDesc: "من الاختيار من متعدد والمقالي إلى الترتيب والمطابقة، أنشئ تقييمات شاملة تختبر الفهم الحقيقي.",
        detailedAnalytics: "تحليلات مفصلة",
        detailedAnalyticsDesc: "تجاوز الدرجات مع رؤى مدعومة بالذكاء الاصطناعي حول أداء الأسئلة، وصعوبات الطلاب، وإتقان المواضيع.",
        
        roadmapTitle: "مستقبل التعلّم",
        roadmapSubtitle: "نحن نبتكر باستمرار لنقدم لكم أدوات التقييم الأكثر تقدماً.",
        roadmapIntegration: "التكامل مع أنظمة LMS و ATS",
        roadmapIntegrationDesc: "اتصل بسلاسة مع أنظمة مثل Moodle و Canvas و Workday لتبسيط سير عمل التقييم الخاص بك.",
        roadmapLiveProctoring: "مركز المراقبة المباشرة",
        roadmapLiveProctoringDesc: "مركز تحكم للمراقبين البشريين، بمساعدة الذكاء الاصطناعي الذي يحدد الأنشطة المشبوهة في الوقت الفعلي.",
        roadmapMarketplace: "سوق الأسئلة المعتمدة",
        roadmapMarketplaceDesc: "سوق للمعلمين والخبراء لشراء وبيع بنوك أسئلة عالية الجودة ومعتمدة.",
        soon: "قريباً",
    }
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);

const RoadmapCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center mb-3">
                 <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full me-3">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <span className="ms-auto text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300 py-1 px-2 rounded-full">{t.soon}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{children}</p>
        </div>
    );
};

const FeaturesPage: React.FC = () => {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <PublicLayout>
            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.featuresTitle}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={ShieldCheckIcon} title={t.smartProctoring}>{t.smartProctoringDesc}</FeatureCard>
                        <FeatureCard icon={SparklesIcon} title={t.dynamicQuestions}>{t.dynamicQuestionsDesc}</FeatureCard>
                        <FeatureCard icon={DesktopIcon} title={t.secureBrowser}>{t.secureBrowserDesc}</FeatureCard>
                        <FeatureCard icon={Wand2Icon} title={t.adaptiveTesting}>{t.adaptiveTestingDesc}</FeatureCard>
                        <FeatureCard icon={MicIcon} title={t.speechAnalysis}>{t.speechAnalysisDesc}</FeatureCard>
                        <FeatureCard icon={LightbulbIcon} title={t.personalizedGuides}>{t.personalizedGuidesDesc}</FeatureCard>
                        <FeatureCard icon={ClipboardListIcon} title={t.richQuestionBank}>{t.richQuestionBankDesc}</FeatureCard>
                        <FeatureCard icon={PlusCircleIcon} title={t.multipleQuestionTypes}>{t.multipleQuestionTypesDesc}</FeatureCard>
                        <FeatureCard icon={BarChartIcon} title={t.detailedAnalytics}>{t.detailedAnalyticsDesc}</FeatureCard>
                    </div>
                </div>
            </section>

             {/* Roadmap Section */}
            <section id="roadmap" className="py-20 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.roadmapTitle}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.roadmapSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <RoadmapCard icon={InboxIcon} title={t.roadmapIntegration}>{t.roadmapIntegrationDesc}</RoadmapCard>
                        <RoadmapCard icon={EyeIcon} title={t.roadmapLiveProctoring}>{t.roadmapLiveProctoringDesc}</RoadmapCard>
                        <RoadmapCard icon={TagIcon} title={t.roadmapMarketplace}>{t.roadmapMarketplaceDesc}</RoadmapCard>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default FeaturesPage;
