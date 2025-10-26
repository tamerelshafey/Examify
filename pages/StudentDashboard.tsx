import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExamineeExams } from '../services/api';
import { Exam } from '../types';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, UsersIcon } from '../components/icons';

const StudentDashboard = () => {
  const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExamineeExams();
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const startExam = (examId: string) => {
    navigate(`/examinee/exam/${examId}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <nav className="w-64 bg-white dark:bg-slate-800 p-5 shadow-lg">
        <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-10">Examify Student</h1>
        <ul>
          <li className="mb-4">
            <a href="#/examinee" className="flex items-center p-2 text-base font-normal text-slate-900 dark:text-white rounded-lg bg-slate-200 dark:bg-slate-700">
              <BookOpenIcon className="w-6 h-6" />
              <span className="ml-3">Available Exams</span>
            </a>
          </li>
          <li>
            <a href="#/examinee" className="flex items-center p-2 text-base font-normal text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="ml-3">My Results</span>
            </a>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-8">Available Exams</h2>
        
        {loading ? (
          <p>Loading exams...</p>
        ) : (
          <div className="space-y-4">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center justify-between transition-shadow hover:shadow-lg">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{exam.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exam.description}</p>
                   <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-300">
                    <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1"/> {exam.duration} minutes</span>
                    <span className="flex items-center"><UsersIcon className="w-4 h-4 mr-1"/> {exam.questionCount} questions</span>
                    <span className={`font-semibold px-2 py-1 rounded-full text-xs ${exam.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : exam.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {exam.difficulty}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => startExam(exam.id)}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;