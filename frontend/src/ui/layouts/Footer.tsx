import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-gradient-to-br from-[#ff9800] to-[#ff5722] rounded-lg" />
            <span className="text-sm text-[#14181b] dark:text-[#ffffff]">
              © 2025 Volt Platform
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link
              to="/terms"
              className="text-[#14181b] dark:text-[#ffffff] hover:text-[#ff9800] transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <Link
              to="/privacy"
              className="text-[#14181b] dark:text-[#ffffff] hover:text-[#ff9800] transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/contact"
              className="text-[#14181b] dark:text-[#ffffff] hover:text-[#ff9800] transition-colors"
            >
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
