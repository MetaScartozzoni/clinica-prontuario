-- =====================================================================================
-- Arquivo: functions.sql
-- Descrição: Define todas as funções PostgreSQL utilizadas no sistema.
-- Ordem de execução: 8
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_role TEXT;
    v_status TEXT;
    v_job_title TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Extrai os dados do raw_user_meta_data
    v_job_title := NEW.raw_user_meta_data->>'job_title';
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';

    -- Define o papel e o status com base nos dados do novo usuário.
    -- Se job_title for fornecido (convite de admin), o usuário já nasce ativo com seu cargo.
    -- Se não (cadastro público), ele se torna um paciente pendente de aprovação.
    IF v_job_title IS NOT NULL THEN
        SELECT lower(v_job_title) INTO v_role;
        v_status := 'active';
    ELSE
        v_role := 'patient';
        v_status := 'pending';
    END IF;

    -- Insere o novo perfil na tabela public.profiles
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role, job_title, status)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        v_role,
        v_job_title,
        v_status
    );
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.setup_initial_admin_and_policies(admin_user_id uuid, admin_email text, admin_first_name text, admin_last_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    admin_profile_id uuid;
BEGIN
    -- Etapa 1: Inserir o perfil do administrador, que será a base de tudo.
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role, job_title, status)
    VALUES (
        admin_user_id,
        admin_email,
        admin_first_name,
        admin_last_name,
        'admin',
        'Administrador',
        'active'
    )
    ON CONFLICT (user_id) DO NOTHING -- Não faz nada se o usuário já existir
    RETURNING id INTO admin_profile_id;

    -- Etapa 2: Inserir os cargos e prefixos padrão no sistema.
    INSERT INTO public.job_prefixes (job_title, prefix, description)
    VALUES
        ('Administrador', 'ADM', 'Acesso total ao sistema.'),
        ('Médico', 'DR', 'Acesso a funcionalidades médicas e de agendamento.'),
        ('Enfermeiro', 'ENF', 'Acesso a funcionalidades de suporte médico e agendamento.'),
        ('Recepcionista', 'REC', 'Acesso a agendamentos e gerenciamento de pacientes.'),
        ('Contador', 'FIN', 'Acesso a funcionalidades financeiras.'),
        ('Paciente', 'PAC', 'Acesso ao portal do paciente.')
    ON CONFLICT (job_title) DO NOTHING;

    -- Etapa 4: Habilitar Row-Level Security (RLS) para todas as tabelas críticas.
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

END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_system_setup()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE role = 'admin'
    ) INTO admin_exists;

    RETURN jsonb_build_object('hasAdmin', admin_exists);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unified_calendar_events(professional_user_id_filter uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id text, title text, start timestamp with time zone, "end" timestamp with time zone, all_day boolean, resource jsonb, event_type text, event_id uuid, professional_id uuid, patient_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_professional_profile_id UUID;
BEGIN
    IF professional_user_id_filter IS NOT NULL THEN
        SELECT prof.id INTO v_professional_profile_id FROM public.profiles prof WHERE prof.user_id = professional_user_id_filter LIMIT 1;
    END IF;

    RETURN QUERY
    -- Consulta para agendamentos (appointments)
    SELECT
        'appt_' || a.id::text,
        (CASE WHEN a.is_telemedicine THEN '🎥 ' ELSE '' END) || pat.full_name || ' - ' || a.service_type,
        a.start_time,
        a.end_time,
        false AS all_day,
        jsonb_build_object(
            'type', 'appointment',
            'appointment_id', a.id,
            'status', a.status,
            'patient_name', pat.full_name,
            'professional_id', a.professional_id,
            'service_type', a.service_type,
            'notes', a.notes,
            'is_telemedicine', a.is_telemedicine,
            'telemedicine_url', a.telemedicine_url
        ) AS resource,
        'appointment' AS event_type,
        a.id AS event_id,
        a.professional_id,
        a.patient_id,
        a.status
    FROM
        public.appointments a
    JOIN public.patients pat ON a.patient_id = pat.id
    WHERE
        (v_professional_profile_id IS NULL OR a.professional_id = v_professional_profile_id)

    UNION ALL

    -- Consulta para cirurgias (surgery_schedule)
    SELECT
        'surg_' || ss.id::text,
        '⚕️ ' || pat.full_name || ' - ' || COALESCE(st.name, ss.custom_surgery_name, 'Cirurgia'),
        ss.scheduled_date_time,
        ss.scheduled_date_time + (ss.duration_minutes * interval '1 minute'),
        false AS all_day,
        jsonb_build_object(
            'type', 'surgery',
            'surgery_id', ss.id,
            'status', ss.status,
            'patient_name', pat.full_name,
            'professional_id', ss.professional_id,
            'hospital_name', ss.hospital_name,
            'room_number', ss.room_number,
            'financial_status', ss.financial_status
        ) AS resource,
        'surgery' AS event_type,
        ss.id AS event_id,
        ss.professional_id,
        ss.patient_id,
        ss.status
    FROM
        public.surgery_schedule ss
    JOIN public.patients pat ON ss.patient_id = pat.id
    LEFT JOIN public.surgery_types st ON ss.surgery_type_id = st.id
    WHERE
        (v_professional_profile_id IS NULL OR ss.professional_id = v_professional_profile_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_patients_with_profiles(p_search text DEFAULT NULL::text, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS TABLE(patient_id uuid, profile_id uuid, first_name text, last_name text, full_name text, email text, phone text, date_of_birth date, gender text, cpf text, rg text, address_full text, health_insurance text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS patient_id,
        p.profile_id,
        p.first_name,
        p.last_name,
        p.full_name,
        p.email,
        p.phone,
        p.date_of_birth,
        p.gender,
        p.cpf,
        p.rg,
        CONCAT_WS(', ', 
            p.address_street, 
            p.address_number, 
            p.address_complement, 
            p.address_neighborhood,
            p.address_city,
            p.address_state,
            p.address_zipcode
        ) AS address_full,
        p.health_insurance,
        p.created_at
    FROM 
        public.patients p
    WHERE 
        (p_search IS NULL OR 
         p.full_name ILIKE '%' || p_search || '%' OR
         p.email ILIKE '%' || p_search || '%' OR
         p.cpf ILIKE '%' || p_search || '%' OR
         p.phone ILIKE '%' || p_search || '%')
    ORDER BY 
        p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$function$
;