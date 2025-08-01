import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './SupabaseAuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }) => {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }
    
    // Evita refetch desnecessário se o perfil já estiver carregado para o usuário atual
    // A menos que estejamos forçando um refetch (profile será null)
    if (profile && profile.user_id === user.id) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: no rows returned
        console.error('Erro ao buscar perfil:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Exceção ao buscar perfil:', e);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []); // Remove profile das dependências para permitir o refetch

  useEffect(() => {
    if (session?.user) {
      fetchProfile(session.user);
    } else {
      setProfile(null);
      setLoadingProfile(false);
    }
  }, [session, fetchProfile]);

  const refetchProfile = useCallback(() => {
    if (session?.user) {
      // Força a busca do perfil, limpando o estado atual para garantir a recarga
      setProfile(null);
      fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  const value = {
    profile,
    loadingProfile,
    refetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};