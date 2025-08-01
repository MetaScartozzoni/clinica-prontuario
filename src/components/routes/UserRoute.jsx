import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader2 } from 'lucide-react';

const UserRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const { profile, loadingProfile } = useProfile();
  const location = useLocation();
  
  const loading = authLoading || loadingProfile;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1B1446] to-[#472377]">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Permite acesso se o usuário está ativo, independente da role.
  // A verificação específica de role será feita em cada rota (AdminRoute, etc.)
  if (profile.status !== 'active') {
    if (profile.status === 'inactive') return <Navigate to="/inactive" replace />;
    if (profile.status === 'pending') return <Navigate to="/pending-approval" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default UserRoute;