// Configurações do Supabase
export const SUPABASE_CONFIG = {
  // URLs e chaves
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  
  // Configurações de autenticação
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  
  // Configurações de realtime
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}

// Configurações de storage
export const STORAGE_CONFIG = {
  bucketName: 'aurea-labs-files',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
}

// Configurações de RLS (Row Level Security)
export const RLS_CONFIG = {
  enabled: true,
  policies: {
    users: 'Users can only see their own data',
    clinics: 'Users can only see clinics they belong to',
    patients: 'Users can only see patients from their clinics',
    doctors: 'Users can only see doctors from their clinics',
    appointments: 'Users can only see appointments from their clinics'
  }
}

