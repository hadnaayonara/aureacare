import { useAuth } from '@/hooks/useAuth';

// =====================================================
// SERVIÇO DE PERMISSÕES - AUREA LABS
// =====================================================

class PermissionService {
  constructor() {
    this.permissions = this.initializePermissions();
  }

  // =====================================================
  // INICIALIZAÇÃO DAS PERMISSÕES
  // =====================================================

  initializePermissions() {
    return {
      // Permissões globais por role
      global: {
        admin: {
          users: ['create', 'read', 'update', 'delete'],
          clinics: ['create', 'read', 'update', 'delete'],
          doctors: ['create', 'read', 'update', 'delete'],
          patients: ['create', 'read', 'update', 'delete'],
          appointments: ['create', 'read', 'update', 'delete'],
          medical_records: ['create', 'read', 'update', 'delete'],
          exams: ['create', 'read', 'update', 'delete'],
          audit_logs: ['read'],
          system_settings: ['read', 'update']
        },
        host: {
          users: ['read', 'update'], // Apenas usuários de suas clínicas
          clinics: ['create', 'read', 'update'], // Apenas suas clínicas
          doctors: ['create', 'read', 'update', 'delete'],
          patients: ['create', 'read', 'update', 'delete'],
          appointments: ['create', 'read', 'update', 'delete'],
          medical_records: ['read'], // Pode ler todos da clínica
          exams: ['read'],
          audit_logs: ['read'],
          system_settings: ['read']
        },
        doctor: {
          users: ['read'], // Apenas próprios dados
          clinics: ['read'], // Apenas clínicas que pertence
          doctors: ['read', 'update'], // Apenas próprios dados
          patients: ['read'], // Apenas pacientes atribuídos
          appointments: ['read', 'update'], // Apenas próprias consultas
          medical_records: ['create', 'read', 'update'], // Apenas próprios prontuários
          exams: ['read'],
          audit_logs: [], // Sem acesso
          system_settings: []
        },
        reception: {
          users: ['read'], // Apenas dados básicos
          clinics: ['read'], // Apenas clínicas que pertence
          doctors: ['read'],
          patients: ['create', 'read', 'update'], // Pode gerenciar pacientes
          appointments: ['create', 'read', 'update', 'delete'], // Pode gerenciar consultas
          medical_records: ['read'], // Apenas leitura
          exams: ['read'],
          audit_logs: [], // Sem acesso
          system_settings: []
        },
        guest: {
          users: ['read'], // Apenas próprios dados
          clinics: ['read'], // Apenas clínicas que pertence
          doctors: ['read'],
          patients: [],
          appointments: [],
          medical_records: [],
          exams: ['read'],
          audit_logs: [],
          system_settings: []
        }
      },

      // Permissões específicas por role na clínica
      clinic: {
        owner: {
          users: ['read', 'update', 'delete'], // Usuários da clínica
          doctors: ['create', 'read', 'update', 'delete'],
          patients: ['create', 'read', 'update', 'delete'],
          appointments: ['create', 'read', 'update', 'delete'],
          medical_records: ['read'], // Pode ler todos da clínica
          clinic_settings: ['read', 'update'],
          billing: ['read', 'update']
        },
        admin: {
          users: ['read', 'update'], // Usuários da clínica
          doctors: ['create', 'read', 'update', 'delete'],
          patients: ['create', 'read', 'update', 'delete'],
          appointments: ['create', 'read', 'update', 'delete'],
          medical_records: ['read'], // Pode ler todos da clínica
          clinic_settings: ['read', 'update'],
          billing: ['read']
        },
        doctor: {
          users: ['read'], // Dados básicos
          doctors: ['read', 'update'], // Apenas próprios dados
          patients: ['read'], // Apenas pacientes atribuídos
          appointments: ['read', 'update'], // Apenas próprias consultas
          medical_records: ['create', 'read', 'update'], // Apenas próprios prontuários
          clinic_settings: ['read'],
          billing: []
        },
        reception: {
          users: ['read'], // Dados básicos
          doctors: ['read'],
          patients: ['create', 'read', 'update'], // Pode gerenciar pacientes
          appointments: ['create', 'read', 'update', 'delete'], // Pode gerenciar consultas
          medical_records: ['read'], // Apenas leitura
          clinic_settings: ['read'],
          billing: []
        }
      }
    };
  }

  // =====================================================
  // VERIFICAÇÃO DE PERMISSÕES
  // =====================================================

