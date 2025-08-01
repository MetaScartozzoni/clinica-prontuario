import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate, useLocation } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import { Button } from '@/components/ui/button';
    import { Loader2, AlertCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    import MedicalRecordForm from '@/components/medical-record/MedicalRecordForm';
    import MedicalRecordActions from '@/components/medical-record/MedicalRecordActions';
    import MedicalRecordHeader from '@/components/medical-record/MedicalRecordHeader';
    import TelemedicineSession from '@/components/medical-record/telemedicine/TelemedicineSession';
    import ExitConfirmationDialog from '@/components/medical-record/telemedicine/ExitConfirmationDialog';
    
    import RequestExamsModal from '@/components/medical-record/modals/RequestExamsModal';
    import CreateCertificateModal from '@/components/medical-evaluation/modals/CreateCertificateModal';
    import CreatePrescriptionModal from '@/components/medical-record/modals/CreatePrescriptionModal';
    import UploadDocumentModal from '@/components/dossier/UploadDocumentModal';

    const MedicalRecordPage = () => {
      const { patientId } = useParams();
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const { user } = useAuth();
      const { profile: professionalProfile } = useProfile();

      const [patient, setPatient] = useState(null);
      const [appointment, setAppointment] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [isSaving, setIsSaving] = useState(false);
      const [error, setError] = useState(null);
      const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
      const [activeModal, setActiveModal] = useState(null);
      const [formData, setFormData] = useState({
        weight: '', height: '', main_complaint: '', clinical_history: '',
        diagnostic_hypothesis: '', indication: 'Clínico', patient_expectation: '',
        observation: '', conclusion: '',
      });

      const appointmentId = location.state?.appointmentId;

      const fetchData = useCallback(async () => {
        if (!patientId) {
          setError("ID do paciente não fornecido.");
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('id, first_name, last_name, date_of_birth')
            .eq('id', patientId)
            .single();
          if (patientError) throw patientError;
          setPatient(patientData);

          if (appointmentId) {
            const { data: appointmentData, error: appointmentError } = await supabase
              .from('appointments')
              .select('*')
              .eq('id', appointmentId)
              .single();
            if (appointmentError && appointmentError.code !== 'PGRST116') throw appointmentError;
            setAppointment(appointmentData);
            if(appointmentData) {
                toast({
                    title: appointmentData.is_telemedicine ? 'Teleconsulta Iniciada' : 'Atendimento Iniciado',
                    description: `Atendimento para ${patientData.first_name} pronto.`
                });
            }
          }
        } catch (err) {
          setError(err.message);
          toast({ title: "Erro ao buscar dados", description: err.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [patientId, appointmentId, toast]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);

      const handleFormChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
      };
      
      const handleSave = async () => {
        setIsSaving(true);
        const recordData = {
          patient_id: patientId,
          professional_id: professionalProfile?.id,
          consultation_timestamp: new Date().toISOString(),
          appointment_id: appointmentId || null,
          ...formData
        };

        try {
          const { error } = await supabase.from('medical_records').insert(recordData);
          if (error) throw error;
          toast({ title: 'Atendimento Salvo!', description: 'A ficha de atendimento rápido foi salva com sucesso.', variant: 'success' });
          navigate(`/dossie/${patientId}`);
        } catch (err) {
          toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
        } finally {
          setIsSaving(false);
        }
      };
      
      const handleExit = () => {
        if (appointment?.is_telemedicine) {
          setIsExitConfirmOpen(true);
        } else {
          navigate(`/dossie/${patientId}`);
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
            <Button onClick={() => navigate('/pacientes')} className="mt-4 btn-gradient"> Voltar para Lista</Button>
          </div>
        );
      }

      return (
        <>
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <MedicalRecordHeader
                patientName={`${patient.first_name} ${patient.last_name}`}
                onBack={handleExit}
                onSave={handleSave}
                isSaving={isSaving}
              />
              
              {appointment?.is_telemedicine && (
                <TelemedicineSession 
                  roomUrl={appointment.telemedicine_url}
                  displayName={professionalProfile?.full_name}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <MedicalRecordForm 
                    patient={patient}
                    formData={formData}
                    onFormChange={handleFormChange}
                    onIndicationChange={(value) => handleFormChange('indication', value)}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <MedicalRecordActions 
                    patientId={patientId}
                    onAction={setActiveModal}
                    formData={formData}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <RequestExamsModal isOpen={activeModal === 'exam_request'} onClose={() => setActiveModal(null)} patientId={patientId} />
          <CreateCertificateModal isOpen={activeModal === 'certificate'} onClose={() => setActiveModal(null)} patientName={`${patient.first_name} ${patient.last_name}`} />
          <CreatePrescriptionModal isOpen={activeModal === 'prescription'} onClose={() => setActiveModal(null)} patientId={patientId} />
          <UploadDocumentModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} patientId={patientId} onUploadSuccess={() => setActiveModal(null)} />
          <ExitConfirmationDialog isOpen={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen} onConfirm={handleExit} />
        </>
      );
    };

    export default MedicalRecordPage;