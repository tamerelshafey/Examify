
import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { useLanguage } from '../App';

const translations = {
    en: {
        aboutTitle: "Our Mission",
        aboutSubtitle: "Empowering educators, ensuring integrity.",
        aboutMission: "Our mission is to build the world's most trusted and intelligent assessment platform. We believe in leveraging artificial intelligence not just to prevent cheating, but to provide deeper insights that empower educators and help learners achieve their full potential. We are committed to creating a fair, secure, and accessible educational environment for everyone, everywhere.",
    },
    ar: {
        aboutTitle: "مهمتنا",
        aboutSubtitle: "تمكين المعلمين، وضمان النزاهة.",
        aboutMission: "مهمتنا هي بناء منصة التقييم الأكثر موثوقية وذكاءً في العالم. نؤمن بتسخير الذكاء الاصطناعي ليس فقط لمنع الغش، ولكن لتقديم رؤى أعمق تمكّن المعلمين وتساعد المتعلمين على تحقيق إمكاناتهم الكاملة. نحن ملتزمون بإنشاء بيئة تعليمية عادلة وآمنة ومتاحة للجميع في كل مكان.",
    }
};

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
        </PublicLayout>
    );
};

export default AboutPage;
