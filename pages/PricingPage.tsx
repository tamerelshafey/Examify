
import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { useLanguage } from '../App';
import { CheckCircleIcon } from '../components/icons';

const translations = {
    en: {
        pricingTitle: "Simple, Transparent Pricing",
        pricingSubtitle: "Choose the plan that fits your needs. No hidden fees, ever.",
        mostPopular: "MOST POPULAR",
        plan1Title: "Teacher",
        plan1Price: "$15",
        plan1Frequency: "/ month",
        plan1Desc: "For individual educators and small classrooms.",
        plan1Feature1: "Up to 50 students",
        plan1Feature2: "Unlimited exams",
        plan1Feature3: "AI Question Generation",
        plan1Feature4: "Basic Analytics",
        plan1CTA: "Get Started",
        plan2Title: "Training Company",
        plan2Price: "$75",
        plan2Frequency: "/ month",
        plan2Desc: "For professional training organizations and bootcamps.",
        plan2Feature1: "Up to 200 trainees",
        plan2Feature2: "All Teacher features",
        plan2Feature3: "Centralized Question Bank",
        plan2Feature4: "Advanced AI Analytics",
        plan2CTA: "Choose Plan",
        plan3Title: "Corporate",
        plan3Price: "Custom",
        plan3Frequency: "",
        plan3Desc: "For businesses and large-scale assessment needs.",
        plan3Feature1: "Unlimited candidates",
        plan3Feature2: "All Training Co. features",
        plan3Feature3: "LMS & ATS Integration (Soon)",
        plan3Feature4: "Dedicated Support",
        plan3CTA: "Contact Sales",
    },
    ar: {
        pricingTitle: "أسعار بسيطة وشفافة",
        pricingSubtitle: "اختر الخطة التي تناسب احتياجاتك. لا توجد رسوم خفية على الإطلاق.",
        mostPopular: "الأكثر شيوعاً",
        plan1Title: "معلم",
        plan1Price: "١٥$",
        plan1Frequency: "/ شهرياً",
        plan1Desc: "للمعلمين الأفراد والفصول الدراسية الصغيرة.",
        plan1Feature1: "حتى ٥٠ طالباً",
        plan1Feature2: "اختبارات غير محدودة",
        plan1Feature3: "إنشاء أسئلة بالذكاء الاصطناعي",
        plan1Feature4: "تحليلات أساسية",
        plan1CTA: "ابدأ الآن",
        plan2Title: "شركة تدريب",
        plan2Price: "٧٥$",
        plan2Frequency: "/ شهرياً",
        plan2Desc: "لمؤسسات التدريب المهني والمعسكرات التدريبية.",
        plan2Feature1: "حتى ٢٠٠ متدرب",
        plan2Feature2: "جميع ميزات المعلم",
        plan2Feature3: "بنك أسئلة مركزي",
        plan2Feature4: "تحليلات متقدمة بالذكاء الاصطناعي",
        plan2CTA: "اختر الخطة",
        plan3Title: "شركات",
        plan3Price: "مخصص",
        plan3Frequency: "",
        plan3Desc: "للشركات واحتياجات التقييم على نطاق واسع.",
        plan3Feature1: "مرشحون غير محدودين",
        plan3Feature2: "جميع ميزات شركة التدريب",
        plan3Feature3: "التكامل مع أنظمة LMS و ATS (قريباً)",
        plan3Feature4: "دعم مخصص",
        plan3CTA: "تواصل مع المبيعات",
    }
};

const PricingCard: React.FC<{ title: string, price: string, frequency: string, description: string, features: string[], cta: string, isPopular?: boolean }> = ({ title, price, frequency, description, features, cta, isPopular = false }) => {
    const popularClass = isPopular ? 'border-primary-500 border-2 -my-4' : 'border-slate-200 dark:border-slate-800';
    const buttonClass = isPopular ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200';
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border flex flex-col h-full ${popularClass}`}>
            {isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">{t.mostPopular}</span></div>}
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mt-2">{description}</p>
            <div className="my-8 text-center">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-50">{price}</span>
                <span className="text-slate-500 dark:text-slate-400">{frequency}</span>
            </div>
            <ul className="space-y-4 text-slate-600 dark:text-slate-300 mb-8 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 me-3" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${buttonClass}`}>{cta}</button>
        </div>
    );
};

const PricingPage: React.FC = () => {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <PublicLayout>
            <section id="pricing" className="py-20 bg-slate-100 dark:bg-slate-950/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.pricingTitle}</h2>
                        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.pricingSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
                        <PricingCard
                            title={t.plan1Title}
                            price={t.plan1Price}
                            frequency={t.plan1Frequency}
                            description={t.plan1Desc}
                            features={[t.plan1Feature1, t.plan1Feature2, t.plan1Feature3, t.plan1Feature4]}
                            cta={t.plan1CTA}
                        />
                        <PricingCard
                            title={t.plan2Title}
                            price={t.plan2Price}
                            frequency={t.plan2Frequency}
                            description={t.plan2Desc}
                            features={[t.plan2Feature1, t.plan2Feature2, t.plan2Feature3, t.plan2Feature4]}
                            cta={t.plan2CTA}
                            isPopular={true}
                        />
                        <PricingCard
                            title={t.plan3Title}
                            price={t.plan3Price}
                            frequency={t.plan3Frequency}
                            description={t.plan3Desc}
                            features={[t.plan3Feature1, t.plan3Feature2, t.plan3Feature3, t.plan3Feature4]}
                            cta={t.plan3CTA}
                        />
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default PricingPage;
