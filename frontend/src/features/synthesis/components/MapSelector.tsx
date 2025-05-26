import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Rectangle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import type { BoundingBox } from '../../../core/types/synthesis';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapSelectorProps {
  onBoundsSelect: (bounds: BoundingBox) => void;
}

const MapClickHandler: React.FC<{
  onBoundsSelect: (bounds: BoundingBox) => void;
  firstCorner: [number, number] | null;
  setFirstCorner: (corner: [number, number] | null) => void;
  bounds: [[number, number], [number, number]] | null;
  setBounds: (bounds: [[number, number], [number, number]] | null) => void;
}> = ({ onBoundsSelect, firstCorner, setFirstCorner, bounds, setBounds }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      if (!firstCorner) {
        // First click - set first corner
        setFirstCorner([lat, lng]);
        setBounds(null);
      } else {
        // Second click - create rectangle
        const newBounds: [[number, number], [number, number]] = [
          firstCorner,
          [lat, lng]
        ];
        setBounds(newBounds);
        
        // Calculate bounding box
        const north = Math.max(firstCorner[0], lat);
        const south = Math.min(firstCorner[0], lat);
        const east = Math.max(firstCorner[1], lng);
        const west = Math.min(firstCorner[1], lng);
        
        onBoundsSelect({ north, south, east, west });
        setFirstCorner(null);
      }
    },
    contextmenu: (e) => {
      // Right click - reset
      e.originalEvent.preventDefault();
      setFirstCorner(null);
      setBounds(null);
    }
  });
  
  return null;
};

export const MapSelector: React.FC<MapSelectorProps> = ({
  onBoundsSelect,
}) => {
  const { t } = useTranslation();
  const [mapCenter] = useState<[number, number]>([46.8182, 8.2275]); // Switzerland center
  const [mapZoom] = useState(8);
  const [firstCorner, setFirstCorner] = useState<[number, number] | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  
  return (
    <div className="relative h-[500px] w-full">
      <div className="absolute top-4 right-4 z-[1000]">
        <GlassPanel className="px-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#121212] dark:text-[#f1f4f8]">
              {t('synthesis.drawRectangle')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {firstCorner 
                ? ("Click to set second corner")
                : ("Click to set first corner")
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {("Right-click to reset")}
            </p>
          </div>
        </GlassPanel>
      </div>
      
      <div className="h-full w-full rounded-2xl overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          style={{ zIndex: 0 }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          dragging={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            onBoundsSelect={onBoundsSelect}
            firstCorner={firstCorner}
            setFirstCorner={setFirstCorner}
            bounds={bounds}
            setBounds={setBounds}
          />
          {bounds && (
            <Rectangle
              bounds={bounds}
              pathOptions={{
                color: '#ff9800',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.2,
              }}
            />
          )}
          {firstCorner && !bounds && (
            <Rectangle
              bounds={[firstCorner, firstCorner]}
              pathOptions={{
                color: '#ff9800',
                weight: 2,
                opacity: 0.5,
                fillOpacity: 0.1,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

