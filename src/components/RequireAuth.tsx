import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth', '/privacy'];

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const isPublic = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

  if (!user && !isPublic) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
