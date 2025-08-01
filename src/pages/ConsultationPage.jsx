
import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate, useLocation } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import { Button } from '@/components/ui/button';
    import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    import ConsultationForm from '@/components/consultation/ConsultationForm';
    import ConsultationActions from '@/components/consultation/ConsultationActions';
    import ConsultationHeader from '@/components/consultation/ConsultationHeader';
    import TelemedicinePanel from '@/components/consultation/TelemedicinePanel';
    import ExitConfirmationDialog from '@/components/consultation/ExitConfirmationDialog';
    import ConsultationHistory from '@/components/consultation/ConsultationHistory';

    const ConsultationPage = () => {
      const { patientId } = useParams();
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const { user } = useAuth();
      const { profile: professionalProfile } = useProfile();
      
      const [patient, setPatient] = useState(null);
      const [appointment, setAppointment] = useState(null);
      const [medicalHistory, setMedicalHistory] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isSaving, setIsSaving] = useState(false);
      const [error, setError] = useState(null);
      const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

      const [formData, setFormData] = useState({
        weight: '', height: '', main_complaint: '', clinical_history: '',
        diagnostic_hypothesis: '', indication: 'Clínico', patient_expectation: '',
        observation: '', conclusion: '',
      });

      const appointmentId = location.state?.appointmentId;
      const initialData = location.state?.initialData;

      const fetchData = useCallback(async () => {
        if (!patientId) {
          setError("ID do paciente não fornecido.");
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const [patientRes, appointmentRes, historyRes] = await Promise.all([
            supabase.from('patients').select('id, first_name, last_name, date_of_birth, email, phone').eq('id', patientId).single(),
            appointmentId ? supabase.from('appointments').select('*').eq('id', appointmentId).single() : Promise.resolve({ data: null, error: null }),
            supabase.from('medical_records').select('id, consultation_timestamp, conclusion, professional_id(full_name)').eq('patient_id', patientId).order('consultation_timestamp', { ascending: false }).limit(5),
          ]);
          
          if (patientRes.error) throw patientRes.error;
          setPatient(patientRes.data);

          if (appointmentRes.error && appointmentRes.error.code !== 'PGRST116') throw appointmentRes.error;
          setAppointment(appointmentRes.data);
          if(appointmentRes.data) {
            toast({
              title: appointmentRes.data.is_telemedicine ? 'Teleconsulta Iniciada' : 'Atendimento Iniciado',
              description: `Atendimento para ${patientRes.data.first_name} pronto.`,
            });
          }

          if (historyRes.error) throw historyRes.error;
          setMedicalHistory(historyRes.data || []);
          
          if(initialData) {
            setFormData(prev => ({...prev, ...initialData}));
          }

        } catch (err) {
          setError(err.message);
          toast({ title: "Erro ao buscar dados", description: err.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [patientId, appointmentId, toast, initialData]);
      
      useEffect(() => {
        fetchData();
      }, [fetchData]);

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
          toast({ title: 'Atendimento Salvo!', description: 'A ficha de atendimento foi salva com sucesso.', variant: 'success' });
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
            <Button onClick={() => navigate('/pacientes')} className="mt-4 btn-gradient"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Pacientes</Button>
          </div>
        );
      }

      return (
        <>
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <ConsultationHeader 
                patientName={`${patient.first_name || ''} ${patient.last_name || ''}`.trim()}
                onExit={handleExit}
              />
              
              {appointment?.is_telemedicine && (
                <TelemedicinePanel 
                  roomUrl={appointment.telemedicine_url}
                  displayName={professionalProfile?.full_name}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <ConsultationForm
                    patient={patient}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="space-y-6 sticky top-24">
                    <ConsultationActions patientId={patientId} user={user} formData={formData} />
                    <ConsultationHistory history={medicalHistory} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <ExitConfirmationDialog
            isOpen={isExitConfirmOpen}
            onOpenChange={setIsExitConfirmOpen}
            onConfirm={() => {
              setIsExitConfirmOpen(false);
              navigate(`/dossie/${patientId}`);
            }}
          />
        </>
      );
    };

    export default ConsultationPage;
