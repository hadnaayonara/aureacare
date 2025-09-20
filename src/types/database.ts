// =====================================================
// TIPOS TYPESCRIPT PARA SUPABASE - AUREA LABS
// =====================================================

// =====================================================
// TIPOS ENUM
// =====================================================

export type UserAppRole = 'admin' | 'host' | 'doctor' | 'reception' | 'guest';
export type AppointmentType = 'consulta' | 'retorno' | 'exame' | 'procedimento' | 'bloqueio';
export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'falta';
export type AppointmentSource = 'whatsapp_ia' | 'whatsapp_manual' | 'telefone' | 'presencial' | 'instagram' | 'website' | 'outro';
export type PatientGender = 'Masculino' | 'Feminino' | 'Outro';
export type DoctorGender = 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';
export type ClinicUserRole = 'owner' | 'admin' | 'reception' | 'doctor';
export type ClinicSubscriptionPlan = 'trial' | 'basic' | 'premium' | 'enterprise';
export type UserApiKeyStatus = 'active' | 'revoked';
export type AuditLogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'invite' | 'switch_clinic';
export type NewsletterSubscriberStatus = 'active' | 'unsubscribed';
export type ExamStatus = 'active' | 'archived';
export type UserRegistrationRole = 'host';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

// =====================================================
// TIPOS BASE DAS TABELAS
// =====================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  app_role: UserAppRole;
  last_login?: string;
  first_login: boolean;
  is_active: boolean;
  host_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  phone?: string;
  email?: string;
  settings?: any; // JSONB
  subscription_plan: ClinicSubscriptionPlan;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicAddress {
  id: string;
  clinic_id: string;
  street: string;
  number?: string;
  city: string;
  state: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id?: string;
  clinic_id: string;
  full_name: string;
  cpf?: string;
  birth_date?: string;
  gender?: DoctorGender;
  languages?: any; // JSONB
  council_type: string;
  council_number: string;
  council_state: string;
  main_specialty: string;
  sub_specialties?: any; // JSONB
  email: string;
  phone: string;
  landline?: string;
  services?: any; // JSONB
  accepted_insurances?: any; // JSONB
  availability_schedule?: any; // JSONB
  has_system_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  cpf: string;
  birth_date?: string;
  gender?: PatientGender;
  phone?: string;
  email?: string;
  medical_plan?: string;
  allergies?: any; // JSONB
  chronic_conditions?: any; // JSONB
  current_medications?: any; // JSONB
  surgeries?: any; // JSONB
  hospitalizations?: any; // JSONB
  family_medical_history?: string;
  is_active: boolean;
  owning_host_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientAddress {
  id: string;
  patient_id: string;
  street: string;
  number?: string;
  city: string;
  state: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  relationship?: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  name: string;
  category?: string;
  instructions?: string;
  notes?: string;
  price: number;
  duration: number;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  exam_id?: string;
  starts_at: string;
  ends_at: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  source: AppointmentSource;
  specialty?: string;
  special_needs?: string;
  whatsapp_thread?: string;
  reminder_sent: boolean;
  cancellation_reason?: string;
  cancelled_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_id?: string;
  consultation_date: string;
  chief_complaint?: string;
  history_present_illness?: string;
  physical_examination?: string;
  diagnosis?: any; // JSONB
  treatment_plan?: string;
  prescriptions?: any; // JSONB
  lab_tests?: any; // JSONB
  attachments?: any; // JSONB
  follow_up_date?: string;
  is_confidential: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Reception {
  id: string;
  user_id?: string;
  clinic_id: string;
  full_name: string;
  cpf?: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicUser {
  id: string;
  user_id: string;
  clinic_id: string;
  doctor_id?: string;
  reception_id?: string;
  role: ClinicUserRole;
  invited_email?: string;
  invitation_token?: string;
  invitation_expires_at?: string;
  accepted_at?: string;
  invited_by?: string;
  permissions?: any; // JSONB
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAssignment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  clinic_id?: string;
  action: AuditLogAction;
  table_name?: string;
  record_id?: string;
  old_values?: any; // JSONB
  new_values?: any; // JSONB
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserApiKey {
  id: string;
  user_id: string;
  api_key_hash: string;
  api_key_preview: string;
  name?: string;
  status: UserApiKeyStatus;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRegistration {
  id: string;
  email: string;
  full_name: string;
  clinic_name: string;
  phone?: string;
  city_state?: string;
  main_specialty?: string;
  role: UserRegistrationRole;
  status: RegistrationStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterSubscriberStatus;
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceptionContact {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TIPOS PARA OPERAÇÕES CRUD
// =====================================================

export type InsertUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;

export type InsertClinic = Omit<Clinic, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClinic = Partial<Omit<Clinic, 'id' | 'created_at' | 'updated_at'>>;

export type InsertDoctor = Omit<Doctor, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDoctor = Partial<Omit<Doctor, 'id' | 'created_at' | 'updated_at'>>;

export type InsertPatient = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePatient = Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>;

export type InsertAppointment = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAppointment = Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>;

export type InsertMedicalRecord = Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMedicalRecord = Partial<Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>>;

export type InsertExam = Omit<Exam, 'id' | 'created_at' | 'updated_at'>;
export type UpdateExam = Partial<Omit<Exam, 'id' | 'created_at' | 'updated_at'>>;

// =====================================================
// TIPOS PARA RELACIONAMENTOS
// =====================================================

export interface UserWithProfile extends User {
  userProfile?: UserProfile;
}

export interface UserProfile extends User {
  clinic_users?: ClinicUserWithClinic[];
  owned_clinics?: Clinic[];
}

export interface ClinicUserWithClinic extends ClinicUser {
  clinic?: Clinic;
  user?: User;
  doctor?: Doctor;
  reception?: Reception;
}

export interface DoctorWithUser extends Doctor {
  user?: User;
  clinic?: Clinic;
  clinic_users?: ClinicUser[];
}

export interface PatientWithDetails extends Patient {
  clinic?: Clinic;
  owning_host?: User;
  addresses?: PatientAddress[];
  emergency_contacts?: EmergencyContact[];
  appointments?: Appointment[];
  medical_records?: MedicalRecord[];
  patient_assignments?: PatientAssignment[];
}

export interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  doctor?: Doctor;
  clinic?: Clinic;
  exam?: Exam;
  cancelled_by_user?: User;
  medical_records?: MedicalRecord[];
}

export interface MedicalRecordWithDetails extends MedicalRecord {
  patient?: Patient;
  doctor?: Doctor;
  clinic?: Clinic;
  appointment?: Appointment;
  attachments?: any[];
}

export interface ClinicWithDetails extends Clinic {
  created_by_user?: User;
  addresses?: ClinicAddress[];
  doctors?: Doctor[];
  patients?: Patient[];
  appointments?: Appointment[];
  medical_records?: MedicalRecord[];
  clinic_users?: ClinicUserWithUser[];
  receptions?: Reception[];
}

export interface ClinicUserWithUser extends ClinicUser {
  user?: User;
  doctor?: Doctor;
  reception?: Reception;
  invited_by_user?: User;
}

// =====================================================
// TIPOS PARA FILTROS E BUSCA
// =====================================================

export interface PatientFilters {
  search?: string;
  clinic_id?: string;
  gender?: PatientGender;
  is_active?: boolean;
  owning_host_id?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentFilters {
  search?: string;
  clinic_id?: string;
  doctor_id?: string;
  patient_id?: string;
  start_date?: string;
  end_date?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  limit?: number;
  offset?: number;
}

export interface DoctorFilters {
  search?: string;
  clinic_id?: string;
  specialty?: string;
  has_system_access?: boolean;
  limit?: number;
  offset?: number;
}

export interface ClinicFilters {
  search?: string;
  subscription_plan?: ClinicSubscriptionPlan;
  is_active?: boolean;
  created_by?: string;
  limit?: number;
  offset?: number;
}

export interface MedicalRecordFilters {
  search?: string;
  clinic_id?: string;
  patient_id?: string;
  doctor_id?: string;
  start_date?: string;
  end_date?: string;
  is_confidential?: boolean;
  limit?: number;
  offset?: number;
}

// =====================================================
// TIPOS PARA ESTATÍSTICAS
// =====================================================

export interface DashboardStats {
  total_patients: number;
  total_appointments: number;
  completed_appointments: number;
  pending_appointments: number;
  total_doctors: number;
}

export interface AppointmentStats {
  total: number;
  by_status: Record<AppointmentStatus, number>;
  by_type: Record<AppointmentType, number>;
  by_source: Record<AppointmentSource, number>;
  today: number;
  this_week: number;
  this_month: number;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  by_gender: Record<PatientGender, number>;
  new_this_month: number;
}

// =====================================================
// TIPOS PARA RESPOSTAS DA API
// =====================================================

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SearchResponse<T> {
  data: T[];
  count: number;
  query: string;
  filters: any;
}

// =====================================================
// TIPOS PARA UPLOAD DE ARQUIVOS
// =====================================================

export interface FileUpload {
  file: File;
  bucket: 'aurea-labs-uploads' | 'aurea-labs-documents' | 'aurea-labs-images';
  path: string;
  metadata?: {
    patient_id?: string;
    appointment_id?: string;
    medical_record_id?: string;
    clinic_id?: string;
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  created_at: string;
  metadata?: any;
}

// =====================================================
// TIPOS PARA NOTIFICAÇÕES
// =====================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  user_id?: string;
  type?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}

// =====================================================
// TIPOS PARA PERMISSÕES
// =====================================================

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: any;
}

export interface UserPermissions {
  user_id: string;
  role: UserAppRole;
  clinic_permissions: Record<string, Permission[]>;
  global_permissions: Permission[];
}

// =====================================================
// TIPOS PARA REAL-TIME
// =====================================================

export interface RealtimeSubscription {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  callback: (payload: any) => void;
}

export interface RealtimePayload<T = any> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: string | null;
}

