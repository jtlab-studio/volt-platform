import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/components/Button';
import { Header } from '../ui/layouts/Header';
import { Footer } from '../ui/layouts/Footer';
import { ROUTES } from '../core/config/constants';
import { MapIcon, ChartBarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: ChartBarIcon,
      titleKey: 'landing.features.analyze.title',
      descriptionKey: 'landing.features.analyze.description',
      color: 'text-[#2196f3]',
    },
    {
      icon: MapIcon,
      titleKey: 'landing.features.generate.title',
      descriptionKey: 'landing.features.generate.description',
      color: 'text-[#ff9800]',
    },
    {
      icon: RocketLaunchIcon,
      titleKey: 'landing.features.train.title',
      descriptionKey: 'landing.features.train.description',
      color: 'text-[#249689]',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] to-[#f1f4f8] dark:from-[#121212] dark:to-[#14181b]">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#121212] dark:text-[#f1f4f8] mb-6">
                {t('landing.hero.title')}
              </h1>
              <p className="text-xl text-[#14181b] dark:text-[#ffffff] mb-8 max-w-2xl mx-auto">
                {t('landing.hero.subtitle')}
              </p>
              <Link to={ROUTES.SIGNUP}>
                <Button size="lg" className="px-8 py-4 text-lg">
                  {t('landing.hero.cta')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-gradient-to-br from-[#ff9800]/20 to-[#ff5722]/20 rounded-full blur-3xl" />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-[#121212] dark:text-[#f1f4f8] mb-12">
              {t('landing.features.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/20 dark:bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-semibold text-[#121212] dark:text-[#f1f4f8] mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-[#14181b] dark:text-[#ffffff]">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
