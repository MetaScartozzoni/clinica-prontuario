-- =====================================================================================
-- Arquivo: policies.sql
-- Descrição: Define todas as Políticas de Segurança a Nível de Linha (RLS).
-- Ordem de execução: 9
-- =====================================================================================

-- Habilita RLS em todas as tabelas relevantes.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_surgery_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_prefixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_evaluation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela `profiles`
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios perfis, e admins gerenciam t" ON public.profiles;
DROP POLICY IF EXISTS "Permite leitura para usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Permite atualização própria ou por admin" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem deletar perfis" ON public.profiles;

CREATE POLICY "Permite leitura para usuários autenticados" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Permite atualização própria ou por admin" ON public.profiles
FOR UPDATE
USING ( user_id = auth.uid() OR public.is_admin() )
WITH CHECK ( user_id = auth.uid() OR public.is_admin() );

CREATE POLICY "Admins podem deletar perfis" ON public.profiles
FOR DELETE
USING ( public.is_admin() );

-- Políticas para a tabela `patients`
DROP POLICY IF EXISTS "Usuários veem seus pacientes, e admins gerenciam todos" ON public.patients;
CREATE POLICY "Usuários veem seus pacientes, e admins gerenciam todos" ON public.patients
FOR ALL
USING ( user_id = auth.uid() OR public.is_admin() );

-- Políticas para a tabela `professionals`
DROP POLICY IF EXISTS "Profissionais podem ver seus próprios dados" ON public.professionals;
CREATE POLICY "Profissionais podem ver seus próprios dados" ON public.professionals
FOR SELECT
USING ( user_id = auth.uid() );
DROP POLICY IF EXISTS "Admins podem gerenciar profissionais" ON public.professionals;
CREATE POLICY "Admins podem gerenciar profissionais" ON public.professionals
FOR ALL
USING ( public.is_admin() );

-- Políticas para a tabela `appointments`
DROP POLICY IF EXISTS "Admins podem gerenciar todos os agendamentos" ON public.appointments;
CREATE POLICY "Admins podem gerenciar todos os agendamentos" ON public.appointments
FOR ALL
USING ( public.is_admin() );
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios agendamentos" ON public.appointments;
CREATE POLICY "Usuários podem gerenciar seus próprios agendamentos" ON public.appointments
FOR ALL
USING ( (created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) OR (patient_id IN ( SELECT p.id FROM patients p JOIN profiles prof ON p.profile_id = prof.id WHERE prof.user_id = auth.uid())) OR (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) );

-- Políticas para a tabela `surgery_schedule`
DROP POLICY IF EXISTS "Admins podem gerenciar todas as cirurgias" ON public.surgery_schedule;
CREATE POLICY "Admins podem gerenciar todas as cirurgias" ON public.surgery_schedule
FOR ALL
USING ( public.is_admin() );
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias cirurgias" ON public.surgery_schedule;
CREATE POLICY "Usuários podem gerenciar suas próprias cirurgias" ON public.surgery_schedule
FOR ALL
USING ( (created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) OR (patient_id IN ( SELECT p.id FROM patients p JOIN profiles prof ON p.profile_id = prof.id WHERE prof.user_id = auth.uid())) OR (professional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) );

-- Políticas para a tabela `notifications`
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notifications;
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notifications
FOR ALL
USING ( user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) )
WITH CHECK ( user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) );

-- Políticas para a tabela `messages`
DROP POLICY IF EXISTS "Usuários podem ver e gerenciar suas próprias mensagens" ON public.messages;
CREATE POLICY "Usuários podem ver e gerenciar suas próprias mensagens" ON public.messages
FOR ALL
USING ( (sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) OR (recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) )
WITH CHECK ( sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) );

-- Políticas para tabelas com acesso restrito a admins ou equipe
DROP POLICY IF EXISTS "Admins e equipe médica podem gerenciar inventário" ON public.inventory;
CREATE POLICY "Admins e equipe médica podem gerenciar inventário" ON public.inventory FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))));
DROP POLICY IF EXISTS "Admins e equipe médica podem gerenciar transações de invent" ON public.inventory_transactions;
CREATE POLICY "Admins e equipe médica podem gerenciar transações de invent" ON public.inventory_transactions FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))));
DROP POLICY IF EXISTS "Admins e equipe médica podem gerenciar salas" ON public.rooms;
CREATE POLICY "Admins e equipe médica podem gerenciar salas" ON public.rooms FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))));
DROP POLICY IF EXISTS "Admins e equipe médica podem gerenciar equipamentos" ON public.equipment;
CREATE POLICY "Admins e equipe médica podem gerenciar equipamentos" ON public.equipment FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))));
DROP POLICY IF EXISTS "Equipe e paciente podem ver a jornada" ON public.patient_journey_progress;
CREATE POLICY "Equipe e paciente podem ver a jornada" ON public.patient_journey_progress FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))) OR (patient_id IN ( SELECT p.id FROM patients p JOIN profiles prof ON p.profile_id = prof.id WHERE prof.user_id = auth.uid())));
DROP POLICY IF EXISTS "Equipe e paciente podem ver documentos de cirurgia" ON public.patient_surgery_documents;
CREATE POLICY "Equipe e paciente podem ver documentos de cirurgia" ON public.patient_surgery_documents FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))) OR (patient_id IN ( SELECT p.id FROM patients p JOIN profiles prof ON p.profile_id = prof.id WHERE prof.user_id = auth.uid())));
DROP POLICY IF EXISTS "Equipe pode gerenciar checklist de cirurgia" ON public.surgery_checklist_items;
CREATE POLICY "Equipe pode gerenciar checklist de cirurgia" ON public.surgery_checklist_items FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))));
DROP POLICY IF EXISTS "Acesso a itens de orçamento segue o orçamento principal" ON public.quote_items;
CREATE POLICY "Acesso a itens de orçamento segue o orçamento principal" ON public.quote_items FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor', 'receptionist'))));
DROP POLICY IF EXISTS "Acesso restrito a prescrições" ON public.prescriptions;
CREATE POLICY "Acesso restrito a prescrições" ON public.prescriptions FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor'))));
DROP POLICY IF EXISTS "Acesso a imagens de avaliação médica" ON public.medical_evaluation_images;
CREATE POLICY "Acesso a imagens de avaliação médica" ON public.medical_evaluation_images FOR ALL USING ((EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'doctor'))));

