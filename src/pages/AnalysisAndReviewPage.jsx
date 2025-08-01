import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, BookOpen, BellRing } from 'lucide-react';
import EvolutionDashboard from '@/components/analysis/EvolutionDashboard';
import ScientificReviewPanel from '@/components/analysis/ScientificReviewPanel';
import ReviewReminders from '@/components/analysis/ReviewReminders';
import ProtectedContent from '@/components/general/ProtectedContent';

const AnalysisAndReviewPage = () => {
  return (
    <ProtectedContent requiredRole="medico">
      <Helmet>
        <title>Análise e Revisão</title>
        <meta name="description" content="Dashboard de análise de evolução, revisão científica e lembretes." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Análise e Revisão Científica</h1>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard de Evolução
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <BookOpen className="mr-2 h-4 w-4" />
              Revisão Científica
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <BellRing className="mr-2 h-4 w-4" />
              Lembretes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <EvolutionDashboard />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ScientificReviewPanel />
          </TabsContent>
          <TabsContent value="reminders" className="mt-6">
            <ReviewReminders />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
};

export default AnalysisAndReviewPage;