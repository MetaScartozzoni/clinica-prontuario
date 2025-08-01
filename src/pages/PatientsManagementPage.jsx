import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { PlusCircle, Search, User, MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import AddEditPatientModal from '@/components/patients/AddEditPatientModal';
import { useNavigate } from 'react-router-dom';

const PatientsManagementPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_patients_with_profiles', {
          p_search: searchTerm || null
        });

      if (error) throw error;
      setPatients(data);
    } catch (error) {
      toast({
        title: 'Erro ao buscar pacientes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchPatients]);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', patientId);
        if (error) throw error;
        toast({
          title: 'Paciente excluído com sucesso!',
        });
        fetchPatients();
      } catch (error) {
        toast({
          title: 'Erro ao excluir paciente',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewDossier = (patientId) => {
    navigate(`/dossie/${patientId}`);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Pacientes</title>
        <meta name="description" content="Gerencie todos os pacientes da clínica." />
      </Helmet>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="p-4 sm:p-6 lg:p-8"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
              <User className="mr-3 h-8 w-8 text-violet-400" />
              Gestão de Pacientes
            </h1>
            <p className="text-violet-200 mt-1">Adicione, edite e visualize os registros dos pacientes.</p>
          </div>
          <Button onClick={handleAddPatient} className="mt-4 sm:mt-0 bg-violet-600 hover:bg-violet-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Paciente
          </Button>
        </header>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white">Lista de Pacientes</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF, e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Nome Completo</TableHead>
                    <TableHead className="text-white">E-mail</TableHead>
                    <TableHead className="text-white">Telefone</TableHead>
                    <TableHead className="text-white">CPF</TableHead>
                    <TableHead className="text-white text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="5" className="text-center text-gray-400">Carregando...</TableCell>
                    </TableRow>
                  ) : patients.length > 0 ? (
                    patients.map((patient) => (
                      <TableRow key={patient.patient_id}>
                        <TableCell className="font-medium text-white">{patient.full_name}</TableCell>
                        <TableCell className="text-gray-300">{patient.email}</TableCell>
                        <TableCell className="text-gray-300">{patient.phone}</TableCell>
                        <TableCell className="text-gray-300">{patient.cpf}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDossier(patient.patient_id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Dossiê
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePatient(patient.patient_id)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="5" className="text-center text-gray-400">Nenhum paciente encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <AddEditPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPatients();
        }}
      />
    </>
  );
};

export default PatientsManagementPage;