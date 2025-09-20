// =====================================================
// CLIENTE SUPABASE REAL - AUREA LABS
// =====================================================

import { supabase, supabaseAdmin } from '@/lib/supabase'

// =====================================================
// CLASSE PRINCIPAL DO CLIENTE
// =====================================================

class SupabaseApiClient {
  constructor() {
    this.entities = new SupabaseEntities()
    this.auth = new SupabaseAuth()
    this.functions = new SupabaseFunctions()
    this.integrations = new SupabaseIntegrations()
  }
}

// =====================================================
// ENTIDADES SUPABASE
// =====================================================

class SupabaseEntities {
  constructor() {
    this.Patient = new SupabaseEntity('patients', 'Patient')
    this.Appointment = new SupabaseEntity('appointments', 'Appointment')
    this.MedicalRecord = new SupabaseEntity('medical_records', 'MedicalRecord')
    this.Doctor = new SupabaseEntity('doctors', 'Doctor')
    this.Clinic = new SupabaseEntity('clinics', 'Clinic')
    this.ClinicUser = new SupabaseEntity('clinic_users', 'ClinicUser')
    this.PatientAssignment = new SupabaseEntity('patient_assignments', 'PatientAssignment')
    this.AuditLog = new SupabaseEntity('audit_logs', 'AuditLog')
    this.UserApiKey = new SupabaseEntity('user_api_keys', 'UserApiKey')
    this.UserRegistration = new SupabaseEntity('user_registrations', 'UserRegistration')
    this.NewsletterSubscriber = new SupabaseEntity('newsletter_subscribers', 'NewsletterSubscriber')
    this.Reception = new SupabaseEntity('receptions', 'Reception')
    this.Exam = new SupabaseEntity('exams', 'Exam')
    this.User = new SupabaseEntity('users', 'User')
  }
}

// =====================================================
// ENTIDADE GENÉRICA SUPABASE
// =====================================================

class SupabaseEntity {
  constructor(tableName, entityName) {
    this.tableName = tableName
    this.entityName = entityName
  }

  async list(filters = {}, limit = 50, offset = 0) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id)
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      // Aplicar paginação
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        count: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error(`Error in ${this.entityName}.list():`, error)
      throw error
    }
  }

  async get(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error in ${this.entityName}.get(${id}):`, error)
      throw error
    }
  }

  async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error(`Error in ${this.entityName}.create():`, error)
      throw error
    }
  }

  async update(id, data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error(`Error in ${this.entityName}.update(${id}):`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error in ${this.entityName}.delete(${id}):`, error)
      throw error
    }
  }

  async filter(criteria, limit = 50) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Aplicar critérios de filtro
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      query = query.limit(limit).order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error in ${this.entityName}.filter():`, error)
      throw error
    }
  }

  async bulkCreate(items) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(items)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error in ${this.entityName}.bulkCreate():`, error)
      throw error
    }
  }

  async search(searchTerm, filters = {}, limit = 50, offset = 0) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Busca por termo
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        count: count || 0,
        query: searchTerm,
        filters
      }
    } catch (error) {
      console.error(`Error in ${this.entityName}.search():`, error)
      throw error
    }
  }
}

// =====================================================
// AUTENTICAÇÃO SUPABASE
// =====================================================

class SupabaseAuth {
  async me() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Buscar dados do perfil na tabela users
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return {
        ...user,
        ...userProfile
      }
    } catch (error) {
      console.error('Error in auth.me():', error)
      throw error
    }
  }

  async login(redirectUrl = '/dashboard') {
    try {
      // O login é gerenciado pelo AuthContext
      return true
    } catch (error) {
      console.error('Error in auth.login():', error)
      throw error
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error in auth.logout():', error)
      throw error
    }
  }

  async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Error in auth.isAuthenticated():', error)
      return false
    }
  }

  async updateMyUserData(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: result, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error in auth.updateMyUserData():', error)
      throw error
    }
  }
}

// =====================================================
// FUNÇÕES SUPABASE
// =====================================================

