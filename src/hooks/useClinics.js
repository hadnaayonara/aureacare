import { useState, useEffect, useCallback } from 'react';
import { Clinic, ClinicUser } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE CLÍNICAS
// =====================================================

export const useClinics = (filters = {}) => {
  const { userProfile } = useAuth();
  const [clinics, setClinics] = useState<ClinicType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Carregar clínicas
  const loadClinics = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...newFilters
      };

      // Admin pode ver todas as clínicas, outros só as suas
      if (userProfile.app_role !== 'admin') {
        finalFilters.created_by = userProfile.id;
      }

      const response = await Clinic.list(finalFilters, finalFilters.limit || 50, (finalFilters.page || 1 - 1) * (finalFilters.limit || 50));
      
      setClinics(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.count,
        totalPages: response.total_pages
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar clínicas');
      console.error('Error loading clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Buscar clínicas
  const searchClinics = useCallback(async (searchTerm, searchFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...searchFilters,
        search: searchTerm
      };

      // Admin pode ver todas as clínicas, outros só as suas
      if (userProfile.app_role !== 'admin') {
        finalFilters.created_by = userProfile.id;
      }

      const response = await Clinic.search(searchTerm, finalFilters, finalFilters.limit || 50, 0);
      
      setClinics(response.data);
      setPagination({
        page: 1,
        limit: response.count,
        total: response.count,
        totalPages: 1
      });
    } catch (err) {
      setError(err.message || 'Erro ao buscar clínicas');
      console.error('Error searching clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Obter clínica por ID
  const getClinic = useCallback(async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const clinic = await Clinic.get(id);
      return clinic;
    } catch (err) {
      setError(err.message || 'Erro ao carregar clínica');
      console.error('Error getting clinic:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar clínica
  const createClinic = useCallback(async (clinicData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newClinic = await Clinic.create({
        ...clinicData,
        created_by: userProfile.id
      });

      // Atualizar lista local
      setClinics(prev => [newClinic, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return newClinic;
    } catch (err) {
      setError(err.message || 'Erro ao criar clínica');
      console.error('Error creating clinic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Atualizar clínica
  const updateClinic = useCallback(async (id, clinicData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedClinic = await Clinic.update(id, clinicData);

      // Atualizar lista local
      setClinics(prev => prev.map(c => c.id === id ? updatedClinic : c));

      return updatedClinic;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar clínica');
      console.error('Error updating clinic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar clínica
  const deleteClinic = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await Clinic.delete(id);

      // Remover da lista local
      setClinics(prev => prev.filter(c => c.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao deletar clínica');
      console.error('Error deleting clinic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar clínicas na inicialização
  useEffect(() => {
    if (userProfile) {
      loadClinics();
    }
  }, [userProfile, loadClinics]);

  return {
    clinics,
    loading,
    error,
    pagination,
    loadClinics,
    searchClinics,
    getClinic,
    createClinic,
    updateClinic,
    deleteClinic,
    // Funções de paginação
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        loadClinics({ ...filters, page: pagination.page + 1 });
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        loadClinics({ ...filters, page: pagination.page - 1 });
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadClinics({ ...filters, page });
      }
    }
  };
};

// =====================================================
// HOOK PARA USUÁRIOS DA CLÍNICA
// =====================================================

export const useClinicUsers = (clinicId) => {
  const { userProfile } = useAuth();
  const [clinicUsers, setClinicUsers] = useState<ClinicUserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuários da clínica
  const loadClinicUsers = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ClinicUser.filter({
        clinic_id: id,
        is_active: true
      });

      setClinicUsers(response);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários da clínica');
      console.error('Error loading clinic users:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Adicionar usuário à clínica
  const addUserToClinic = useCallback(async (userId, role, doctorId = null, receptionId = null) => {
    if (!userProfile || !clinicId) throw new Error('Dados insuficientes');

    setLoading(true);
    setError(null);

    try {
      const newClinicUser = await ClinicUser.create({
        user_id: userId,
        clinic_id: clinicId,
        doctor_id: doctorId,
        reception_id: receptionId,
        role: role,
        invited_by: userProfile.id,
        is_active: true
      });

      // Atualizar lista local
      setClinicUsers(prev => [newClinicUser, ...prev]);

      return newClinicUser;
    } catch (err) {
      setError(err.message || 'Erro ao adicionar usuário à clínica');
      console.error('Error adding user to clinic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, clinicId]);

  // Remover usuário da clínica
  const removeUserFromClinic = useCallback(async (clinicUserId) => {
    setLoading(true);
    setError(null);

    try {
      await ClinicUser.delete(clinicUserId);

      // Remover da lista local
      setClinicUsers(prev => prev.filter(cu => cu.id !== clinicUserId));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao remover usuário da clínica');
      console.error('Error removing user from clinic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar role do usuário na clínica
  const updateUserRole = useCallback(async (clinicUserId, newRole) => {
    setLoading(true);
    setError(null);

    try {
      const updatedClinicUser = await ClinicUser.update(clinicUserId, {
        role: newRole
      });

      // Atualizar lista local
      setClinicUsers(prev => prev.map(cu => 
        cu.id === clinicUserId ? updatedClinicUser : cu
      ));

      return updatedClinicUser;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar role do usuário');
      console.error('Error updating user role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadClinicUsers(clinicId);
    }
  }, [clinicId, loadClinicUsers]);

  return {
    clinicUsers,
    loading,
    error,
    loadClinicUsers,
    addUserToClinic,
    removeUserFromClinic,
    updateUserRole
  };
};

// =====================================================
// HOOK PARA CLÍNICAS DO USUÁRIO
// =====================================================

export const useUserClinics = () => {
  const { userProfile } = useAuth();
  const [userClinics, setUserClinics] = useState<ClinicType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserClinics = useCallback(async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar clínicas do usuário através de clinic_users
      const clinicUsers = await ClinicUser.filter({
        user_id: userProfile.id,
        is_active: true
      });

      // Buscar detalhes das clínicas
      const clinicIds = clinicUsers.map(cu => cu.clinic_id);
      const clinics = [];

      for (const clinicId of clinicIds) {
        try {
          const clinic = await Clinic.get(clinicId);
          if (clinic) {
            clinics.push({
              ...clinic,
              userRole: clinicUsers.find(cu => cu.clinic_id === clinicId)?.role
            });
          }
        } catch (err) {
          console.error(`Error loading clinic ${clinicId}:`, err);
        }
      }

      setUserClinics(clinics);
    } catch (err) {
      setError(err.message || 'Erro ao carregar clínicas do usuário');
      console.error('Error loading user clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      loadUserClinics();
    }
  }, [userProfile, loadUserClinics]);

  return {
    userClinics,
    loading,
    error,
    loadUserClinics
  };
};
