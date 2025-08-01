-- =====================================================================================
-- Arquivo: 03_appointment_tables.sql
-- Descrição: Define tabelas relacionadas a agendamentos e cirurgias.
-- Ordem de execução: 3
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID NOT NULL REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    service_type TEXT,
    notes TEXT,
    is_telemedicine BOOLEAN DEFAULT FALSE,
    telemedicine_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.surgery_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.surgery_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID NOT NULL REFERENCES public.profiles(id),
    surgery_type_id UUID REFERENCES public.surgery_types(id),
    custom_surgery_name TEXT,
    scheduled_date_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    hospital_name TEXT,
    room_number TEXT,
    status TEXT NOT NULL,
    financial_status TEXT NOT NULL,
    notes TEXT,
    anesthesiologist TEXT,
    instrumentalist TEXT,
    required_equipment TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patient_journey_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    quote_id UUID,
    surgery_schedule_id UUID UNIQUE REFERENCES public.surgery_schedule(id) ON DELETE SET NULL,
    consultation_scheduled_date DATE,
    surgery_scheduled_date DATE,
    surgery_return_date DATE,
    exams_received BOOLEAN DEFAULT FALSE,
    insurance_guide_released BOOLEAN DEFAULT FALSE,
    hospital_booked BOOLEAN DEFAULT FALSE,
    pre_op_completed BOOLEAN DEFAULT FALSE,
    consent_signed BOOLEAN DEFAULT FALSE,
    prescription_issued BOOLEAN DEFAULT FALSE,
    medical_certificate_ready BOOLEAN DEFAULT FALSE,
    observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);