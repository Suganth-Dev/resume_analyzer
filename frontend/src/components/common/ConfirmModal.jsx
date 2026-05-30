import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  cancelText = 'Cancel', 
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-dark-800 shadow-2xl relative transform transition-all scale-100">
        
        {/* Warning Icon & Title Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-6">{title}</h3>
            <p className="text-sm text-dark-350 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-dark-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-semibold text-xs transition-all shadow-md shadow-red-950/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
