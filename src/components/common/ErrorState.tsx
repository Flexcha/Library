import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Thông báo hệ thống',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-200 rounded-lg bg-red-50/50 my-4 font-serif-data">
      <div className="p-3 bg-red-100 rounded-full text-red-700 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-medium text-red-950 font-serif-display mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-700 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 font-medium text-xs rounded transition flex items-center space-x-1.5 cursor-pointer border border-[#d5cebf] shadow-2xs font-serif"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tải Lại Dữ Liệu</span>
        </button>
      )}
    </div>
  );
};
