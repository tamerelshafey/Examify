
import React from 'react';
import { UserRole } from '../types';
import ExamineeResultComponent from '../components/ExamineeResultComponent';

const CorporateExamineeResultPage = () => {
    return <ExamineeResultComponent userRole={UserRole.Corporate} />;
};

export default CorporateExamineeResultPage;
