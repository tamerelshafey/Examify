
import React from 'react';
import { UserRole } from '../types';
import ExamResultsComponent from '../components/ExamResultsComponent';

const CorporateExamResultsPage = () => {
    return <ExamResultsComponent userRole={UserRole.Corporate} />;
};

export default CorporateExamResultsPage;
