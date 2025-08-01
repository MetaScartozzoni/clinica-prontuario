import React, { useState } from 'react';
import AddManualPatientModal from '@/components/patients/AddManualPatientModal';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AddPatientAndRefetch = ({ onPatientAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handlePatientAdded = async (newPatient) => {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('id, first_name, last_name')
            .order('first_name');
        
        if (error) throw error;
        
        const formattedPatients = data.map(p => ({ ...p, name: `${p.first_name || ''} ${p.last_name || ''}`.trim() }));
        onPatientAdded(formattedPatients, newPatient.id);
        setIsModalOpen(false);

    } catch (error) {
         toast({
            title: 'Erro ao atualizar lista de pacientes',
            description: error.message,
            variant: 'destructive',
        });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Novo
      </Button>
      <AddManualPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
    </>
  );
};

export default AddPatientAndRefetch;