import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { PageLayout } from '../ui/layouts/PageLayout';
import { routeConfigs } from './routes';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const MatchPage = lazy(() => import('../pages/MatchPage'));
const SynthesisPage = lazy(() => import('../pages/SynthesisPage'));
const LibraryPage = lazy(() => import('../pages/LibraryPage'));
const LibraryDetailPage = lazy(() => import('../pages/LibraryDetailPage'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9800]" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};
