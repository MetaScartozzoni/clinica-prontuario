import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PatientInputSection from './PatientInputSection';
import AppointmentScheduler from './AppointmentScheduler';
import ContactRequestForm from './ContactRequestForm';
import { supabase } from '@/lib/supabaseClient';

const CentralActionPanel = ({ onActionSuccess }) => {
  const methods = useForm();
  const { watch, reset } = methods;
  const [searchTerm, setSearchTerm] = useState('');
  const patientId = watch('patient_id');
  const patientNameManual = watch('patient_name_manual');
  
  const [professionals, setProfessionals] = useState([]);

  const fetchProfessionals = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['doctor', 'nurse', 'admin', 'receptionist']);
    if (data) setProfessionals(data);
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleSuccess = () => {
    reset();
    setSearchTerm('');
    if (onActionSuccess) {
      onActionSuccess();
    }
  };

  return (
    <Card className="card-glass shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Central de Ações Rápidas</CardTitle>
        <CardDescription className="text-violet-200">Cadastre, agende e registre solicitações em um só lugar.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <div className="space-y-8">
            <PatientInputSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            <AppointmentScheduler patientId={patientId} onActionSuccess={handleSuccess} />

            <ContactRequestForm 
              patientId={patientId} 
              patientNameManual={patientNameManual}
              professionals={professionals} 
              onActionSuccess={handleSuccess} 
            />
          </div>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default CentralActionPanel;