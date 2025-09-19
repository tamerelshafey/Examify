
import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Icon className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
