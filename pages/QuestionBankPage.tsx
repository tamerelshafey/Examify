import React from 'react';
import { UserRole } from '../types';
import QuestionBankComponent from '../components/QuestionBankComponent';

const QuestionBankPage = () => {
    return (
        <QuestionBankComponent 
            userRole={UserRole.Teacher}
            currentUserId="user-1"
        />
    );
};

export default QuestionBankPage;
