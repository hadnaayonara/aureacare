
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { ClinicUser } from '@/api/entities';
import { Reception } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Send, Loader2, User as UserIcon, Building2, Trash2, UserMinus, Copy, RefreshCw } from "lucide-react";
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ensureArray } from '../components/utils';

export default function InviteReception() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [receptionName, setReceptionName] = useState('');
  const [receptionCpf, setReceptionCpf] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeClinic, setActiveClinic] = useState(null);
  const [availableClinics, setAvailableClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [receptionList, setReceptionList] = useState([]);
  const [resendingId, setResendingId] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadReceptionData = useCallback(async (clinicId) => {
    if (!clinicId) return;
    setIsLoading(true);
    try {
      const receptionsResponse = await Reception.filter({ clinic_id: clinicId });
      const clinicUsersResponse = await ClinicUser.filter({ clinic_id: clinicId, role: 'reception' });

      const safeReceptions = ensureArray(receptionsResponse);
      const safeClinicUsers = ensureArray(clinicUsersResponse);

      const combinedList = safeReceptions.map(reception => {
        const invite = safeClinicUsers.find(cu => cu.reception_id === reception.id) ||
                       safeClinicUsers.find(cu => cu.invited_email === reception.email && !cu.reception_id);

        let status = 'Desconhecido';
        if (reception.is_active === false) {
          status = 'Inativo';
        } else if (invite) {
          if (invite.accepted_at) {
            status = invite.is_active === false ? 'Inativo' : 'Ativo';
          } else {
            if (invite.invitation_expires_at && new Date() > new Date(invite.invitation_expires_at)) {
              status = 'Expirado';
            } else if (invite.invitation_token) {
              status = 'Pendente';
            } else {
              status = 'Desativado';
            }
          }
        } else {
          status = 'Desativado';
        }

        return {
          id: reception.id,
          full_name: reception.full_name,
          email: reception.email,
          is_active: reception.is_active,
          status: status,
          accepted_at: invite?.accepted_at || null,
          invitation_token: invite?.invitation_token || null,
          invitation_expires_at: invite?.invitation_expires_at || null,
        };
      });

      setReceptionList(combinedList);

    } catch (error) {
      console.error("Erro ao carregar dados da recepção:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de recepcionistas." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchUserAndClinic = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        const storedClinic = localStorage.getItem('activeClinic');
        let clinicToLoad = null;

        if (storedClinic) {
          clinicToLoad = JSON.parse(storedClinic);
        } else {
          const userClinics = ensureArray(await Clinic.filter({ created_by: user.email }));
          if (userClinics.length === 1) {
            const clinic = userClinics[0];
            clinicToLoad = { id: clinic.id, name: clinic.name, role: 'host' };
            localStorage.setItem('activeClinic', JSON.stringify(clinicToLoad));
          } else if (userClinics.length > 1) {
            setAvailableClinics(userClinics);
          }
        }
        
        if (clinicToLoad) {
          setActiveClinic(clinicToLoad);
          await loadReceptionData(clinicToLoad.id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário e clínica:", error);
        toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados. Tente recarregar a página." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndClinic();
  }, [loadReceptionData, refreshTrigger, toast]);

  // Escutar por aceitações de convite em tempo real
  useEffect(() => {
    const handleInviteAccepted = (event) => {
      const { clinicId, role } = event.detail;
      
      // Se a aceitação foi para uma recepcionista da clínica ativa, recarregar os dados
      if (role === 'reception' && activeClinic && clinicId === activeClinic.id) {
        console.log('🔄 Convite de recepção aceito detectado, recarregando lista...');
        toast({ 
          title: "Lista Atualizada!", 
          description: "Um convite foi aceito. A lista foi atualizada automaticamente." 
        });
        setRefreshTrigger(prev => prev + 1);
      }
    };

    // Adicionar listener para eventos customizados
    window.addEventListener('inviteAccepted', handleInviteAccepted);

    // Verificar localStorage para convites aceitos recentemente (fallback)
    const checkRecentInviteAccepted = () => {
      const recentInvite = localStorage.getItem('recentInviteAccepted');
      if (recentInvite) {
        try {
          const inviteData = JSON.parse(recentInvite);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          // Se foi aceito nos últimos 5 minutos e é para esta clínica
          if (inviteData.timestamp > fiveMinutesAgo && 
              inviteData.role === 'reception' && 
              activeClinic && 
              inviteData.clinicId === activeClinic.id) {
            console.log('🔄 Convite aceito recentemente detectado via localStorage, recarregando...');
            setRefreshTrigger(prev => prev + 1);
            localStorage.removeItem('recentInviteAccepted'); // Limpar após uso
          }
        } catch (error) {
          console.error('Erro ao processar convite aceito recentemente:', error);
        }
      }
    };

    // Verificar imediatamente e quando a janela ganha foco
    checkRecentInviteAccepted();
    window.addEventListener('focus', checkRecentInviteAccepted);

    // Cleanup
    return () => {
      window.removeEventListener('inviteAccepted', handleInviteAccepted);
      window.removeEventListener('focus', checkRecentInviteAccepted);
    };
  }, [activeClinic, toast]);

  const handleClinicSelection = async (clinicId) => {
    const selected = availableClinics.find(c => c.id === clinicId);
    if (selected) {
      const clinicToLoad = { id: selected.id, name: selected.name, role: 'host' };
      localStorage.setItem('activeClinic', JSON.stringify(clinicToLoad));
      setActiveClinic(clinicToLoad);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const generateInvitationToken = () => {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    let token = '';
    for (let i = 0; i < array.length; i++) {
      token += (i < 2 ? '' : '-') + array[i].toString(16).slice(-4);
    }
    return token;
  };
  
  const getInviteLink = (token) => {
    if (!token) return '';
    return `${window.location.origin}${createPageUrl('InviteAccept')}?token=${token}`;
  };

  const copyInviteLink = (token) => {
    if (!token) {
      toast({ variant: "destructive", title: "Erro", description: "Token de convite não encontrado." });
      return;
    }
    const inviteUrl = getInviteLink(token);
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast({ title: "Link Copiado!", description: "O link de convite foi copiado com sucesso." });
    }, () => {
      toast({ variant: "destructive", title: "Falha ao Copiar", description: "Não foi possível copiar o link." });
    });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!activeClinic || !receptionName || !email) {
      toast({ variant: "destructive", title: "Erro", description: "Nome, e-mail e clínica são obrigatórios." });
      return;
    }
    setIsInviting(true);
    try {
      const existingReception = ensureArray(await Reception.filter({ email, clinic_id: activeClinic.id }))[0];
      if (existingReception) {
        toast({ variant: "destructive", title: "Erro", description: "Já existe uma recepcionista com este e-mail nesta clínica." });
        setIsInviting(false);
        return;
      }
      
      const newReception = await Reception.create({
        full_name: receptionName,
        cpf: receptionCpf,
        email: email,
        clinic_id: activeClinic.id,
        is_active: true,
      });

      const token = generateInvitationToken();
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);

      await ClinicUser.create({
        clinic_id: activeClinic.id,
        invited_email: email,
        role: 'reception',
        invitation_token: token,
        invitation_expires_at: expiration.toISOString(),
        is_active: false,
        user_id: null,
        reception_id: newReception.id,
        invited_by: currentUser.email,
      });

      const newItem = {
        id: newReception.id,
        full_name: newReception.full_name,
        email: newReception.email,
        is_active: newReception.is_active,
        status: 'Pendente',
        accepted_at: null,
        invitation_token: token,
        invitation_expires_at: expiration.toISOString(),
      };

      setReceptionList(prevList => [...prevList, newItem]);

      toast({ title: "Convite Criado!", description: `O link de convite para ${receptionName} foi gerado.` });
      setIsFormOpen(false);
      setEmail('');
      setReceptionName('');
      setReceptionCpf('');
    } catch (error) {
      console.error("Erro ao convidar recepcionista:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o convite." });
    } finally {
      setIsInviting(false);
    }
  };

  const handleActivateInvitation = async (reception) => {
    setActivatingId(reception.id);
    try {
      await Reception.update(reception.id, { is_active: true });

      const existingInvites = ensureArray(await ClinicUser.filter({ 
        clinic_id: activeClinic.id, 
        reception_id: reception.id 
      }));

      const token = generateInvitationToken();
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      const expirationISO = expiration.toISOString();

      if (existingInvites.length > 0) {
        await ClinicUser.update(existingInvites[0].id, {
          invitation_token: token,
          invitation_expires_at: expirationISO,
          is_active: false,
        });
      } else {
        await ClinicUser.create({
          clinic_id: activeClinic.id,
          reception_id: reception.id,
          invited_email: reception.email,
          role: 'reception',
          invitation_token: token,
          invitation_expires_at: expirationISO,
          is_active: false,
          user_id: null,
          invited_by: currentUser.email,
        });
      }

      setReceptionList(prevList => prevList.map(item => 
        item.id === reception.id
          ? { ...item, status: 'Pendente', is_active: true, invitation_token: token, invitation_expires_at: expirationISO }
          : item
      ));

      toast({ title: "Convite Ativado!", description: `Um novo link de convite foi gerado para ${reception.full_name}.` });
    } catch (error) {
      console.error("Erro ao ativar convite:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível ativar o convite." });
    } finally {
      setActivatingId(null);
    }
  };

  const handleRenewInvitation = async (reception) => {
    setResendingId(reception.id);
    try {
      const clinicUsers = ensureArray(await ClinicUser.filter({ clinic_id: activeClinic.id, reception_id: reception.id, role: 'reception' }));
      if (clinicUsers.length === 0) throw new Error("Convite original não encontrado para renovar.");
      
      const invite = clinicUsers[0];
      const newToken = generateInvitationToken();
      const newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + 7);
      const newExpirationISO = newExpiration.toISOString();

      await ClinicUser.update(invite.id, {
        invitation_token: newToken,
        invitation_expires_at: newExpirationISO,
      });

      setReceptionList(prevList => prevList.map(item =>
        item.id === reception.id
          ? { ...item, status: 'Pendente', invitation_token: newToken, invitation_expires_at: newExpirationISO }
          : item
      ));

      toast({ title: "Link Renovado!", description: `Um novo link de convite foi gerado para ${reception.full_name}.` });
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar um novo link." });
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelInvite = async (reception) => {
    try {
      // Deleta o registro de convite em ClinicUser
      const clinicUsers = ensureArray(await ClinicUser.filter({ clinic_id: activeClinic.id, reception_id: reception.id, role: 'reception' }));
      if (clinicUsers.length > 0) {
        await ClinicUser.delete(clinicUsers[0].id);
      }
      // Deleta o registro da própria recepcionista para limpeza
      await Reception.delete(reception.id);

      setReceptionList(prevList => prevList.filter(item => item.id !== reception.id));

      toast({ title: "Convite Cancelado", description: `O convite para ${reception.full_name} foi cancelado e removido.` });
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível cancelar o convite." });
    }
  };

  const handleRemoveReception = async (reception) => {
    try {
      const clinicUsers = ensureArray(await ClinicUser.filter({ clinic_id: activeClinic.id, reception_id: reception.id, role: 'reception' }));
      if (clinicUsers.length > 0) {
        await ClinicUser.update(clinicUsers[0].id, { is_active: false });
      }
      await Reception.update(reception.id, { is_active: false });

      setReceptionList(prevList => prevList.map(item =>
        item.id === reception.id
          ? { ...item, status: 'Inativo', is_active: false }
          : item
      ));

      toast({ title: "Acesso Removido", description: `O acesso de ${reception.full_name} foi revogado.` });
    } catch (error) {
      console.error("Erro ao remover recepção:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o acesso." });
    }
  };

  if (isLoading && !receptionList.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster />
      <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Equipe de Recepção</h1>
            <p className="text-slate-600 mt-1">Gerencie os convites e o acesso da sua equipe de recepção.</p>
          </div>
        </div>

        {!activeClinic && availableClinics.length > 0 && (
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Card className="shadow-lg animate-in fade-in duration-500 max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Selecione uma Clínica
                </CardTitle>
                <CardDescription>
                  Você precisa selecionar uma clínica para gerenciar a equipe de recepção.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleClinicSelection}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Escolha a clínica..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClinics.map(clinic => 
                      <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}

        {activeClinic && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center flex-wrap gap-y-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  Membros da Clínica: <span className="font-bold text-blue-700 ml-2">{activeClinic?.name}</span>
                </CardTitle>
                <CardDescription>Veja abaixo os membros da recepção e seus status de acesso.</CardDescription>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar Recepção
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Nova Recepcionista</DialogTitle>
                    <DialogDescription>
                      Preencha os dados abaixo para gerar um link de convite.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="receptionName">Nome Completo</Label>
                      <Input id="receptionName" value={receptionName} onChange={(e) => setReceptionName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receptionCpf">CPF (Opcional)</Label>
                      <Input id="receptionCpf" value={receptionCpf} onChange={(e) => setReceptionCpf(e.target.value)} />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? 
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Aguarde...
                          </> : 
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Gerar Convite
                          </>
                        }
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[300px]">Link de Convite</TableHead>
                      <TableHead>Acesso Concedido</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (<TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>) : 
                    receptionList.length > 0 ? receptionList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.full_name}</div>
                          <div className="text-sm text-slate-500">{item.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={{"Ativo":"default","Pendente":"secondary","Expirado":"destructive","Inativo":"outline","Desativado":"outline"}[item.status]} className={{"Ativo":"bg-green-100 text-green-800","Pendente":"bg-yellow-100 text-yellow-800","Expirado":"bg-red-100 text-red-800","Inativo":"bg-gray-100 text-gray-800","Desativado":"bg-gray-100 text-gray-800"}[item.status]}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {(item.status === 'Pendente' || item.status === 'Expirado') && item.invitation_token ? (
                            <div className="space-y-2"><div className="flex items-center gap-2"><Input value={getInviteLink(item.invitation_token)} readOnly className="h-8 text-xs font-mono" onClick={(e) => e.target.select()} /><Button variant="outline" size="sm" onClick={() => copyInviteLink(item.invitation_token)} className="h-8 px-3"><Copy className="h-3 w-3" /></Button></div>{item.status === 'Expirado' && <div className="text-xs font-medium text-red-600">⚠️ Link expirado</div>}{item.status === 'Pendente' && <div className="text-xs font-medium text-blue-600">✨ Link válido</div>}</div>
                          ) : item.status === 'Ativo' ? (
                            <div className="text-xs font-medium text-green-600">✅ Convite aceito</div>
                          ) : (
                            <div className="text-xs text-gray-500">-</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{item.accepted_at ? new Date(item.accepted_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {(item.status === 'Pendente' || item.status === 'Expirado') && (
                              <><Button variant="outline" size="sm" onClick={() => handleRenewInvitation(item)} disabled={isLoading || resendingId === item.id} className="h-8 px-2">{resendingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}{resendingId !== item.id && 'Novo'}</Button>
                              <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" className="h-8 px-2 border-orange-200 text-orange-600 hover:bg-orange-50" disabled={isLoading}><UserMinus className="mr-1 h-3 w-3" />Cancelar</Button></AlertDialogTrigger>
                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar Convite</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja cancelar o convite para {item.full_name}? Esta ação removerá o registro da recepcionista e o convite pendente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => handleCancelInvite(item)} className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>Confirmar Cancelamento</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                              </AlertDialog></>
                            )}
                            {item.status === 'Ativo' && (
                              <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isLoading} className="h-8 px-2"><Trash2 className="mr-1 h-3 w-3" />Remover</Button></AlertDialogTrigger>
                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Acesso da Recepção</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover o acesso de {item.full_name}? A recepcionista perderá o acesso ao sistema.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveReception(item)} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>Remover Acesso</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                              </AlertDialog>
                            )}
                            {(item.status === 'Inativo' || item.status === 'Desativado') && (
                              <>
                                {item.status === 'Desativado' ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleActivateInvitation(item)} 
                                    disabled={isLoading || activatingId === item.id}
                                    className="h-8 px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                                  >
                                    {activatingId === item.id ? 
                                      <Loader2 className="h-3 w-3 animate-spin" /> : 
                                      <><Send className="mr-1 h-3 w-3" />Ativar</>
                                    }
                                  </Button>
                                ) : ( // Se 'Inativo', significa que foi removido após aceitar
                                  <Badge variant="outline" className="text-xs">Acesso Removido</Badge>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (<TableRow><TableCell colSpan={5} className="text-center py-10"><div className="flex flex-col items-center justify-center gap-4"><UserPlus className="h-8 w-8 text-slate-400" /><p className="text-slate-500">Nenhum membro da recepção encontrado. Convide o primeiro!</p></div></TableCell></TableRow>)
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
