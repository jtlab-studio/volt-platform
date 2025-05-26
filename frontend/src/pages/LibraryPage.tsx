import React from 'react';
import { useTranslation } from 'react-i18next';
import { RaceLibrary } from '../features/race/components/RaceLibrary';
import { BreadcrumbItem } from '../ui/components/Breadcrumbs';
import { ROUTES } from '../core/config/constants';

const LibraryPage: React.FC = () => {
  const { t } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: ROUTES.LANDING },
    { label: t('nav.library') },
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#121212] dark:text-[#f1f4f8] mb-8">
        {t('nav.library')}
      </h1>
      
      <RaceLibrary />
    </div>
  );
};

export default LibraryPage;
