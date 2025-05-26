import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { PageLayout } from '../ui/layouts/PageLayout';
import { routeConfigs } from './routes';

// Import pages directly instead of lazy loading to avoid the error
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import MatchPage from '../pages/MatchPage';
import SynthesisPage from '../pages/SynthesisPage';
import LibraryPage from '../pages/LibraryPage';
import LibraryDetailPage from '../pages/LibraryDetailPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={routeConfigs.landing.path} element={<LandingPage />} />
      <Route
        path={routeConfigs.login.path}
        element={
          <PageLayout>
            <LoginPage />
          </PageLayout>
        }
      />
      <Route
        path={routeConfigs.signup.path}
        element={
          <PageLayout>
            <SignupPage />
          </PageLayout>
        }
      />
      
      {/* Protected routes */}
      <Route
        path={routeConfigs.match.path}
        element={
          <ProtectedRoute>
            <PageLayout>
              <MatchPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={routeConfigs.synthesis.path}
        element={
          <ProtectedRoute>
            <PageLayout>
              <SynthesisPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={routeConfigs.library.path}
        element={
          <ProtectedRoute>
            <PageLayout>
              <LibraryPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={routeConfigs.libraryDetail.path}
        element={
          <ProtectedRoute>
            <PageLayout>
              <LibraryDetailPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to={routeConfigs.landing.path} replace />} />
    </Routes>
  );
};
