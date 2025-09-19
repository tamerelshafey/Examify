
import React from 'react';
import { UserRole } from '../types';
import ExamResultsComponent from '../components/ExamResultsComponent';

const TeacherExamResultsPage = () => {
    return <ExamResultsComponent userRole={UserRole.Teacher} />;
};

export default TeacherExamResultsPage;
