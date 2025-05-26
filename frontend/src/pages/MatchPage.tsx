import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RaceLibrarySidebar } from '../features/race/components/RaceLibrarySidebar';
import { ElevationChart } from '../features/race/components/ElevationChart';
import { GradientDistribution } from '../features/race/components/GradientDistribution';
import { RaceMetadata } from '../features/race/components/RaceMetadata';
import { Button } from '../ui/components/Button';
import { useRaceStore } from '../features/race/stores/raceStore';
import { useElevationProfile, useGradientDistribution, useRaceMetrics } from '../features/race/hooks/useRaces';
import { ROUTES } from '../core/config/constants';
import { Link } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedRace, updateRaceMetrics } = useRaceStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Use a ref to track if we've already updated metrics
  const metricsUpdatedRef = useRef<string | null>(null);
  
  // Always use smoothing with 75m window
  const isSmoothed = true;
  const windowSize = 75;
  
  const { profile, isLoading: profileLoading } = useElevationProfile(
    selectedRace?.id || '',
    windowSize,
    isSmoothed
  );
  
  const { distribution, isLoading: distributionLoading } = useGradientDistribution(
    selectedRace?.id || '',
    windowSize,
    isSmoothed
  );
  
  const { metrics, isLoading: metricsLoading } = useRaceMetrics(
    selectedRace?.id || '',
    isSmoothed
  );
  
  // Update race metrics when smoothed metrics are loaded
  useEffect(() => {
    const metricsKey = `${selectedRace?.id}-smoothed`;
    if (metrics && selectedRace && metricsUpdatedRef.current !== metricsKey) {
      metricsUpdatedRef.current = metricsKey;
      updateRaceMetrics(selectedRace.id, metrics);
    }
  }, [metrics, selectedRace?.id]);
  
  return (
    <div className="flex gap-4 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Library Sidebar - Now on the left */}
      <RaceLibrarySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Main Content Area - Adjusted margin for left sidebar */}
      <div className={`flex-1 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-12'}`}>
        <div className="max-w-full space-y-6">
          {selectedRace ? (
            <>
              {/* Top Section - Race metadata and gradient distributions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Race Metadata - Left */}
                <div className="lg:col-span-1">
                  <RaceMetadata race={selectedRace} isSmoothed={isSmoothed} />
                </div>
                
                {/* Gradient Distributions - Right (spans 2 columns) */}
                <div className="lg:col-span-2">
                  {distribution && (
                    <GradientDistribution
                      distribution={distribution}
                      isLoading={distributionLoading}
                    />
                  )}
                </div>
              </div>
              
              {/* Elevation Profile - Full Width */}
              {profile && (
                <ElevationChart
                  profile={profile}
                  isLoading={profileLoading}
                />
              )}
              
              {/* Action Button - Centered */}
              <div className="flex justify-center">
                <Link to={`${ROUTES.SYNTHESIS}?ref=${selectedRace.id}`}>
                  <Button size="lg">
                    {t('race.generateSimilar')}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl p-12 text-center">
              <p className="text-[#14181b] dark:text-[#ffffff] text-lg">
                {t('race.uploadToStart')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchPage;