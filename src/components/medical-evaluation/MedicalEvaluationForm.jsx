import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ImageAnnotationCanvas from './ImageAnnotationCanvas';
import { v4 as uuidv4 } from 'uuid';

const MedicalEvaluationForm = ({ formData, setFormData, annotatedImages, setAnnotatedImages, patient }) => {
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const addAnnotationArea = () => {
    setAnnotatedImages(prev => [...prev, { id: uuidv4(), imageSrc: null, lines: [], description: '' }]);
  };

  const handleImageStateChange = (id, newState) => {
    if (newState === null) {
      setAnnotatedImages(prev => prev.filter(img => img.id !== id));
    } else {
      setAnnotatedImages(prev => prev.map(img => (img.id === id ? { ...img, ...newState } : img)));
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Nome Completo</Label><Input value={`${patient.first_name} ${patient.last_name}`} readOnly className="bg-white/5" /></div>
            <div><Label>Data de Nascimento</Label><Input value={new Date(patient.date_of_birth).toLocaleDateString('pt-BR')} readOnly className="bg-white/5" /></div>
            <div><Label>Idade</Label><Input value={`${calculateAge(patient.date_of_birth)} anos`} readOnly className="bg-white/5" /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Anamnese e Exame Físico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="main_complaint">Queixa Principal</Label><Textarea id="main_complaint" value={formData.main_complaint} onChange={handleInputChange} placeholder="Descreva a queixa principal..." /></div>
          <div><Label htmlFor="clinical_history">História Clínica</Label><Textarea id="clinical_history" value={formData.clinical_history} onChange={handleInputChange} placeholder="Detalhe a história da doença atual e pregressa..." /></div>
          <div><Label htmlFor="physical_exam">Exame Físico</Label><Textarea id="physical_exam" value={formData.physical_exam} onChange={handleInputChange} placeholder="Descreva os achados do exame físico..." /></div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Anotações em Imagens</CardTitle>
          <CardDescription>Carregue imagens e desenhe sobre elas para planejamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {annotatedImages.map((imgState) => (
            <ImageAnnotationCanvas
              key={imgState.id}
              imageState={imgState}
              onImageStateChange={(newState) => handleImageStateChange(imgState.id, newState)}
            />
          ))}
          <Button variant="outline" onClick={addAnnotationArea} className="w-full">
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Área de Anotação
          </Button>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Hipótese Diagnóstica e Plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="diagnostic_hypothesis">Hipótese Diagnóstica</Label><Textarea id="diagnostic_hypothesis" value={formData.diagnostic_hypothesis} onChange={handleInputChange} placeholder="Liste as hipóteses diagnósticas..." /></div>
          <div><Label htmlFor="proposed_treatment">Tratamento Proposto</Label><Textarea id="proposed_treatment" value={formData.proposed_treatment} onChange={handleInputChange} placeholder="Descreva o plano de tratamento cirúrgico ou clínico..." /></div>
          <div><Label htmlFor="notes">Notas Adicionais</Label><Textarea id="notes" value={formData.notes} onChange={handleInputChange} placeholder="Observações e notas adicionais..." /></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalEvaluationForm;