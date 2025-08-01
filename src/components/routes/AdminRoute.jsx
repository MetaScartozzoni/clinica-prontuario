import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children, requiredRole = 'admin' }) => {
  const { session, loading: authLoading } = useAuth();
  const { profile, loadingProfile } = useProfile();
  const { isAdminAuthenticated, loading: adminAuthLoading } = useAdminAuth();
  const location = useLocation();

  const loading = authLoading || loadingProfile || adminAuthLoading;

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
  
  if (profile.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (profile.status !== 'active') {
    if (profile.status === 'inactive') return <Navigate to="/inactive" replace />;
    if (profile.status === 'pending') return <Navigate to="/pending-approval" replace />;
    return <Navigate to="/login" replace />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/reauth" state={{ from: location, message: "Seu acesso administrativo requer verificação de segurança. Por favor, insira sua senha." }} replace />;
  }

  return children;
};

export default AdminRoute;