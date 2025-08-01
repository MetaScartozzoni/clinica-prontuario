import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useUnifiedMedicalRecord = (patientId) => {
  const { toast } = useToast();
  const [patient, setPatient] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!patientId) {
      setError("ID do paciente não fornecido.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        patientRes,
        timelineRes,
        documentsRes,
        prescriptionsRes,
        latestRecordRes,
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.rpc('get_patient_timeline', { p_patient_id: patientId }),
        supabase.from('patient_documents').select('*').eq('patient_id', patientId).order('uploaded_at', { ascending: false }),
        supabase.from('prescriptions').select('*, doctor:doctor_id(full_name)').eq('patient_id', patientId).order('prescription_date', { ascending: false }),
        supabase.from('medical_records').select('*').eq('patient_id', patientId).order('consultation_timestamp', { ascending: false }).limit(1).single(),
      ]);

      if (patientRes.error) throw new Error(`Paciente: ${patientRes.error.message}`);
      setPatient(patientRes.data);

      if (timelineRes.error) throw new Error(`Histórico: ${timelineRes.error.message}`);
      setTimeline(timelineRes.data || []);
      
      if (documentsRes.error) throw new Error(`Documentos: ${documentsRes.error.message}`);
      setDocuments(documentsRes.data || []);
      
      if (prescriptionsRes.error) throw new Error(`Receitas: ${prescriptionsRes.error.message}`);
      setPrescriptions(prescriptionsRes.data || []);

      if (latestRecordRes.error && latestRecordRes.error.code !== 'PGRST116') {
        throw new Error(`Último Atendimento: ${latestRecordRes.error.message}`);
      }
      setCurrentRecord(latestRecordRes.data || { patient_id: patientId });

    } catch (err) {
      console.error("Erro ao carregar dados unificados do paciente:", err);
      setError(err.message);
      toast({ title: 'Erro ao carregar dados', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    patient, 
    currentRecord, 
    timeline, 
    documents,
    prescriptions,
    isLoading, 
    error, 
    refetchData: fetchData 
  };
};