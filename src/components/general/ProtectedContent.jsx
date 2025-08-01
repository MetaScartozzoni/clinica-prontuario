import React from 'react';
import usePermissions from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';

const ProtectedContent = ({ children, permission }) => {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 opacity-50">
        <Lock className="h-5 w-5 mr-2 animate-pulse" /> Verificando permissões...
      </div>
    );
  }

  const isAllowed = can(permission);

  if (isAllowed) {
    return <>{children}</>;
  }
  
  return null;
};

export default ProtectedContent;