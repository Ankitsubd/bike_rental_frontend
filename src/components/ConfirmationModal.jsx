import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, success, danger
}) => {
  if (!isOpen) return null;

  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          button: 'bg-green-500 hover:bg-green-600',
          iconSymbol: '✅'
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          button: 'bg-red-500 hover:bg-red-600',
          iconSymbol: '⚠️'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600',
          iconSymbol: '❓'
        };
    }
  };

  const styles = getModalStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl border ${styles.border} max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${styles.bg} px-4 sm:px-8 py-4 sm:py-6 rounded-t-3xl border-b ${styles.border}`}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white/80 rounded-2xl flex items-center justify-center border ${styles.border} shadow-lg`}>
              <span className="text-xl sm:text-2xl">{styles.iconSymbol}</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h3>
              <p className="text-slate-600 text-xs sm:text-sm">Please confirm your action</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <p className="text-slate-700 text-center leading-relaxed text-sm sm:text-base">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50/50 rounded-b-3xl border-t border-slate-200/60">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 sm:px-6 py-3 ${styles.button} text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 