  /**
   * Verifica se o usuário tem permissão para uma ação específica
   * @param {string} userRole - Role global do usuário (admin, host, doctor, reception, guest)
   * @param {string} clinicRole - Role do usuário na clínica (owner, admin, doctor, reception)
   * @param {string} resource - Recurso (users, clinics, doctors, etc.)
   * @param {string} action - Ação (create, read, update, delete)
   * @param {string} clinicId - ID da clínica (opcional)
   * @returns {boolean}
   */
  hasPermission(userRole, clinicRole, resource, action, clinicId = null) {
    // Admin global tem acesso a tudo
    if (userRole === 'admin') {
      return true;
    }

    // Verificar permissões globais
    const globalPermissions = this.permissions.global[userRole];
    if (globalPermissions && globalPermissions[resource]?.includes(action)) {
      return true;
    }

    // Verificar permissões específicas da clínica
    if (clinicRole && clinicId) {
      const clinicPermissions = this.permissions.clinic[clinicRole];
      if (clinicPermissions && clinicPermissions[resource]?.includes(action)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica se o usuário pode acessar um recurso específico
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @param {string} resource - Recurso
   * @returns {boolean}
   */
  canAccessResource(userRole, clinicRole, resource) {
    return this.hasPermission(userRole, clinicRole, resource, 'read');
  }

  /**
   * Verifica se o usuário pode criar um recurso
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @param {string} resource - Recurso
   * @returns {boolean}
   */
  canCreateResource(userRole, clinicRole, resource) {
    return this.hasPermission(userRole, clinicRole, resource, 'create');
  }

  /**
   * Verifica se o usuário pode atualizar um recurso
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @param {string} resource - Recurso
   * @returns {boolean}
   */
  canUpdateResource(userRole, clinicRole, resource) {
    return this.hasPermission(userRole, clinicRole, resource, 'update');
  }

  /**
   * Verifica se o usuário pode deletar um recurso
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @param {string} resource - Recurso
   * @returns {boolean}
   */
  canDeleteResource(userRole, clinicRole, resource) {
    return this.hasPermission(userRole, clinicRole, resource, 'delete');
  }

  // =====================================================
  // VERIFICAÇÕES ESPECÍFICAS DO NEGÓCIO
  // =====================================================

  /**
   * Verifica se o usuário pode gerenciar médicos
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canManageDoctors(userRole, clinicRole) {
    return this.canCreateResource(userRole, clinicRole, 'doctors') &&
           this.canUpdateResource(userRole, clinicRole, 'doctors') &&
           this.canDeleteResource(userRole, clinicRole, 'doctors');
  }

  /**
   * Verifica se o usuário pode gerenciar pacientes
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canManagePatients(userRole, clinicRole) {
    return this.canCreateResource(userRole, clinicRole, 'patients') &&
           this.canUpdateResource(userRole, clinicRole, 'patients') &&
           this.canDeleteResource(userRole, clinicRole, 'patients');
  }

  /**
   * Verifica se o usuário pode gerenciar consultas
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canManageAppointments(userRole, clinicRole) {
    return this.canCreateResource(userRole, clinicRole, 'appointments') &&
           this.canUpdateResource(userRole, clinicRole, 'appointments') &&
           this.canDeleteResource(userRole, clinicRole, 'appointments');
  }

  /**
   * Verifica se o usuário pode gerenciar prontuários
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canManageMedicalRecords(userRole, clinicRole) {
    return this.canCreateResource(userRole, clinicRole, 'medical_records') &&
           this.canUpdateResource(userRole, clinicRole, 'medical_records');
  }

  /**
   * Verifica se o usuário pode acessar configurações da clínica
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canAccessClinicSettings(userRole, clinicRole) {
    return this.hasPermission(userRole, clinicRole, 'clinic_settings', 'read');
  }

  /**
   * Verifica se o usuário pode modificar configurações da clínica
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {boolean}
   */
  canModifyClinicSettings(userRole, clinicRole) {
    return this.hasPermission(userRole, clinicRole, 'clinic_settings', 'update');
  }

  // =====================================================
  // VERIFICAÇÃO DE PROPRIEDADE
  // =====================================================

  /**
   * Verifica se o usuário é proprietário de um recurso
   * @param {Object} user - Usuário atual
   * @param {Object} resource - Recurso a ser verificado
   * @param {string} resourceType - Tipo do recurso
   * @returns {boolean}
   */
  isResourceOwner(user, resource, resourceType) {
    if (!user || !resource) return false;

    switch (resourceType) {
      case 'clinic':
        return resource.created_by === user.id;
      case 'doctor':
        return resource.user_id === user.id;
      case 'patient':
        return resource.owning_host_id === user.id;
      case 'appointment':
        return resource.doctor_id === user.id;
      case 'medical_record':
        return resource.doctor_id === user.id;
      default:
        return false;
    }
  }

  /**
   * Verifica se o usuário pertence à mesma clínica do recurso
   * @param {Object} user - Usuário atual
   * @param {Object} resource - Recurso a ser verificado
   * @returns {boolean}
   */
  isSameClinic(user, resource) {
    if (!user || !resource) return false;
    
    // Se o usuário tem clinic_id, verificar se é o mesmo
    if (user.clinic_id && resource.clinic_id) {
      return user.clinic_id === resource.clinic_id;
    }

    // Se não tem clinic_id, verificar se é admin ou host
    return user.app_role === 'admin' || user.app_role === 'host';
  }

  // =====================================================
  // MIDDLEWARE DE AUTORIZAÇÃO
  // =====================================================

  /**
   * Middleware para verificar permissões antes de executar uma ação
   * @param {Function} action - Ação a ser executada
   * @param {string} resource - Recurso
   * @param {string} actionType - Tipo da ação
   * @param {Object} user - Usuário atual
   * @param {Object} clinicUser - Dados do usuário na clínica
   * @returns {Function}
   */
  withPermission(action, resource, actionType, user, clinicUser) {
    return async (...args) => {
      const hasPermission = this.hasPermission(
        user.app_role,
        clinicUser?.role,
        resource,
        actionType,
        clinicUser?.clinic_id
      );

      if (!hasPermission) {
        throw new Error(`Usuário não tem permissão para ${actionType} ${resource}`);
      }

      return action(...args);
    };
  }

  // =====================================================
  // LOGS DE TENTATIVAS DE ACESSO
  // =====================================================

  /**
   * Registra uma tentativa de acesso não autorizado
   * @param {Object} user - Usuário que tentou acessar
   * @param {string} resource - Recurso tentado
   * @param {string} action - Ação tentada
   * @param {Object} resourceData - Dados do recurso
   */
  logUnauthorizedAccess(user, resource, action, resourceData = null) {
    console.warn('Unauthorized access attempt:', {
      user_id: user.id,
      user_role: user.app_role,
      resource,
      action,
      resource_data: resourceData,
      timestamp: new Date().toISOString()
    });

    // Aqui você pode implementar o envio para um serviço de logs
    // ou banco de dados para auditoria
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  /**
   * Obtém todas as permissões de um usuário
   * @param {string} userRole - Role global do usuário
   * @param {string} clinicRole - Role do usuário na clínica
   * @returns {Object}
   */
  getUserPermissions(userRole, clinicRole) {
    const globalPermissions = this.permissions.global[userRole] || {};
    const clinicPermissions = clinicRole ? this.permissions.clinic[clinicRole] || {} : {};

    return {
      global: globalPermissions,
      clinic: clinicPermissions
    };
  }

  /**
   * Verifica se um role é válido
   * @param {string} role - Role a ser verificado
   * @returns {boolean}
   */
  isValidRole(role) {
    const validRoles = ['admin', 'host', 'doctor', 'reception', 'guest'];
    return validRoles.includes(role);
  }

  /**
   * Verifica se um role de clínica é válido
   * @param {string} role - Role de clínica a ser verificado
   * @returns {boolean}
   */
  isValidClinicRole(role) {
    const validClinicRoles = ['owner', 'admin', 'doctor', 'reception'];
    return validClinicRoles.includes(role);
  }
}

// =====================================================
// HOOK PARA USAR O SERVIÇO DE PERMISSÕES
// =====================================================

export const usePermissions = () => {
  const { userProfile } = useAuth();
  const permissionService = new PermissionService();

  const hasPermission = (resource, action, clinicId = null) => {
    if (!userProfile) return false;
    
    return permissionService.hasPermission(
      userProfile.app_role,
      userProfile.clinic_role, // Assumindo que existe no userProfile
      resource,
      action,
      clinicId
    );
  };

  const canAccess = (resource) => hasPermission(resource, 'read');
  const canCreate = (resource) => hasPermission(resource, 'create');
  const canUpdate = (resource) => hasPermission(resource, 'update');
  const canDelete = (resource) => hasPermission(resource, 'delete');

  return {
    hasPermission,
    canAccess,
    canCreate,
    canUpdate,
    canDelete,
    canManageDoctors: () => permissionService.canManageDoctors(userProfile?.app_role, userProfile?.clinic_role),
    canManagePatients: () => permissionService.canManagePatients(userProfile?.app_role, userProfile?.clinic_role),
    canManageAppointments: () => permissionService.canManageAppointments(userProfile?.app_role, userProfile?.clinic_role),
    canManageMedicalRecords: () => permissionService.canManageMedicalRecords(userProfile?.app_role, userProfile?.clinic_role),
    canAccessClinicSettings: () => permissionService.canAccessClinicSettings(userProfile?.app_role, userProfile?.clinic_role),
    canModifyClinicSettings: () => permissionService.canModifyClinicSettings(userProfile?.app_role, userProfile?.clinic_role),
    isResourceOwner: (resource, resourceType) => permissionService.isResourceOwner(userProfile, resource, resourceType),
    isSameClinic: (resource) => permissionService.isSameClinic(userProfile, resource),
    getUserPermissions: () => permissionService.getUserPermissions(userProfile?.app_role, userProfile?.clinic_role)
  };
};

export default PermissionService;
