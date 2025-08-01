import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const AddEditProfessionalModal = ({ isOpen, onClose, professional, onSuccess }) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const isEditMode = !!professional;

  const fetchAvailableUsers = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_available_users_for_professional');
    if (error) {
      toast({ title: 'Erro ao buscar usuários', description: error.message, variant: 'destructive' });
    } else {
      setAvailableUsers(data);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
      if (isEditMode) {
        reset({
          profile_id: professional.profile_id,
          specialization: professional.specialization,
          license_number: professional.license_number,
          biography: professional.biography,
        });
      } else {
        reset({});
      }
    }
  }, [isOpen, professional, isEditMode, reset, fetchAvailableUsers]);
  
  const handleUserSelection = (profileId) => {
    setValue('profile_id', profileId);
  };


  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const professionalData = {
        profile_id: formData.profile_id,
        specialization: formData.specialization,
        license_number: formData.license_number,
        biography: formData.biography,
        is_active: professional?.is_active ?? true,
      };
      
      let response;
      if (isEditMode) {
        response = await supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', professional.id);
      } else {
        response = await supabase.from('professionals').insert([professionalData]);
      }

      const { error } = response;
      if (error) throw error;

      toast({
        title: `Profissional ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'salvar' : 'adicionar'} profissional`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-dark-theme sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">{isEditMode ? 'Editar Profissional' : 'Adicionar Novo Profissional'}</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            {isEditMode ? 'Altere as informações abaixo.' : 'Vincule um usuário existente e preencha os detalhes do profissional.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="profile_id" className="label-custom">Usuário do Sistema</Label>
              <Controller
                name="profile_id"
                control={control}
                rules={{ required: 'É obrigatório vincular um usuário' }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleUserSelection(value);
                    }}
                    value={field.value || ''}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="select-trigger-custom">
                      <SelectValue placeholder="Selecione um usuário para vincular..." />
                    </SelectTrigger>
                    <SelectContent className="select-content-custom">
                      {isEditMode && professional && (
                         <SelectItem key={professional.profile_id} value={professional.profile_id} className="select-item-custom">
                           {professional.full_name} ({professional.email})
                         </SelectItem>
                      )}
                      {availableUsers.map((user) => (
                        <SelectItem key={user.profile_id} value={user.profile_id} className="select-item-custom">
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.profile_id && <p className="text-red-400 text-xs mt-1">{errors.profile_id.message}</p>}
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization" className="label-custom">Especialidade</Label>
              <Input id="specialization" {...register('specialization', { required: 'Especialidade é obrigatória' })} className="input-light-theme" />
              {errors.specialization && <p className="text-red-400 text-xs mt-1">{errors.specialization.message}</p>}
            </div>
            <div>
              <Label htmlFor="license_number" className="label-custom">Nº da Licença (CRM, etc.)</Label>
              <Input id="license_number" {...register('license_number', { required: 'Nº da Licença é obrigatório' })} className="input-light-theme" />
              {errors.license_number && <p className="text-red-400 text-xs mt-1">{errors.license_number.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="biography" className="label-custom">Biografia / Formação</Label>
            <Textarea id="biography" {...register('biography')} className="input-light-theme" />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} className="btn-frutacor" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Salvar Alterações' : 'Adicionar Profissional'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProfessionalModal;