-- =====================================================
-- SCHEMA SUPABASE PARA AUREA LABS
-- Baseado no arquivo banco.md, adaptado para Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TIPOS ENUM
-- =====================================================

CREATE TYPE "user_app_role" AS ENUM (
'admin',
'host',
'doctor',
'reception',
'guest'
);

CREATE TYPE "appointment_type" AS ENUM (
'consulta',
'retorno',
'exame',
'procedimento',
'bloqueio'
);

CREATE TYPE "appointment_status" AS ENUM (
'agendado',
'confirmado',
'em_andamento',
'concluido',
'cancelado',
'falta'
);

CREATE TYPE "appointment_source" AS ENUM (
'whatsapp_ia',
'whatsapp_manual',
'telefone',
'presencial',
'instagram',
'website',
'outro'
);

CREATE TYPE "patient_gender" AS ENUM (
'Masculino',
'Feminino',
'Outro'
);

CREATE TYPE "doctor_gender" AS ENUM (
'Masculino',
'Feminino',
'Outro',
'Prefiro não informar'
);

CREATE TYPE "clinic_user_role" AS ENUM (
'owner',
'admin',
'reception',
'doctor'
);

CREATE TYPE "clinic_subscription_plan" AS ENUM (
'trial',
'basic',
'premium',
'enterprise'
);

CREATE TYPE "user_api_key_status" AS ENUM (
'active',
'revoked'
);

CREATE TYPE "audit_log_action" AS ENUM (
'create',
'update',
'delete',
'login',
'logout',
'invite',
'switch_clinic'
);

CREATE TYPE "newsletter_subscriber_status" AS ENUM (
'active',
'unsubscribed'
);

CREATE TYPE "exam_status" AS ENUM (
'active',
'archived'
);

CREATE TYPE "user_registration_role" AS ENUM (
'host'
);

