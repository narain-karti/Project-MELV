import React from 'react';
import { X } from 'lucide-react';

export default function ActionModal({ isOpen, onClose, title, message, severity = 'info' }) {
  if (!isOpen) return null;

  const severityStyles = {
    critical: 'border-red-500 bg-red-500/10',
    warning: 'border-amber-400 bg-amber-400/10',
    success: 'border-brand-acid bg-brand-acid/10',
    info: 'border-brand-purple bg-brand-purple/10',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative max-w-lg w-[90%] border-2 ${severityStyles[severity] || severityStyles.info} p-6 chamfer-card shadow-editorial bg-brand-black`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-gray hover:text-brand-paper transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-acid mb-2 font-mono">
          System Notification
        </div>
        <h3 className="text-lg font-bold text-brand-paper uppercase tracking-wider mb-3 font-mono">
          {title}
        </h3>
        <p className="text-sm text-brand-gray font-mono leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-brand-acid text-brand-black font-bold text-[10px] uppercase tracking-widest border border-brand-black shadow-editorial hover:bg-brand-paper transition-all"
          >
            Acknowledged
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-brand-dark-gray text-brand-gray text-[10px] uppercase tracking-widest font-bold hover:text-brand-paper hover:border-brand-paper transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export { ActionModal };
