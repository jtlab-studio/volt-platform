import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, breadcrumbs }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] dark:bg-[#121212]">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-[95%] px-4 sm:px-6 lg:px-8 py-8">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-6" />
          )}
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
