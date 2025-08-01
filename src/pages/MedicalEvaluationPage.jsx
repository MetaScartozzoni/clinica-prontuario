import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import MedicalEvaluationForm from '@/components/medical-evaluation/MedicalEvaluationForm';

const MedicalEvaluationPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile: professionalProfile } = useProfile();

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    main_complaint: '',
    clinical_history: '',
    physical_exam: '',
    diagnostic_hypothesis: '',
    proposed_treatment: '',
    notes: '',
  });
  const [annotatedImages, setAnnotatedImages] = useState([]);

  const initialData = location.state?.initialData;

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const fetchPatientData = useCallback(async () => {
    if (!patientId) {
      setError("ID do paciente não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      setPatient(data);
    } catch (err) {
      setError(err.message);
      toast({ title: "Erro ao buscar dados do paciente", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleSaveEvaluation = async () => {
    setIsSaving(true);
    try {
      const evaluationData = {
        patient_id: patientId,
        professional_id: professionalProfile?.id,
        ...formData,
      };

      const { data: savedEvaluation, error: evaluationError } = await supabase
        .from('medical_evaluations')
        .insert(evaluationData)
        .select()
        .single();

      if (evaluationError) throw evaluationError;

      if (annotatedImages.length > 0) {
        const imageRecords = annotatedImages.map(img => ({
          evaluation_id: savedEvaluation.id,
          original_image_url: img.original_image_url,
          annotated_image_data: img.annotated_image_data,
          description: img.description,
        }));

        const { error: imageError } = await supabase
          .from('medical_evaluation_images')
          .insert(imageRecords);

        if (imageError) throw imageError;
      }

      toast({ title: 'Avaliação Salva!', description: 'A avaliação médica foi salva com sucesso.', variant: 'success' });
      navigate(`/dossie/${patientId}`);
    } catch (err) {
      toast({ title: 'Erro ao salvar avaliação', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-violet-400" /></div>;
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-white">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-red-400">Paciente não encontrado</h2>
        <p className="text-violet-300">{error || "O ID do paciente é inválido."}</p>
        <Button onClick={() => navigate('/pacientes')} className="mt-4 btn-gradient"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Pacientes</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Ficha de Avaliação Médica</h1>
            <p className="page-subtitle">Paciente: {`${patient.first_name} ${patient.last_name}`}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/dossie/${patientId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button className="btn-gradient" onClick={handleSaveEvaluation} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Avaliação
            </Button>
          </div>
        </div>
        
        <MedicalEvaluationForm
          formData={formData}
          setFormData={setFormData}
          annotatedImages={annotatedImages}
          setAnnotatedImages={setAnnotatedImages}
          patient={patient}
        />
      </motion.div>
    </div>
  );
};

export default MedicalEvaluationPage;