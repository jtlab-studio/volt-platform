import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import clsx from 'clsx';

interface RollingWindowSelectorProps {
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
}

const WINDOW_SIZES = [10, 100, 500];

export const RollingWindowSelector: React.FC<RollingWindowSelectorProps> = ({
  windowSize,
  onWindowSizeChange,
}) => {
  const { t } = useTranslation();
  
  return (
    <GlassPanel padding="sm" className="h-[200px] flex flex-col">
      <h4 className="text-sm font-medium text-[#121212] dark:text-[#f1f4f8] mb-3">
        {t('race.rollingWindowSize')}
      </h4>
      <div className="flex-1 flex flex-col justify-center space-y-2">
        {WINDOW_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onWindowSizeChange(size)}
            className={clsx(
              'w-full py-3 px-3 rounded-xl text-sm font-medium transition-all',
              windowSize === size
                ? 'bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white'
                : 'bg-white/20 dark:bg-[#1e1e1e]/40 text-[#121212] dark:text-[#f1f4f8] hover:bg-white/30 dark:hover:bg-[#1e1e1e]/50'
            )}
          >
            {size} m
          </button>
        ))}
      </div>
    </GlassPanel>
  );
};
