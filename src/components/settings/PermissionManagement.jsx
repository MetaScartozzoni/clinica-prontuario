import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ShieldCheck, Save, Users, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const permissionGroups = {
  "Pacientes": ["can_view_patients", "can_create_patients", "can_update_patients", "can_delete_patients"],
  "Agendamentos": ["can_view_appointments", "can_create_appointments", "can_update_appointments", "can_delete_appointments"],
  "Prontuários": ["can_view_medical_records", "can_create_medical_records", "can_update_medical_records", "can_delete_medical_records"],
  "Financeiro": ["can_view_finances", "can_create_finances", "can_update_finances", "can_delete_finances"],
};

const permissionLabels = {
  can_view_patients: "Visualizar Pacientes",
  can_create_patients: "Criar Pacientes",
  can_update_patients: "Atualizar Pacientes",
  can_delete_patients: "Deletar Pacientes",
  can_view_appointments: "Visualizar Agendamentos",
  can_create_appointments: "Criar Agendamentos",
  can_update_appointments: "Atualizar Agendamentos",
  can_delete_appointments: "Deletar Agendamentos",
  can_view_medical_records: "Visualizar Prontuários",
  can_create_medical_records: "Criar Prontuários",
  can_update_medical_records: "Atualizar Prontuários",
  can_delete_medical_records: "Deletar Prontuários",
  can_view_finances: "Visualizar Financeiro",
  can_create_finances: "Criar Lançamentos",
  can_update_finances: "Atualizar Lançamentos",
  can_delete_finances: "Deletar Lançamentos",
};

const PermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    const { data, error } = await supabase.from('job_prefixes').select('job_title');
    if (error) {
      setError('Falha ao buscar os cargos. Tente novamente.');
      console.error('Error fetching roles:', error);
    } else {
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0].job_title);
      }
    }
  }, [selectedRole]);

  const fetchPermissionsForRole = useCallback(async (role) => {
    if (!role) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_permissions_by_job_title', { p_job_title: role });
      if (error) throw error;
      
      const permsObject = data.reduce((acc, perm) => {
        acc[perm.permission_name] = perm.has_permission;
        return acc;
      }, {});
      setPermissions(permsObject);
    } catch (err) {
      setError(`Falha ao buscar permissões para o cargo ${role}.`);
      console.error('Error fetching permissions:', err);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissionsForRole(selectedRole);
    }
  }, [selectedRole, fetchPermissionsForRole]);

  const handlePermissionChange = (permission, value) => {
    setPermissions(prev => ({ ...prev, [permission]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const permissionsArray = Object.entries(permissions).map(([permission_name, has_permission]) => ({
        permission_name,
        has_permission
    }));

    const { error } = await supabase.rpc('update_permissions_by_job_title', {
      p_job_title: selectedRole,
      p_permissions: permissionsArray,
    });

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível atualizar as permissões. ${error.message}`,
        variant: "destructive",
      });
      console.error("Error saving permissions:", error);
    } else {
      toast({
        title: "Sucesso!",
        description: `Permissões para ${selectedRole} salvas com sucesso.`,
        variant: "success",
      });
      fetchPermissionsForRole(selectedRole);
    }
    setIsSaving(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck /> Permissões por Cargo</CardTitle>
        <CardDescription>Defina quais ações cada cargo pode realizar no sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="role-select" className="text-lg">Cargo:</Label>
          <Select onValueChange={setSelectedRole} value={selectedRole} id="role-select">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.job_title} value={role.job_title}>
                  {role.job_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
            <p className="font-semibold">Erro ao Carregar Permissões</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
              <div key={groupName}>
                <h3 className="text-xl font-semibold mb-4 text-violet-300 border-b border-violet-800 pb-2">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {groupPermissions.map(perm => (
                    <div key={perm} className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-white/5 transition-colors">
                      <Label htmlFor={`switch-${perm}`} className="cursor-pointer">{permissionLabels[perm]}</Label>
                      <Switch
                        id={`switch-${perm}`}
                        checked={permissions[perm] || false}
                        onCheckedChange={(value) => handlePermissionChange(perm, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PermissionManagement;