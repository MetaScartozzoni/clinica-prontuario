-- =====================================================================================
-- Arquivo: 01_types.sql
-- Descrição: Define todos os tipos personalizados (ENUMS) do banco de dados.
-- Ordem de execução: 1
-- =====================================================================================

-- Tipos Personalizados (ENUMS)
CREATE TYPE public.notification_type AS ENUM ('system_alert', 'user_approval', 'appointment_reminder', 'appointment_change', 'surgery_update', 'message_received');
CREATE TYPE public.notification_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn', 'phone');
CREATE TYPE auth.one_time_token_type AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');