-- Políticas para tabelas com acesso apenas para admins
DROP POLICY IF EXISTS "Admins podem gerenciar permissões de usuário" ON public.user_permissions;
CREATE POLICY "Admins podem gerenciar permissões de usuário" ON public.user_permissions FOR ALL USING ( public.is_admin() );
DROP POLICY IF EXISTS "Admins podem visualizar logs de auditoria" ON public.auth_logs;
CREATE POLICY "Admins podem visualizar logs de auditoria" ON public.auth_logs FOR SELECT USING ( public.is_admin() );
DROP POLICY IF EXISTS "Admins podem ver histórico de geração de documentos" ON public.document_generation_history;
CREATE POLICY "Admins podem ver histórico de geração de documentos" ON public.document_generation_history FOR SELECT USING ( public.is_admin() );
DROP POLICY IF EXISTS "Admins podem gerenciar configurações da clínica" ON public.clinic_settings;
CREATE POLICY "Admins podem gerenciar configurações da clínica" ON public.clinic_settings FOR ALL USING ( public.is_admin() );
DROP POLICY IF EXISTS "Admins podem gerenciar templates de mensagem" ON public.message_templates;
CREATE POLICY "Admins podem gerenciar templates de mensagem" ON public.message_templates FOR ALL USING ( public.is_admin() );
DROP POLICY IF EXISTS "Admins podem gerenciar templates de documentos" ON public.surgery_document_templates;
CREATE POLICY "Admins podem gerenciar templates de documentos" ON public.surgery_document_templates FOR ALL USING ( public.is_admin() );

-- Políticas para disponibilidade
DROP POLICY IF EXISTS "Admins podem ver tudo, profissionais gerenciam sua própria dis" ON public.availability;
CREATE POLICY "Admins podem ver tudo, profissionais gerenciam sua própria dis" ON public.availability FOR ALL USING (public.is_admin() OR (professional_id = ( SELECT (prof.id)::text AS id FROM professionals prof WHERE prof.user_id = auth.uid())));
DROP POLICY IF EXISTS "Admins podem ver tudo, profissionais gerenciam suas próprias d" ON public.blocked_dates;
CREATE POLICY "Admins podem ver tudo, profissionais gerenciam suas próprias d" ON public.blocked_dates FOR ALL USING (public.is_admin() OR (professional_id = ( SELECT (prof.id)::text AS id FROM professionals prof WHERE prof.user_id = auth.uid())));
DROP POLICY IF EXISTS "Profissionais gerenciam sua própria disponibilidade" ON public.professional_availability;
CREATE POLICY "Profissionais gerenciam sua própria disponibilidade" ON public.professional_availability FOR ALL USING (public.is_admin() OR (professional_id = ( SELECT prof.id FROM professionals prof WHERE prof.user_id = auth.uid())));
DROP POLICY IF EXISTS "Profissionais gerenciam suas próprias folgas" ON public.professional_time_off;
CREATE POLICY "Profissionais gerenciam suas próprias folgas" ON public.professional_time_off FOR ALL USING (public.is_admin() OR (professional_id = ( SELECT prof.id FROM professionals prof WHERE prof.user_id = auth.uid())));

-- Políticas para video_rooms
DROP POLICY IF EXISTS "Acesso a salas de telemedicina" ON public.video_rooms;
CREATE POLICY "Acesso a salas de telemedicina" ON public.video_rooms FOR ALL USING (public.is_admin() OR (created_by = auth.uid()));

-- Políticas para tabelas de configuração (leitura para todos, escrita para admins)
DROP POLICY IF EXISTS "Usuários autenticados podem ler" ON public.job_prefixes;
CREATE POLICY "Usuários autenticados podem ler" ON public.job_prefixes FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins podem escrever" ON public.job_prefixes;
CREATE POLICY "Admins podem escrever" ON public.job_prefixes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem ler" ON public.surgery_types;
CREATE POLICY "Usuários autenticados podem ler" ON public.surgery_types FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins podem escrever" ON public.surgery_types;
CREATE POLICY "Admins podem escrever" ON public.surgery_types FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem ler" ON public.hospitals;
CREATE POLICY "Usuários autenticados podem ler" ON public.hospitals FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins podem escrever" ON public.hospitals;
CREATE POLICY "Admins podem escrever" ON public.hospitals FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Políticas para Storage
DROP POLICY IF EXISTS "Public access for system-assets" ON storage.objects;
CREATE POLICY "Public access for system-assets" ON storage.objects FOR SELECT USING (bucket_id = 'system-assets');

DROP POLICY IF EXISTS "Public access for policies-and-terms" ON storage.objects;
CREATE POLICY "Public access for policies-and-terms" ON storage.objects FOR SELECT USING (bucket_id = 'policies-and-terms');

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem gerenciar seus próprios arquivos" ON storage.objects FOR ALL USING ((bucket_id = 'user-files') AND (owner = auth.uid()));

DROP POLICY IF EXISTS "Admins podem gerenciar todos os arquivos" ON storage.objects;
CREATE POLICY "Admins podem gerenciar todos os arquivos" ON storage.objects FOR ALL USING (public.is_admin());