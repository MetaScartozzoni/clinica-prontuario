import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddEditPatientModal from '@/components/patients/AddEditPatientModal'; // Usando o modal unificado
import PatientActionsPanel from '../components/PatientActionsPanel';

const PatientsView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditPatientModalOpen, setIsAddEditPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_patients_with_profiles', {
          p_search: searchTerm || null
        });
      if (error) throw error;
      setPatients(data);
    } catch (error) {
      toast({ title: 'Erro ao buscar pacientes', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchPatients, searchTerm]);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsAddEditPatientModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsAddEditPatientModalOpen(true);
  };

  const handlePatientModalSuccess = () => {
    setIsAddEditPatientModalOpen(false);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.cpf?.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  return (
    <>
      <Card className="card-glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Gerenciamento de Pacientes</CardTitle>
              <CardDescription className="text-violet-200">Visualize, adicione e gerencie os pacientes da clínica.</CardDescription>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPatient} className="bg-violet-600 hover:bg-violet-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Nome Completo</TableHead>
                    <TableHead className="text-white">Contato</TableHead>
                    <TableHead className="text-white">CPF</TableHead>
                    <TableHead className="text-white">Data de Cadastro</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <TableRow key={patient.patient_id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium text-white">{patient.full_name}</TableCell>
                        <TableCell>
                          <div className="text-gray-300">{patient.email}</div>
                          <div className="text-gray-300">{patient.phone}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">{patient.cpf}</TableCell>
                        <TableCell className="text-gray-300">{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <PatientActionsPanel patient={patient} onEdit={handleEditPatient} />
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
          )}
        </CardContent>
      </Card>
      <AddEditPatientModal
        isOpen={isAddEditPatientModalOpen}
        onClose={() => setIsAddEditPatientModalOpen(false)}
        patient={selectedPatient}
        onSuccess={handlePatientModalSuccess}
      />
    </>
  );
};

export default PatientsView;