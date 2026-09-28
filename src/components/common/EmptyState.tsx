import React, { ReactNode } from 'react';
import { LucideIcon, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#d5cebf] rounded-lg bg-[#fbf9f5] my-4 shadow-2xs">
      <div className="p-3 bg-[#f1ede4] rounded-full text-[#92400e] mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-medium text-stone-900 font-serif-display mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-[#92400e] hover:bg-[#78350f] text-white font-medium text-xs rounded transition shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
};
