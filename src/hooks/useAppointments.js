import { useState, useEffect, useCallback } from 'react';
import { Appointment, Business } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE CONSULTAS
// =====================================================

export const useAppointments = (filters = {}) => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Carregar consultas
  const loadAppointments = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...newFilters,
        clinic_id: userProfile.clinic_id || filters.clinic_id
      };

      const response = await Appointment.list(finalFilters, finalFilters.limit || 50, (finalFilters.page || 1 - 1) * (finalFilters.limit || 50));
      
      setAppointments(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.count,
        totalPages: response.total_pages
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar consultas');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Buscar consultas
  const searchAppointments = useCallback(async (searchTerm, searchFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...searchFilters,
        clinic_id: userProfile.clinic_id || filters.clinic_id,
        search: searchTerm
      };

      const response = await Appointment.search(searchTerm, finalFilters, finalFilters.limit || 50, 0);
      
      setAppointments(response.data);
      setPagination({
        page: 1,
        limit: response.count,
        total: response.count,
        totalPages: 1
      });
    } catch (err) {
      setError(err.message || 'Erro ao buscar consultas');
      console.error('Error searching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Obter consulta por ID
  const getAppointment = useCallback(async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const appointment = await Appointment.get(id);
      return appointment;
    } catch (err) {
      setError(err.message || 'Erro ao carregar consulta');
      console.error('Error getting appointment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar consulta
  const createAppointment = useCallback(async (appointmentData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newAppointment = await Appointment.create({
        ...appointmentData,
        clinic_id: userProfile.clinic_id
      });

      // Atualizar lista local
      setAppointments(prev => [newAppointment, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return newAppointment;
    } catch (err) {
      setError(err.message || 'Erro ao criar consulta');
      console.error('Error creating appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Atualizar consulta
  const updateAppointment = useCallback(async (id, appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAppointment = await Appointment.update(id, appointmentData);

      // Atualizar lista local
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));

      return updatedAppointment;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar consulta');
      console.error('Error updating appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar consulta
  const deleteAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await Appointment.delete(id);

      // Remover da lista local
      setAppointments(prev => prev.filter(a => a.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao deletar consulta');
      console.error('Error deleting appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar consulta
  const cancelAppointment = useCallback(async (id, reason, cancelledBy) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAppointment = await Appointment.update(id, {
        status: 'cancelado',
        cancellation_reason: reason,
        cancelled_by: cancelledBy
      });

      // Atualizar lista local
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));

      return updatedAppointment;
    } catch (err) {
      setError(err.message || 'Erro ao cancelar consulta');
      console.error('Error cancelling appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirmar consulta
  const confirmAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAppointment = await Appointment.update(id, {
        status: 'confirmado'
      });

      // Atualizar lista local
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));

      return updatedAppointment;
    } catch (err) {
      setError(err.message || 'Erro ao confirmar consulta');
      console.error('Error confirming appointment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar consultas na inicialização
  useEffect(() => {
    if (userProfile) {
      loadAppointments();
    }
  }, [userProfile, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    pagination,
    loadAppointments,
    searchAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    confirmAppointment,
    // Funções de paginação
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        loadAppointments({ ...filters, page: pagination.page + 1 });
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        loadAppointments({ ...filters, page: pagination.page - 1 });
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadAppointments({ ...filters, page });
      }
    }
  };
};

// =====================================================
// HOOK PARA CONSULTAS DO DIA
// =====================================================

export const useAppointmentsToday = () => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayAppointments = useCallback(async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const response = await Business.searchAppointments({
        clinic_id: userProfile.clinic_id,
        start_date: startOfDay.toISOString().split('T')[0],
        end_date: endOfDay.toISOString().split('T')[0]
      });

      setAppointments(response);
    } catch (err) {
      setError(err.message || 'Erro ao carregar consultas de hoje');
      console.error('Error loading today appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      loadTodayAppointments();
    }
  }, [userProfile, loadTodayAppointments]);

  return {
    appointments,
    loading,
    error,
    loadTodayAppointments
  };
};

// =====================================================
// HOOK PARA CONSULTAS POR MÉDICO
// =====================================================

export const useAppointmentsByDoctor = (doctorId) => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctorAppointments = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await Business.searchAppointments({
        clinic_id: userProfile.clinic_id,
        doctor_id: id
      });

      setAppointments(response);
    } catch (err) {
      setError(err.message || 'Erro ao carregar consultas do médico');
      console.error('Error loading doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (doctorId) {
      loadDoctorAppointments(doctorId);
    }
  }, [doctorId, loadDoctorAppointments]);

  return {
    appointments,
    loading,
    error,
    loadDoctorAppointments
  };
};

// =====================================================
// HOOK PARA ESTATÍSTICAS DE CONSULTAS
// =====================================================

export const useAppointmentStats = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar todas as consultas para calcular estatísticas
      const response = await Appointment.filter({
        clinic_id: userProfile.clinic_id
      });

      const appointments = response;
      const total = appointments.length;

      // Estatísticas por status
      const byStatus = appointments.reduce((acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por tipo
      const byType = appointments.reduce((acc, appointment) => {
        acc[appointment.type] = (acc[appointment.type] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por fonte
      const bySource = appointments.reduce((acc, appointment) => {
        acc[appointment.source] = (acc[appointment.source] || 0) + 1;
        return acc;
      }, {});

      // Consultas de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => 
        a.starts_at.startsWith(today)
      ).length;

      // Consultas desta semana
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const thisWeekCount = appointments.filter(a => 
        a.starts_at >= weekStartStr
      ).length;

      // Consultas deste mês
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const thisMonthCount = appointments.filter(a => 
        a.starts_at >= monthStartStr
      ).length;

      setStats({
        total,
        by_status: byStatus,
        by_type: byType,
        by_source: bySource,
        today: todayCount,
        this_week: thisWeekCount,
        this_month: thisMonthCount
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar estatísticas');
      console.error('Error loading appointment stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      loadStats();
    }
  }, [userProfile, loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats
  };
};
