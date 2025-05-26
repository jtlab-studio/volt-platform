import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeIcon, MapIcon, TrashIcon } from '@heroicons/react/24/outline';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { Button } from '../../../ui/components/Button';
import { Modal } from '../../../ui/components/Modal';
import { SkeletonCard } from '../../../ui/components/Skeleton';
import { useRaces } from '../hooks/useRaces';
import { useRaceStore } from '../stores/raceStore';
import { ROUTES } from '../../../core/config/constants';
import { formatDate } from '../../../core/utils/transform';

export const RaceLibrary: React.FC = () => {
  const { t } = useTranslation();
  const { races, isLoading, error, mutate } = useRaces();
  const { deleteRace, selectRace } = useRaceStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      // Refresh the races list
      mutate();
    } catch (error) {
      console.error('Failed to delete race:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <GlassPanel>
        <p className="text-center text-[#dc143c]">{error}</p>
      </GlassPanel>
    );
  }
  
  if (!races || races.length === 0) {
    return (
      <GlassPanel>
        <p className="text-center text-[#14181b] dark:text-[#ffffff]">
          {t('race.noRaces')}
        </p>
      </GlassPanel>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#121212] dark:text-[#f1f4f8]">
          {t('race.myLibrary')}
        </h3>
        
        {races.map((race) => (
          <GlassPanel key={race.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <h4 className="font-medium text-[#121212] dark:text-[#f1f4f8]">
                  {race.name}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-[#14181b] dark:text-[#ffffff]">
                  <span>{race.distanceKm.toFixed(1)} km</span>
                  <span>↑ {race.elevationGainM.toFixed(0)} m</span>
                  <span>↓ {race.elevationLossM.toFixed(0)} m</span>
                  <span className="text-[#ff9800]">
                    ITRA: {race.itraEffortDistance.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(race.createdAt))}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectRace(race)}
                  title={t('race.viewOverview')}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Link to={`${ROUTES.SYNTHESIS}?ref=${race.id}`}>
                  <Button variant="secondary" size="sm" title={t('race.generateSimilar')}>
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick({ id: race.id, name: race.name })}
                  title={t('common.delete')}
                >
                  <TrashIcon className="h-4 w-4 text-[#dc143c]" />
                </Button>
              </div>
            </div>
          </GlassPanel>
        ))}
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
            {t('race.confirmDelete', { name: raceToDelete?.name })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('race.deleteWarning')}
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
    </>
  );
};
