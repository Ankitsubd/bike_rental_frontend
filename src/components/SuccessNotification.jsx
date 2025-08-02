import React, { useEffect } from 'react';

const SuccessNotification = ({ 
  isVisible, 
  message, 
  onClose, 
  type = "success" // success, error, warning
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800',
          iconSymbol: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-800',
          iconSymbol: '⚠️'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          text: 'text-green-800',
          iconSymbol: '✅'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl shadow-2xl p-6 max-w-sm`}>
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center border ${styles.border} shadow-lg`}>
            <span className="text-xl">{styles.iconSymbol}</span>
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold ${styles.text}`}>
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Warning!'}
            </h4>
            <p className={`text-sm ${styles.text} mt-1`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/50 transition-all duration-200 ${styles.icon}`}
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification; 