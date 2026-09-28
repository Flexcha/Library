import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext.tsx';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-emerald-800/80 bg-stone-900 text-stone-100',
  error: 'border-rose-800/80 bg-stone-900 text-stone-100',
  warning: 'border-amber-800/80 bg-stone-900 text-stone-100',
  info: 'border-sky-800/80 bg-stone-900 text-stone-100',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all duration-200 ${
            borderStyles[toast.type]
          }`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-sm font-semibold text-stone-100 tracking-tight mb-0.5">
                {toast.title}
              </h4>
            )}
            <p className="text-xs text-stone-300 leading-relaxed break-words">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-200 transition p-1 -mr-1 -mt-1 rounded-lg hover:bg-stone-800 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
