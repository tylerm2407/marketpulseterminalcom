import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth', '/privacy', '/terms', '/reset-password'];

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, nwSession, nwProcessing } = useAuth();
  const location = useLocation();

  if (loading || nwProcessing) return null;

  const isPublic = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

  // Allow access if user has Supabase session OR NovaWealth session
  if (!user && !nwSession && !isPublic) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
