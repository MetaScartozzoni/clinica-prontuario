import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, FileText, Loader2, ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import AddManualQuoteModal from '@/components/quotes/AddManualQuoteModal.jsx';
import SurgeryDateModal from '@/components/quotes/SurgeryDateModal.jsx';
import QuotesTable from '@/components/quotes/QuotesTable.jsx';
import { useQuotesManagement } from '@/hooks/useQuotesManagement.js';
import { useNavigate } from 'react-router-dom';
import SendQuoteMessageModal from '@/components/quotes/SendQuoteMessageModal.jsx';
import { supabase } from '@/lib/supabaseClient';

const QuotesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    quotes,
    isLoading,
    surgeryTypes,
    fetchQuotes,
    deleteQuote,
    updateQuoteStatus,
  } = useQuotesManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [isSurgeryDateModalOpen, setIsSurgeryDateModalOpen] = useState(false);
  const [quoteForSurgeryDate, setQuoteForSurgeryDate] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [quoteForMessage, setQuoteForMessage] = useState(null);


  const filteredQuotes = quotes.filter(quote =>
    (quote.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.custom_surgery_name || quote.surgery_type?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatusTrigger = (quote, newStatus) => {
    if (newStatus === 'Aceito') {
      setQuoteForSurgeryDate(quote);
      setIsSurgeryDateModalOpen(true);
    } else if (newStatus === 'Em Negociação') {
        navigate('/negotiations');
    } else {
      updateQuoteStatus(quote, newStatus);
    }
  };

  const handleSurgeryDateSubmit = async (probableSurgeryDate, paymentInstructions) => {
    if (!quoteForSurgeryDate || !probableSurgeryDate) return;
    const success = await updateQuoteStatus(quoteForSurgeryDate, 'Aceito', { 
        proposed_surgery_date: probableSurgeryDate,
        payment_instructions: paymentInstructions 
    });
    if (success) {
      setIsSurgeryDateModalOpen(false);
      setQuoteForSurgeryDate(null);
    }
  };
  
  const handleViewQuote = (quoteId) => {
     toast({ title: "Visualizar Orçamento", description: `🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀`, variant: "default" });
  };

  const handleEditQuote = (quoteData) => {
     setEditingQuote(quoteData); 
     setIsAddQuoteModalOpen(true); 
  };

  const handleOpenMessageModal = (quote) => {
    setQuoteForMessage(quote);
    setIsSendMessageModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Orçamentos | Clínica Prontuários</title>
        <meta name="description" content="Gerencie todos os orçamentos de pacientes da clínica." />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="card-glass">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
                  <FileText className="mr-3 h-8 w-8 text-pink-400" /> Gerenciamento de Orçamentos
                </CardTitle>
                <CardDescription>Crie, visualize e acompanhe os orçamentos dos pacientes.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/negotiations')} variant="outline">
                      Painel de Negociação <ArrowRight className="ml-2 h-4 w-4"/>
                  </Button>
                  <Button onClick={() => { setEditingQuote(null); setIsAddQuoteModalOpen(true); }} className="btn-gradient">
                      <PlusCircle className="mr-2 h-5 w-5" /> Novo Orçamento
                  </Button>
              </div>
            </div>
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-300" />
              <Input
                type="search"
                placeholder="Buscar por paciente, procedimento ou ID..."
                className="pl-10 w-full md:w-1/2 lg:w-1/3 input-light-theme"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
                </div>
            ) : (
              <QuotesTable
                quotes={filteredQuotes}
                onUpdateStatus={handleUpdateStatusTrigger}
                onView={handleViewQuote}
                onEdit={handleEditQuote}              onDelete={deleteQuote}
                onSendMessage={handleOpenMessageModal}
              />
            )}
          </CardContent>
        </Card>
        <AddManualQuoteModal 
          isOpen={isAddQuoteModalOpen} 
          onClose={() => { setIsAddQuoteModalOpen(false); setEditingQuote(null); }}
          onQuoteAdded={fetchQuotes}
          initialData={editingQuote}
          surgeryTypes={surgeryTypes}
        />
        <SurgeryDateModal
          isOpen={isSurgeryDateModalOpen}
          onClose={() => setIsSurgeryDateModalOpen(false)}
          onSubmit={handleSurgeryDateSubmit}
          patientName={quoteForSurgeryDate?.patient_name || ''}
        />
        <SendQuoteMessageModal
          isOpen={isSendMessageModalOpen}
          onClose={() => setIsSendMessageModalOpen(false)}
          quote={quoteForMessage}
        />
      </motion.div>
    </>
  );
};

export default QuotesPage;