import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE NOTIFICAÇÕES
// =====================================================

export const useNotifications = (filters = {}) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // =====================================================
  // FUNÇÕES DE CRUD
  // =====================================================

  // Carregar notificações
  const loadNotifications = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      const finalFilters = { ...filters, ...newFilters };
      
      if (finalFilters.type) {
        query = query.eq('type', finalFilters.type);
      }
      
      if (finalFilters.read !== undefined) {
        query = query.eq('read', finalFilters.read);
      }

      if (finalFilters.limit) {
        query = query.limit(finalFilters.limit);
      }

      if (finalFilters.offset) {
        query = query.range(finalFilters.offset, finalFilters.offset + (finalFilters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      setNotifications(data || []);
      
      // Calcular notificações não lidas
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);

    } catch (err) {
      setError(err.message || 'Erro ao carregar notificações');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Criar notificação
  const createNotification = useCallback(async (notificationData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          user_id: userProfile.id
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar à lista local
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);

      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }, [userProfile]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar lista local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true, updated_at: new Date().toISOString() } : n
      ));

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.id)
        .eq('read', false);

      if (error) throw error;

      // Atualizar lista local
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        read: true, 
        updated_at: new Date().toISOString() 
      })));

      setUnreadCount(0);

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [userProfile]);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Remover da lista local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Atualizar contador se não estava lida
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  // =====================================================
  // SUBSCRIPTION PARA REAL-TIME
  // =====================================================

  useEffect(() => {
    if (!userProfile) return;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userProfile.id}`
      }, (payload) => {
        console.log('New notification received:', payload);
        
        const newNotification = payload.new;
        setNotifications(prev => [newNotification, ...prev]);
        
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }

        // Mostrar notificação do browser se suportado
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png',
            tag: newNotification.id
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userProfile.id}`
      }, (payload) => {
        console.log('Notification updated:', payload);
        
        const updatedNotification = payload.new;
        setNotifications(prev => prev.map(n => 
          n.id === updatedNotification.id ? updatedNotification : n
        ));
        
        // Recalcular contador não lidas
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    if (userProfile) {
      loadNotifications();
    }
  }, [userProfile, loadNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

// =====================================================
// HOOK PARA NOTIFICAÇÕES ESPECÍFICAS
// =====================================================

export const useNotificationService = () => {
  const { userProfile } = useAuth();

  // Notificação de nova consulta
  const notifyNewAppointment = useCallback(async (appointmentData, doctorName, patientName) => {
    if (!userProfile) return;

    const notification = {
      title: 'Nova Consulta Agendada',
      message: `Consulta agendada para ${patientName} com Dr(a). ${doctorName} em ${new Date(appointmentData.starts_at).toLocaleString('pt-BR')}`,
      type: 'info',
      data: {
        appointment_id: appointmentData.id,
        patient_id: appointmentData.patient_id,
        doctor_id: appointmentData.doctor_id,
        clinic_id: appointmentData.clinic_id
      }
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating appointment notification:', error);
    }
  }, [userProfile]);

  // Notificação de consulta cancelada
  const notifyCancelledAppointment = useCallback(async (appointmentData, reason) => {
    if (!userProfile) return;

    const notification = {
      title: 'Consulta Cancelada',
      message: `Consulta com ${appointmentData.patient_name} foi cancelada. Motivo: ${reason}`,
      type: 'warning',
      data: {
        appointment_id: appointmentData.id,
        patient_id: appointmentData.patient_id,
        doctor_id: appointmentData.doctor_id,
        clinic_id: appointmentData.clinic_id
      }
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating cancellation notification:', error);
    }
  }, [userProfile]);

  // Notificação de lembrete de consulta
  const notifyAppointmentReminder = useCallback(async (appointmentData, timeUntil) => {
    if (!userProfile) return;

    const notification = {
      title: 'Lembrete de Consulta',
      message: `Consulta com ${appointmentData.patient_name} em ${timeUntil}`,
      type: 'info',
      data: {
        appointment_id: appointmentData.id,
        patient_id: appointmentData.patient_id,
        doctor_id: appointmentData.doctor_id,
        clinic_id: appointmentData.clinic_id
      }
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating reminder notification:', error);
    }
  }, [userProfile]);

  // Notificação de novo paciente
  const notifyNewPatient = useCallback(async (patientData) => {
    if (!userProfile) return;

    const notification = {
      title: 'Novo Paciente Cadastrado',
      message: `Paciente ${patientData.full_name} foi cadastrado no sistema`,
      type: 'success',
      data: {
        patient_id: patientData.id,
        clinic_id: patientData.clinic_id
      }
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating patient notification:', error);
    }
  }, [userProfile]);

  // Notificação de novo médico
  const notifyNewDoctor = useCallback(async (doctorData) => {
    if (!userProfile) return;

    const notification = {
      title: 'Novo Médico Cadastrado',
      message: `Dr(a). ${doctorData.full_name} foi cadastrado na clínica`,
      type: 'success',
      data: {
        doctor_id: doctorData.id,
        clinic_id: doctorData.clinic_id
      }
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating doctor notification:', error);
    }
  }, [userProfile]);

  // Notificação de erro do sistema
  const notifySystemError = useCallback(async (errorMessage, errorData = null) => {
    if (!userProfile) return;

    const notification = {
      title: 'Erro do Sistema',
      message: errorMessage,
      type: 'error',
      data: errorData
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating system error notification:', error);
    }
  }, [userProfile]);

  // Notificação de sucesso
  const notifySuccess = useCallback(async (title, message, data = null) => {
    if (!userProfile) return;

    const notification = {
      title,
      message,
      type: 'success',
      data
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating success notification:', error);
    }
  }, [userProfile]);

  // Notificação de aviso
  const notifyWarning = useCallback(async (title, message, data = null) => {
    if (!userProfile) return;

    const notification = {
      title,
      message,
      type: 'warning',
      data
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating warning notification:', error);
    }
  }, [userProfile]);

  // Notificação de informação
  const notifyInfo = useCallback(async (title, message, data = null) => {
    if (!userProfile) return;

    const notification = {
      title,
      message,
      type: 'info',
      data
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userProfile.id
        });
    } catch (error) {
      console.error('Error creating info notification:', error);
    }
  }, [userProfile]);

  return {
    notifyNewAppointment,
    notifyCancelledAppointment,
    notifyAppointmentReminder,
    notifyNewPatient,
    notifyNewDoctor,
    notifySystemError,
    notifySuccess,
    notifyWarning,
    notifyInfo
  };
};

// =====================================================
// HOOK PARA PERMISSÕES DE NOTIFICAÇÃO DO BROWSER
// =====================================================

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const showNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, []);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window
  };
};