CREATE TYPE "registration_status" AS ENUM (
'pending',
'approved',
'rejected'
);

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (vinculada ao auth.users do Supabase)
CREATE TABLE "users" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"email" varchar(255) UNIQUE NOT NULL,
"full_name" varchar(255) NOT NULL,
"app_role" user_app_role NOT NULL DEFAULT 'host',
"last_login" timestamp,
"first_login" boolean NOT NULL DEFAULT true,
"is_active" boolean NOT NULL DEFAULT true,
"host_user_id" uuid,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de clínicas
CREATE TABLE "clinics" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"name" varchar(255) NOT NULL,
"cnpj" varchar(20) UNIQUE NOT NULL,
"phone" varchar(50),
"email" varchar(255) UNIQUE,
"settings" jsonb,
"subscription_plan" clinic_subscription_plan NOT NULL DEFAULT 'trial',
"is_active" boolean NOT NULL DEFAULT true,
"created_by" uuid NOT NULL,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de endereços das clínicas
CREATE TABLE "clinic_addresses" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"clinic_id" uuid NOT NULL,
"street" varchar(255) NOT NULL,
"number" varchar(50),
"city" varchar(255) NOT NULL,
"state" varchar(50) NOT NULL,
"zip_code" varchar(20),
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de médicos
CREATE TABLE "doctors" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" uuid UNIQUE,
"clinic_id" uuid NOT NULL,
"full_name" varchar(255) NOT NULL,
"cpf" varchar(20) UNIQUE,
"birth_date" date,
"gender" doctor_gender,
"languages" jsonb,
"council_type" varchar(50) NOT NULL,
"council_number" varchar(50) UNIQUE NOT NULL,
"council_state" varchar(10) NOT NULL,
"main_specialty" varchar(255) NOT NULL,
"sub_specialties" jsonb,
"email" varchar(255) UNIQUE NOT NULL,
"phone" varchar(50) NOT NULL,
"landline" varchar(50),
"services" jsonb,
"accepted_insurances" jsonb,
"availability_schedule" jsonb,
"has_system_access" boolean NOT NULL DEFAULT false,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de pacientes
CREATE TABLE "patients" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"clinic_id" uuid NOT NULL,
"full_name" varchar(255) NOT NULL,
"cpf" varchar(20) UNIQUE NOT NULL,
"birth_date" date,
"gender" patient_gender,
"phone" varchar(50),
"email" varchar(255),
"medical_plan" varchar(255),
"allergies" jsonb,
"chronic_conditions" jsonb,
"current_medications" jsonb,
"surgeries" jsonb,
"hospitalizations" jsonb,
"family_medical_history" text,
"is_active" boolean NOT NULL DEFAULT true,
"owning_host_id" uuid,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de endereços dos pacientes
CREATE TABLE "patient_addresses" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"patient_id" uuid NOT NULL,
"street" varchar(255) NOT NULL,
"number" varchar(50),
"city" varchar(255) NOT NULL,
"state" varchar(50) NOT NULL,
"zip_code" varchar(20),
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de contatos de emergência
CREATE TABLE "emergency_contacts" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"patient_id" uuid NOT NULL,
"name" varchar(255) NOT NULL,
"phone" varchar(50) NOT NULL,
"relationship" varchar(100),
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de exames (catálogo global)
CREATE TABLE "exams" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"name" varchar(255) UNIQUE NOT NULL,
"category" varchar(255),
"instructions" text,
"notes" text,
"price" decimal(10,2) NOT NULL,
"duration" integer DEFAULT 30,
"status" exam_status NOT NULL DEFAULT 'active',
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de consultas
CREATE TABLE "appointments" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"patient_id" uuid NOT NULL,
"doctor_id" uuid NOT NULL,
"clinic_id" uuid NOT NULL,
"exam_id" uuid,
"starts_at" timestamp NOT NULL,
"ends_at" timestamp NOT NULL,
"duration" integer NOT NULL DEFAULT 30,
"type" appointment_type NOT NULL,
"status" appointment_status NOT NULL,
"source" appointment_source NOT NULL DEFAULT 'presencial',
"specialty" varchar(255),
"special_needs" text,
"whatsapp_thread" varchar(255),
"reminder_sent" boolean NOT NULL DEFAULT false,
"cancellation_reason" text,
"cancelled_by" uuid,
"notes" text,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de prontuários médicos
CREATE TABLE "medical_records" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"patient_id" uuid NOT NULL,
"doctor_id" uuid NOT NULL,
"clinic_id" uuid NOT NULL,
"appointment_id" uuid,
"consultation_date" date NOT NULL,
"chief_complaint" text,
"history_present_illness" text,
"physical_examination" text,
"diagnosis" jsonb,
"treatment_plan" text,
"prescriptions" jsonb,
"lab_tests" jsonb,
"attachments" jsonb,
"follow_up_date" date,
"is_confidential" boolean NOT NULL DEFAULT false,
"notes" text,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de recepcionistas
CREATE TABLE "receptions" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" uuid UNIQUE,
"clinic_id" uuid NOT NULL,
"full_name" varchar(255) NOT NULL,
"cpf" varchar(20) UNIQUE,
"email" varchar(255) UNIQUE NOT NULL,
"phone" varchar(50),
"is_active" boolean NOT NULL DEFAULT true,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de relacionamento clínica-usuário
CREATE TABLE "clinic_users" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" uuid NOT NULL,
"clinic_id" uuid NOT NULL,
"doctor_id" uuid,
"reception_id" uuid,
"role" clinic_user_role NOT NULL,
"invited_email" varchar(255),
"invitation_token" varchar(255) UNIQUE,
"invitation_expires_at" timestamp,
"accepted_at" timestamp,
"invited_by" uuid,
"permissions" jsonb,
"is_active" boolean NOT NULL DEFAULT true,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de atribuições de pacientes
CREATE TABLE "patient_assignments" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"clinic_id" uuid NOT NULL,
"patient_id" uuid NOT NULL,
"doctor_id" uuid NOT NULL,
"assigned_by" uuid NOT NULL,
"assigned_at" timestamp NOT NULL DEFAULT (now()),
"is_active" boolean NOT NULL DEFAULT true,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de logs de auditoria
CREATE TABLE "audit_logs" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" uuid,
"clinic_id" uuid,
"action" audit_log_action NOT NULL,
"table_name" varchar(100),
"record_id" uuid,
"old_values" jsonb,
"new_values" jsonb,
"ip_address" inet,
"user_agent" text,
"created_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de chaves API dos usuários
CREATE TABLE "user_api_keys" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" uuid NOT NULL,
"api_key_hash" varchar(255) NOT NULL,
"api_key_preview" varchar(20) NOT NULL,
"name" varchar(100),
"status" user_api_key_status NOT NULL DEFAULT 'active',
"last_used_at" timestamp,
"expires_at" timestamp,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de registros de usuários (para aprovação)
CREATE TABLE "user_registrations" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"email" varchar(255) UNIQUE NOT NULL,
"full_name" varchar(255) NOT NULL,
"clinic_name" varchar(255) NOT NULL,
"phone" varchar(50),
"city_state" varchar(255),
"main_specialty" varchar(255),
"role" user_registration_role NOT NULL DEFAULT 'host',
"status" registration_status NOT NULL DEFAULT 'pending',
"approved_by" uuid,
"approved_at" timestamp,
"rejection_reason" text,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de assinantes da newsletter
CREATE TABLE "newsletter_subscribers" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"email" varchar(255) UNIQUE NOT NULL,
"status" newsletter_subscriber_status NOT NULL DEFAULT 'active',
"subscribed_at" timestamp NOT NULL DEFAULT (now()),
"unsubscribed_at" timestamp,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- Tabela de recepções (contatos)
CREATE TABLE "receptions_contact" (
"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
"clinic_id" uuid NOT NULL,
"name" varchar(255) NOT NULL,
"email" varchar(255) UNIQUE NOT NULL,
"phone" varchar(50),
"message" text,
"created_at" timestamp NOT NULL DEFAULT (now()),
"updated_at" timestamp NOT NULL DEFAULT (now())
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_app_role ON users(app_role);
CREATE INDEX idx_users_host_user_id ON users(host_user_id);

-- Índices para tabela clinics
CREATE INDEX idx_clinics_cnpj ON clinics(cnpj);
CREATE INDEX idx_clinics_created_by ON clinics(created_by);
CREATE INDEX idx_clinics_is_active ON clinics(is_active);

-- Índices para tabela doctors
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_doctors_cpf ON doctors(cpf);
CREATE INDEX idx_doctors_council_number ON doctors(council_number);

-- Índices para tabela patients
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_owning_host_id ON patients(owning_host_id);
CREATE INDEX idx_patients_is_active ON patients(is_active);

-- Índices para tabela appointments
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Índices para tabela medical_records
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_clinic_id ON medical_records(clinic_id);
CREATE INDEX idx_medical_records_consultation_date ON medical_records(consultation_date);

-- Índices para tabela clinic_users
CREATE INDEX idx_clinic_users_user_id ON clinic_users(user_id);
CREATE INDEX idx_clinic_users_clinic_id ON clinic_users(clinic_id);
CREATE INDEX idx_clinic_users_role ON clinic_users(role);
CREATE INDEX idx_clinic_users_is_active ON clinic_users(is_active);

-- Índices para tabela audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

-- Foreign keys para users
ALTER TABLE users ADD CONSTRAINT fk_users_host_user_id 
  FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Foreign keys para clinics
ALTER TABLE clinics ADD CONSTRAINT fk_clinics_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign keys para clinic_addresses
ALTER TABLE clinic_addresses ADD CONSTRAINT fk_clinic_addresses_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Foreign keys para doctors
ALTER TABLE doctors ADD CONSTRAINT fk_doctors_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE doctors ADD CONSTRAINT fk_doctors_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Foreign keys para patients
ALTER TABLE patients ADD CONSTRAINT fk_patients_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE patients ADD CONSTRAINT fk_patients_owning_host_id 
  FOREIGN KEY (owning_host_id) REFERENCES users(id) ON DELETE SET NULL;

-- Foreign keys para patient_addresses
ALTER TABLE patient_addresses ADD CONSTRAINT fk_patient_addresses_patient_id 
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- Foreign keys para emergency_contacts
ALTER TABLE emergency_contacts ADD CONSTRAINT fk_emergency_contacts_patient_id 
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- Foreign keys para appointments
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_patient_id 
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_doctor_id 
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_exam_id 
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_cancelled_by 
  FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL;

-- Foreign keys para medical_records
ALTER TABLE medical_records ADD CONSTRAINT fk_medical_records_patient_id 
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
ALTER TABLE medical_records ADD CONSTRAINT fk_medical_records_doctor_id 
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
ALTER TABLE medical_records ADD CONSTRAINT fk_medical_records_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE medical_records ADD CONSTRAINT fk_medical_records_appointment_id 
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- Foreign keys para receptions
ALTER TABLE receptions ADD CONSTRAINT fk_receptions_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE receptions ADD CONSTRAINT fk_receptions_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Foreign keys para clinic_users
ALTER TABLE clinic_users ADD CONSTRAINT fk_clinic_users_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE clinic_users ADD CONSTRAINT fk_clinic_users_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE clinic_users ADD CONSTRAINT fk_clinic_users_doctor_id 
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;
ALTER TABLE clinic_users ADD CONSTRAINT fk_clinic_users_reception_id 
  FOREIGN KEY (reception_id) REFERENCES receptions(id) ON DELETE SET NULL;
ALTER TABLE clinic_users ADD CONSTRAINT fk_clinic_users_invited_by 
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL;

-- Foreign keys para patient_assignments
ALTER TABLE patient_assignments ADD CONSTRAINT fk_patient_assignments_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE patient_assignments ADD CONSTRAINT fk_patient_assignments_patient_id 
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
ALTER TABLE patient_assignments ADD CONSTRAINT fk_patient_assignments_doctor_id 
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;
ALTER TABLE patient_assignments ADD CONSTRAINT fk_patient_assignments_assigned_by 
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign keys para audit_logs
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;

-- Foreign keys para user_api_keys
ALTER TABLE user_api_keys ADD CONSTRAINT fk_user_api_keys_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign keys para user_registrations
ALTER TABLE user_registrations ADD CONSTRAINT fk_user_registrations_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Foreign keys para receptions_contact
ALTER TABLE receptions_contact ADD CONSTRAINT fk_receptions_contact_clinic_id 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- =====================================================

COMMENT ON TABLE users IS 'Usuários do sistema vinculados ao auth.users do Supabase';
COMMENT ON COLUMN users.id IS 'ID do usuário (UUID vinculado ao auth.users)';
COMMENT ON COLUMN users.app_role IS 'Papel do usuário no sistema: admin, host, doctor, reception, guest';
COMMENT ON COLUMN users.host_user_id IS 'ID do usuário host (para usuários convidados)';

COMMENT ON TABLE clinics IS 'Clínicas cadastradas no sistema';
COMMENT ON COLUMN clinics.created_by IS 'ID do usuário que criou a clínica';
COMMENT ON COLUMN clinics.subscription_plan IS 'Plano de assinatura da clínica';

COMMENT ON TABLE doctors IS 'Médicos cadastrados nas clínicas';
COMMENT ON COLUMN doctors.user_id IS 'ID do usuário (se tiver acesso ao sistema)';
COMMENT ON COLUMN doctors.has_system_access IS 'Se o médico tem acesso ao sistema';

COMMENT ON TABLE patients IS 'Pacientes das clínicas';
COMMENT ON COLUMN patients.owning_host_id IS 'ID do host proprietário do paciente';

COMMENT ON TABLE appointments IS 'Consultas agendadas';
COMMENT ON COLUMN appointments.source IS 'Origem do agendamento';
COMMENT ON COLUMN appointments.whatsapp_thread IS 'Thread do WhatsApp (se aplicável)';

COMMENT ON TABLE medical_records IS 'Prontuários médicos';
COMMENT ON COLUMN medical_records.is_confidential IS 'Se o prontuário é confidencial';

COMMENT ON TABLE clinic_users IS 'Relacionamento entre usuários e clínicas';
COMMENT ON COLUMN clinic_users.role IS 'Papel do usuário na clínica';
COMMENT ON COLUMN clinic_users.invited_email IS 'Email para convite (se aplicável)';

COMMENT ON TABLE audit_logs IS 'Logs de auditoria do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores anteriores (JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'Valores novos (JSON)';

