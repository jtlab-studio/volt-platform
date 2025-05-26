import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
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
  initialBounds?: BoundingBox;
}

const DrawControl: React.FC<{ onBoundsSelect: (bounds: BoundingBox) => void }> = ({
  onBoundsSelect,
}) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  
  useEffect(() => {
    map.addLayer(drawnItemsRef.current);
    
    const drawControl = new (L.Control as any).Draw({
      position: 'topright',
      draw: {
        rectangle: {
          shapeOptions: {
            color: '#ff9800',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.2,
          },
        },
        polygon: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        edit: false,
        remove: true,
      },
    });
    
    map.addControl(drawControl);
    
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      
      const bounds = layer.getBounds();
      onBoundsSelect({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    });
    
    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItemsRef.current);
    };
  }, [map, onBoundsSelect]);
  
  return null;
};

export const MapSelector: React.FC<MapSelectorProps> = ({
  onBoundsSelect,
  initialBounds,
}) => {
  const { t } = useTranslation();
  const [mapCenter] = useState<[number, number]>([46.8182, 8.2275]); // Switzerland center
  const [mapZoom] = useState(8);
  
  return (
    <GlassPanel padding="none" className="h-[500px] relative">
      <div className="absolute top-4 left-4 z-[1000]">
        <GlassPanel className="px-3 py-2">
          <p className="text-sm font-medium text-[#121212] dark:text-[#f1f4f8]">
            {t('synthesis.drawRectangle')}
          </p>
        </GlassPanel>
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full rounded-2xl"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl onBoundsSelect={onBoundsSelect} />
      </MapContainer>
    </GlassPanel>
  );
};
