import React from 'react';
import clsx from 'clsx';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={clsx(
        'bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl shadow-lg',
        'border border-white/10 dark:border-white/5',
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:bg-white/25 dark:hover:bg-[#1e1e1e]/45 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
