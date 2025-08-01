import React, { useMemo } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    const MedicalRecordForm = ({ patient, formData, onFormChange, onIndicationChange }) => {

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
              <div><Label htmlFor="weight">Peso (kg)</Label><Input id="weight" value={formData.weight} onChange={(e) => onFormChange('weight', e.target.value)} placeholder="Ex: 70.5" /></div>
              <div><Label htmlFor="height">Altura (m)</Label><Input id="height" value={formData.height} onChange={(e) => onFormChange('height', e.target.value)} placeholder="Ex: 1.75" /></div>
              <div><Label>IMC</Label><Input value={imc} readOnly className="bg-white/5 font-bold" /></div>
            </div>
            <div><Label htmlFor="main_complaint">Queixa Principal</Label><Textarea id="main_complaint" value={formData.main_complaint} onChange={(e) => onFormChange('main_complaint', e.target.value)} rows={2} placeholder="Descreva a queixa principal do paciente..." /></div>
            <div><Label htmlFor="clinical_history">História Clínica</Label><Textarea id="clinical_history" value={formData.clinical_history} onChange={(e) => onFormChange('clinical_history', e.target.value)} rows={3} placeholder="Detalhe a história da doença atual e pregressa..." /></div>
            <div><Label htmlFor="diagnostic_hypothesis">Hipótese Diagnóstica</Label><Textarea id="diagnostic_hypothesis" value={formData.diagnostic_hypothesis} onChange={(e) => onFormChange('diagnostic_hypothesis', e.target.value)} placeholder="Liste as hipóteses diagnósticas..." /></div>
            <div>
              <Label>Indicação</Label>
              <div className="flex gap-2 mt-1">
                <Button onClick={() => onIndicationChange('Cirúrgico')} variant={formData.indication === 'Cirúrgico' ? 'default' : 'outline'} className="flex-1">Cirúrgico</Button>
                <Button onClick={() => onIndicationChange('Clínico')} variant={formData.indication === 'Clínico' ? 'default' : 'outline'} className="flex-1">Clínico</Button>
              </div>
            </div>
            <div><Label htmlFor="patient_expectation">Expectativa do Paciente</Label><Input id="patient_expectation" value={formData.patient_expectation} onChange={(e) => onFormChange('patient_expectation', e.target.value)} placeholder="Qual a principal expectativa do paciente?" /></div>
            <div><Label htmlFor="observation">Observação</Label><Input id="observation" value={formData.observation} onChange={(e) => onFormChange('observation', e.target.value)} placeholder="Observações adicionais..." /></div>
            <div><Label htmlFor="conclusion">Conclusão (Nome da Cirurgia/Procedimento)</Label><Input id="conclusion" value={formData.conclusion} onChange={(e) => onFormChange('conclusion', e.target.value)} placeholder="Ex: Rinoplastia Estruturada" /></div>
          </CardContent>
        </Card>
      );
    };

    export default MedicalRecordForm;