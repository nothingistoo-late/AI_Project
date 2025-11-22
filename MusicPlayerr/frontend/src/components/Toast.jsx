import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  const textColor = type === 'success'
    ? 'text-green-800 dark:text-green-200'
    : 'text-red-800 dark:text-red-200';
  const iconColor = type === 'success'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        {type === 'success' ? (
          <CheckCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
        ) : (
          <XCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
        )}
        <p className={`flex-1 ${textColor} font-medium`}>{message}</p>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


