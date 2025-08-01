import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

const ConsultationForm = ({ patient, formData, setFormData, onSave, isSaving }) => {

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleIndicationChange = (value) => {
    setFormData(prev => ({ ...prev, indication: value }));
  };
  
  const imc = useMemo(() => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    if (weight > 0 && height > 0) return (weight / (height * height)).toFixed(2);
    return '0.00';
  }, [formData.weight, formData.height]);
  
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  
  const patientFullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

  return (
    <Card className="card-glass h-full">
      <CardHeader><CardTitle>Dados da Consulta</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-2"><Label>Nome do Paciente</Label><Input value={patientFullName} readOnly className="bg-white/5" /></div>
          <div><Label>Data de Nascimento</Label><Input value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('pt-BR') : 'N/A'} readOnly className="bg-white/5" /></div>
          <div><Label>Idade</Label><Input value={`${calculateAge(patient.date_of_birth)} anos`} readOnly className="bg-white/5" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label htmlFor="weight">Peso (kg)</Label><Input id="weight" value={formData.weight} onChange={handleInputChange} placeholder="Ex: 70.5" /></div>
          <div><Label htmlFor="height">Altura (m)</Label><Input id="height" value={formData.height} onChange={handleInputChange} placeholder="Ex: 1.75" /></div>
          <div><Label>IMC</Label><Input value={imc} readOnly className="bg-white/5 font-bold" /></div>
        </div>
        <div><Label htmlFor="main_complaint">Queixa Principal</Label><Textarea id="main_complaint" value={formData.main_complaint} onChange={handleInputChange} rows={2} placeholder="Descreva a queixa principal do paciente..." /></div>
        <div><Label htmlFor="clinical_history">História Clínica</Label><Textarea id="clinical_history" value={formData.clinical_history} onChange={handleInputChange} rows={3} placeholder="Detalhe a história da doença atual e pregressa..." /></div>
        <div><Label htmlFor="diagnostic_hypothesis">Hipótese Diagnóstica</Label><Textarea id="diagnostic_hypothesis" value={formData.diagnostic_hypothesis} onChange={handleInputChange} placeholder="Liste as hipóteses diagnósticas..." /></div>
        <div>
          <Label>Indicação</Label>
          <div className="flex gap-2 mt-1">
            <Button onClick={() => handleIndicationChange('Cirúrgico')} variant={formData.indication === 'Cirúrgico' ? 'default' : 'outline'} className="flex-1">Cirúrgico</Button>
            <Button onClick={() => handleIndicationChange('Clínico')} variant={formData.indication === 'Clínico' ? 'default' : 'outline'} className="flex-1">Clínico</Button>
          </div>
        </div>
        <div><Label htmlFor="patient_expectation">Expectativa do Paciente</Label><Input id="patient_expectation" value={formData.patient_expectation} onChange={handleInputChange} placeholder="Qual a principal expectativa do paciente?" /></div>
        <div><Label htmlFor="observation">Observação</Label><Input id="observation" value={formData.observation} onChange={handleInputChange} placeholder="Observações adicionais..." /></div>
        <div><Label htmlFor="conclusion">Conclusão (Nome da Cirurgia/Procedimento)</Label><Input id="conclusion" value={formData.conclusion} onChange={handleInputChange} placeholder="Ex: Rinoplastia Estruturada" /></div>
        <div className="pt-4 flex justify-end">
          <Button className="btn-gradient w-full md:w-auto" onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Atendimento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationForm;