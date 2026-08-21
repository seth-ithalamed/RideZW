import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';
import { dialog, DialogOptions } from '../../services/dialogService';

export const CustomDialogModal: React.FC = () => {
  const [current, setCurrent] = useState<DialogOptions | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const unsubscribe = dialog.subscribe((options) => {
      setCurrent(options);
      if (options?.type === 'prompt') {
        setInputValue(options.defaultValue || '');
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!current) return null;

  const handleConfirm = () => {
    if (current.type === 'prompt') {
      current.onConfirm?.(inputValue);
    } else {
      current.onConfirm?.();
    }
  };

  const handleCancel = () => {
    current.onCancel?.();
    dialog.close();
  };

  const getIcon = () => {
    if (current.type === 'prompt') {
      return <HelpCircle className="w-5 h-5 text-indigo-600" />;
    }
    switch (current.variant) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-600" />;
    }
  };

  const getHeaderBg = () => {
    switch (current.variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'error':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'info':
      default:
        return 'bg-sky-50 text-sky-900 border-sky-200';
    }
  };

  return (
    <div
      id="custom-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="custom-dialog-box"
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Dialog Header */}
        <div className={`p-4 border-b flex items-center justify-between ${getHeaderBg()}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-lg shadow-2xs">
              {getIcon()}
            </div>
            <h3 className="font-bold text-sm text-slate-900">{current.title}</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed text-[13px]">{current.message}</p>

          {current.type === 'prompt' && (
            <div className="space-y-1.5">
              <input
                id="custom-dialog-prompt-input"
                type="text"
                autoFocus
                placeholder={current.placeholder || 'Enter response...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
              />
            </div>
          )}
        </div>

        {/* Dialog Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          {(current.type === 'confirm' || current.type === 'prompt') && (
            <button
              id="custom-dialog-cancel-btn"
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              {current.cancelText || 'Cancel'}
            </button>
          )}

          <button
            id="custom-dialog-confirm-btn"
            type="button"
            autoFocus={current.type !== 'prompt'}
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-all cursor-pointer ${
              current.variant === 'error'
                ? 'bg-rose-600 hover:bg-rose-700'
                : current.variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-sky-900 hover:bg-sky-800'
            }`}
          >
            {current.confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
