import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../../../core/config/constants';

export const useAuth = () => {
  const authStore = useAuthStore();
  
  useEffect(() => {
    // Initialize auth state on mount
    authStore.initialize();
  }, []);
  
  return authStore;
};

export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, isLoading, navigate]);
  
  return { user, isLoading };
};
