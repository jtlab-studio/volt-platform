import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { Button } from '../../../ui/components/Button';
import { gpxFileSchema } from '../../../core/utils/validation';
import { useRaceStore } from '../stores/raceStore';
import clsx from 'clsx';

export const GpxUpload: React.FC = () => {
  const { t } = useTranslation();
  const { uploadGpx, isUploading, error } = useRaceStore();
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setValidationError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    try {
      gpxFileSchema.parse(file);
      await uploadGpx(file);
    } catch (error: any) {
      if (error.errors) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError('Failed to upload file');
      }
    }
  }, [uploadGpx]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gpx+xml': ['.gpx'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading,
  });
  
  const displayError = validationError || error;
  
  return (
    <div className="space-y-4">
      <GlassPanel
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive
            ? 'border-[#ff9800] bg-[#ff9800]/5'
            : 'border-gray-300 dark:border-gray-700 hover:border-[#ff9800]/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center py-12 px-6">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-base font-medium text-[#121212] dark:text-[#f1f4f8] mb-2">
            {isDragActive ? t('race.dropFile') : t('race.uploadGpx')}
          </p>
          <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
            {t('race.dragDropOrClick')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('race.maxFileSize')}
          </p>
        </div>
      </GlassPanel>
      
      {displayError && (
        <div className="p-3 rounded-lg bg-[#dc143c]/10 border border-[#dc143c]/20">
          <p className="text-sm text-[#dc143c]">{displayError}</p>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff9800]" />
            <span className="text-sm text-[#14181b] dark:text-[#ffffff]">
              {t('race.uploading')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
