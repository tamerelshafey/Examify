import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheckIcon, LightbulbIcon, UsersIcon, Wand2Icon } from '../components/icons';

const translations = {
    en: {
        aboutTitle: "Our Mission",
        aboutSubtitle: "Empowering educators, ensuring integrity.",
        aboutMission: "Our mission is to build the world's most trusted and intelligent assessment platform. We believe in leveraging artificial intelligence not just to prevent cheating, but to provide deeper insights that empower educators and help learners achieve their full potential. We are committed to creating a fair, secure, and accessible educational environment for everyone, everywhere.",
        
        valuesTitle: "Our Core Values",
        value1Title: "Integrity",
        value1Desc: "We are committed to the highest standards of academic honesty and fairness in every feature we build.",
        value2Title: "Innovation",
        value2Desc: "We relentlessly pursue cutting-edge AI to solve real-world educational challenges and enhance learning outcomes.",
        value3Title: "Empowerment",
        value3Desc: "We build intuitive tools that save time for educators and provide personalized learning paths for students.",

        teamTitle: "Meet Our Team",
        teamSubtitle: "A passionate group of educators, engineers, and designers dedicated to reshaping the future of learning.",

        visionTitle: "Our Vision for the Future",
        visionDesc: "We're just getting started. Our roadmap is filled with exciting developments to further enhance the learning and assessment ecosystem.",
        vision1: "Seamless LMS & ATS integrations.",
        vision2: "Dedicated mobile apps for on-the-go learning and proctoring.",
        vision3: "More advanced, adaptive AI testing models.",
    },
    ar: {
        aboutTitle: "مهمتنا",
        aboutSubtitle: "تمكين المعلمين، وضمان النزاهة.",
        aboutMission: "مهمتنا هي بناء منصة التقييم الأكثر موثوقية وذكاءً في العالم. نؤمن بتسخير الذكاء الاصطناعي ليس فقط لمنع الغش، ولكن لتقديم رؤى أعمق تمكّن المعلمين وتساعد المتعلمين على تحقيق إمكاناتهم الكاملة. نحن ملتزمون بإنشاء بيئة تعليمية عادلة وآمنة ومتاحة للجميع في كل مكان.",
    
        valuesTitle: "قيمنا الأساسية",
        value1Title: "النزاهة",
        value1Desc: "نحن ملتزمون بأعلى معايير الأمانة الأكاديمية والعدالة في كل ميزة نبنيها.",
        value2Title: "الابتكار",
        value2Desc: "نسعى بلا هوادة وراء أحدث تقنيات الذكاء الاصطناعي لحل تحديات التعليم الواقعية وتعزيز نتائج التعلم.",
        value3Title: "التمكين",
        value3Desc: "نقوم ببناء أدوات بديهية توفر الوقت للمعلمين وتوفر مسارات تعلم مخصصة للطلاب.",

        teamTitle: "تعرف على فريقنا",
        teamSubtitle: "مجموعة شغوفة من المعلمين والمهندسين والمصممين المكرسين لإعادة تشكيل مستقبل التعلم.",

        visionTitle: "رؤيتنا للمستقبل",
        visionDesc: "لقد بدأنا للتو. خارطة طريقنا مليئة بالتطورات المثيرة لتعزيز نظام التعلم والتقييم.",
        vision1: "تكامل سلس مع أنظمة إدارة التعلم (LMS) وأنظمة تتبع المتقدمين (ATS).",
        vision2: "تطبيقات جوال مخصصة للتعلم والمراقبة أثناء التنقل.",
        vision3: "نماذج اختبار ذكاء اصطناعي أكثر تقدمًا وتكيفًا.",
    }
};

const ValueCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-full mx-auto mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);


const AboutPage: React.FC = () => {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <PublicLayout>
            <section id="about" className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.aboutTitle}</h2>
                    <p className="mt-3 text-lg font-semibold text-primary-500">{t.aboutSubtitle}</p>
                    <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">{t.aboutMission}</p>
                </div>
            </section>
            
            <section id="values" className="py-20 bg-slate-50 dark:bg-slate-950">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.valuesTitle}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        <ValueCard icon={ShieldCheckIcon} title={t.value1Title}>{t.value1Desc}</ValueCard>
                        <ValueCard icon={LightbulbIcon} title={t.value2Title}>{t.value2Desc}</ValueCard>
                        <ValueCard icon={UsersIcon} title={t.value3Title}>{t.value3Desc}</ValueCard>
                    </div>
                 </div>
            </section>
            
            <section id="team" className="py-20 bg-white dark:bg-slate-900">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t.teamTitle}</h2>
                    <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{t.teamSubtitle}</p>
                    {/* Team member components would go here in a real application */}
                 </div>
            </section>

             <section id="vision" className="py-20 bg-primary-500 text-white">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold">{t.visionTitle}</h2>
                    <p className="mt-3 text-lg text-primary-100">{t.visionDesc}</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-center gap-3 p-4 bg-primary-600 rounded-lg">
                            <Wand2Icon className="w-6 h-6 text-primary-200"/>
                            <span className="font-semibold">{t.vision1}</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-primary-600 rounded-lg">
                            <Wand2Icon className="w-6 h-6 text-primary-200"/>
                             <span className="font-semibold">{t.vision2}</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-primary-600 rounded-lg">
                             <Wand2Icon className="w-6 h-6 text-primary-200"/>
                             <span className="font-semibold">{t.vision3}</span>
                        </div>
                    </div>
                 </div>
            </section>
        </PublicLayout>
    );
};

export default AboutPage;