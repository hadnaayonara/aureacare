
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, Loader2, ExternalLink } from "lucide-react";
import { ClinicUser } from "@/api/entities";
import { Clinic } from "@/api/entities";
import { Doctor } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { createPageUrl } from "@/utils";

export default function InviteAccept() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setError('Token de convite não encontrado na URL.');
      setIsLoading(false);
      return;
    }
    
    loadInvitationAndUser(token);
  }, [location.search]);

  const loadInvitationAndUser = async (token) => {
    console.log('🔍 Iniciando carregamento do convite com token:', token);
    
    try {
      setDebugInfo({ token, step: 'starting', timestamp: new Date().toISOString() });
      
      // Step 1: Try to get current user (optional for invite page)
      let currentUserData = null;
      try {
        console.log('👤 Tentando buscar usuário atual...');
        currentUserData = await UserEntity.me();
        setCurrentUser(currentUserData);
        console.log('✅ Usuário encontrado:', currentUserData?.email);
        setDebugInfo(prev => ({ ...prev, currentUser: currentUserData?.email, step: 'user_loaded' }));
      } catch (userError) {
        console.log('ℹ️ Usuário não autenticado (normal para página de convite)');
        setCurrentUser(null);
        setDebugInfo(prev => ({ ...prev, userError: userError.message, step: 'user_not_authenticated' }));
      }

      // Step 2: Load invitation data with enhanced debugging
      console.log('🔎 Buscando convite com token:', token);
      setDebugInfo(prev => ({ ...prev, step: 'loading_invitation' }));
      
      let invitations = [];
      let searchMethod = '';
      
      // Enhanced Strategy 1: Direct filter with specific token
      try {
        console.log('🔍 Tentativa 1: Filter direto com invitation_token...');
        invitations = await ClinicUser.filter({ invitation_token: token });
        searchMethod = 'direct_filter';
        console.log('✅ Filter direto funcionou, encontrados:', invitations.length);
        setDebugInfo(prev => ({ 
          ...prev, 
          searchMethod,
          totalInvitations: invitations.length,
          step: 'filter_success'
        }));
      } catch (filterError) {
        console.log('❌ Filter direto falhou:', filterError.message);
        
        // Enhanced Strategy 2: List all and filter manually with detailed logging
        try {
          console.log('🔍 Tentativa 2: Buscar todos os ClinicUser e filtrar manualmente...');
          const allInvitations = await ClinicUser.list();
          console.log('📝 Total de registros ClinicUser encontrados:', allInvitations.length);
          
          // Log sample of data for debugging
          if (allInvitations.length > 0) {
            console.log('📋 Amostra dos primeiros registros:', allInvitations.slice(0, 3).map(inv => ({
              id: inv.id,
              invitation_token: inv.invitation_token,
              invited_email: inv.invited_email,
              role: inv.role,
              is_active: inv.is_active
            })));
          }
          
          // Filter for invitations with tokens
          const invitationsWithTokens = allInvitations.filter(inv => inv.invitation_token);
          console.log('🔗 Registros com invitation_token:', invitationsWithTokens.length);
          
          // Filter for exact token match
          invitations = allInvitations.filter(inv => {
            const hasToken = inv.invitation_token === token;
            if (hasToken) {
              console.log('🎯 Token encontrado em registro:', {
                id: inv.id,
                invited_email: inv.invited_email,
                role: inv.role,
                is_active: inv.is_active,
                accepted_at: inv.accepted_at
              });
            }
            return hasToken;
          });
          
          searchMethod = 'manual_filter';
          console.log('✅ Busca manual funcionou, convites encontrados:', invitations.length);
          setDebugInfo(prev => ({ 
            ...prev, 
            searchMethod,
            totalRecords: allInvitations.length,
            totalWithTokens: invitationsWithTokens.length,
            totalInvitations: invitations.length,
            step: 'manual_filter_success'
          }));
        } catch (listError) {
          console.error('❌ Busca manual também falhou:', listError.message);
          searchMethod = 'both_failed';
          setDebugInfo(prev => ({ 
            ...prev, 
            searchMethod,
            filterError: filterError.message,
            listError: listError.message,
            step: 'both_methods_failed'
          }));
          
          setError(`Erro ao acessar dados do convite: ${listError.message}`);
          return;
        }
      }
      
      console.log('🎯 Resultado final da busca:', {
        method: searchMethod,
        totalFound: invitations.length,
        invitations: invitations.map(inv => ({
          id: inv.id,
          invited_email: inv.invited_email,
          accepted_at: inv.accepted_at,
          expires_at: inv.invitation_expires_at
        }))
      });
      
      if (invitations.length === 0) {
        console.log('❌ Nenhum convite encontrado com este token');
        setError('Convite não encontrado. Verifique se o link está correto ou se não expirou.');
        setDebugInfo(prev => ({ ...prev, step: 'no_invitation_found' }));
        return;
      }
      
      const invite = invitations[0];
      console.log('📄 Convite encontrado:', {
        id: invite.id,
        invited_email: invite.invited_email,
        role: invite.role,
        is_active: invite.is_active,
        accepted_at: invite.accepted_at,
        expires_at: invite.invitation_expires_at
      });
      
      // Step 3: Validate invitation state
      if (invite.accepted_at) {
        console.log('❌ Convite já foi aceito em:', invite.accepted_at);
        setError('Este convite já foi aceito anteriormente.');
        setDebugInfo(prev => ({ ...prev, step: 'already_accepted' }));
        return;
      }
      
      // Check expiration
      if (invite.invitation_expires_at) {
        const now = new Date();
        const expirationDate = new Date(invite.invitation_expires_at);
        
        console.log('⏰ Verificando expiração:', {
          now: now.toISOString(),
          expires: expirationDate.toISOString(),
          isExpired: expirationDate < now
        });
        
        if (expirationDate < now) {
          console.log('❌ Convite expirado');
          setError('Este convite expirou. Solicite um novo convite ao administrador.');
          setDebugInfo(prev => ({ ...prev, step: 'expired' }));
          return;
        }
      }
      
      // Check if invitation is in correct state (should be inactive for pending invites)
      if (invite.is_active === true) {
        console.log('⚠️ Convite com is_active=true mas não aceito ainda');
        // This might be a data inconsistency, but let's proceed
      }
      
      setInvitation(invite);
      setDebugInfo(prev => ({ ...prev, step: 'invitation_loaded' }));
      
      // Step 4: Load additional information (clinic and doctor)
      console.log('🏥 Carregando informações da clínica e médico...');
      try {
        if (invite.clinic_id) {
          const clinics = await Clinic.list();
          const clinic = clinics.find(c => c.id === invite.clinic_id);
          if (clinic) {
            setClinic(clinic);
            console.log('✅ Clínica encontrada:', clinic.name);
          } else {
            console.log('⚠️ Clínica não encontrada para ID:', invite.clinic_id);
          }
        }
        
        if (invite.doctor_id) {
          const doctors = await Doctor.list();
          const doctor = doctors.find(d => d.id === invite.doctor_id);
          if (doctor) {
            setDoctor(doctor);
            console.log('✅ Médico encontrado:', doctor.full_name);
          } else {
            console.log('⚠️ Médico não encontrado para ID:', invite.doctor_id);
          }
        }
      } catch (loadError) {
        console.warn('⚠️ Erro ao carregar informações adicionais (não crítico):', loadError);
      }
      
      console.log('🎉 Carregamento completo com sucesso!');
      setDebugInfo(prev => ({ ...prev, step: 'completed' }));
      
    } catch (error) {
      console.error('❌ Erro crítico no carregamento:', error);
      setError(`Erro ao processar convite: ${error.message}`);
      setDebugInfo(prev => ({ ...prev, step: 'critical_error', error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invitation) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      let userToProcess = currentUser;
      
      if (!userToProcess) {
        try {
          userToProcess = await UserEntity.me();
          setCurrentUser(userToProcess);
        } catch (authError) {
          const currentUrl = `${window.location.origin}${createPageUrl('InviteAccept')}?token=${invitation.invitation_token}`;
          await UserEntity.loginWithRedirect(currentUrl);
          return;
        }
      }
      
      // Validate email match
      if (userToProcess.email !== invitation.invited_email) {
        setError(`Este convite foi enviado para ${invitation.invited_email}, mas você está logado como ${userToProcess.email}. Por favor, faça logout e login com o email correto.`);
        setIsProcessing(false);
        return;
      }
      
      // Accept the invitation
      const updateData = {
        user_id: userToProcess.id,
        is_active: true,
        accepted_at: new Date().toISOString(),
        invitation_token: null
      };
      
      await ClinicUser.update(invitation.id, updateData);
      
      // ATUALIZAÇÃO: Definir a app_role e clinic_ids no User
      await UserEntity.updateMyUserData({
          app_role: invitation.role,
          clinic_ids: [invitation.clinic_id]
      });
      
      // Set user type and clinic context based on role
      if (invitation.role === 'doctor') {
        localStorage.setItem('userType', 'doctor');
        
        const activeClinicData = {
          id: invitation.clinic_id,
          name: clinic?.name || 'Clínica',
          role: 'doctor',
          doctor_id: invitation.doctor_id
        };
        localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
        localStorage.removeItem('userClinics');
      } else if (invitation.role === 'reception') {
        localStorage.setItem('userType', 'reception');
        
        const activeClinicData = {
          id: invitation.clinic_id,
          name: clinic?.name || 'Clínica',
          role: 'reception'
        };
        localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
        localStorage.removeItem('userClinics');
      }
      
      // Disparar evento customizado para notificar outras páginas sobre a aceitação do convite
      window.dispatchEvent(new CustomEvent('inviteAccepted', {
        detail: {
          invitationId: invitation.id,
          clinicId: invitation.clinic_id,
          role: invitation.role,
          acceptedAt: new Date().toISOString(),
          userEmail: userToProcess.email
        }
      }));
      
      // Também armazenar no localStorage como backup
      localStorage.setItem('recentInviteAccepted', JSON.stringify({
        timestamp: Date.now(),
        invitationId: invitation.id,
        clinicId: invitation.clinic_id,
        role: invitation.role
      }));
      
      setSuccess('Convite aceito com sucesso! Redirecionando para o dashboard...');
      
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 2000);
      
    } catch (error) {
      console.error('Error accepting invite:', error);
      setError(`Erro ao aceitar convite: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (!invitation) return;
    
    const currentUrl = `${window.location.origin}${createPageUrl('InviteAccept')}?token=${invitation.invitation_token}`;
    await UserEntity.loginWithRedirect(currentUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Carregando convite...</p>
            {/* Debug info for development */}
            <div className="mt-4 text-xs text-slate-400 text-left">
              <p>Token: {debugInfo.token?.substring(0, 10)}...</p>
              <p>Etapa: {debugInfo.step}</p>
              <p>Método: {debugInfo.searchMethod}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Convite inválido</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate(createPageUrl('Home'))} className="w-full">
                Voltar ao início
              </Button>
              {invitation?.invited_email && (
                <Button variant="outline" onClick={handleLogin} className="w-full">
                  Fazer Login como {invitation.invited_email}
                </Button>
              )}
            </div>
            {/* Debug info for development */}
            <details className="mt-4 text-xs text-left">
              <summary className="cursor-pointer text-slate-400">Debug Info</summary>
              <pre className="bg-slate-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Convite Aceito!</h2>
            <p className="text-slate-600 mb-6">{success}</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Aceitar Convite</CardTitle>
          <p className="text-slate-600">
            Você foi convidado(a) para ser <strong>
              {invitation?.role === 'doctor' ? 'Médico(a)' : 
               invitation?.role === 'reception' ? 'Recepcionista' : 
               invitation?.role}
            </strong>
            {clinic && <span> na clínica <strong>{clinic.name}</strong></span>}.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-900">📧 Email do Convite:</span>
              <span className="text-blue-700">{invitation?.invited_email}</span>
            </div>
            {doctor && (
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">👨‍⚕️ Profissional:</span>
                <span className="text-blue-700">{doctor.full_name}</span>
              </div>
            )}
            {clinic && (
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">🏥 Clínica:</span>
                <span className="text-blue-700">{clinic.name}</span>
              </div>
            )}
          </div>
          
          {currentUser && currentUser.email !== invitation?.invited_email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Atenção:</strong> Este convite foi enviado para <strong>{invitation?.invited_email}</strong>, 
                mas você está logado como <strong>{currentUser.email}</strong>. 
                Faça logout e login com o email correto para aceitar o convite.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            {!currentUser ? (
              <Button 
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    🔐 Fazer Login para Aceitar
                  </>
                )}
              </Button>
            ) : currentUser.email === invitation?.invited_email ? (
              <Button 
                onClick={handleAcceptInvite}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aceitando convite...
                  </>
                ) : (
                  '✅ Aceitar Convite e Entrar'
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleLogin}
                variant="outline"
                className="w-full"
                disabled={isProcessing}
              >
                🔄 Fazer Login com Email Correto
              </Button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Precisa de ajuda?{' '}
              <a href="mailto:suporte@aurealab.com" className="text-blue-600 hover:text-blue-700 font-medium">
                Entre em contato
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
