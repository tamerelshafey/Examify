import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon } from '../components/icons';

type NotificationType = 'success' | 'error';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const Icon = ({ type }: { type: NotificationType }) => {
    if (type === 'success') {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    }
    return <XCircleIcon className="w-6 h-6 text-red-500" />;
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-5 right-5 z-[200] space-y-3 w-full max-w-sm">
        {notifications.map(notification => (
          <div key={notification.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black dark:ring-white/10 ring-opacity-5 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon type={notification.type} />
                </div>
                <div className="ms-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.type === 'success' ? 'Success' : 'Error'}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
