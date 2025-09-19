
import React from 'react';
import { UserRole } from '../types';
import ProctoringReportComponent from '../components/ProctoringReportComponent';

const CorporateProctoringReportPage = () => {
    return <ProctoringReportComponent userRole={UserRole.Corporate} />;
};

export default CorporateProctoringReportPage;
