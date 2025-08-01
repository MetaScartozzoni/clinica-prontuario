import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobTitles, setJobTitles] = useState([]);

  const fetchJobTitles = useCallback(async () => {
    const { data, error } = await supabase.from('job_prefixes').select('job_title').order('job_title');
    if (error) {
      toast({ title: 'Erro ao buscar cargos', description: error.message, variant: 'destructive' });
    } else {
      setJobTitles(data);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchJobTitles();
      reset();
    }
  }, [isOpen, fetchJobTitles, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Ocorreu um erro na comunicação com o servidor.');
      }
      
      if (data && data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Sucesso!',
        description: `Usuário ${formData.email} criado e convite enviado.`,
        variant: 'success',
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">Criar Novo Funcionário</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Um e-mail de convite será enviado para que o funcionário defina sua senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="label-custom">Nome</Label>
              <Input id="first_name" {...register('first_name', { required: 'Nome é obrigatório' })} className="input-light-theme" />
              {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="last_name" className="label-custom">Sobrenome</Label>
              <Input id="last_name" {...register('last_name', { required: 'Sobrenome é obrigatório' })} className="input-light-theme" />
              {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="label-custom">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })} className="input-light-theme" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="job_title" className="label-custom">Cargo</Label>
            <Controller
              name="job_title"
              control={control}
              rules={{ required: 'Cargo é obrigatório' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um cargo..." /></SelectTrigger>
                  <SelectContent className="select-content-custom">
                    {jobTitles.map((job) => (
                      <SelectItem key={job.job_title} value={job.job_title} className="select-item-custom" disabled={job.job_title === 'Paciente'}>
                        {job.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.job_title && <p className="text-red-400 text-xs mt-1">{errors.job_title.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" className="btn-frutacor" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Criar e Convidar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;