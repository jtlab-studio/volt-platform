import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../ui/components/Button';
import { GlassPanel } from '../../../ui/components/GlassPanel';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../../../core/config/constants';
import { emailSchema, passwordSchema, usernameSchema } from '../../../core/utils/validation';

const signupSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  activityType: z.enum(['hiker', 'cyclist', 'runner']).optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, loading, error } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      activityType: null,
    }
  });
  
  const onSubmit = async (data: SignupFormData) => {
    const success = await signup(data.email, data.username, data.password);
    if (success) {
      navigate(ROUTES.MATCH);
    }
  };
  
  return (
    <GlassPanel className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#121212] dark:text-[#f1f4f8] mb-6">
        {t('auth.signUpTitle')}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#dc143c]/10 border border-[#dc143c]/20">
          <p className="text-sm text-[#dc143c]">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-1"
          >
            {t('auth.email')}
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
            placeholder={t('auth.emailPlaceholder')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[#dc143c]">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-1"
          >
            {t('auth.username')}
          </label>
          <input
            {...register('username')}
            type="text"
            id="username"
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
            placeholder={t('auth.usernamePlaceholder')}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-[#dc143c]">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-1"
          >
            {t('auth.password')}
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
            placeholder={t('auth.passwordPlaceholder')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-[#dc143c]">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-1"
          >
            {t('auth.confirmPassword')}
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent transition-all"
            placeholder={t('auth.confirmPasswordPlaceholder')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-[#dc143c]">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#14181b] dark:text-[#ffffff] mb-2">
            {t('auth.activityType')} ({t('auth.optional')})
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                {...register('activityType')}
                type="radio"
                value=""
                className="mr-2 text-[#ff9800] focus:ring-[#ff9800]"
                defaultChecked
              />
              <span className="text-sm text-[#14181b] dark:text-[#ffffff]">
                {t('common.noData')}
              </span>
            </label>
            {(['hiker', 'cyclist', 'runner'] as const).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  {...register('activityType')}
                  type="radio"
                  value={type}
                  className="mr-2 text-[#ff9800] focus:ring-[#ff9800]"
                />
                <span className="text-sm text-[#14181b] dark:text-[#ffffff]">
                  {t(`auth.${type}`)}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <Button type="submit" fullWidth loading={loading}>
          {t('auth.signUp')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-[#14181b] dark:text-[#ffffff]">
          {t('auth.haveAccount')}{' '}
          <Link
            to={ROUTES.LOGIN}
            className="text-[#ff9800] hover:text-[#ff9800]/80 transition-colors font-medium"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </GlassPanel>
  );
};
