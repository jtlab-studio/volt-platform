import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GpxUpload } from '../features/race/components/GpxUpload';
import { RaceLibrary } from '../features/race/components/RaceLibrary';
import { ElevationChart } from '../features/race/components/ElevationChart';
import { GradientDistribution } from '../features/race/components/GradientDistribution';
import { RaceMetadata } from '../features/race/components/RaceMetadata';
import { Button } from '../ui/components/Button';
import { useRaceStore } from '../features/race/stores/raceStore';
import { useElevationProfile, useGradientDistribution } from '../features/race/hooks/useRaces';
import { ROLLING_WINDOW, ROUTES } from '../core/config/constants';
import { Link } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedRace } = useRaceStore();
  const [windowSize, setWindowSize] = useState<number>(ROLLING_WINDOW.DEFAULT);
  
  const { profile, isLoading: profileLoading } = useElevationProfile(
    selectedRace?.id || '',
    windowSize
  );
  
  const { distribution, isLoading: distributionLoading } = useGradientDistribution(
    selectedRace?.id || '',
    windowSize
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Upload & Library */}
      <div className="lg:col-span-1 space-y-6">
        <GpxUpload />
        <RaceLibrary />
      </div>
      
      {/* Right Column - Overview */}
      <div className="lg:col-span-2 space-y-6">
        {selectedRace ? (
          <>
            <RaceMetadata
              race={selectedRace}
              windowSize={windowSize}
              onWindowSizeChange={(size) => setWindowSize(size)}
            />
            
            {profile && (
              <ElevationChart
                profile={profile}
                isLoading={profileLoading}
              />
            )}
            
            {distribution && (
              <GradientDistribution
                distribution={distribution}
                isLoading={distributionLoading}
              />
            )}
            
            <div className="flex justify-end">
              <Link to={`${ROUTES.SYNTHESIS}?ref=${selectedRace.id}`}>
                <Button size="lg">
                  {t('race.generateSimilar')}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl p-12 text-center">
            <p className="text-[#14181b] dark:text-[#ffffff]">
              {t('race.noRaces')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;
