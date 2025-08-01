import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import useAuthRole from '@/hooks/useAuthRole';

const usePermissions = () => {
  const { userId, isAdmin, isLoading: isRoleLoading, profile } = useAuthRole();
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    if (isAdmin) {
      const allPermissions = {
        can_view_patients: true, can_create_patients: true, can_update_patients: true, can_delete_patients: true,
        can_view_appointments: true, can_create_appointments: true, can_update_appointments: true, can_delete_appointments: true,
        can_view_medical_records: true, can_create_medical_records: true, can_update_medical_records: true, can_delete_medical_records: true,
        can_view_finances: true, can_create_finances: true, can_update_finances: true, can_delete_finances: true,
      };
      setPermissions(allPermissions);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_user_permissions', { p_user_id: userId });
      
      if (rpcError) throw rpcError;
      
      const permsObject = data.reduce((acc, perm) => {
        acc[perm.permission_name] = perm.has_permission;
        return acc;
      }, {});

      setPermissions(permsObject);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching permissions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    if (!isRoleLoading) {
      fetchPermissions();
    }
  }, [isRoleLoading, fetchPermissions, profile]); // Adicionado profile para refetch ao mudar

  const can = (action) => {
    if (isRoleLoading || isLoading) return false;
    if (isAdmin) return true; // Adicionado para garantir que o admin sempre tenha permissão
    return !!permissions[action];
  };

  return { permissions, isLoading: isLoading || isRoleLoading, error, can, refetchPermissions: fetchPermissions };
};

export default usePermissions;