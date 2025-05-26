import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { SkeletonCard } from '../../../ui/components/Skeleton';
import type { SynthesisResult } from '../../../core/types/synthesis';
import clsx from 'clsx';

interface RouteResultsProps {
  results: SynthesisResult[];
  selectedResultId: string | null;
  onResultSelect: (result: SynthesisResult) => void;
  isLoading: boolean;
}

export const RouteResults: React.FC<RouteResultsProps> = ({
  results,
  selectedResultId,
  onResultSelect,
  isLoading,
}) => {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
          {t('synthesis.results')}
        </h3>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <GlassPanel>
        <p className="text-center text-[#14181b] dark:text-[#ffffff]">
          {t('synthesis.noResults')}
        </p>
      </GlassPanel>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
        {t('synthesis.results')} ({results.length})
      </h3>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {results.map((result, index) => (
          <GlassPanel
            key={result.id}
            padding="sm"
            onClick={() => onResultSelect(result)}
            className={clsx(
              'cursor-pointer transition-all',
              selectedResultId === result.id
                ? 'ring-2 ring-[#ff9800] bg-[#ff9800]/5'
                : 'hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#121212] dark:text-[#f1f4f8]">
                  #{index + 1}
                </p>
                <div className="flex items-center space-x-3 text-sm text-[#14181b] dark:text-[#ffffff] mt-1">
                  <span>{result.distanceKm.toFixed(1)} km</span>
                  <span>↑ {result.elevationGainM.toFixed(0)} m</span>
                  <span>↓ {result.elevationLossM.toFixed(0)} m</span>
                </div>
                <div className="flex items-center space-x-3 text-sm mt-1">
                  <span className="text-[#ff9800]">
                    ITRA: {result.itraEffortDistance.toFixed(1)}
                  </span>
                  <span className="text-[#249689]">
                    {t('synthesis.similarity')}: {(result.similarityScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <button className="text-sm text-[#ff9800] hover:text-[#ff9800]/80 transition-colors">
                  {t('synthesis.view')}
                </button>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
};
