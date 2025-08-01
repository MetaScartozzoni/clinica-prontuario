import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Users, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserManagementSettings = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_all_users_with_profiles');
      if (rpcError) throw rpcError;
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError("Não foi possível carregar os usuários. Verifique as permissões e tente novamente.");
      toast({
        title: "Erro ao carregar usuários",
        description: err.message,
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setIsUpdating(userId);
    const { error: rpcError } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: newRole,
    });

    if (rpcError) {
      toast({
        title: "Erro ao atualizar perfil",
        description: rpcError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "O perfil do usuário foi alterado com sucesso.",
        variant: "success",
      });
      fetchUsers(); 
    }
    setIsUpdating(null);
  };

  const roleOptions = [
    { value: 'admin_financeiro', label: 'Admin Financeiro' },
    { value: 'medico', label: 'Médico' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'user', label: 'Paciente' },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users /> Gerenciamento de Usuários
        </CardTitle>
        <CardDescription>Visualize e gerencie os perfis de acesso dos usuários do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
            <p className="font-semibold">Erro ao Carregar Usuários</p>
            <p className="text-sm">{error}</p>
            <Button onClick={fetchUsers} variant="outline" className="mt-4">Tentar Novamente</Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="w-[200px]">Perfil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? 
                        formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true, locale: ptBR })
                        : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      {isUpdating === user.user_id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Select
                          defaultValue={user.app_role}
                          onValueChange={(value) => handleRoleChange(user.user_id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagementSettings;