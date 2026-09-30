import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon text-success" />,
    error: <AlertCircle size={18} className="toast-icon text-danger" />,
    info: <Info size={18} className="toast-icon text-primary" />,
  };

  return (
    <div className={`toast-notification toast-${toast.type || 'info'} animate-slide-up`}>
      {icons[toast.type || 'info']}
      <span className="toast-message">{toast.message}</span>
      <button type="button" className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
