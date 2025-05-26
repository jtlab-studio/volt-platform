import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RaceLibrarySidebar } from '../features/race/components/RaceLibrarySidebar';
import { ElevationChart } from '../features/race/components/ElevationChart';
import { GradientDistribution } from '../features/race/components/GradientDistribution';
import { RaceMetadata } from '../features/race/components/RaceMetadata';
import { RollingWindowSelector } from '../features/race/components/RollingWindowSelector';
import { Button } from '../ui/components/Button';
import { useRaceStore } from '../features/race/stores/raceStore';
import { useElevationProfile, useGradientDistribution } from '../features/race/hooks/useRaces';
import { ROUTES } from '../core/config/constants';
import { Link } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedRace } = useRaceStore();
  const [windowSize, setWindowSize] = useState<number>(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { profile, isLoading: profileLoading } = useElevationProfile(
    selectedRace?.id || '',
    windowSize
  );
  
  const { distribution, isLoading: distributionLoading } = useGradientDistribution(
    selectedRace?.id || '',
    windowSize
  );
  
  return (
    <div className="flex gap-4 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Main Content Area */}
      <div className={`flex-1 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
        <div className="max-w-full space-y-6">
          {selectedRace ? (
            <>
              {/* Top Section - All cards with same height */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Race Metadata - Left */}
                <div className="lg:col-span-1">
                  <RaceMetadata race={selectedRace} />
                </div>
                
                {/* Gradient Distributions - Center (spans 2 columns) */}
                <div className="lg:col-span-2">
                  {distribution && (
                    <GradientDistribution
                      distribution={distribution}
                      isLoading={distributionLoading}
                    />
                  )}
                </div>
                
                {/* Rolling Window Selector - Right */}
                <div className="lg:col-span-1">
                  <RollingWindowSelector
                    windowSize={windowSize}
                    onWindowSizeChange={setWindowSize}
                  />
                </div>
              </div>
              
              {/* Elevation Profile - Full Width */}
              {profile && (
                <ElevationChart
                  profile={profile}
                  isLoading={profileLoading}
                />
              )}
              
              {/* Action Button */}
              <div className="flex justify-end">
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
      
      {/* Library Sidebar */}
      <RaceLibrarySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
};

export default MatchPage;
