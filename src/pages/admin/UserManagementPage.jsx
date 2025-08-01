import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, RefreshCw, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateUserModal from '@/components/admin/CreateUserModal';

const UserManagementPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Erro ao buscar usuários', description: error.message, variant: 'destructive' });
    } else {
      setUsers(data);
    }
    setIsLoading(false);
  }, [searchTerm, toast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);
  
  const handleUpdateStatus = async (userId, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado com sucesso!', variant: 'success' });
      fetchUsers();
    }
  };


  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  }

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Usuários</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="page-title">Gerenciamento de Usuários</h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button className="btn-gradient" onClick={() => setIsModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Funcionário
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="card-glass">
          {isLoading ? (
            <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell>{user.job_title || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)}>
                        {getStatusText(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="modal-dark-theme">
                           {user.status === 'pending' && <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'active')}>Aprovar</DropdownMenuItem>}
                           {user.status === 'active' && user.role !== 'admin' && <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'inactive')}>Desativar</DropdownMenuItem>}
                           {user.status === 'inactive' && <DropdownMenuItem onClick={() => handleUpdateStatus(user.user_id, 'active')}>Reativar</DropdownMenuItem>}
                           {user.role === 'admin' && <DropdownMenuItem disabled>Admin não pode ser alterado</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {users.length === 0 && !isLoading && <div className="text-center p-10 text-violet-300">Nenhum usuário encontrado.</div>}
        </div>
      </div>
      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />
    </>
  );
};

export default UserManagementPage;