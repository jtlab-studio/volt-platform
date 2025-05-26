import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ElevationChart } from '../features/race/components/ElevationChart';
import { GradientDistribution } from '../features/race/components/GradientDistribution';
import { RaceMetadata } from '../features/race/components/RaceMetadata';
import { Button } from '../ui/components/Button';
import { useRace, useElevationProfile, useGradientDistribution } from '../features/race/hooks/useRaces';
import { ROLLING_WINDOW, ROUTES } from '../core/config/constants';
import { BreadcrumbItem } from '../ui/components/Breadcrumbs';
import { SkeletonCard } from '../ui/components/Skeleton';

const LibraryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [windowSize, setWindowSize] = useState(ROLLING_WINDOW.DEFAULT);
  
  const { race, isLoading: raceLoading, error } = useRace(id || '');
  const { profile, isLoading: profileLoading } = useElevationProfile(
    id || '',
    windowSize
  );
  const { distribution, isLoading: distributionLoading } = useGradientDistribution(
    id || '',
    windowSize
  );
  
  if (!id) {
    return <Navigate to={ROUTES.LIBRARY} replace />;
  }
  
  if (raceLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={1} showImage />
        <SkeletonCard lines={1} showImage />
      </div>
    );
  }
  
  if (error || !race) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl p-8 text-center">
          <p className="text-[#dc143c] mb-4">{error || 'Race not found'}</p>
          <Link to={ROUTES.LIBRARY}>
            <Button variant="secondary">{t('common.back')}</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: ROUTES.LANDING },
    { label: t('nav.library'), href: ROUTES.LIBRARY },
    { label: race.name },
  ];
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <RaceMetadata
        race={race}
        windowSize={windowSize}
        onWindowSizeChange={setWindowSize}
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
      
      <div className="flex justify-between">
        <Link to={ROUTES.LIBRARY}>
          <Button variant="secondary">{t('common.back')}</Button>
        </Link>
        
        <Link to={`${ROUTES.SYNTHESIS}?ref=${race.id}`}>
          <Button>{t('race.generateSimilar')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default LibraryDetailPage;
