import React from 'react';
import { useTranslation } from 'react-i18next';
import { SignupForm } from '../features/auth/components/SignupForm';
import { BreadcrumbItem } from '../ui/components/Breadcrumbs';
import { ROUTES } from '../core/config/constants';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: ROUTES.LANDING },
    { label: t('auth.signUp') },
  ];
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
