
import React from 'react';
import { UserRole } from '../types';
import ExamResultsComponent from '../components/ExamResultsComponent';

const TrainingCompanyExamResultsPage = () => {
    return <ExamResultsComponent userRole={UserRole.TrainingCompany} />;
};

export default TrainingCompanyExamResultsPage;