class SupabaseFunctions {
  constructor() {
    this.agentGateway = new SupabaseFunction('agent_gateway')
    this.generateApiKeyForUser = new SupabaseFunction('generate_api_key_for_user')
    this.sendReminder = new SupabaseFunction('send_reminder')
    this.subscribeNewsletter = new SupabaseFunction('subscribe_newsletter')
    this.importDoctorsFromExcel = new SupabaseFunction('import_doctors_from_excel')
    this.exportPatientHistory = new SupabaseFunction('export_patient_history')
    this.exportDoctorProfile = new SupabaseFunction('export_doctor_profile')
    this.exportFullReport = new SupabaseFunction('export_full_report')
    this.importPatientsFromExcel = new SupabaseFunction('import_patients_from_excel')
  }
}

class SupabaseFunction {
  constructor(functionName) {
    this.functionName = functionName
  }

  async invoke(...args) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: args.length === 1 ? args[0] : args
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error(`Error in function ${this.functionName}.invoke():`, error)
      return { success: false, error: error.message }
    }
  }
}

// =====================================================
// INTEGRAÇÕES SUPABASE
// =====================================================

class SupabaseIntegrations {
  constructor() {
    this.Core = new SupabaseCoreIntegration()
  }
}

class SupabaseCoreIntegration {
  constructor() {
    this.InvokeLLM = new SupabaseIntegration('invoke_llm')
    this.SendEmail = new SupabaseIntegration('send_email')
    this.UploadFile = new SupabaseIntegration('upload_file')
    this.GenerateImage = new SupabaseIntegration('generate_image')
    this.ExtractDataFromUploadedFile = new SupabaseIntegration('extract_data_from_uploaded_file')
    this.CreateFileSignedUrl = new SupabaseIntegration('create_file_signed_url')
    this.UploadPrivateFile = new SupabaseIntegration('upload_private_file')
  }
}

class SupabaseIntegration {
  constructor(integrationName) {
    this.integrationName = integrationName
  }

  async invoke(...args) {
    try {
      // Implementar integrações específicas conforme necessário
      console.log(`Integration ${this.integrationName}.invoke()`, args)
      return { success: true, data: null }
    } catch (error) {
      console.error(`Error in integration ${this.integrationName}.invoke():`, error)
      return { success: false, error: error.message }
    }
  }
}

// =====================================================
// FUNÇÕES ESPECÍFICAS DO NEGÓCIO
// =====================================================

class BusinessFunctions {
  // Buscar pacientes com filtros avançados
  async searchPatients(filters = {}) {
    try {
      const { data, error } = await supabase.rpc('search_patients', {
        search_term: filters.search || null,
        clinic_uuid: filters.clinic_id || null,
        limit_count: filters.limit || 50,
        offset_count: filters.offset || 0
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error in searchPatients():', error)
      throw error
    }
  }

  // Buscar consultas com filtros avançados
  async searchAppointments(filters = {}) {
    try {
      const { data, error } = await supabase.rpc('search_appointments', {
        search_term: filters.search || null,
        clinic_uuid: filters.clinic_id || null,
        doctor_uuid: filters.doctor_id || null,
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        status_filter: filters.status || null,
        limit_count: filters.limit || 50,
        offset_count: filters.offset || 0
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error in searchAppointments():', error)
      throw error
    }
  }

  // Obter estatísticas do dashboard
  async getDashboardStats(clinicId = null, startDate = null, endDate = null) {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        clinic_uuid: clinicId,
        start_date: startDate,
        end_date: endDate
      })

      if (error) throw error
      return data?.[0] || {}
    } catch (error) {
      console.error('Error in getDashboardStats():', error)
      throw error
    }
  }

  // Criar API key para usuário
  async createUserApiKey(userId, keyName = 'Default API Key') {
    try {
      const { data, error } = await supabase.rpc('create_user_api_key', {
        user_uuid: userId,
        key_name: keyName
      })

      if (error) throw error
      return data?.[0] || {}
    } catch (error) {
      console.error('Error in createUserApiKey():', error)
      throw error
    }
  }

  // Validar API key
  async validateApiKey(apiKey) {
    try {
      const { data, error } = await supabase.rpc('validate_api_key', {
        api_key: apiKey
      })

      if (error) throw error
      return data?.[0] || { user_id: null, is_valid: false }
    } catch (error) {
      console.error('Error in validateApiKey():', error)
      throw error
    }
  }
}

// =====================================================
// INSTÂNCIA DO CLIENTE
// =====================================================

const apiClient = new SupabaseApiClient()

// Adicionar funções de negócio ao cliente
apiClient.business = new BusinessFunctions()

export { apiClient }
export default apiClient