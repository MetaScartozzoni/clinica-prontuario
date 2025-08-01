import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, UserPlus, Save } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const AddEditPatientModal = ({ isOpen, onClose, patient, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();
  const isEditMode = !!patient;

  const fetchAddressFromCEP = useCallback(async (cep, setValue) => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue('address_street', data.logradouro);
        setValue('address_neighborhood', data.bairro);
        setValue('address_city', data.localidade);
        setValue('address_state', data.uf);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && patient) {
        reset({
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          phone: patient.phone,
          cpf: patient.cpf,
          rg: patient.rg,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          address_street: patient.address_street,
          address_number: patient.address_number,
          address_complement: patient.address_complement,
          address_neighborhood: patient.address_neighborhood,
          address_city: patient.address_city,
          address_state: patient.address_state,
          address_zipcode: patient.address_zipcode,
          health_insurance: patient.health_insurance,
        });
      } else {
        reset({});
      }
    }
  }, [isOpen, patient, isEditMode, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await supabase
          .from('patients')
          .update(data)
          .eq('id', patient.patient_id)
          .select();
      } else {
        const patientData = { ...data, created_by: profile?.id };
        response = await supabase.rpc('create_patient_and_profile', { p_patient_data: patientData });
      }

      const { error } = response;
      if (error) throw error;

      toast({
        title: `Paciente ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`,
        variant: 'success'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} paciente`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom flex items-center">
            {isEditMode ? <Save className="mr-2" /> : <UserPlus className="mr-2" />}
            {isEditMode ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha as informações abaixo para {isEditMode ? 'atualizar o registro do' : 'cadastrar um novo'} paciente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-300 border-b border-violet-500/30 pb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="label-custom">Nome *</Label>
                <Input id="first_name" {...register('first_name', { required: 'Nome é obrigatório' })} className="input-light-theme" />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name" className="label-custom">Sobrenome *</Label>
                <Input id="last_name" {...register('last_name', { required: 'Sobrenome é obrigatório' })} className="input-light-theme" />
                {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="label-custom">E-mail</Label>
                <Input id="email" type="email" {...register('email')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="phone" className="label-custom">Telefone *</Label>
                <Input id="phone" {...register('phone', { required: 'Telefone é obrigatório' })} className="input-light-theme" />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cpf" className="label-custom">CPF</Label>
                <Input id="cpf" {...register('cpf')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="rg" className="label-custom">RG</Label>
                <Input id="rg" {...register('rg')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="date_of_birth" className="label-custom">Data de Nascimento</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} className="input-light-theme" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="gender" className="label-custom">Gênero</Label>
                    <Input id="gender" {...register('gender')} className="input-light-theme" />
                </div>
                <div>
                    <Label htmlFor="health_insurance" className="label-custom">Convênio</Label>
                    <Input id="health_insurance" {...register('health_insurance')} className="input-light-theme" />
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-violet-300 border-b border-violet-500/30 pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="address_zipcode" className="label-custom">CEP</Label>
                <Controller
                  name="address_zipcode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="address_zipcode"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        fetchAddressFromCEP(e.target.value, reset);
                      }}
                      className="input-light-theme"
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address_street" className="label-custom">Rua</Label>
                <Input id="address_street" {...register('address_street')} className="input-light-theme" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address_number" className="label-custom">Número</Label>
                <Input id="address_number" {...register('address_number')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="address_complement" className="label-custom">Complemento</Label>
                <Input id="address_complement" {...register('address_complement')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="address_neighborhood" className="label-custom">Bairro</Label>
                <Input id="address_neighborhood" {...register('address_neighborhood')} className="input-light-theme" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address_city" className="label-custom">Cidade</Label>
                <Input id="address_city" {...register('address_city')} className="input-light-theme" />
              </div>
              <div>
                <Label htmlFor="address_state" className="label-custom">Estado</Label>
                <Input id="address_state" {...register('address_state')} className="input-light-theme" />
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn-frutacor">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Salvar Alterações' : 'Adicionar Paciente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditPatientModal;