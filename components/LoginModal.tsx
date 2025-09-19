
import React from 'react';
import { UserRole } from '../types';
import { BookOpenIcon, UsersIcon, BuildingIcon, BriefcaseIcon, ShieldCheckIcon } from './icons';
import { useTheme, useLanguage } from '../App';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

const translations = {
    en: {
        title: "Choose Your Role to Sign In",
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
        title: "اختر دورك لتسجيل الدخول",
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

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleRoleSelect = (role: UserRole) => {
    onSelectRole(role);
    onClose();
  };
  
  if (!isOpen) return null;

  const roles = [
    { role: UserRole.Teacher, icon: BookOpenIcon, title: t.teacher, description: t.teacherDesc, color: "primary" },
    { role: UserRole.Examinee, icon: UsersIcon, title: t.examinee, description: t.examineeDesc, color: "primary" },
    { role: UserRole.TrainingCompany, icon: BuildingIcon, title: t.company, description: t.companyDesc, color: "primary" },
    { role: UserRole.Corporate, icon: BriefcaseIcon, title: t.corporate, description: t.corporateDesc, color: "primary" },
    { role: UserRole.Admin, icon: ShieldCheckIcon, title: t.admin, description: t.adminDesc, color: "red" },
  ];
  
  const colorClasses: Record<string, string> = {
      primary: 'from-primary-700 to-primary-900 text-white',
      red: 'from-red-600 to-red-800 text-red-100',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">{t.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(({ role, icon: Icon, title, description, color }) => (
                <div key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`group relative h-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-80 group-hover:opacity-95 transition-opacity duration-300`}></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-white text-center">
                        <Icon className="w-16 h-16 mb-2 transition-transform duration-300 group-hover:scale-110" />
                        <h3 className="text-2xl font-bold">{title}</h3>
                        <p className={`mt-1 text-sm`}>{description}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
