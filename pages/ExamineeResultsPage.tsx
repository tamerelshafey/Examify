

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExamineeResults } from '../services/api';
import { ExamResult } from '../types';
import { BookOpenIcon, CheckCircleIcon, EyeIcon, LogOutIcon } from '../components/icons';
import { Language } from '../types';

const translations = {
    en: {
        title: "Examinee Portal",
        availableExams: "Available Exams",
        myResults: "My Results",
        switchRole: "Switch Role",
        loading: "Loading your results...",
        empty: "You haven't completed any exams yet.",
        table: {
            examTitle: "Exam Title",
            score: "Score",
            percentage: "Percentage",
            dateSubmitted: "Date Submitted",
            actions: "Actions",
        },
        viewDetails: "View Details",
    },
    ar: {
        title: "بوابة الطالب",
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        switchRole: "تغيير الدور",
        loading: "جاري تحميل نتائجك...",
        empty: "لم تكمل أي اختبارات بعد.",
        table: {
            examTitle: "عنوان الاختبار",
            score: "الدرجة",
            percentage: "النسبة المئوية",
            dateSubmitted: "تاريخ الإرسال",
            actions: "الإجراءات",
        },
        viewDetails: "عرض التفاصيل",
    }
}

const ExamineeResultsPage = ({ onLogout, lang }: { onLogout: () => void, lang: Language }) => {
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const t = translations[lang];

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                // In a real app, we'd pass the current user's ID
                const data = await getExamineeResults("current-user-id");
                setResults(data);
            } catch (error) {
                console.error("Failed to fetch results:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-red-500';
    }

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
            <nav className="w-64 bg-white dark:bg-slate-800 p-5 shadow-lg flex flex-col">
                <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-10">{t.title}</h1>
                <ul>
                    <li className="mb-4">
                        <Link to="/examinee" className="flex items-center p-2 text-base font-normal text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                            <BookOpenIcon className="w-6 h-6" />
                            <span className="ms-3">{t.availableExams}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/examinee/results" className="flex items-center p-2 text-base font-normal text-slate-900 dark:text-white rounded-lg bg-slate-200 dark:bg-slate-700">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span className="ms-3">{t.myResults}</span>
                        </Link>
                    </li>
                </ul>
                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onLogout} className="flex items-center p-2 text-base font-normal rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 w-full">
                        <LogOutIcon className="w-6 h-6" />
                        <span className="ms-3">{t.switchRole}</span>
                    </button>
                </div>
            </nav>
            <main className="flex-1 p-10">
                <h2 className="text-3xl font-bold mb-8">{t.myResults}</h2>

                 <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                    {loading ? (
                        <p className="p-4">{t.loading}</p>
                    ) : (
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t.table.examTitle}</th>
                                    <th scope="col" className="px-6 py-3">{t.table.score}</th>
                                    <th scope="col" className="px-6 py-3">{t.table.percentage}</th>
                                    <th scope="col" className="px-6 py-3">{t.table.dateSubmitted}</th>
                                    <th scope="col" className="px-6 py-3">{t.table.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(result => {
                                    const percentage = Math.round((result.score / result.totalPoints) * 100);
                                    return (
                                        <tr key={result.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">{result.examTitle}</td>
                                            <td className="px-6 py-4">{result.score} / {result.totalPoints}</td>
                                            <td className={`px-6 py-4 font-bold ${getPerformanceColor(percentage)}`}>
                                                {percentage}%
                                            </td>
                                            <td className="px-6 py-4">{result.submittedAt.toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <Link to={`/examinee/result/${result.id}`} className="p-2 inline-block text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" title={t.viewDetails}>
                                                  <EyeIcon className="w-5 h-5"/>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {!loading && results.length === 0 && (
                        <p className="text-center text-slate-500 py-10">{t.empty}</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExamineeResultsPage;
