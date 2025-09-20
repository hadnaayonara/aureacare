import { useState, useEffect, useCallback } from 'react';
import { MedicalRecord } from '@/api/entities';
import { useAuth } from '@/hooks/useAuth';

// =====================================================
// HOOK PARA GERENCIAMENTO DE PRONTUÁRIOS MÉDICOS
// =====================================================

export const useMedicalRecords = (filters = {}) => {
  const { userProfile } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Carregar prontuários
  const loadMedicalRecords = useCallback(async (newFilters = {}) => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ...filters,
        ...newFilters,
        clinic_id: userProfile.clinic_id || filters.clinic_id
      };

      const response = await MedicalRecord.list(finalFilters, finalFilters.limit || 50, (finalFilters.page || 1 - 1) * (finalFilters.limit || 50));
      
      setMedicalRecords(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.count,
        totalPages: response.total_pages
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar prontuários');
      console.error('Error loading medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Buscar prontuários
  const searchMedicalRecords = useCallback(async (searchTerm, searchFilters = {}) => {
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

      const response = await MedicalRecord.search(searchTerm, finalFilters, finalFilters.limit || 50, 0);
      
      setMedicalRecords(response.data);
      setPagination({
        page: 1,
        limit: response.count,
        total: response.count,
        totalPages: 1
      });
    } catch (err) {
      setError(err.message || 'Erro ao buscar prontuários');
      console.error('Error searching medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, filters]);

  // Obter prontuário por ID
  const getMedicalRecord = useCallback(async (id) => {
    if (!id) return null;

    setLoading(true);
    setError(null);

    try {
      const medicalRecord = await MedicalRecord.get(id);
      return medicalRecord;
    } catch (err) {
      setError(err.message || 'Erro ao carregar prontuário');
      console.error('Error getting medical record:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar prontuário
  const createMedicalRecord = useCallback(async (medicalRecordData) => {
    if (!userProfile) throw new Error('Usuário não autenticado');

    setLoading(true);
    setError(null);

    try {
      const newMedicalRecord = await MedicalRecord.create({
        ...medicalRecordData,
        clinic_id: userProfile.clinic_id,
        doctor_id: userProfile.id // Assumindo que o usuário é médico
      });

      // Atualizar lista local
      setMedicalRecords(prev => [newMedicalRecord, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      return newMedicalRecord;
    } catch (err) {
      setError(err.message || 'Erro ao criar prontuário');
      console.error('Error creating medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Atualizar prontuário
  const updateMedicalRecord = useCallback(async (id, medicalRecordData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedMedicalRecord = await MedicalRecord.update(id, medicalRecordData);

      // Atualizar lista local
      setMedicalRecords(prev => prev.map(mr => mr.id === id ? updatedMedicalRecord : mr));

      return updatedMedicalRecord;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar prontuário');
      console.error('Error updating medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar prontuário
  const deleteMedicalRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await MedicalRecord.delete(id);

      // Remover da lista local
      setMedicalRecords(prev => prev.filter(mr => mr.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err.message || 'Erro ao deletar prontuário');
      console.error('Error deleting medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar prontuários na inicialização
  useEffect(() => {
    if (userProfile) {
      loadMedicalRecords();
    }
  }, [userProfile, loadMedicalRecords]);

  return {
    medicalRecords,
    loading,
    error,
    pagination,
    loadMedicalRecords,
    searchMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    // Funções de paginação
    nextPage: () => {
      if (pagination.page < pagination.totalPages) {
        loadMedicalRecords({ ...filters, page: pagination.page + 1 });
      }
    },
    prevPage: () => {
      if (pagination.page > 1) {
        loadMedicalRecords({ ...filters, page: pagination.page - 1 });
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadMedicalRecords({ ...filters, page });
      }
    }
  };
};

// =====================================================
// HOOK PARA PRONTUÁRIOS DO PACIENTE
// =====================================================

export const usePatientMedicalRecords = (patientId) => {
  const { userProfile } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatientMedicalRecords = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await MedicalRecord.filter({
        patient_id: id,
        clinic_id: userProfile.clinic_id
      });

      // Ordenar por data de consulta (mais recente primeiro)
      const sortedRecords = response.sort((a, b) => 
        new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
      );

      setMedicalRecords(sortedRecords);
    } catch (err) {
      setError(err.message || 'Erro ao carregar prontuários do paciente');
      console.error('Error loading patient medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (patientId) {
      loadPatientMedicalRecords(patientId);
    }
  }, [patientId, loadPatientMedicalRecords]);

  return {
    medicalRecords,
    loading,
    error,
    loadPatientMedicalRecords
  };
};

// =====================================================
// HOOK PARA PRONTUÁRIOS DO MÉDICO
// =====================================================

export const useDoctorMedicalRecords = (doctorId) => {
  const { userProfile } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctorMedicalRecords = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await MedicalRecord.filter({
        doctor_id: id,
        clinic_id: userProfile.clinic_id
      });

      // Ordenar por data de consulta (mais recente primeiro)
      const sortedRecords = response.sort((a, b) => 
        new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
      );

      setMedicalRecords(sortedRecords);
    } catch (err) {
      setError(err.message || 'Erro ao carregar prontuários do médico');
      console.error('Error loading doctor medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (doctorId) {
      loadDoctorMedicalRecords(doctorId);
    }
  }, [doctorId, loadDoctorMedicalRecords]);

  return {
    medicalRecords,
    loading,
    error,
    loadDoctorMedicalRecords
  };
};

// =====================================================
// HOOK PARA HISTÓRICO MÉDICO COMPLETO
// =====================================================

export const useMedicalHistory = (patientId) => {
  const { userProfile } = useAuth();
  const [history, setHistory] = useState<MedicalRecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedicalHistory = useCallback(async (id) => {
    if (!userProfile || !id) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar todos os prontuários do paciente
      const response = await MedicalRecord.filter({
        patient_id: id,
        clinic_id: userProfile.clinic_id
      });

      // Ordenar por data de consulta (mais antigo primeiro para histórico cronológico)
      const sortedHistory = response.sort((a, b) => 
        new Date(a.consultation_date).getTime() - new Date(b.consultation_date).getTime()
      );

      setHistory(sortedHistory);
    } catch (err) {
      setError(err.message || 'Erro ao carregar histórico médico');
      console.error('Error loading medical history:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (patientId) {
      loadMedicalHistory(patientId);
    }
  }, [patientId, loadMedicalHistory]);

  return {
    history,
    loading,
    error,
    loadMedicalHistory
  };
};
