import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA REAL-TIME SUBSCRIPTIONS
// =====================================================

export const useRealtime = () => {
  const { userProfile } = useAuth();
  const subscriptions = useRef(new Map());

  // =====================================================
  // FUNÇÕES DE GERENCIAMENTO DE SUBSCRIPTIONS
  // =====================================================

  /**
   * Cria uma subscription para uma tabela específica
   * @param {string} table - Nome da tabela
   * @param {string} event - Tipo de evento (INSERT, UPDATE, DELETE)
   * @param {Function} callback - Função de callback
   * @param {string} filter - Filtro opcional (ex: "clinic_id=eq.123")
   * @returns {Object} - Objeto da subscription
   */
  const subscribe = useCallback((table, event, callback, filter = null) => {
    if (!userProfile) {
      console.warn('User not authenticated, cannot subscribe to real-time updates');
      return null;
    }

    const subscriptionKey = `${table}-${event}-${filter || 'all'}`;
    
    // Se já existe uma subscription para esta combinação, retornar a existente
    if (subscriptions.current.has(subscriptionKey)) {
      return subscriptions.current.get(subscriptionKey);
    }

    let query = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: event.toLowerCase(),
        schema: 'public',
        table: table,
        filter: filter
      }, callback);

    const subscription = query.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} ${event} events`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} ${event} events`);
      } else if (status === 'TIMED_OUT') {
        console.warn(`Timeout subscribing to ${table} ${event} events`);
      } else if (status === 'CLOSED') {
        console.log(`Unsubscribed from ${table} ${event} events`);
      }
    });

    // Armazenar a subscription
    subscriptions.current.set(subscriptionKey, subscription);

    return subscription;
  }, [userProfile]);

  /**
   * Remove uma subscription específica
   * @param {string} table - Nome da tabela
   * @param {string} event - Tipo de evento
   * @param {string} filter - Filtro usado na subscription
   */
  const unsubscribe = useCallback((table, event, filter = null) => {
    const subscriptionKey = `${table}-${event}-${filter || 'all'}`;
    const subscription = subscriptions.current.get(subscriptionKey);
    
    if (subscription) {
      supabase.removeChannel(subscription);
      subscriptions.current.delete(subscriptionKey);
      console.log(`Unsubscribed from ${table} ${event} events`);
    }
  }, []);

  /**
   * Remove todas as subscriptions
   */
  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
      console.log(`Unsubscribed from ${key}`);
    });
    subscriptions.current.clear();
  }, []);

  // =====================================================
  // SUBSCRIPTIONS ESPECÍFICAS POR ENTIDADE
  // =====================================================

  /**
   * Subscribe para mudanças em pacientes
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica (opcional)
   */
  const subscribeToPatients = useCallback((callback, clinicId = null) => {
    if (!userProfile) return null;

    const filter = clinicId ? `clinic_id=eq.${clinicId}` : null;
    
    return {
      insert: subscribe('patients', 'INSERT', callback, filter),
      update: subscribe('patients', 'UPDATE', callback, filter),
      delete: subscribe('patients', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  /**
   * Subscribe para mudanças em médicos
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica (opcional)
   */
  const subscribeToDoctors = useCallback((callback, clinicId = null) => {
    if (!userProfile) return null;

    const filter = clinicId ? `clinic_id=eq.${clinicId}` : null;
    
    return {
      insert: subscribe('doctors', 'INSERT', callback, filter),
      update: subscribe('doctors', 'UPDATE', callback, filter),
      delete: subscribe('doctors', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  /**
   * Subscribe para mudanças em consultas
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica (opcional)
   */
  const subscribeToAppointments = useCallback((callback, clinicId = null) => {
    if (!userProfile) return null;

    const filter = clinicId ? `clinic_id=eq.${clinicId}` : null;
    
    return {
      insert: subscribe('appointments', 'INSERT', callback, filter),
      update: subscribe('appointments', 'UPDATE', callback, filter),
      delete: subscribe('appointments', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  /**
   * Subscribe para mudanças em prontuários
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica (opcional)
   */
  const subscribeToMedicalRecords = useCallback((callback, clinicId = null) => {
    if (!userProfile) return null;

    const filter = clinicId ? `clinic_id=eq.${clinicId}` : null;
    
    return {
      insert: subscribe('medical_records', 'INSERT', callback, filter),
      update: subscribe('medical_records', 'UPDATE', callback, filter),
      delete: subscribe('medical_records', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  /**
   * Subscribe para mudanças em clínicas
   * @param {Function} callback - Função de callback
   */
  const subscribeToClinics = useCallback((callback) => {
    if (!userProfile) return null;
    
    return {
      insert: subscribe('clinics', 'INSERT', callback),
      update: subscribe('clinics', 'UPDATE', callback),
      delete: subscribe('clinics', 'DELETE', callback)
    };
  }, [userProfile, subscribe]);

  // =====================================================
  // SUBSCRIPTIONS ESPECÍFICAS PARA DASHBOARD
  // =====================================================

  /**
   * Subscribe para consultas de hoje
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica
   */
  const subscribeToTodayAppointments = useCallback((callback, clinicId) => {
    if (!userProfile || !clinicId) return null;

    const today = new Date().toISOString().split('T')[0];
    const filter = `clinic_id=eq.${clinicId},starts_at=gte.${today}T00:00:00,starts_at=lte.${today}T23:59:59`;
    
    return subscribe('appointments', 'INSERT', callback, filter);
  }, [userProfile, subscribe]);

  /**
   * Subscribe para consultas por médico
   * @param {Function} callback - Função de callback
   * @param {string} doctorId - ID do médico
   */
  const subscribeToDoctorAppointments = useCallback((callback, doctorId) => {
    if (!userProfile || !doctorId) return null;

    const filter = `doctor_id=eq.${doctorId}`;
    
    return {
      insert: subscribe('appointments', 'INSERT', callback, filter),
      update: subscribe('appointments', 'UPDATE', callback, filter),
      delete: subscribe('appointments', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  /**
   * Subscribe para prontuários por paciente
   * @param {Function} callback - Função de callback
   * @param {string} patientId - ID do paciente
   */
  const subscribeToPatientMedicalRecords = useCallback((callback, patientId) => {
    if (!userProfile || !patientId) return null;

    const filter = `patient_id=eq.${patientId}`;
    
    return {
      insert: subscribe('medical_records', 'INSERT', callback, filter),
      update: subscribe('medical_records', 'UPDATE', callback, filter),
      delete: subscribe('medical_records', 'DELETE', callback, filter)
    };
  }, [userProfile, subscribe]);

  // =====================================================
  // SUBSCRIPTIONS PARA NOTIFICAÇÕES
  // =====================================================

  /**
   * Subscribe para mudanças em logs de auditoria
   * @param {Function} callback - Função de callback
   * @param {string} clinicId - ID da clínica (opcional)
   */
  const subscribeToAuditLogs = useCallback((callback, clinicId = null) => {
    if (!userProfile) return null;

    const filter = clinicId ? `clinic_id=eq.${clinicId}` : null;
    
    return subscribe('audit_logs', 'INSERT', callback, filter);
  }, [userProfile, subscribe]);

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  /**
   * Verifica se há subscriptions ativas
   * @returns {boolean}
   */
  const hasActiveSubscriptions = useCallback(() => {
    return subscriptions.current.size > 0;
  }, []);

  /**
   * Obtém o número de subscriptions ativas
   * @returns {number}
   */
  const getActiveSubscriptionsCount = useCallback(() => {
    return subscriptions.current.size;
  }, []);

  /**
   * Obtém lista de subscriptions ativas
   * @returns {Array}
   */
  const getActiveSubscriptions = useCallback(() => {
    return Array.from(subscriptions.current.keys());
  }, []);

  // =====================================================
  // LIMPEZA AUTOMÁTICA
  // =====================================================

  // Limpar subscriptions quando o componente for desmontado
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  // Limpar subscriptions quando o usuário fizer logout
  useEffect(() => {
    if (!userProfile) {
      unsubscribeAll();
    }
  }, [userProfile, unsubscribeAll]);

  return {
    // Funções básicas
    subscribe,
    unsubscribe,
    unsubscribeAll,
    
    // Subscriptions específicas por entidade
    subscribeToPatients,
    subscribeToDoctors,
    subscribeToAppointments,
    subscribeToMedicalRecords,
    subscribeToClinics,
    
    // Subscriptions para dashboard
    subscribeToTodayAppointments,
    subscribeToDoctorAppointments,
    subscribeToPatientMedicalRecords,
    
    // Subscriptions para notificações
    subscribeToAuditLogs,
    
    // Utilitários
    hasActiveSubscriptions,
    getActiveSubscriptionsCount,
    getActiveSubscriptions
  };
};

// =====================================================
// HOOK ESPECÍFICO PARA CONSULTAS EM TEMPO REAL
// =====================================================

export const useRealtimeAppointments = (clinicId) => {
  const { subscribeToAppointments } = useRealtime();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAppointmentChange = useCallback((payload) => {
    console.log('Appointment change:', payload);
    
    setAppointments(prev => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(appointment => 
            appointment.id === newRecord.id ? newRecord : appointment
          );
        case 'DELETE':
          return prev.filter(appointment => appointment.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  }, []);

  useEffect(() => {
    if (clinicId) {
      const subscriptions = subscribeToAppointments(handleAppointmentChange, clinicId);
      
      return () => {
        if (subscriptions) {
          Object.values(subscriptions).forEach(sub => {
            if (sub) {
              supabase.removeChannel(sub);
            }
          });
        }
      };
    }
  }, [clinicId, subscribeToAppointments, handleAppointmentChange]);

  return {
    appointments,
    loading,
    setAppointments
  };
};

// =====================================================
// HOOK ESPECÍFICO PARA PACIENTES EM TEMPO REAL
// =====================================================

export const useRealtimePatients = (clinicId) => {
  const { subscribeToPatients } = useRealtime();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePatientChange = useCallback((payload) => {
    console.log('Patient change:', payload);
    
    setPatients(prev => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(patient => 
            patient.id === newRecord.id ? newRecord : patient
          );
        case 'DELETE':
          return prev.filter(patient => patient.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  }, []);

  useEffect(() => {
    if (clinicId) {
      const subscriptions = subscribeToPatients(handlePatientChange, clinicId);
      
      return () => {
        if (subscriptions) {
          Object.values(subscriptions).forEach(sub => {
            if (sub) {
              supabase.removeChannel(sub);
            }
          });
        }
      };
    }
  }, [clinicId, subscribeToPatients, handlePatientChange]);

  return {
    patients,
    loading,
    setPatients
  };
};

// =====================================================
// HOOK PARA RECONEXÃO AUTOMÁTICA
// =====================================================

export const useRealtimeConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel.on('system', {}, (payload) => {
      if (payload.status === 'ok') {
        setIsConnected(true);
        setConnectionStatus('CONNECTED');
      } else {
        setIsConnected(false);
        setConnectionStatus('DISCONNECTED');
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setConnectionStatus('CONNECTED');
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        setConnectionStatus('ERROR');
      } else if (status === 'TIMED_OUT') {
        setIsConnected(false);
        setConnectionStatus('TIMEOUT');
      } else if (status === 'CLOSED') {
        setIsConnected(false);
        setConnectionStatus('DISCONNECTED');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isConnected,
    connectionStatus
  };
};
