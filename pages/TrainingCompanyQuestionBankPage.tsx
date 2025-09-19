import React from 'react';
import { UserRole } from '../types';
import QuestionBankComponent from '../components/QuestionBankComponent';

const TrainingCompanyQuestionBankPage = () => {
    return (
        <QuestionBankComponent 
            userRole={UserRole.TrainingCompany}
            currentUserId="user-5"
        />
    );
};

export default TrainingCompanyQuestionBankPage;
