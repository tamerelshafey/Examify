


import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAIExamVariant } from '../services/api';
import { Exam, UserRole } from '../types';
import { PlusCircleIcon, SparklesIcon, Wand2Icon, InboxIcon, ClockIcon, UsersIcon, UploadIcon } from './icons';
import ExamFormModal from './ExamFormModal';
import AIGenerateExamModal from './AIGenerateExamModal';
import DashboardLayout from './DashboardLayout';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

// Props Interface
interface DashboardComponentProps {
    userRole: UserRole;
    navLinks: any[];
    sidebarHeader: ReactNode;
    pageTitle?: string;
    
    // API functions
    getExamsApi: () => Promise<Omit<Exam, 'questions'>[]>;
    createExamApi: (exam: Omit<Exam, 'id' | 'questionCount'>) => Promise<Exam>;

    // Translations and labels
    translations: {
        importFromText: string;
        generateExamAI: string;
        createNewExam: string;
        viewResults: string;
        createVariant: string;
        creatingVariant: string;
        variantCreated: string;
        variantFailed: string;
        noExamsTitle: string;
        noExamsMessage: string;
    };

    // Analytics (Optional)
    showAnalyticsChart?: boolean;
    analyticsData?: any[];
    analyticsChartComponent?: React.FC<{data: any[]}>;
    analyticsTitle?: string;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({
    userRole,
    navLinks,
    sidebarHeader,
    pageTitle,
    getExamsApi,
    createExamApi,
    translations: t,
    showAnalyticsChart = false,
    analyticsData = [],
    analyticsChartComponent: AnalyticsChart,
    analyticsTitle
}) => {
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCreatingVariant, setIsCreatingVariant] = useState<string | null>(null);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await getExamsApi();
            setExams(data);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
            addNotification('Failed to fetch exams.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [getExamsApi]);

    const handleSaveExam = async (newExamData: Omit<Exam, 'id' | 'questionCount'>) => {
        try {
            await createExamApi(newExamData);
            await fetchExams();
            setIsModalOpen(false);
            setIsAiModalOpen(false);
            addNotification('Exam created successfully!', 'success');
        } catch (error) {
            console.error("Failed to save exam:", error);
            addNotification('Failed to create exam.', 'error');
        }
    };

    const handleCreateVariant = async (exam: Omit<Exam, 'questions'>) => {
        setIsCreatingVariant(exam.id);
        try {
            await createAIExamVariant(exam);
            await fetchExams();
            addNotification(t.variantCreated, 'success');
        } catch (error) {
            console.error("Failed to create AI variant:", error);
            addNotification(t.variantFailed, 'error');
        } finally {
            setIsCreatingVariant(null);
        }
    };

    const getResultPath = (examId: string) => {
        switch(userRole) {
            case UserRole.Teacher: return `/teacher/exam/${examId}/results`;
            case UserRole.Corporate: return `/corporate/exam/${examId}/results`;
            case UserRole.TrainingCompany: return `/company/exam/${examId}/results`;
            default: return '/';
        }
    }

    const getImportPath = () => {
        switch(userRole) {
            case UserRole.Teacher: return `/teacher/import`;
            case UserRole.Corporate: return `/corporate/import`;
            case UserRole.TrainingCompany: return `/company/import`;
            default: return '/';
        }
    }

    const mainContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (exams.length === 0) {
            return (
                <EmptyState
                    icon={InboxIcon}
                    title={t.noExamsTitle}
                    message={t.noExamsMessage}
                    action={
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center mx-auto bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5 me-2" />
                            {t.createNewExam}
                        </button>
                    }
                />
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{exam.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow">{exam.description}</p>
                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-300">
                            <span className="flex items-center"><ClockIcon className="w-4 h-4 me-1"/> {exam.duration} min</span>
                            <span className="flex items-center"><UsersIcon className="w-4 h-4 me-1"/> {exam.questionCount} Qs</span>
                            <span className={`font-semibold px-2 py-1 rounded-full text-xs ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {exam.difficulty}
                            </span>
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button onClick={() => navigate(getResultPath(exam.id))} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">{t.viewResults}</button>
                            <button
                                onClick={() => handleCreateVariant(exam)}
                                disabled={isCreatingVariant === exam.id}
                                className="w-full flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50"
                            >
                                <Wand2Icon className="w-4 h-4 me-2" />
                                {isCreatingVariant === exam.id ? t.creatingVariant : t.createVariant}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <DashboardLayout
                navLinks={navLinks}
                pageTitle={pageTitle}
                sidebarHeader={sidebarHeader}
            >
                <div className="flex justify-between items-center mb-8">
                    <div/>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(getImportPath())}
                            className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <UploadIcon className="w-5 h-5 me-2" />
                            {t.importFromText}
                        </button>
                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <SparklesIcon className="w-5 h-5 me-2" />
                            {t.generateExamAI}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5 me-2" />
                            {t.createNewExam}
                        </button>
                    </div>
                </div>
                
                {mainContent()}

                {showAnalyticsChart && AnalyticsChart && analyticsTitle && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-8">{analyticsTitle}</h2>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-96">
                           <AnalyticsChart data={analyticsData} />
                        </div>
                    </div>
                )}

            </DashboardLayout>
            <ExamFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveExam}
            />
            <AIGenerateExamModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onSave={handleSaveExam}
            />
        </>
    );
};

export default DashboardComponent;