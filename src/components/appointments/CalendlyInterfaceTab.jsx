import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarPlus, RefreshCw, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const calendlyLinks = {
  newAppointment: "https://calendly.com/clinica-scartozzoni",
  reschedule: "https://calendly.com/remarcacao-de-consultas",
  surgeries: "https://calendly.com/cirurgias"
};

const CalendlyInterfaceTab = () => {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Integração com Calendly</CardTitle>
        <CardDescription>
          Utilize as abas abaixo para acessar as diferentes funcionalidades de agendamento da sua conta Calendly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="newAppointment" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 bg-muted p-1 rounded-lg">
            <TabsTrigger value="newAppointment" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">
              <CalendarPlus className="mr-2 h-5 w-5 inline-block" /> Agendar Consulta
            </TabsTrigger>
            <TabsTrigger value="reschedule" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">
              <RefreshCw className="mr-2 h-5 w-5 inline-block" /> Remarcações
            </TabsTrigger>
            <TabsTrigger value="surgeries" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">
              <Briefcase className="mr-2 h-5 w-5 inline-block" /> Agendar Cirurgias
            </TabsTrigger>
          </TabsList>

          <motion.div
            key="calendly-tabs-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6"
          >
            <TabsContent value="newAppointment">
              <Card>
                <CardHeader><CardTitle>Nova Consulta</CardTitle></CardHeader>
                <CardContent>
                  <iframe src={calendlyLinks.newAppointment} width="100%" height="650px" frameBorder="0" title="Agendar Nova Consulta - Calendly" className="rounded-md border"></iframe>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reschedule">
              <Card>
                <CardHeader><CardTitle>Remarcar Consulta</CardTitle></CardHeader>
                <CardContent>
                  <iframe src={calendlyLinks.reschedule} width="100%" height="650px" frameBorder="0" title="Remarcar Consulta - Calendly" className="rounded-md border"></iframe>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="surgeries">
              <Card>
                <CardHeader><CardTitle>Agendar Cirurgias</CardTitle></CardHeader>
                <CardContent>
                  <iframe src={calendlyLinks.surgeries} width="100%" height="650px" frameBorder="0" title="Agendar Cirurgias - Calendly" className="rounded-md border"></iframe>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendlyInterfaceTab;