import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, RefreshCw, MoreVertical, Edit, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEditProfessionalModal from '@/components/admin/AddEditProfessionalModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfessionalsManagementPage = () => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_professionals_details', {
        p_search: searchTerm || null,
      });

      if (error) throw error;
      setProfessionals(data);
    } catch (error) {
      toast({
        title: 'Erro ao buscar profissionais',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProfessionals();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProfessionals]);

  const handleAdd = () => {
    setSelectedProfessional(null);
    setIsModalOpen(true);
  };

  const handleEdit = (professional) => {
    setSelectedProfessional(professional);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (professional) => {
    const newStatus = !professional.is_active;
    const { error } = await supabase
      .from('professionals')
      .update({ is_active: newStatus })
      .eq('id', professional.id);

    if (error) {
      toast({
        title: `Erro ao ${newStatus ? 'ativar' : 'desativar'} profissional`,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: `Profissional ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
      });
      fetchProfessionals();
    }
  };

  const getStatusVariant = (status) => {
    return status ? 'success' : 'destructive';
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Profissionais</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 md:p-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="page-title">Gestão de Profissionais</h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={fetchProfessionals} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button className="btn-gradient" onClick={handleAdd}>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Profissional
            </Button>
          </div>
        </div>
        
        <Card className="card-glass">
            <CardHeader>
                <CardTitle className="text-white">Lista de Profissionais</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, especialidade, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Especialidade</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {professionals.map((pro) => (
                                <TableRow key={pro.id}>
                                <TableCell className="font-medium">{pro.full_name}</TableCell>
                                <TableCell>{pro.specialization}</TableCell>
                                <TableCell className="hidden md:table-cell">{pro.email}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(pro.is_active)}>
                                    {pro.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="modal-dark-theme">
                                        <DropdownMenuItem onClick={() => handleEdit(pro)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleStatus(pro)}>
                                        {pro.is_active ? (
                                            <><ToggleLeft className="mr-2 h-4 w-4" /> Desativar</>
                                        ) : (
                                            <><ToggleRight className="mr-2 h-4 w-4" /> Ativar</>
                                        )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {professionals.length === 0 && !isLoading && <div className="text-center p-10 text-violet-300">Nenhum profissional encontrado.</div>}
            </CardContent>
        </Card>
      </motion.div>
      <AddEditProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professional={selectedProfessional}
        onSuccess={fetchProfessionals}
      />
    </>
  );
};

export default ProfessionalsManagementPage;