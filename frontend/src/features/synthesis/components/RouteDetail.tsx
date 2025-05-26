import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { Button } from '../../../ui/components/Button';
import { ElevationChart } from '../../race/components/ElevationChart';
import type { SynthesisResult } from '../../../core/types/synthesis';
import type { ElevationProfile } from '../../../core/types/race';
import { latLngBounds } from 'leaflet';

interface RouteDetailProps {
  result: SynthesisResult;
  elevationProfile?: ElevationProfile;
  onDownload: () => void;
  onSaveToLibrary: () => void;
  isSaving: boolean;
}

export const RouteDetail: React.FC<RouteDetailProps> = ({
  result,
  elevationProfile,
  onDownload,
  onSaveToLibrary,
  isSaving,
}) => {
  const { t } = useTranslation();
  
  // Calculate bounds for the map
  const positions = result.route.points.map(p => [p.lat, p.lon] as [number, number]);
  const bounds = positions.length > 0 ? latLngBounds(positions) : undefined;
  
  return (
    <div className="space-y-4">
      <GlassPanel>
        <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] mb-4">
          {t('synthesis.routeDetail')}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
              {t('race.totalDistance')}
            </p>
            <p className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
              {result.distanceKm.toFixed(1)} km
            </p>
          </div>
          
          <div>
            <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
              {t('race.elevationGain')}
            </p>
            <p className="text-lg font-semibold text-[#249689]">
              ↑ {result.elevationGainM.toFixed(0)} m
            </p>
          </div>
          
          <div>
            <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
              {t('race.elevationLoss')}
            </p>
            <p className="text-lg font-semibold text-[#dc143c]">
              ↓ {result.elevationLossM.toFixed(0)} m
            </p>
          </div>
          
          <div>
            <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
              {t('race.itraEffortDistance')}
            </p>
            <p className="text-lg font-semibold text-[#ff9800]">
              {result.itraEffortDistance.toFixed(1)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onDownload}>
            {t('synthesis.downloadGpx')}
          </Button>
          <Button onClick={onSaveToLibrary} loading={isSaving}>
            {t('synthesis.saveToLibrary')}
          </Button>
        </div>
      </GlassPanel>
      
      <GlassPanel padding="none" className="h-[300px]">
        <MapContainer
          bounds={bounds}
          className="h-full w-full rounded-2xl"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positions.length > 0 && (
            <Polyline
              positions={positions}
              color="#ff9800"
              weight={3}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </GlassPanel>
      
      {elevationProfile && (
        <ElevationChart profile={elevationProfile} />
      )}
    </div>
  );
};
