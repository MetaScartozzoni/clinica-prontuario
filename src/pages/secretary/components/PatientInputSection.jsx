import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Search, History } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { usePatientCentralActions } from '@/pages/secretary/hooks/usePatientCentralActions';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatientInputSection = ({ searchTerm, setSearchTerm }) => {
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useFormContext();
  const patientNameManual = watch('patient_name_manual');
  const patientContactManual = watch('patient_contact_manual');
  const patientEmail = watch('patient_email');
  const patientCpf = watch('patient_cpf');
  const { isLoading, searchedPatient, setSearchedPatient, unresolvedRequests, searchPatient, handleCreatePatient } = usePatientCentralActions();
  const { toast } = useToast();

  useEffect(() => {
    const debounce = setTimeout(async () => {
      const result = await searchPatient(searchTerm);
      if (result) {
        setValue('patient_id', result.id);
        setValue('patient_name_manual', result.full_name);
        setValue('patient_contact_manual', result.phone || result.email);
        setValue('patient_cpf', result.cpf);
        setValue('patient_email', result.email);
      } else {
        setValue('patient_id', null);
        setValue('patient_name_manual', searchTerm);
        setValue('patient_contact_manual', '');
        setValue('patient_cpf', '');
        setValue('patient_email', '');
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, searchPatient, setValue]);

  const onSubmitCreatePatient = async (data) => {
    const result = await handleCreatePatient(data);
    if (result) {
      setSearchedPatient({ id: result.patient_id, full_name: result.full_name });
      setValue('patient_id', result.patient_id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-violet-200 font-medium mb-2 block">Buscar Paciente (Nome ou CPF)</label>
        <div className="relative">
          <Input
            placeholder="Digite nome ou CPF para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-light-theme pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Nome Completo do Paciente" {...register('patient_name_manual', { required: true })} className="input-light-theme" />
        <Input placeholder="CPF" {...register('patient_cpf')} className="input-light-theme" />
        <Input placeholder="Telefone de Contato" {...register('patient_contact_manual')} className="input-light-theme" />
        <Input placeholder="E-mail (Opcional)" {...register('patient_email')} className="input-light-theme" />
      </div>
      
      {!searchedPatient && patientNameManual && patientContactManual && (
        <Button onClick={handleSubmit(onSubmitCreatePatient)} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isLoading ? "Buscando..." : "Buscar/Criar Paciente"}
        </Button>
      )}

      {searchedPatient && (
        <div className="border-t border-white/20 pt-4 mt-4">
          <h4 className="font-semibold text-lg text-white mb-2 flex items-center">
            <History className="mr-2 h-5 w-5 text-amber-400" /> Solicitações Pendentes de {searchedPatient.full_name}
          </h4>
          {unresolvedRequests.length > 0 ? (
            <ScrollArea className="h-[120px] w-full rounded-md border border-white/20 p-2">
              <div className="space-y-2">
                {unresolvedRequests.map(req => (
                  <div key={req.id} className="p-2 bg-white/5 rounded-md text-sm text-violet-100">
                    <p className="font-medium">{req.content}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(req.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - Status: {req.status}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-violet-200">Nenhuma solicitação pendente para este paciente.</p>
          )}
          <Button 
            onClick={() => toast({ title: "🚧 Funcionalidade em Desenvolvimento", description: "O acesso ao dossiê será melhorado em breve para exibir informações relevantes para a secretaria (documentos, agendamentos)." })} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Ver Dossiê (Visualização Rápida)
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientInputSection;