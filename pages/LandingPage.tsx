
import React from 'react';
import { UserRole } from '../types';
import { BookOpenIcon, UsersIcon, BriefcaseIcon, BuildingIcon, CheckCircleIcon } from '../components/icons';
import { useTheme, useLanguage } from '../App';
import PublicLayout from '../components/PublicLayout';

const translations = {
    en: {
        heroTitle: "The Future of Online Assessment",
        heroSubtitle: "provides a secure, intuitive, and powerful platform for creating, administering, and analyzing exams with advanced AI-powered integrity features.",
        heroCTA: "Choose Your Role & Get Started",
        
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


const RoleCard: React.FC<{ icon: React.ElementType, title: string, description: string, features: string[] }> = ({ icon: Icon, title, description, features }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col h-full">
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


const LandingPage: React.FC = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative py-24 md:py-40 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 leading-tight">
                        {t.heroTitle}
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                        {theme.platformName} {t.heroSubtitle}
                    </p>
                    <div className="mt-10 flex justify-center">
                        <button onClick={() => {
                            const loginButton = document.getElementById('header-login-button');
                            if (loginButton) {
                                loginButton.click();
                            }
                        }} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-primary-500/50">
                            {t.heroCTA}
                        </button>
                    </div>
                </div>
            </section>
            
             {/* Roles Section */}
            <section id="roles" className="py-20 bg-slate-100 dark:bg-slate-950/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.designedForTitle}</h2>
                        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.designedForSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <RoleCard 
                            icon={BookOpenIcon}
                            title={t.forTeachersTitle}
                            description={t.forTeachersDesc}
                            features={[t.forTeachersFeature1, t.forTeachersFeature2, t.forTeachersFeature3]}
                        />
                        <RoleCard 
                            icon={BriefcaseIcon}
                            title={t.forCorporateTitle}
                            description={t.forCorporateDesc}
                            features={[t.forCorporateFeature1, t.forCorporateFeature2, t.forCorporateFeature3]}
                        />
                        <RoleCard 
                            icon={BuildingIcon}
                            title={t.forCompanyTitle}
                            description={t.forCompanyDesc}
                            features={[t.forCompanyFeature1, t.forCompanyFeature2, t.forCompanyFeature3]}
                        />
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default LandingPage;