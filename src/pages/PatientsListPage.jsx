import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCheck as UserSearch, ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddManualPatientModal from '@/components/patients/AddManualPatientModal';

const PatientsListPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, email')
      .order('name', { ascending: true });

    if (error) {
      toast({ title: 'Erro ao buscar pacientes', description: error.message, variant: 'destructive' });
    } else {
      setPatients(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, [toast]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handlePatientAdded = () => {
    fetchPatients();
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                  <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-4xl font-bold text-white">Lista de Pacientes</h1>
            </div>
            <p className="text-lg text-violet-200 mt-1">Selecione um paciente para ver o dossiê completo.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Paciente
          </Button>
        </motion.div>

        <div className="relative mb-6">
          <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredPatients.map(patient => (
              <motion.div key={patient.id} variants={itemVariants}>
                <Card
                  className="card-glass cursor-pointer text-center hover:border-violet-300 transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/dossie/${patient.id}`)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <Avatar className="h-20 w-20 mb-4 border-2 border-violet-400">
                      <AvatarImage src={`https://avatar.vercel.sh/${patient.email}.png`} alt={patient.name} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-300">
                        {patient.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-white truncate w-full">{patient.name}</p>
                    <p className="text-sm text-violet-300 truncate w-full">{patient.email || 'Sem e-mail'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        { !isLoading && filteredPatients.length === 0 && (
            <div className="text-center py-20">
              <p className="text-violet-200 text-lg">Nenhum paciente encontrado com o termo "{searchTerm}".</p>
            </div>
          )}
      </div>
      <AddManualPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
    </>
  );
};

export default PatientsListPage;