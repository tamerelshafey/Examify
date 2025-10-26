import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { BookOpenIcon, UsersIcon, BriefcaseIcon, BuildingIcon, CheckCircleIcon, SparklesIcon, ShieldCheckIcon, Wand2Icon, PlusCircleIcon, BarChartIcon, StarIcon, LightbulbIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import PublicLayout from '../components/PublicLayout';

const translations = {
    en: {
        heroTitle: "The Future of Online Assessment",
        heroSubtitle: "provides a secure, intuitive, and powerful platform for creating, administering, and analyzing exams with advanced AI-powered integrity features.",
        heroCTA: "Choose Your Role & Get Started",
        
        whyChooseUsTitle: "Why Choose Examify?",
        whyChooseUsSubtitle: "Go beyond traditional testing with features designed for accuracy, integrity, and insight.",
        feature1Title: "AI-Powered",
        feature1Desc: "From generating unique exam variants to providing deep analytical insights, our AI is your trusted co-pilot.",
        feature2Title: "Unmatched Security",
        feature2Desc: "Multi-layered proctoring, a secure browser, and plagiarism checks ensure every assessment is fair and authentic.",
        feature3Title: "Effortless Workflow",
        feature3Desc: "An intuitive interface designed to save you time, whether you're creating a simple quiz or a complex assessment.",

        howItWorksTitle: "Get Started in 3 Simple Steps",
        step1Title: "Create or Import",
        step1Desc: "Easily create exams manually, import from text, or generate entire assessments with a single AI prompt.",
        step2Title: "Administer Securely",
        step2Desc: "Deliver assessments with our AI-proctoring and lockdown features, ensuring a fair testing environment for everyone.",
        step3Title: "Analyze & Improve",
        step3Desc: "Gain deep insights into performance with AI-powered analytics and generate personalized study plans.",

        learningCycleTitle: "Beyond the Score: A Full Learning Cycle",
        cycleStep1Title: "Take the Exam",
        cycleStep1Desc: "Students take exams in a secure, AI-proctored environment.",
        cycleStep2Title: "Instant Results",
        cycleStep2Desc: "Receive scores immediately and review answer-by-answer feedback.",
        cycleStep3Title: "AI-Powered Insights",
        cycleStep3Desc: "Our AI explains *why* an answer was wrong, turning mistakes into learning opportunities.",
        cycleStep4Title: "Personalized Plan",
        cycleStep4Desc: "A custom study plan is generated to address weaknesses, complete with resources and practice questions.",

        testimonialsTitle: "Trusted by Educators & Professionals",
        testimonial1: "Examify has revolutionized how I create and grade exams. The AI-generated questions save me hours, and the analytics help me pinpoint exactly where my students are struggling.",
        testimonial1Name: "Ali H.",
        testimonial1Role: "High School Teacher",
        testimonial2: "The AI proctoring feature is a game-changer for our remote hiring process. We can now assess candidates' skills with a high degree of confidence and integrity.",
        testimonial2Name: "Sara K.",
        testimonial2Role: "HR Manager, Innovate Corp.",
        testimonial3: "Managing certifications for hundreds of trainees was a logistical nightmare. Examify centralized our entire process, from assessment to issuing certificates.",
        testimonial3Name: "Yusuf I.",
        testimonial3Role: "Training Coordinator, Future Skills Co.",

        finalCtaTitle: "Ready to Revolutionize Your Assessments?",
        finalCtaButton: "Get Started Now",

        designedForTitle: "Designed for Every Educational Need",
        designedForSubtitle: "Whether you're an educator, a hiring manager, or a training provider, our platform adapts to your workflow.",

        forTeachersTitle: "For Teachers",
        forTeachersDesc: "Save time, gain insights, and deliver better learning outcomes.",
        forTeachersFeature1: "Automate grading for objective questions.",
        forTeachersFeature2: "Generate diverse exams with AI.",
        forTeachersFeature3: "Track student performance with detailed analytics.",

        forCorporateTitle: "For Corporates",
        forCorporateDesc: "Identify top talent and skill gaps within your teams efficiently.",
        forCorporateFeature1: "Create tailored skill assessments.",
        forCorporateFeature2: "Ensure candidate integrity with AI proctoring.",
        forCorporateFeature3: "Make data-driven hiring and training decisions.",

        forCompanyTitle: "For Training Companies",
        forCompanyDesc: "Manage courses, assess trainee knowledge, and certify skills at scale.",
        forCompanyFeature1: "Deploy pre- and post-training assessments.",
        forCompanyFeature2: "Centralize your question banks.",
        forCompanyFeature3: "Issue certificates based on performance.",
    },
    ar: {
        heroTitle: "مستقبل التقييم عبر الإنترنت",
        heroSubtitle: "يوفر منصة آمنة وبديهية وقوية لإنشاء وإدارة وتحليل الاختبارات مع ميزات نزاهة متقدمة مدعومة بالذكاء الاصطناعي.",
        heroCTA: "اختر دورك وابدأ الآن",
        
        whyChooseUsTitle: "لماذا تختار Examify؟",
        whyChooseUsSubtitle: "تجاوز الاختبارات التقليدية بميزات مصممة للدقة والنزاهة والرؤى العميقة.",
        feature1Title: "مدعوم بالذكاء الاصطناعي",
        feature1Desc: "من إنشاء نماذج اختبار فريدة إلى توفير رؤى تحليلية عميقة، ذكاؤنا الاصطناعي هو مساعدك الموثوق.",
        feature2Title: "أمان لا مثيل له",
        feature2Desc: "تضمن المراقبة متعددة الطبقات والمتصفح الآمن وفحوصات الانتحال أن كل تقييم عادل وأصلي.",
        feature3Title: "سير عمل سلس",
        feature3Desc: "واجهة سهلة الاستخدام مصممة لتوفير وقتك، سواء كنت تنشئ اختبارًا بسيطًا أو تقييمًا معقدًا.",

        howItWorksTitle: "ابدأ في 3 خطوات بسيطة",
        step1Title: "أنشئ أو استورد",
        step1Desc: "أنشئ الاختبارات يدويًا بسهولة، أو استوردها من نص، أو أنشئ تقييمات كاملة بموجه واحد للذكاء الاصطناعي.",
        step2Title: "أدر الاختبار بأمان",
        step2Desc: "قدّم التقييمات مع ميزات المراقبة الذكية والإغلاق، مما يضمن بيئة اختبار عادلة للجميع.",
        step3Title: "حلل وحسّن",
        step3Desc: "احصل على رؤى عميقة حول الأداء باستخدام التحليلات المدعومة بالذكاء الاصطناعي وأنشئ خططًا دراسية مخصصة.",
        
        learningCycleTitle: "ما بعد الدرجة: دورة تعلم متكاملة",
        cycleStep1Title: "أداء الاختبار",
        cycleStep1Desc: "يؤدي الطلاب الاختبارات في بيئة آمنة ومراقبة بالذكاء الاصطناعي.",
        cycleStep2Title: "نتائج فورية",
        cycleStep2Desc: "احصل على درجاتك فورًا وراجع ملاحظات كل إجابة.",
        cycleStep3Title: "رؤى ذكية",
        cycleStep3Desc: "يشرح الذكاء الاصطناعي *لماذا* كانت إجابتك خاطئة، محولاً الأخطاء إلى فرص للتعلم.",
        cycleStep4Title: "خطة مخصصة",
        cycleStep4Desc: "يتم إنشاء خطة دراسة مخصصة لمعالجة نقاط الضعف، مع موارد وأسئلة تدريبية.",

        testimonialsTitle: "موثوق به من قبل المعلمين والمحترفين",
        testimonial1: "لقد أحدث Examify ثورة في طريقة إنشائي وتصحيحي للاختبارات. الأسئلة التي يتم إنشاؤها بواسطة الذكاء الاصطناعي توفر لي ساعات، والتحليلات تساعدني في تحديد نقاط ضعف طلابي بدقة.",
        testimonial1Name: "علي ح.",
        testimonial1Role: "مدرس في مدرسة ثانوية",
        testimonial2: "ميزة المراقبة الذكية غيرت قواعد اللعبة في عملية التوظيف عن بعد لدينا. يمكننا الآن تقييم مهارات المرشحين بدرجة عالية من الثقة والنزاهة.",
        testimonial2Name: "سارة ك.",
        testimonial2Role: "مديرة موارد بشرية، Innovate Corp.",
        testimonial3: "كانت إدارة الشهادات لمئات المتدربين كابوسًا لوجستيًا. قام Examify بمركّزية عمليتنا بأكملها، من التقييم إلى إصدار الشهادات.",
        testimonial3Name: "يوسف إ.",
        testimonial3Role: "منسق تدريب، Future Skills Co.",

        finalCtaTitle: "هل أنت مستعد لإحداث ثورة في تقييماتك؟",
        finalCtaButton: "ابدأ الآن",

        designedForTitle: "مصمم لكل الاحتياجات التعليمية",
        designedForSubtitle: "سواء كنت معلمًا أو مدير توظيف أو مقدم تدريب، تتكيف منصتنا مع سير عملك.",

        forTeachersTitle: "للمعلمين",
        forTeachersDesc: "وفر الوقت، واكتسب رؤى، وحقق نتائج تعليمية أفضل.",
        forTeachersFeature1: "تصحيح تلقائي للأسئلة الموضوعية.",
        forTeachersFeature2: "إنشاء اختبارات متنوعة بالذكاء الاصطناعي.",
        forTeachersFeature3: "تتبع أداء الطلاب بتحليلات مفصلة.",

        forCorporateTitle: "للشركات",
        forCorporateDesc: "حدد أفضل المواهب والفجوات في المهارات داخل فرقك بكفاءة.",
        forCorporateFeature1: "إنشاء تقييمات مهارات مخصصة.",
        forCorporateFeature2: "ضمان نزاهة المرشحين بالمراقبة الذكية.",
        forCorporateFeature3: "اتخذ قرارات توظيف وتدريب مبنية على البيانات.",

        forCompanyTitle: "لشركات التدريب",
        forCompanyDesc: "إدارة الدورات، تقييم معرفة المتدربين، ومنح الشهادات على نطاق واسع.",
        forCompanyFeature1: "نشر تقييمات قبل وبعد التدريب.",
        forCompanyFeature2: "مركزية بنوك الأسئلة الخاصة بك.",
        forCompanyFeature3: "إصدار شهادات بناءً على الأداء.",
    }
};


const RoleCard: React.FC<{ icon: React.ElementType, title: string, description: string, features: string[], onClick: () => void }> = ({ icon: Icon, title, description, features, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col h-full cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-primary-500/20"
    >
        <div className="flex items-center mb-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 ms-4">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">{description}</p>
        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 me-3 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

const FeatureHighlightCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="text-center p-6 rounded-2xl transition-transform duration-300 hover:scale-105">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full mx-auto mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);

const HowItWorksStep: React.FC<{ icon: React.ElementType; number: string; title: string; children: React.ReactNode }> = ({ icon: Icon, number, title, children }) => (
    <div className="relative flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 border-2 border-primary-500 text-primary-500 rounded-full mb-4 z-10 bg-white dark:bg-slate-900">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-xs">{children}</p>
    </div>
);

const LearningCycleStep: React.FC<{ icon: React.ElementType; title: string; description: string; stepNumber: number; }> = ({ icon: Icon, title, description, stepNumber }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex flex-col items-center">
            <div className="flex items-center justify-center w-14 h-14 border-2 border-primary-500 text-primary-500 rounded-full z-10 bg-slate-100 dark:bg-slate-950">
                <Icon className="w-7 h-7" />
            </div>
            {stepNumber < 4 && <div className="mt-2 w-0.5 h-16 bg-slate-300 dark:bg-slate-700"></div>}
        </div>
        <div className="ms-6">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; }> = ({ quote, name, role }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 transition-transform duration-300 hover:scale-105 hover:shadow-primary-500/10">
        <div className="flex text-yellow-400 mb-4">
            <StarIcon className="w-5 h-5 fill-current" />
            <StarIcon className="w-5 h-5 fill-current" />
            <StarIcon className="w-5 h-5 fill-current" />
            <StarIcon className="w-5 h-5 fill-current" />
            <StarIcon className="w-5 h-5 fill-current" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"{quote}"</p>
        <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>
    </div>
);

const LandingPage: React.FC = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = translations[lang];
    const navigate = useNavigate();

    return (
        <PublicLayout>
            <style>{`
                @keyframes blob-animation {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.3;
                    will-change: transform;
                    z-index: 0;
                }
                .dark .blob {
                    opacity: 0.4;
                }
                .blob-1 {
                    width: 300px;
                    height: 300px;
                    left: 10%;
                    top: 10%;
                    background-color: ${theme.primaryColor};
                    animation: blob-animation 8s infinite ease-in-out;
                }
                .blob-2 {
                    width: 250px;
                    height: 250px;
                    right: 15%;
                    bottom: 5%;
                    background-color: #8b5cf6; /* purple-500 */
                    animation: blob-animation 10s infinite ease-in-out reverse;
                }
            `}</style>
            {/* Hero Section */}
            <section className="relative py-24 md:py-40 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 leading-tight">
                        {t.heroTitle}
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                        {theme.platformName} {t.heroSubtitle}
                    </p>
                    <div className="mt-10 flex justify-center">
                        <button onClick={() => {
                            document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
                        }} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-primary-500/50">
                            {t.heroCTA}
                        </button>
                    </div>
                </div>
            </section>
            
             {/* Why Choose Us Section */}
            <section id="why-us" className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.whyChooseUsTitle}</h2>
                        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.whyChooseUsSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        <FeatureHighlightCard icon={SparklesIcon} title={t.feature1Title}>{t.feature1Desc}</FeatureHighlightCard>
                        <FeatureHighlightCard icon={ShieldCheckIcon} title={t.feature2Title}>{t.feature2Desc}</FeatureHighlightCard>
                        <FeatureHighlightCard icon={Wand2Icon} title={t.feature3Title}>{t.feature3Desc}</FeatureHighlightCard>
                    </div>
                </div>
            </section>

             {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.howItWorksTitle}</h2>
                    </div>
                    <div className="relative max-w-5xl mx-auto">
                         <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-slate-300 dark:bg-slate-700"></div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            <HowItWorksStep icon={PlusCircleIcon} number="1" title={t.step1Title}>{t.step1Desc}</HowItWorksStep>
                            <HowItWorksStep icon={ShieldCheckIcon} number="2" title={t.step2Title}>{t.step2Desc}</HowItWorksStep>
                            <HowItWorksStep icon={BarChartIcon} number="3" title={t.step3Title}>{t.step3Desc}</HowItWorksStep>
                         </div>
                    </div>
                </div>
            </section>

             {/* Learning Cycle Section */}
            <section id="learning-cycle" className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.learningCycleTitle}</h2>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="space-y-8">
                            <LearningCycleStep icon={BookOpenIcon} title={t.cycleStep1Title} description={t.cycleStep1Desc} stepNumber={1} />
                            <LearningCycleStep icon={CheckCircleIcon} title={t.cycleStep2Title} description={t.cycleStep2Desc} stepNumber={2} />
                            <LearningCycleStep icon={SparklesIcon} title={t.cycleStep3Title} description={t.cycleStep3Desc} stepNumber={3} />
                            <LearningCycleStep icon={LightbulbIcon} title={t.cycleStep4Title} description={t.cycleStep4Desc} stepNumber={4} />
                        </div>
                    </div>
                </div>
            </section>
            
             {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.testimonialsTitle}</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <TestimonialCard quote={t.testimonial1} name={t.testimonial1Name} role={t.testimonial1Role} />
                        <TestimonialCard quote={t.testimonial2} name={t.testimonial2Name} role={t.testimonial2Role} />
                        <TestimonialCard quote={t.testimonial3} name={t.testimonial3Name} role={t.testimonial3Role} />
                    </div>
                </div>
            </section>
            
             {/* Roles Section */}
            <section id="roles" className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.designedForTitle}</h2>
                        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.designedForSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <RoleCard 
                            onClick={() => navigate('/login')}
                            icon={BookOpenIcon}
                            title={t.forTeachersTitle}
                            description={t.forTeachersDesc}
                            features={[t.forTeachersFeature1, t.forTeachersFeature2, t.forTeachersFeature3]}
                        />
                        <RoleCard 
                            onClick={() => navigate('/login')}
                            icon={BriefcaseIcon}
                            title={t.forCorporateTitle}
                            description={t.forCorporateDesc}
                            features={[t.forCorporateFeature1, t.forCorporateFeature2, t.forCorporateFeature3]}
                        />
                        <RoleCard 
                            onClick={() => navigate('/login')}
                            icon={BuildingIcon}
                            title={t.forCompanyTitle}
                            description={t.forCompanyDesc}
                            features={[t.forCompanyFeature1, t.forCompanyFeature2, t.forCompanyFeature3]}
                        />
                    </div>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="py-20 bg-primary-500">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white">{t.finalCtaTitle}</h2>
                    <button onClick={() => {
                        document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
                    }} className="mt-6 bg-white text-primary-500 font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg">
                        {t.finalCtaButton}
                    </button>
                 </div>
            </section>
        </PublicLayout>
    );
};

export default LandingPage;