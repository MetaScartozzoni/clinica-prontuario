import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const requestTypes = [ // Duplicated from MedicalRecordStep4 for now, consider centralizing
  { id: 'ressonanciaMamas', name: 'Ressonância M. Mamas' },
  { id: 'avaliacaoCardio', name: 'Avaliação Cardíaca pré' },
  { id: 'usgTotal', name: 'USG Abdome Total' },
];

const usePatientExamsHistory = (patientId) => {
  const [patientPastExams, setPatientPastExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [errorExams, setErrorExams] = useState(null);

  useEffect(() => {
    const fetchPastExams = async () => {
      if (!patientId) {
        setPatientPastExams([]);
        return;
      }
      setIsLoadingExams(true);
      setErrorExams(null);
      try {
        let historicalExams = [];

        // Fetch from medical_records.exam_requests
        const { data: recordsData, error: recordsError } = await supabase
          .from('medical_records')
          .select('id, exam_requests, consultation_timestamp')
          .eq('patient_id', patientId)
          .order('consultation_timestamp', { ascending: false });

        if (recordsError) throw recordsError;
        
        if (recordsData) {
          recordsData.forEach(record => {
            if (record.exam_requests?.tipoSolicitacao) {
              const requestTypeName = requestTypes.find(rt => rt.id === record.exam_requests.tipoSolicitacao)?.name || record.exam_requests.tipoSolicitacao;
              historicalExams.push({ 
                id: `record_${record.id}_spec`, 
                name: `Solicitação Específica: ${requestTypeName}`, 
                date: record.consultation_timestamp, 
                type: 'specific_request' 
              });
            }
            record.exam_requests?.customRequests?.forEach((customReq, index) => {
              historicalExams.push({ 
                id: `record_${record.id}_custom_${index}`, 
                name: `Solicitado: ${customReq.type} (Obs: ${customReq.obs || 'N/A'})`, 
                date: record.consultation_timestamp, 
                type: 'custom_request' 
              });
            });
          });
        }
        
        // Fetch from medical_records.photo_references
        const { data: photoRefsData, error: photoRefsError } = await supabase
          .from('medical_records')
          .select('id, photo_references, consultation_timestamp')
          .eq('patient_id', patientId)
          .order('consultation_timestamp', { ascending: false });
        
        if (photoRefsError) throw photoRefsError;

        if (photoRefsData) {
          photoRefsData.forEach(record => {
            record.photo_references?.forEach(ref => {
              if (ref.type.startsWith('application/pdf') || ref.type.startsWith('image/')) {
                historicalExams.push({
                  id: `photoref_${record.id}_${ref.name.replace(/[^a-zA-Z0-9]/g, "")}`, // Sanitize name for ID
                  name: `Arquivo Anexado: ${ref.name}`,
                  date: record.consultation_timestamp,
                  type: 'uploaded_file',
                  url: ref.url,
                });
              }
            });
          });
        }
        
        historicalExams.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPatientPastExams(historicalExams.slice(0, 20)); // Show last 20

      } catch (error) {
        console.error("Error fetching past exams:", error);
        setErrorExams(error.message);
      } finally {
        setIsLoadingExams(false);
      }
    };

    fetchPastExams();
  }, [patientId]);

  return { patientPastExams, isLoadingExams, errorExams };
};

export default usePatientExamsHistory;