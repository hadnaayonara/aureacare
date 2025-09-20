import { apiClient } from './client';

// =====================================================
// ENTIDADES SUPABASE - AUREA LABS
// =====================================================

// Entidades principais
export const Patient = apiClient.entities.Patient;
export const Appointment = apiClient.entities.Appointment;
export const MedicalRecord = apiClient.entities.MedicalRecord;
export const Doctor = apiClient.entities.Doctor;
export const Clinic = apiClient.entities.Clinic;
export const ClinicUser = apiClient.entities.ClinicUser;
export const PatientAssignment = apiClient.entities.PatientAssignment;
export const AuditLog = apiClient.entities.AuditLog;
export const UserApiKey = apiClient.entities.UserApiKey;
export const UserRegistration = apiClient.entities.UserRegistration;
export const NewsletterSubscriber = apiClient.entities.NewsletterSubscriber;
export const Reception = apiClient.entities.Reception;
export const Exam = apiClient.entities.Exam;
export const User = apiClient.entities.User;

// Autenticação
export const Auth = apiClient.auth;

// Funções de negócio
export const Business = apiClient.business;

// Funções do sistema
export const Functions = apiClient.functions;

// Integrações
export const Integrations = apiClient.integrations;