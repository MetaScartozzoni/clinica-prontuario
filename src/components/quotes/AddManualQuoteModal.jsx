import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Form Fields Components
import QuotePatientFormFields from '@/components/quotes/formFields/QuotePatientFormFields';
import QuoteSurgeryFormFields from '@/components/quotes/formFields/QuoteSurgeryFormFields';
import QuoteDetailsFormFields from '@/components/quotes/formFields/QuoteDetailsFormFields';
import QuoteExtraMaterialsForm from '@/components/quotes/formFields/QuoteExtraMaterialsForm';
import QuoteFinancialSummary from '@/components/quotes/formFields/QuoteFinancialSummary';

const defaultQuoteData = {
  patient_id: null,
  patient_name: '',
  patient_phone: '',
  patient_email: '',
  cpf: '',
  professional_id: null,
  custom_surgery_name: '',
  surgery_type_id: '',
  status: 'Pendente',
  lead_classification: 'Quente',
  observation: '',
  total_price: 0,
  materials_cost: 0,
  professional_fee: 0,
  hospital_cost: 0,
  anesthesia_cost: 0,
  other_costs: 0,
  quote_items: [],
};

const AddManualQuoteModal = ({ isOpen, onClose, onQuoteAdded, initialData, surgeryTypes }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(defaultQuoteData);
  const [currentTab, setCurrentTab] = useState("patient");
  const [professionals, setProfessionals] = useState([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultQuoteData,
        ...initialData,
        surgery_type_id: initialData.surgery_type?.id || '',
        professional_id: initialData.professional_id || '',
        quote_items: initialData.quote_items || [],
        total_price: parseFloat(initialData.total_price) || 0,
        materials_cost: parseFloat(initialData.materials_cost) || 0,
        professional_fee: parseFloat(initialData.professional_fee) || 0,
        hospital_cost: parseFloat(initialData.hospital_cost) || 0,
        anesthesia_cost: parseFloat(initialData.anesthesia_cost) || 0,
        other_costs: parseFloat(initialData.other_costs) || 0,
      });
    } else {
      setFormData(defaultQuoteData);
    }
  }, [initialData, isOpen]);

  const fetchProfessionals = useCallback(async () => {
    setIsLoadingProfessionals(true);
    try {
      const { data, error } = await supabase.from('professionals').select('id, first_name, last_name, specialization');
      if (error) throw error;
      setProfessionals(data.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name} (${p.specialization})`
      })));
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar profissionais: ' + error.message, variant: 'destructive' });
    } finally {
      setIsLoadingProfessionals(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
    }
  }, [isOpen, fetchProfessionals]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePatientSelect = useCallback((patientData) => {
    setFormData(prev => ({ ...prev, ...patientData }));
  }, []);

  const handleQuoteItemChange = useCallback((items) => {
    setFormData(prev => ({ ...prev, quote_items: items }));
  }, []);

  const handleSubmit = async () => {
    let finalFormData = { ...formData };

    // Remove empty strings for nullable fields to allow NULL in DB
    for (const key in finalFormData) {
        if (finalFormData[key] === '') {
            finalFormData[key] = null;
        }
    }

    // Ensure numeric fields are numbers or null
    finalFormData.total_price = parseFloat(finalFormData.total_price) || 0;
    finalFormData.materials_cost = parseFloat(finalFormData.materials_cost) || 0;
    finalFormData.professional_fee = parseFloat(finalFormData.professional_fee) || 0;
    finalFormData.hospital_cost = parseFloat(finalFormData.hospital_cost) || 0;
    finalFormData.anesthesia_cost = parseFloat(finalFormData.anesthesia_cost) || 0;
    finalFormData.other_costs = parseFloat(finalFormData.other_costs) || 0;

    try {
      let result;
      if (initialData && initialData.id) {
        // Update existing quote
        const { data, error } = await supabase
          .from('quotes')
          .update(finalFormData)
          .eq('id', initialData.id)
          .select();
        if (error) throw error;
        result = data;
        toast({ title: 'Sucesso', description: 'Orçamento atualizado com sucesso!', variant: 'success' });
      } else {
        // Create new quote
        const { data, error } = await supabase
          .from('quotes')
          .insert([finalFormData])
          .select();
        if (error) throw error;
        result = data;
        toast({ title: 'Sucesso', description: 'Orçamento criado com sucesso!', variant: 'success' });
      }
      onQuoteAdded(result[0]); // Pass the new/updated quote data
      onClose();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({ title: 'Erro ao salvar orçamento', description: error.message, variant: 'destructive' });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Orçamento' : 'Criar Novo Orçamento'}</DialogTitle>
        </DialogHeader>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-background z-10">
            <TabsTrigger value="patient">Paciente</TabsTrigger>
            <TabsTrigger value="surgery">Cirurgia</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <motion.div
              key="patient-tab"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuotePatientFormFields
                formData={formData}
                onFormChange={handleFormChange}
                onPatientSelect={handlePatientSelect}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="surgery">
            <motion.div
              key="surgery-tab"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuoteSurgeryFormFields
                formData={formData}
                onFormChange={handleFormChange}
                surgeryTypes={surgeryTypes}
                professionals={professionals}
                isLoadingProfessionals={isLoadingProfessionals}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="details">
            <motion.div
              key="details-tab"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuoteDetailsFormFields
                formData={formData}
                onFormChange={handleFormChange}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="materials">
            <motion.div
              key="materials-tab"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuoteExtraMaterialsForm
                quoteItems={formData.quote_items}
                onQuoteItemsChange={handleQuoteItemChange}
                formData={formData}
                onFormChange={handleFormChange}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="summary">
            <motion.div
              key="summary-tab"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <QuoteFinancialSummary
                formData={formData}
                onFormChange={handleFormChange}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="btn-gradient">Salvar Orçamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddManualQuoteModal;