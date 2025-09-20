import { useState, useEffect, useCallback } from 'react';
import { Patient, Business } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE PACIENTES
// =====================================================

export const usePatients = (filters = {}) => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Carregar pacientes
  const loadPatients = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...newFilters,
        clinic_id: userProfile.clinic_id || filters.clinic_id
      };

      const response = await Patient.list(finalFilters, finalFilters.limit || 50, (finalFilters.page || 1 - 1) * (finalFilters.limit || 50));
      
      setPatients(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.count,
        totalPages: response.total_pages
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar pacientes');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Buscar pacientes
  const searchPatients = useCallback(async (searchTerm, searchFilters = {}) => {
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

      const response = await Patient.search(searchTerm, finalFilters, finalFilters.limit || 50, 0);
      
      setPatients(response.data);
      setPagination({
        page: 1,
        limit: response.count,
        total: response.count,
        totalPages: 1
      });
    } catch (err) {
      setError(err.message || 'Erro ao buscar pacientes');
      console.error('Error searching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Obter paciente por ID
  const getPatient = useCallback(async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const patient = await Patient.get(id);
      return patient;
    } catch (err) {
      setError(err.message || 'Erro ao carregar paciente');
      console.error('Error getting patient:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar paciente
  const createPatient = useCallback(async (patientData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newPatient = await Patient.create({
        ...patientData,
        clinic_id: userProfile.clinic_id,
        owning_host_id: userProfile.id
      });

      // Atualizar lista local
      setPatients(prev => [newPatient, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return newPatient;
    } catch (err) {
      setError(err.message || 'Erro ao criar paciente');
      console.error('Error creating patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Atualizar paciente
  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedPatient = await Patient.update(id, patientData);

      // Atualizar lista local
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));

      return updatedPatient;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar paciente');
      console.error('Error updating patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar paciente
  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await Patient.delete(id);

      // Remover da lista local
      setPatients(prev => prev.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao deletar paciente');
      console.error('Error deleting patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar múltiplos pacientes
  const bulkCreatePatients = useCallback(async (patientsData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const patientsWithClinic = patientsData.map(patient => ({
        ...patient,
        clinic_id: userProfile.clinic_id,
        owning_host_id: userProfile.id
      }));

      const newPatients = await Patient.bulkCreate(patientsWithClinic);

      // Atualizar lista local
      setPatients(prev => [...newPatients, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + newPatients.length }));

      return newPatients;
    } catch (err) {
      setError(err.message || 'Erro ao criar pacientes');
      console.error('Error bulk creating patients:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Carregar pacientes na inicialização
  useEffect(() => {
    if (userProfile) {
      loadPatients();
    }
  }, [userProfile, loadPatients]);

  return {
    patients,
    loading,
    error,
    pagination,
    loadPatients,
    searchPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    bulkCreatePatients,
    // Funções de paginação
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        loadPatients({ ...filters, page: pagination.page + 1 });
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        loadPatients({ ...filters, page: pagination.page - 1 });
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadPatients({ ...filters, page });
      }
    }
  };
};

// =====================================================
// HOOK PARA BUSCA AVANÇADA DE PACIENTES
// =====================================================

export const usePatientSearch = () => {
  const { userProfile } = useAuth();
  const [searchResults, setSearchResults] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm, filters = {}) => {
    if (!userProfile || !searchTerm) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Business.searchPatients({
        search: searchTerm,
        clinic_id: userProfile.clinic_id,
        ...filters
      });

      setSearchResults(results);
    } catch (err) {
      setError(err.message || 'Erro na busca de pacientes');
      console.error('Error in patient search:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    clearSearch
  };
};

// =====================================================
// HOOK PARA ESTATÍSTICAS DE PACIENTES
// =====================================================

export const usePatientStats = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Implementar função de estatísticas quando disponível
      const patientStats = await Patient.filter({
        clinic_id: userProfile.clinic_id,
        is_active: true
      });

      const total = patientStats.length;
      const active = patientStats.filter(p => p.is_active).length;
      const inactive = total - active;

      const byGender = patientStats.reduce((acc, patient) => {
        acc[patient.gender] = (acc[patient.gender] || 0) + 1;
        return acc;
      }, {});

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = patientStats.filter(p => 
        new Date(p.created_at) >= thisMonth
      ).length;

      setStats({
        total,
        active,
        inactive,
        by_gender: byGender,
        new_this_month: newThisMonth
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar estatísticas');
      console.error('Error loading patient stats:', err);
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
