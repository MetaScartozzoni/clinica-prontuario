import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import SurgeryPageHeader from '@/components/surgeries/SurgeryPageHeader';
import SurgeryListView from '@/components/surgeries/SurgeryListView';
import SurgeryCalendarView from '@/components/surgeries/SurgeryCalendarView';
import SurgeryJourneyView from '@/components/surgeries/SurgeryJourneyView';
import ScheduleSurgeryModal from '@/components/surgeries/ScheduleSurgeryModal';
import { useSurgeries } from '@/hooks/useSurgeries';

const SurgeriesPage = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // Default active tab
  const [searchTerm, setSearchTerm] = useState('');
  const { surgeries, journeys, isLoading, error, refetchAll } = useSurgeries();

  const handleSurgeryScheduled = () => {
    setIsScheduleModalOpen(false);
    refetchAll();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center text-red-400 bg-red-500/10 rounded-lg p-4">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold">Erro ao carregar dados</h3>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="journey">Jornada do Paciente</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <SurgeryListView surgeries={surgeries} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <SurgeryCalendarView />
        </TabsContent>
        <TabsContent value="journey" className="mt-4">
          <SurgeryJourneyView />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Helmet>
        <title>Agenda Cirúrgica</title>
        <meta name="description" content="Gerencie e visualize todos os agendamentos de cirurgias." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SurgeryPageHeader
            onScheduleNew={() => setIsScheduleModalOpen(true)}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            viewMode={activeTab}
            onViewModeChange={setActiveTab}
          />
          <div className="mt-6">
            {renderContent()}
          </div>
        </motion.div>
      </div>
      {isScheduleModalOpen && (
        <ScheduleSurgeryModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSurgeryScheduled={handleSurgeryScheduled}
        />
      )}
    </>
  );
};

export default SurgeriesPage;