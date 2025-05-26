import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, MapIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../ui/components/Button';
import { Modal } from '../../../ui/components/Modal';
import { SkeletonCard } from '../../../ui/components/Skeleton';
import { GpxUpload } from './GpxUpload';
import { useRaces } from '../hooks/useRaces';
import { useRaceStore } from '../stores/raceStore';
import { racesApi } from '../api/races';
import { ROUTES } from '../../../core/config/constants';
import { useUIStore } from '../../../stores/uiStore';
import clsx from 'clsx';

interface RaceLibrarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const RaceLibrarySidebar: React.FC<RaceLibrarySidebarProps> = ({
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { races, isLoading, error, mutate } = useRaces();
  const { deleteRace, selectRace } = useRaceStore();
  const { addToast } = useUIStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  
  const handleDeleteClick = (race: { id: string; name: string }) => {
    setRaceToDelete(race);
    setDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!raceToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteRace(raceToDelete.id);
      setDeleteModalOpen(false);
      setRaceToDelete(null);
      mutate();
    } catch (error) {
      console.error('Failed to delete race:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleClearLibrary = async () => {
    setIsClearing(true);
    try {
      // Delete all races one by one
      if (races) {
        for (const race of races) {
          await racesApi.deleteRace(race.id);
        }
      }
      setClearModalOpen(false);
      mutate();
      addToast({
        type: 'success',
        message: 'Race library cleared successfully',
      });
    } catch (error) {
      console.error('Failed to clear library:', error);
      addToast({
        type: 'error',
        message: 'Failed to clear library',
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  return (
    <>
      {/* Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-16 bottom-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl',
          'border-r border-gray-200 dark:border-gray-800 shadow-xl',
          'transition-all duration-300 z-30',
          isOpen ? 'w-80' : 'w-12'
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-10 top-4 bg-white dark:bg-[#1e1e1e] rounded-r-lg p-2 shadow-lg border border-l-0 border-gray-200 dark:border-gray-800"
        >
          {isOpen ? (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        {/* Content */}
        <div className={clsx(
          'h-full overflow-y-auto custom-scrollbar',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="p-4 space-y-4">
            {/* Upload GPX Section */}
            <div>
              <GpxUpload compact />
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {/* Collapsible Library Header */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
                  className="flex items-center space-x-2 text-lg font-semibold text-[#121212] dark:text-[#f1f4f8] hover:text-[#ff9800] transition-colors"
                >
                  <span>{t('race.myLibrary')}</span>
                  {isLibraryExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
                {races && races.length > 0 && (
                  <button
                    onClick={() => setClearModalOpen(true)}
                    className="text-xs text-[#dc143c] hover:text-[#dc143c]/80 transition-colors"
                    title={t('race.clearLibrary')}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Collapsible Content */}
              {isLibraryExpanded && (
                <>
                  {isLoading && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} lines={2} />
                      ))}
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-center text-[#dc143c] text-sm p-4">
                      {error}
                    </div>
                  )}
                  
                  {!isLoading && !error && (!races || races.length === 0) && (
                    <div className="text-center text-[#14181b] dark:text-[#ffffff] text-sm p-4">
                      {t('race.noRaces')}
                    </div>
                  )}
                  
                  {races && races.length > 0 && (
                    <div className="space-y-3">
                      {races.map((race) => (
                        <div
                          key={race.id}
                          className="bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-xl p-3 hover:shadow-md transition-all"
                        >
                          <h4 className="font-medium text-sm text-[#121212] dark:text-[#f1f4f8] mb-1 truncate">
                            {race.name}
                          </h4>
                          <div className="space-y-1 text-xs text-[#14181b] dark:text-[#ffffff]">
                            <div className="flex justify-between">
                              <span>{race.distanceKm.toFixed(1)} km</span>
                              <span className="text-[#ff9800]">
                                ITRA: {race.itraEffortDistance.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>↑ {race.elevationGainM.toFixed(0)}m</span>
                              <span>↓ {race.elevationLossM.toFixed(0)}m</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectRace(race)}
                              title={t('race.viewOverview')}
                              className="p-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Link to={`${ROUTES.SYNTHESIS}?ref=${race.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title={t('race.generateSimilar')}
                                className="p-1"
                              >
                                <MapIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick({ id: race.id, name: race.name })}
                              title={t('common.delete')}
                              className="p-1"
                            >
                              <TrashIcon className="h-4 w-4 text-[#dc143c]" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRaceToDelete(null);
        }}
        title={t('common.confirm')}
      >
        <div className="space-y-4">
          <p className="text-[#14181b] dark:text-[#ffffff]">
            Are you sure you want to delete "{raceToDelete?.name}"?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setRaceToDelete(null);
              }}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              loading={isDeleting}
              className="bg-[#dc143c] hover:bg-[#dc143c]/90"
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Clear Library Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title={t('race.clearLibrary')}
      >
        <div className="space-y-4">
          <p className="text-[#14181b] dark:text-[#ffffff]">
            {t('race.confirmClearLibrary')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('race.clearWarning')}
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setClearModalOpen(false)}
              disabled={isClearing}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleClearLibrary}
              loading={isClearing}
              className="bg-[#dc143c] hover:bg-[#dc143c]/90"
            >
              {t('race.clearLibrary')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};