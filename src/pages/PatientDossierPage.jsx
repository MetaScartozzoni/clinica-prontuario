
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Stethoscope, AlertCircle, Loader2, Mail, Phone, Calendar as CalendarIcon, FileText, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatientDossier } from '@/hooks/usePatientDossier';
import TimelineItem from '@/components/dossier/TimelineItem';
import PatientDocuments from '@/components/dossier/PatientDocuments';
import PatientCommunicationChannel from '@/components/dossier/PatientCommunicationChannel';
import PatientQuotesManager from '@/components/dossier/PatientQuotesManager';

const PatientDossierPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patient, timeline, isLoading, error, refreshDossier } = usePatientDossier(patientId);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-white">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-red-400">Paciente não encontrado</h2>
        <p className="text-violet-300">{error || "O ID do paciente é inválido."}</p>
        <Button onClick={() => navigate('/pacientes')} className="mt-4 btn-gradient">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Pacientes
        </Button>
      </div>
    );
  }

  const patientName = patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

  return (
    <>
      <Helmet>
        <title>{patientName} | Dossiê do Paciente</title>
        <meta name="description" content={`Dossiê completo do paciente ${patientName}, incluindo histórico, orçamentos, comunicação e documentos.`} />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Button variant="outline" onClick={() => navigate('/pacientes')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Pacientes
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/avaliacao-medica/${patientId}`)} className="btn-gradient">
                <ClipboardCheck className="mr-2 h-4 w-4" /> Nova Avaliação
              </Button>
              <Button onClick={() => navigate(`/atendimento/${patientId}`)} variant="secondary">
                <Stethoscope className="mr-2 h-4 w-4" /> Atendimento Rápido
              </Button>
            </div>
          </div>

          <Card className="card-glass overflow-hidden">
            <CardHeader className="bg-black/20 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24 border-4 border-violet-400 shadow-lg">
                  <img alt={`Avatar do paciente ${patientName}`} src={`https://images.unsplash.com/photo-1622253694238-3b22139576c6?q=80&w=250`} />
                  <AvatarFallback className="text-3xl bg-pink-500/20 text-pink-300">{patientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold">{patientName}</CardTitle>
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 text-sm text-violet-200">
                    <span className="flex items-center"><Mail className="h-4 w-4 mr-2" />{patient.email || 'N/A'}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="flex items-center"><Phone className="h-4 w-4 mr-2" />{patient.phone || 'N/A'}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" />{calculateAge(patient.date_of_birth)} anos</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-none border-b border-white/10 bg-black/20">
                  <TabsTrigger value="timeline" className="py-3">Linha do Tempo</TabsTrigger>
                  <TabsTrigger value="quotes" className="py-3">Orçamentos & Contratos</TabsTrigger>
                  <TabsTrigger value="communication" className="py-3">Comunicação Interna</TabsTrigger>
                  <TabsTrigger value="documents" className="py-3">Documentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="p-6">
                  <h3 className="text-2xl font-semibold text-violet-100 mb-4">Histórico Completo</h3>
                  {timeline.length > 0 ? (
                    <div className="relative pl-8 space-y-8 border-l-2 border-violet-500/30">
                      {timeline.map((item, index) => (
                        <TimelineItem key={item.event_id || index} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="mx-auto h-12 w-12 text-violet-400" />
                      <p className="mt-4 text-violet-300">Nenhum evento encontrado para este paciente.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="quotes" className="p-6">
                   <PatientQuotesManager patientId={patientId} patientName={patientName} onDataChange={refreshDossier} />
                </TabsContent>

                <TabsContent value="communication" className="p-6">
                  <h3 className="text-2xl font-semibold text-violet-100 mb-4">Notas da Equipe</h3>
                  <PatientCommunicationChannel patientId={patientId} />
                </TabsContent>

                <TabsContent value="documents" className="p-6">
                   <PatientDocuments patientId={patientId} onUploadSuccess={refreshDossier} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PatientDossierPage;
