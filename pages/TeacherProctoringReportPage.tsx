
import React from 'react';
import { UserRole } from '../types';
import ProctoringReportComponent from '../components/ProctoringReportComponent';

const TeacherProctoringReportPage = () => {
    return <ProctoringReportComponent userRole={UserRole.Teacher} />;
};

export default TeacherProctoringReportPage;
