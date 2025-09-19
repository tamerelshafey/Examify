
import React from 'react';
import { UserRole } from '../types';
import ExamineeResultComponent from '../components/ExamineeResultComponent';

const TeacherExamineeResultPage = () => {
    return <ExamineeResultComponent userRole={UserRole.Teacher} />;
};

export default TeacherExamineeResultPage;
