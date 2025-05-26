import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapSelector } from '../features/synthesis/components/MapSelector';
import { SynthesisControls } from '../features/synthesis/components/SynthesisControls';
import { RouteResults } from '../features/synthesis/components/RouteResults';
import { RouteDetail } from '../features/synthesis/components/RouteDetail';
import { useSynthesisStore } from '../features/synthesis/stores/synthesisStore';
import { useSynthesis } from '../features/synthesis/hooks/useSynthesis';
import { useUIStore } from '../stores/uiStore';
import type { BoundingBox } from '../core/types/synthesis';

const SynthesisPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { addToast } = useUIStore();
  
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
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Set reference race from URL params on mount
  useEffect(() => {
    const refId = searchParams.get('ref');
    if (refId) {
      setReferenceRace(refId);
    }
  }, [searchParams, setReferenceRace]);
  
  const handleBoundsSelect = (bounds: BoundingBox) => {
    setBoundingBox(bounds);
  };
  
  const handleStartSynthesis = async () => {
    if (!referenceRaceId || !boundingBox) {
      addToast({
        type: 'error',
        message: 'Please select a reference race and draw a search area',
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
  
  const handleDownloadGpx = async () => {
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
      const name = `Generated Route ${new Date().toLocaleDateString()}`;
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
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-[#121212] dark:text-[#f1f4f8]">
        {t('nav.synthesis')}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MapSelector onBoundsSelect={handleBoundsSelect} />
          
          {selectedResult && (
            <RouteDetail
              result={selectedResult}
              onDownload={handleDownloadGpx}
              onSaveToLibrary={handleSaveToLibrary}
              isSaving={isSaving}
            />
          )}
        </div>
        
        <div className="space-y-6">
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
          
          {results.length > 0 && (
            <RouteResults
              results={results}
              selectedResultId={selectedResult?.id || null}
              onResultSelect={selectResult}
              isLoading={isGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SynthesisPage;
