import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useMedicalRecord = (patientId, recordId = null) => {
  const { toast } = useToast();
  const [patient, setPatient] = useState(null);
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInitialData = useCallback(async () => {
    if (!patientId) {
      setIsLoading(false);
      setError('ID do paciente não foi fornecido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, dob, email, phone')
        .eq('id', patientId)
        .single();
      
      if (patientError) throw new Error(`Erro ao buscar paciente: ${patientError.message}`);
      setPatient(patientData);

      if (recordId) {
        const { data: recordData, error: recordError } = await supabase
          .from('medical_records')
          .select('*')
          .eq('id', recordId)
          .single();
        
        if (recordError && recordError.code !== 'PGRST116') { // Ignore "exact one row" error if not found
            throw new Error(`Erro ao buscar prontuário: ${recordError.message}`);
        }
        setRecord(recordData);
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Erro ao carregar dados',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, recordId, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const saveMedicalRecord = async (formData) => {
    try {
      const recordToSave = {
        ...formData,
        patient_id: patientId,
        id: recordId || undefined, // Upsert based on existence of ID
      };

      const { data, error } = await supabase
        .from('medical_records')
        .upsert(recordToSave)
        .select()
        .single();
      
      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Ficha de atendimento salva.',
        variant: 'success',
      });
      return data;
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  return { patient, record, isLoading, error, saveMedicalRecord };
};