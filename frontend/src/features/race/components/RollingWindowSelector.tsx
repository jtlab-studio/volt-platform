import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import clsx from 'clsx';

interface RollingWindowSelectorProps {
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
  isEnabled: boolean;
}

const WINDOW_SIZES = [
  { value: 10, label: 'XS' },
  { value: 25, label: 'S' },
  { value: 100, label: 'M' },
  { value: 500, label: 'L' },
  { value: 1000, label: 'XL' },
];

export const RollingWindowSelector: React.FC<RollingWindowSelectorProps> = ({
  windowSize,
  onWindowSizeChange,
  isEnabled,
}) => {
  const { t } = useTranslation();
  
  return (
    <GlassPanel padding="sm" className="h-[200px] flex flex-col">
      <h4 className="text-sm font-medium text-[#121212] dark:text-[#f1f4f8] mb-3">
        {t('race.rollingWindowSize')}
      </h4>
      <div className="flex-1 grid grid-cols-2 gap-1.5 content-center">
        {WINDOW_SIZES.map((option) => (
          <button
            key={option.value}
            onClick={() => isEnabled && onWindowSizeChange(option.value)}
            disabled={!isEnabled}
            className={clsx(
              'py-2 px-2 rounded-xl text-xs font-medium transition-all',
              windowSize === option.value && isEnabled
                ? 'bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white'
                : !isEnabled
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-white/20 dark:bg-[#1e1e1e]/40 text-[#121212] dark:text-[#f1f4f8] hover:bg-white/30 dark:hover:bg-[#1e1e1e]/50'
            )}
          >
            {option.label}
            {option.value > 0 && (
              <span className="block text-[10px] opacity-75">
                {option.value < 1000 ? `${option.value}m` : '1km'}
              </span>
            )}
          </button>
        ))}
      </div>
      {!isEnabled && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
          Enable smoothing to adjust window size
        </p>
      )}
    </GlassPanel>
  );
};
