import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const usePatientDetails = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!patientId) {
      setIsLoading(false);
      setError("ID do paciente não fornecido.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        patientRes,
        historyRes,
        quotesRes,
        appointmentsRes
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('medical_records').select('*').eq('patient_id', patientId).order('consultation_timestamp', { ascending: false }),
        supabase.from('budgets').select('*').eq('patient_id', patientId).order('budget_date', { ascending: false }),
        supabase.from('appointments').select('*, professional:professional_id(full_name)').eq('patient_id', patientId).order('start_time', { ascending: false })
      ]);

      if (patientRes.error) throw new Error(`Paciente: ${patientRes.error.message}`);
      setPatient(patientRes.data);

      if (historyRes.error) throw new Error(`Histórico Médico: ${historyRes.error.message}`);
      setMedicalHistory(historyRes.data || []);

      if (quotesRes.error) throw new Error(`Orçamentos: ${quotesRes.error.message}`);
      setQuotes(quotesRes.data || []);

      if (appointmentsRes.error) throw new Error(`Consultas: ${appointmentsRes.error.message}`);
      setAppointments(appointmentsRes.data || []);

    } catch (err) {
      console.error("Erro ao buscar detalhes do paciente:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { patient, medicalHistory, quotes, appointments, isLoading, error, refetch: fetchData };
};