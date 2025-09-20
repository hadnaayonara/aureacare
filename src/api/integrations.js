import { apiClient } from './client';

// =====================================================
// INTEGRAÇÕES SUPABASE - AUREA LABS
// =====================================================

// Integrações principais
export const Core = apiClient.integrations.Core;

// Integrações específicas
export const InvokeLLM = apiClient.integrations.Core.InvokeLLM;
export const SendEmail = apiClient.integrations.Core.SendEmail;
export const UploadFile = apiClient.integrations.Core.UploadFile;
export const GenerateImage = apiClient.integrations.Core.GenerateImage;
export const ExtractDataFromUploadedFile = apiClient.integrations.Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = apiClient.integrations.Core.CreateFileSignedUrl;
export const UploadPrivateFile = apiClient.integrations.Core.UploadPrivateFile;






