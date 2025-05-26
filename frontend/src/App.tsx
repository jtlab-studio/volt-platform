import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { AppRouter } from './navigation/AppRouter';
import { ToastContainer } from './ui/components/Toast';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './features/auth/stores/authStore';
import { validateEnvironment } from './core/config/environment';
import './i18n';

// Validate environment on app start
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Create a wrapper component to apply future flags
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </BrowserRouter>
  );
};

function App() {
  const { toasts, removeToast } = useUIStore();
  const { initialize } = useAuthStore();
  
  useEffect(() => {
    // Initialize auth state
    initialize();
  }, [initialize]);
  
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
      }}
    >
      <RouterWrapper>
        <AppRouter />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </RouterWrapper>
    </SWRConfig>
  );
}

export default App;
