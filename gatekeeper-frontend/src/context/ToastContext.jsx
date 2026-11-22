import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title, message, isErrorOrType = false) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      let type = 'success';
      if (typeof isErrorOrType === 'string') {
        type = isErrorOrType;
      } else if (isErrorOrType === true) {
        type = 'error';
      }

      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast-card toast-${item.type}`}>
            <div className="toast-icon">
              {item.type === 'error' && <AlertCircle size={18} />}
              {item.type === 'success' && <CheckCircle2 size={18} />}
              {item.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-body">
              <strong>{item.title}</strong>
              {item.message && <span>{item.message}</span>}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
