
import React from 'react';
import { UserRole } from '../types';
import ExamineeResultComponent from '../components/ExamineeResultComponent';

const TrainingCompanyExamineeResultPage = () => {
    return <ExamineeResultComponent userRole={UserRole.TrainingCompany} />;
};

export default TrainingCompanyExamineeResultPage;
