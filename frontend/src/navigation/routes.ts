import { ROUTES } from '../core/config/constants';

export interface RouteConfig {
  path: string;
  title: string;
  requiresAuth: boolean;
}

export const routeConfigs: Record<string, RouteConfig> = {
  landing: {
    path: ROUTES.LANDING,
    title: 'Volt Platform',
    requiresAuth: false,
  },
  login: {
    path: ROUTES.LOGIN,
    title: 'Login',
    requiresAuth: false,
  },
  signup: {
    path: ROUTES.SIGNUP,
    title: 'Sign Up',
    requiresAuth: false,
  },
  match: {
    path: ROUTES.MATCH,
    title: 'Races',
    requiresAuth: true,
  },
  synthesis: {
    path: ROUTES.SYNTHESIS,
    title: 'Smart Route Synthesis',
    requiresAuth: true,
  },
  library: {
    path: ROUTES.LIBRARY,
    title: 'Library',
    requiresAuth: true,
  },
  libraryDetail: {
    path: ROUTES.LIBRARY_DETAIL,
    title: 'Race Details',
    requiresAuth: true,
  },
};

export const publicRoutes = Object.values(routeConfigs).filter(
  (route) => !route.requiresAuth
);

export const protectedRoutes = Object.values(routeConfigs).filter(
  (route) => route.requiresAuth
);
