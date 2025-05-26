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
      <BrowserRouter>
        <AppRouter />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;
