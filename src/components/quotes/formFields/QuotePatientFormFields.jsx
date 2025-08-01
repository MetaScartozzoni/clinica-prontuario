import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const QuotePatientFormFields = ({ formData, onFormChange, onPatientSelect }) => {
  const { toast } = useToast();
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handlePatientSelect = useCallback((patient) => {
    onPatientSelect({
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
      patient_email: patient.email,
      cpf: patient.cpf,
    });
    setPatientSearchTerm('');
    setPatientSearchResults([]);
  }, [onPatientSelect]);

  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearchTerm.length < 3) {
        setPatientSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone, cpf, email')
        .or(`full_name.ilike.%${patientSearchTerm}%,cpf.ilike.%${patientSearchTerm}%,email.ilike.%${patientSearchTerm}%`)
        .limit(10);
      
      if (error) {
        toast({ title: 'Erro ao buscar pacientes', description: error.message, variant: 'destructive' });
      } else {
        setPatientSearchResults(data);
      }
      setIsSearching(false);
    };

    const debounceSearch = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [patientSearchTerm, toast]);

  const clearPatient = () => {
    onPatientSelect({
        patient_id: null,
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        cpf: '',
    });
    setPatientSearchTerm('');
  };


  return (
    <div className="space-y-3 border-b pb-4">
      <h4 className="text-md font-medium text-muted-foreground">Dados do Paciente</h4>
       <div>
        <Label htmlFor="patient_search_quote">Buscar Paciente (Nome, CPF, Email)</Label>
        <Popover open={patientSearchTerm.length > 2 && patientSearchResults.length > 0}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="patient_search_quote"
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        placeholder="Digite para buscar..."
                        className="pl-10"
                        disabled={!!formData.patient_id}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                {isSearching ? (
                    <div className="p-4 text-center">Carregando...</div>
                ) : (
                    <ul className="max-h-60 overflow-y-auto">
                        {patientSearchResults.map(p => (
                            <li key={p.id} onClick={() => handlePatientSelect(p)}
                                className="p-2 hover:bg-accent cursor-pointer text-sm">
                                {p.full_name} <span className="text-xs text-muted-foreground">({p.cpf || p.email})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </PopoverContent>
        </Popover>
      </div>

       {formData.patient_id && (
         <Button type="button" variant="outline" size="sm" onClick={clearPatient} className="w-full">
            Limpar Paciente Selecionado
         </Button>
       )}

      <div>
        <Label>Nome do Paciente</Label>
        <Input name="patient_name" value={formData.patient_name} readOnly disabled />
      </div>
      <div>
        <Label>Telefone</Label>
        <Input name="patient_phone" type="tel" value={formData.patient_phone} readOnly disabled />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="patient_email" type="email" value={formData.patient_email} readOnly disabled />
      </div>
      <div>
        <Label>CPF</Label>
        <Input name="cpf" type="text" value={formData.cpf || ''} readOnly disabled />
      </div>
    </div>
  );
};

export default QuotePatientFormFields;