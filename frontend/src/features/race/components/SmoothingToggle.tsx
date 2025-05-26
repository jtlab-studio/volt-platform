import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface SmoothingToggleProps {
  isSmoothed: boolean;
  onToggle: (smoothed: boolean) => void;
}

export const SmoothingToggle: React.FC<SmoothingToggleProps> = ({
  isSmoothed,
  onToggle,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="inline-flex items-center bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl p-1">
      <button
        onClick={() => onToggle(true)}
        className={clsx(
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          isSmoothed
            ? 'bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white'
            : 'text-[#121212] dark:text-[#f1f4f8] hover:bg-white/10'
        )}
      >
        {t('race.smooth')}
      </button>
      <button
        onClick={() => onToggle(false)}
        className={clsx(
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          !isSmoothed
            ? 'bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white'
            : 'text-[#121212] dark:text-[#f1f4f8] hover:bg-white/10'
        )}
      >
        {t('race.raw')}
      </button>
    </div>
  );
};
