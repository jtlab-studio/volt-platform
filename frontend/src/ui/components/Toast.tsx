import React, { useEffect } from 'react';
import clsx from 'clsx';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);
  
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-[#249689]" />,
    error: <XCircleIcon className="h-5 w-5 text-[#dc143c]" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-[#fce62f]" />,
    info: <InformationCircleIcon className="h-5 w-5 text-[#2196f3]" />,
  };
  
  const styles = {
    success: 'bg-[#249689]/10 border-[#249689]/20',
    error: 'bg-[#dc143c]/10 border-[#dc143c]/20',
    warning: 'bg-[#fce62f]/10 border-[#fce62f]/20',
    info: 'bg-[#2196f3]/10 border-[#2196f3]/20',
  };
  
  return (
    <div
      className={clsx(
        'flex items-center justify-between p-4 rounded-2xl backdrop-blur-md',
        'border shadow-lg min-w-[300px] max-w-md',
        'animate-slide-in-right',
        styles[type]
      )}
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <p className="text-sm font-medium text-[#121212] dark:text-[#f1f4f8]">
          {message}
        </p>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="ml-4 rounded-lg p-1 hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
      >
        <XMarkIcon className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
