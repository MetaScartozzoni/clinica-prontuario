
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePatientDossier = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchDossierData = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        patientRes,
        timelineRes,
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.rpc('get_patient_timeline', { p_patient_id: patientId }),
      ]);

      if (patientRes.error) throw new Error(`Paciente: ${patientRes.error.message}`);
      if (timelineRes.error) throw new Error(`Timeline: ${timelineRes.error.message}`);

      setPatient(patientRes.data);
      setTimeline(timelineRes.data || []);

    } catch (err) {
      console.error("Erro ao buscar dossiê:", err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar dossiê',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    fetchDossierData();
  }, [fetchDossierData]);

  return {
    patient,
    timeline,
    loading,
    error,
    refreshDossier: fetchDossierData,
  };
};
