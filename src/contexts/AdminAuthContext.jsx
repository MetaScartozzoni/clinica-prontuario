import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './SupabaseAuthContext';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};

const ADMIN_AUTH_TIMESTAMP_KEY = 'admin_auth_timestamp';
const ADMIN_AUTH_TIMEOUT = 15 * 60 * 1000; // 15 minutos

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = () => {
      const timestamp = localStorage.getItem(ADMIN_AUTH_TIMESTAMP_KEY);
      if (timestamp) {
        const lastAuthTime = parseInt(timestamp, 10);
        if (Date.now() - lastAuthTime < ADMIN_AUTH_TIMEOUT) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
          localStorage.removeItem(ADMIN_AUTH_TIMESTAMP_KEY);
        }
      } else {
        setIsAdminAuthenticated(false);
      }
      setLoading(false);
    };

    checkAdminAuth();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAdminAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const verifyPasswordAndGrantAccess = useCallback(async (password) => {
    if (!user?.email) {
      throw new Error("Usuário não encontrado para reautenticação.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error) {
      // Log failed attempt
      await supabase.from('admin_access_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action: 'REAUTH_FAILURE',
        details: { message: 'Senha incorreta fornecida.' }
      });

      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Senha incorreta. A tentativa de acesso foi registrada.');
      }
      throw new Error(error.message);
    }

    // Log successful attempt
    await supabase.from('admin_access_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action: 'REAUTH_SUCCESS'
    });

    const timestamp = Date.now().toString();
    localStorage.setItem(ADMIN_AUTH_TIMESTAMP_KEY, timestamp);
    setIsAdminAuthenticated(true);
    
    const from = location.state?.from?.pathname || '/admin/dashboard';
    navigate(from, { replace: true });

  }, [user, navigate, location.state]);

  const clearAdminAuth = () => {
    localStorage.removeItem(ADMIN_AUTH_TIMESTAMP_KEY);
    setIsAdminAuthenticated(false);
    navigate('/login');
  };

  const value = {
    isAdminAuthenticated,
    loading,
    verifyPasswordAndGrantAccess,
    clearAdminAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};