import React from 'react';
import { UserRole } from '../types';
import QuestionBankComponent from '../components/QuestionBankComponent';

const CorporateQuestionBankPage = () => {
    return (
        <QuestionBankComponent 
            userRole={UserRole.Corporate}
            currentUserId="user-6"
        />
    );
};

export default CorporateQuestionBankPage;
