import { useProfile } from '@/contexts/ProfileContext';

const useAuthRole = () => {
  const { profile, loadingProfile } = useProfile();

  const userRole = profile?.role || null;
  const isAuthenticated = !!profile;

  const hasRole = (requiredRoleOrRoles) => {
    if (!isAuthenticated || !userRole) {
      return false;
    }
    if (Array.isArray(requiredRoleOrRoles)) {
      return requiredRoleOrRoles.includes(userRole);
    }
    return userRole === requiredRoleOrRoles;
  };

  return {
    profile,
    userRole,
    userId: profile?.user_id,
    profileId: profile?.id,
    isAuthenticated,
    isLoading: loadingProfile,
    hasRole,
    isAdmin: hasRole('admin'),
    isDoctor: hasRole('doctor'),
    isNurse: hasRole('nurse'),
    isReceptionist: hasRole('receptionist'),
    isAccountant: hasRole('accountant'),
    isPatient: hasRole('patient'),
  };
};

export default useAuthRole;