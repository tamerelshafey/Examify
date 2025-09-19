
import React from 'react';
import { SpinnerIcon } from './icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-slate-500 dark:text-slate-400">
      <SpinnerIcon className="w-8 h-8" />
    </div>
  );
};

export default LoadingSpinner;
