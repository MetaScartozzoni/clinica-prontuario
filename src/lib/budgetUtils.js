import { supabase } from '@/lib/supabaseClient';

export const updatePatientJourneyDeadlinesForBudget = async (patientId, budgetDate, toast) => {
  if (!patientId || !budgetDate) return;

  const budgetSentDate = new Date(budgetDate);
  const responseDeadlineDate = new Date(budgetSentDate);
  responseDeadlineDate.setDate(budgetSentDate.getDate() + 3);

  const { data: patientData, error: patientFetchError } = await supabase
    .from('patients')
    .select('name')
    .eq('id', patientId)
    .single();

  if (patientFetchError) {
    console.error("Error fetching patient name for deadlines:", patientFetchError);
    if (toast) toast({ title: "Erro ao buscar dados do paciente", description: "Não foi possível obter o nome do paciente para os prazos.", variant: "warning" });
  }
  const patientName = patientData?.name || 'Paciente Desconhecido';

  const { error } = await supabase
    .from('patient_journey_deadlines')
    .upsert(
      { 
        patient_id: patientId,
        patient_name: patientName,
        budget_sent_date: budgetSentDate.toISOString().split('T')[0],
        response_deadline_date: responseDeadlineDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id' } 
    );

  if (error) {
    console.error("Error updating patient journey deadlines for budget:", error);
    if (toast) toast({ title: "Erro ao Atualizar Prazos (Orçamento)", description: "Não foi possível atualizar os prazos da jornada do paciente: " + error.message, variant: "warning" });
  }
};

export const updatePatientJourneyDeadlinesAfterAcceptance = async (patientId, acceptanceDate, probableSurgeryDate, toast) => {
  if (!patientId || !acceptanceDate || !probableSurgeryDate) return;

  const acceptedDate = new Date(acceptanceDate);
  const schedulingFeeDeadline = new Date(acceptedDate);
  schedulingFeeDeadline.setDate(acceptedDate.getDate() + 2);

  const plannedSurgeryDate = new Date(probableSurgeryDate);
  const downPaymentDeadline = new Date(plannedSurgeryDate);
  downPaymentDeadline.setDate(plannedSurgeryDate.getDate() - 7);
  const remainingPaymentDeadline = new Date(plannedSurgeryDate);
  remainingPaymentDeadline.setDate(plannedSurgeryDate.getDate() - 2);

  const { data: patientData, error: patientFetchError } = await supabase
    .from('patients')
    .select('name')
    .eq('id', patientId)
    .single();
  
  if (patientFetchError) {
    console.error("Error fetching patient name for deadlines:", patientFetchError);
    if (toast) toast({ title: "Erro ao buscar dados do paciente", description: "Não foi possível obter o nome do paciente para os prazos.", variant: "warning" });
  }
  const patientName = patientData?.name || 'Paciente Desconhecido';

  const { error } = await supabase
    .from('patient_journey_deadlines')
    .upsert(
      { 
        patient_id: patientId,
        patient_name: patientName, // Ensure patient_name is updated or set
        budget_accepted_date: acceptedDate.toISOString().split('T')[0],
        scheduling_fee_deadline_date: schedulingFeeDeadline.toISOString().split('T')[0],
        planned_surgery_date: plannedSurgeryDate.toISOString().split('T')[0],
        down_payment_deadline_date: downPaymentDeadline.toISOString().split('T')[0],
        remaining_payment_deadline_date: remainingPaymentDeadline.toISOString().split('T')[0],
        down_payment_status: 'Pendente',
        remaining_payment_status: 'Pendente',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id' }
    );

  if (error) {
    console.error("Error updating journey deadlines after acceptance:", error);
    if (toast) toast({ title: "Erro ao Atualizar Prazos (Aceite)", description: "Não foi possível atualizar os prazos da jornada do paciente: " + error.message, variant: "warning" });
  } else {
    if (toast) toast({ title: "Prazos da Jornada Atualizados!", description: `Prazos definidos para o paciente ${patientName}.`, variant: "success" });
  }
};