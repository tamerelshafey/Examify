import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { BookOpenIcon, UsersIcon, BuildingIcon, BriefcaseIcon, ShieldCheckIcon, ArrowRightIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PublicLayout from '../components/PublicLayout';

const translations = {
    en: {
        welcomeTitle: "Welcome! Let's get you signed in.",
        creatorHeader: "I want to create & manage assessments",
        takerHeader: "I'm here to take an exam",
        adminLogin: "Admin Login",
        teacher: "Teacher",
        teacherDesc: "Create exams & track progress.",
        examinee: "Examinee",
        examineeDesc: "Take exams & view results.",
        company: "Training Company",
        companyDesc: "Manage curricula & trainees.",
        corporate: "Corporate",
        corporateDesc: "Test candidates & develop teams.",
        admin: "Admin",
        adminDesc: "Manage the entire platform.",
    },
    ar: {
        welcomeTitle: "أهلاً بك! لنبدأ بتسجيل دخولك.",
        creatorHeader: "أريد إنشاء وإدارة التقييمات",
        takerHeader: "أنا هنا لأداء اختبار",
        adminLogin: "تسجيل دخول المسؤول",
        teacher: "معلم",
        teacherDesc: "إنشاء الاختبارات وتتبع التقدم.",
        examinee: "طالب",
        examineeDesc: "أداء الاختبارات وعرض النتائج.",
        company: "شركة تدريب",
        companyDesc: "إدارة المناهج والمتدربين.",
        corporate: "شركة",
        corporateDesc: "اختبار المرشحين وتطوير الفرق.",
        admin: "مسؤول",
        adminDesc: "إدارة المنصة بأكملها.",
    }
};

const RoleCard: React.FC<{ icon: React.ElementType, title: string, description: string, onClick: () => void }> = ({ icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-500/10 border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-1 p-6 relative overflow-hidden"
    >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-500"></div>
        <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 rounded-lg">
                <Icon className="w-6 h-6" />
            </div>
            <div className="ms-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
             <ArrowRightIcon className="w-6 h-6 text-primary-500 absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    </button>
);


const LoginPage: React.FC = () => {
    const { lang } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const t = translations[lang];

    const handleRoleSelect = (role: UserRole) => {
        login(role);
        navigate('/');
    };

    const creatorRoles = [
        { role: UserRole.Teacher, icon: BookOpenIcon, title: t.teacher, description: t.teacherDesc },
        { role: UserRole.Corporate, icon: BriefcaseIcon, title: t.corporate, description: t.corporateDesc },
        { role: UserRole.TrainingCompany, icon: BuildingIcon, title: t.company, description: t.companyDesc },
    ];

    const takerRole = { role: UserRole.Examinee, icon: UsersIcon, title: t.examinee, description: t.examineeDesc };

    return (
        <PublicLayout>
            <div className="py-16 md:py-24 bg-slate-100 dark:bg-slate-950/50 flex items-center justify-center">
                <div 
                    className="bg-slate-100 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-slate-200 dark:border-slate-700" 
                >
                    <h2 id="login-modal-title" className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">{t.welcomeTitle}</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                        {/* Left Column: Creators */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-4 text-center lg:text-left">{t.creatorHeader}</h3>
                            <div className="space-y-4">
                                {creatorRoles.map(({ role, icon, title, description }) => (
                                    <RoleCard 
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        icon={icon}
                                        title={title}
                                        description={description}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Right Column: Takers & Admin */}
                        <div className="flex flex-col mt-8 lg:mt-0">
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-4 text-center lg:text-left">{t.takerHeader}</h3>
                                <RoleCard 
                                    onClick={() => handleRoleSelect(takerRole.role)}
                                    icon={takerRole.icon}
                                    title={takerRole.title}
                                    description={takerRole.description}
                                />
                            </div>
                            
                            <div className="flex-grow flex items-end justify-center pt-8">
                                <button
                                    onClick={() => handleRoleSelect(UserRole.Admin)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    {t.adminLogin}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default LoginPage;