import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../features/auth/components/LoginForm';
import { BreadcrumbItem } from '../ui/components/Breadcrumbs';
import { ROUTES } from '../core/config/constants';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: ROUTES.LANDING },
    { label: t('auth.login') },
  ];
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
