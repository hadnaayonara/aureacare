import { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE MÉDICOS
// =====================================================

export const useDoctors = (filters = {}) => {
  const { userProfile } = useAuth();
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Carregar médicos
  const loadDoctors = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...newFilters,
        clinic_id: userProfile.clinic_id || filters.clinic_id
      };

      const response = await Doctor.list(finalFilters, finalFilters.limit || 50, (finalFilters.page || 1 - 1) * (finalFilters.limit || 50));
      
      setDoctors(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.count,
        totalPages: response.total_pages
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar médicos');
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Buscar médicos
  const searchDoctors = useCallback(async (searchTerm, searchFilters = {}) => {
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

      const response = await Doctor.search(searchTerm, finalFilters, finalFilters.limit || 50, 0);
      
      setDoctors(response.data);
      setPagination({
        page: 1,
        limit: response.count,
        total: response.count,
        totalPages: 1
      });
    } catch (err) {
      setError(err.message || 'Erro ao buscar médicos');
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Obter médico por ID
  const getDoctor = useCallback(async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const doctor = await Doctor.get(id);
      return doctor;
    } catch (err) {
      setError(err.message || 'Erro ao carregar médico');
      console.error('Error getting doctor:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar médico
  const createDoctor = useCallback(async (doctorData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newDoctor = await Doctor.create({
        ...doctorData,
        clinic_id: userProfile.clinic_id
      });

      // Atualizar lista local
      setDoctors(prev => [newDoctor, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return newDoctor;
    } catch (err) {
      setError(err.message || 'Erro ao criar médico');
      console.error('Error creating doctor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Atualizar médico
  const updateDoctor = useCallback(async (id, doctorData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedDoctor = await Doctor.update(id, doctorData);

      // Atualizar lista local
      setDoctors(prev => prev.map(d => d.id === id ? updatedDoctor : d));

      return updatedDoctor;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar médico');
      console.error('Error updating doctor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar médico
  const deleteDoctor = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await Doctor.delete(id);

      // Remover da lista local
      setDoctors(prev => prev.filter(d => d.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao deletar médico');
      console.error('Error deleting doctor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar médicos do Excel
  const importDoctors = useCallback(async (file) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      // Implementar importação quando a função estiver disponível
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clinic_id', userProfile.clinic_id);

      // Simular importação por enquanto
      const result = await Doctor.bulkCreate([]);
      
      return result;
    } catch (err) {
      setError(err.message || 'Erro ao importar médicos');
      console.error('Error importing doctors:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Carregar médicos na inicialização
  useEffect(() => {
    if (userProfile) {
      loadDoctors();
    }
  }, [userProfile, loadDoctors]);

  return {
    doctors,
    loading,
    error,
    pagination,
    loadDoctors,
    searchDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    importDoctors,
    // Funções de paginação
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        loadDoctors({ ...filters, page: pagination.page + 1 });
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        loadDoctors({ ...filters, page: pagination.page - 1 });
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadDoctors({ ...filters, page });
      }
    }
  };
};

// =====================================================
// HOOK PARA BUSCA DE MÉDICOS POR ESPECIALIDADE
// =====================================================

export const useDoctorsBySpecialty = (specialty) => {
  const { userProfile } = useAuth();
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctorsBySpecialty = useCallback(async (specialtyName) => {
    if (!userProfile || !specialtyName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await Doctor.filter({
        clinic_id: userProfile.clinic_id,
        main_specialty: specialtyName,
        has_system_access: true
      });

      setDoctors(response);
    } catch (err) {
      setError(err.message || 'Erro ao carregar médicos por especialidade');
      console.error('Error loading doctors by specialty:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (specialty) {
      loadDoctorsBySpecialty(specialty);
    }
  }, [specialty, loadDoctorsBySpecialty]);

  return {
    doctors,
    loading,
    error,
    loadDoctorsBySpecialty
  };
};

// =====================================================
// HOOK PARA GERENCIAMENTO DE AGENDA DO MÉDICO
// =====================================================

export const useDoctorSchedule = (doctorId) => {
  const { userProfile } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const doctor = await Doctor.get(id);
      setSchedule(doctor?.availability_schedule || null);
    } catch (err) {
      setError(err.message || 'Erro ao carregar agenda do médico');
      console.error('Error loading doctor schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const updateSchedule = useCallback(async (id, scheduleData) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const updatedDoctor = await Doctor.update(id, {
        availability_schedule: scheduleData
      });

      setSchedule(scheduleData);
      return updatedDoctor;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar agenda do médico');
      console.error('Error updating doctor schedule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (doctorId) {
      loadSchedule(doctorId);
    }
  }, [doctorId, loadSchedule]);

  return {
    schedule,
    loading,
    error,
    loadSchedule,
    updateSchedule
  };
};
