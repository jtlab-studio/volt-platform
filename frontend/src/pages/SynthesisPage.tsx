import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapSelector } from '../features/synthesis/components/MapSelector';
import { SynthesisControls } from '../features/synthesis/components/SynthesisControls';
import { RouteResults } from '../features/synthesis/components/RouteResults';
import { RouteDetail } from '../features/synthesis/components/RouteDetail';
import { useSynthesisStore } from '../features/synthesis/stores/synthesisStore';
import { useSynthesis } from '../features/synthesis/hooks/useSynthesis';
import { useElevationProfile } from '../features/race/hooks/useRaces';
import { BreadcrumbItem } from '../ui/components/Breadcrumbs';
import { ROUTES } from '../core/config/constants';
import { useUIStore } from '../stores/uiStore';

const SynthesisPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { addToast } = useUIStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    referenceRaceId,
    boundingBox,
    rollingWindow,
    maxResults,
    selectedResult,
    setReferenceRace,
    setBoundingBox,
    setRollingWindow,
    setMaxResults,
    selectResult,
  } = useSynthesisStore();
  
  const {
    generateRoutes,
    downloadGpx,
    saveToLibrary,
    results,
    isGenerating,
    error,
  } = useSynthesis();
  
  // Load elevation profile for selected result
  const { profile } = useElevationProfile(
    selectedResult?.id || '',
    rollingWindow
  );
  
  // Set reference race from URL params
  useEffect(() => {
    const refId = searchParams.get('ref');
    if (refId) {
      setReferenceRace(refId);
    }
  }, [searchParams, setReferenceRace]);
  
  const handleStartSynthesis = async () => {
    if (!referenceRaceId || !boundingBox) {
      addToast({
        type: 'error',
        message: 'Please select a reference race and draw an area on the map',
      });
      return;
    }
    
    await generateRoutes({
      referenceRaceId,
      boundingBox,
      rollingWindow,
      maxResults,
    });
  };
  
  const handleDownload = async () => {
    if (!selectedResult) return;
    
    try {
      await downloadGpx(selectedResult.id);
      addToast({
        type: 'success',
        message: 'GPX file downloaded successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to download GPX file',
      });
    }
  };
  
  const handleSaveToLibrary = async () => {
    if (!selectedResult) return;
    
    setIsSaving(true);
    try {
      const name = prompt('Enter a name for this route:');
      if (!name) return;
      
      await saveToLibrary(selectedResult.id, name);
      addToast({
        type: 'success',
        message: 'Route saved to library',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to save route',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: ROUTES.LANDING },
    { label: t('nav.synthesis') },
  ];
  
  return (
    <div className="space-y-6">
      {/* Map and Controls Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapSelector
            onBoundsSelect={setBoundingBox}
            initialBounds={boundingBox || undefined}
          />
        </div>
        
        <div className="lg:col-span-1">
          <SynthesisControls
            selectedRaceId={referenceRaceId}
            rollingWindow={rollingWindow}
            maxResults={maxResults}
            onRaceSelect={setReferenceRace}
            onWindowChange={setRollingWindow}
            onMaxResultsChange={setMaxResults}
            onStartSynthesis={handleStartSynthesis}
            isLoading={isGenerating}
            canStart={!!referenceRaceId && !!boundingBox}
          />
        </div>
      </div>
      
      {/* Results and Details Row */}
      {(results.length > 0 || isGenerating || error) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <RouteResults
              results={results}
              selectedResultId={selectedResult?.id || null}
              onResultSelect={selectResult}
              isLoading={isGenerating}
            />
          </div>
          
          {selectedResult && (
            <div>
              <RouteDetail
                result={selectedResult}
                elevationProfile={profile}
                onDownload={handleDownload}
                onSaveToLibrary={handleSaveToLibrary}
                isSaving={isSaving}
              />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-lg bg-[#dc143c]/10 border border-[#dc143c]/20">
          <p className="text-[#dc143c]">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SynthesisPage;
