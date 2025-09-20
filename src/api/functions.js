import { apiClient } from './client';

// =====================================================
// FUNÇÕES SUPABASE - AUREA LABS
// =====================================================

// Funções do sistema
export const agentGateway = apiClient.functions.agentGateway;
export const generateApiKeyForUser = apiClient.functions.generateApiKeyForUser;
export const sendReminder = apiClient.functions.sendReminder;
export const subscribeNewsletter = apiClient.functions.subscribeNewsletter;
export const importDoctorsFromExcel = apiClient.functions.importDoctorsFromExcel;
export const exportPatientHistory = apiClient.functions.exportPatientHistory;
export const exportDoctorProfile = apiClient.functions.exportDoctorProfile;
export const exportFullReport = apiClient.functions.exportFullReport;
export const importPatientsFromExcel = apiClient.functions.importPatientsFromExcel;

// Funções de negócio específicas
export const searchPatients = apiClient.business.searchPatients;
export const searchAppointments = apiClient.business.searchAppointments;
export const getDashboardStats = apiClient.business.getDashboardStats;
export const createUserApiKey = apiClient.business.createUserApiKey;
export const validateApiKey = apiClient.business.validateApiKey;

