import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthGuard({ children, requiredRole = null, requireEmailVerification = true }) {
    const { user, userProfile, loading, isAuthenticated, isEmailVerified, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/', '/Home', '/LandingPage'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    useEffect(() => {
        const checkAuthAndPermissions = async () => {
            // Se é rota pública, não precisa verificar autenticação
            if (isPublicRoute) {
                return;
            }

            // Se ainda está carregando, aguarda
            if (loading) {
                return;
            }

            setIsCheckingPermissions(true);
            setPermissionError(null);

            try {
                // 1. Verificar se está autenticado
                if (!isAuthenticated || !user) {
                    console.log('🔒 Usuário não autenticado, redirecionando para login...');
                    navigate(createPageUrl("Auth"));
                    return;
                }

                // 2. Verificar se email está verificado (se necessário)
                if (requireEmailVerification && !isEmailVerified) {
                    console.log('📧 Email não verificado, redirecionando para verificação...');
                    navigate(createPageUrl("EmailVerification"));
                    return;
                }

                // 3. Verificar se tem perfil de usuário
                if (!userProfile) {
                    console.log('👤 Perfil de usuário não encontrado, criando...');
                    await createUserProfile();
                    return;
                }

                // 4. Verificar permissões por role (se especificado)
                if (requiredRole && userProfile.app_role !== requiredRole) {
                    console.log(`🚫 Usuário sem permissão. Necessário: ${requiredRole}, Atual: ${userProfile.app_role}`);
                    setPermissionError(`Acesso negado. Você precisa ser ${getRoleDisplayName(requiredRole)} para acessar esta página.`);
                    return;
                }

                // 5. Configurar dados da clínica se necessário
                await setupClinicData();

                console.log('✅ Autenticação e permissões verificadas com sucesso');

            } catch (error) {
                console.error('❌ Erro na verificação de autenticação:', error);
                setPermissionError('Erro interno. Tente novamente.');
            } finally {
                setIsCheckingPermissions(false);
            }
        };

        checkAuthAndPermissions();
    }, [isAuthenticated, user, userProfile, loading, isEmailVerified, location.pathname, requiredRole, requireEmailVerification, navigate, isPublicRoute]);

    const createUserProfile = async () => {
        try {
            if (!user) return;

            const { data, error } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    app_role: 'host' // Default role
                })
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar perfil:', error);
                setPermissionError('Erro ao criar perfil de usuário.');
            }
        } catch (error) {
            console.error('Erro inesperado ao criar perfil:', error);
            setPermissionError('Erro inesperado ao criar perfil.');
        }
    };

    const setupClinicData = async () => {
        try {
            if (!userProfile) return;

            // Buscar associações com clínicas
            const { data: clinicAssociations, error } = await supabase
                .from('clinic_users')
                .select(`
                    *,
                    clinics (
                        id,
                        name,
                        created_by
                    )
                `)
                .eq('user_id', user.id)
                .eq('is_active', true);

            if (error) {
                console.error('Erro ao buscar associações de clínica:', error);
                return;
            }

            // Configurar localStorage baseado no role e associações
            if (clinicAssociations && clinicAssociations.length > 0) {
                const userRoles = clinicAssociations.map(ca => ca.role);
                
                if (userRoles.includes('owner') || userRoles.includes('admin')) {
                    // Usuário HOST
                    localStorage.setItem('userType', 'host');
                    
                    const userClinics = clinicAssociations.map(ca => ({
                        id: ca.clinic_id,
                        name: ca.clinics?.name,
                        role: ca.role
                    }));
                    
                    localStorage.setItem('userClinics', JSON.stringify(userClinics));
                    
                    // Auto-selecionar primeira clínica se nenhuma estiver ativa
                    const activeClinicStored = localStorage.getItem('activeClinic');
                    if (!activeClinicStored && userClinics.length > 0) {
                        const firstClinic = userClinics[0];
                        localStorage.setItem('activeClinic', JSON.stringify(firstClinic));
                    }
                    
                } else if (userRoles.includes('doctor')) {
                    // Usuário DOCTOR
                    localStorage.setItem('userType', 'doctor');
                    
                    const doctorAssociation = clinicAssociations.find(ca => ca.role === 'doctor');
                    if (doctorAssociation) {
                        const activeClinicData = {
                            id: doctorAssociation.clinic_id,
                            name: doctorAssociation.clinics?.name,
                            role: 'doctor',
                            doctor_id: doctorAssociation.doctor_id
                        };
                        localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
                        localStorage.removeItem('userClinics');
                    }
                    
                } else if (userRoles.includes('reception')) {
                    // Usuário RECEPTION
                    localStorage.setItem('userType', 'reception');
                    
                    const receptionAssociation = clinicAssociations.find(ca => ca.role === 'reception');
                    if (receptionAssociation) {
                        const activeClinicData = {
                            id: receptionAssociation.clinic_id,
                            name: receptionAssociation.clinics?.name,
                            role: 'reception'
                        };
                        localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
                        localStorage.removeItem('userClinics');
                    }
                }
            } else {
                // Usuário sem clínicas (novo host)
                localStorage.setItem('userType', 'host');
                localStorage.removeItem('activeClinic');
                localStorage.removeItem('userClinics');
            }
        } catch (error) {
            console.error('Erro ao configurar dados da clínica:', error);
        }
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'admin': 'Administrador',
            'host': 'Proprietário de Clínica',
            'doctor': 'Médico',
            'reception': 'Recepcionista'
        };
        return roleNames[role] || role;
    };

    // Se é rota pública, renderiza normalmente
    if (isPublicRoute) {
        return children;
    }

    // Se ainda está carregando ou verificando permissões
    if (loading || isCheckingPermissions) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">
                        {loading ? 'Verificando autenticação...' : 'Verificando permissões...'}
                    </p>
                </div>
            </div>
        );
    }

    // Se há erro de permissão
    if (permissionError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-center">
                            {permissionError}
                        </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 text-center space-y-2">
                        <button
                            onClick={() => navigate(createPageUrl("Dashboard"))}
                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Ir para Dashboard
                        </button>
                        
                        <button
                            onClick={() => navigate(-1)}
                            className="block w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Se há erro geral de autenticação
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-center">
                            Erro de autenticação: {error}
                        </AlertDescription>
                    </Alert>
                    
                    <button
                        onClick={() => navigate(createPageUrl("Auth"))}
                        className="block w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    // Se não está autenticado, não renderiza nada (será redirecionado)
    if (!isAuthenticated) {
        return null;
    }

    // Se email não está verificado e é obrigatório
    if (requireEmailVerification && !isEmailVerified) {
        return null; // Será redirecionado para verificação
    }

    // Se chegou até aqui, está autenticado e com permissões
    return children;
}

// Componente wrapper para rotas que requerem roles específicos
export function RoleGuard({ children, requiredRole }) {
    return (
        <AuthGuard requiredRole={requiredRole}>
            {children}
        </AuthGuard>
    );
}

// Componente wrapper para rotas que não precisam de verificação de email
export function NoEmailVerificationGuard({ children }) {
    return (
        <AuthGuard requireEmailVerification={false}>
            {children}
        </AuthGuard>
    );
}