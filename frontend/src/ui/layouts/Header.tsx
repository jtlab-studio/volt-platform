import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Menu } from '@headlessui/react';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { ROUTES } from '../../core/config/constants';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: t('nav.races'), href: ROUTES.MATCH },
    { name: t('nav.synthesis'), href: ROUTES.SYNTHESIS },
    { name: t('nav.library'), href: ROUTES.LIBRARY },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={ROUTES.LANDING} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-[#ff9800] to-[#ff5722] rounded-lg" />
              <span className="text-xl font-bold text-[#121212] dark:text-[#f1f4f8]">
                Volt
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={clsx(
                      'text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-[#ff9800]'
                        : 'text-[#14181b] dark:text-[#ffffff] hover:text-[#ff9800]'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <UserCircleIcon className="h-6 w-6 text-[#14181b] dark:text-[#ffffff]" />
                  </Menu.Button>
                  
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white dark:bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={clsx(
                              'block w-full rounded-xl px-4 py-2 text-left text-sm',
                              active
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'text-[#121212] dark:text-[#f1f4f8]'
                            )}
                          >
                            {t('auth.logout')}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.SIGNUP}>
                  <Button variant="primary" size="sm">
                    {t('auth.getStarted')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1">
            {user ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={clsx(
                      'block rounded-lg px-3 py-2 text-base font-medium',
                      isActive(item.href)
                        ? 'bg-[#ff9800]/10 text-[#ff9800]'
                        : 'text-[#14181b] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-[#14181b] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t('auth.logout')}
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3">
                <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" fullWidth>
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.SIGNUP} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    {t('auth.getStarted')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
