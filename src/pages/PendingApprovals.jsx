import React, { useState, useEffect } from 'react';
import { UserRegistration } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users as UsersIcon,
  Search,
  Eye,
  UserCheck,
  UserX,
  Building2,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PendingApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadRegistrations();
    }
  }, [isAuthorized]);

  useEffect(() => {
    filterRegistrations();
  }, [searchTerm, registrations]);

  const checkAuthorization = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);

      if (userData.email === 'hadnaguinho@gmail.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Esta página é restrita apenas ao administrador principal."
        });
        setTimeout(() => navigate(createPageUrl('Dashboard')), 3000);
      }
    } catch (error) {
      console.error("Erro ao verificar autorização:", error);
      navigate(createPageUrl('Auth'));
    }
  };

  const loadRegistrations = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os registros, independentemente de quem os criou.
      // A página de aprovação deve ver todas as solicitações.
      const registrationsData = await UserRegistration.filter(
        {}, // Filtro vazio para buscar todos os registros
        '-created_date'
      );
      setRegistrations(registrationsData);
      setFilteredRegistrations(registrationsData);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os registros." });
    }
    setIsLoading(false);
  };

  const filterRegistrations = () => {
    if (!searchTerm.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = registrations.filter((registration) =>
      registration.full_name?.toLowerCase().includes(lowercasedFilter) ||
      registration.email?.toLowerCase().includes(lowercasedFilter) ||
      registration.clinic_name?.toLowerCase().includes(lowercasedFilter) ||
      registration.city_state?.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredRegistrations(filtered);
  };

  const handleApproval = async (registrationId, approved, reason = '') => {
    setIsProcessing(true);
    try {
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approved_by: currentUser.email,
        approved_at: new Date().toISOString(),
        ...(reason && { rejection_reason: reason })
      };

      await UserRegistration.update(registrationId, updateData);

      toast({
        title: approved ? "✅ Usuário Aprovado!" : "❌ Usuário Rejeitado!",
        description: approved ?
          "O usuário poderá acessar a plataforma no próximo login." :
          "O usuário foi rejeitado e não terá acesso à plataforma."
      });

      await loadRegistrations();
      // Close dialog if open
      const dialogCloseButton = document.querySelector('[data-radix-dialog-close]');
      if (dialogCloseButton) dialogCloseButton.click();
      
      setSelectedRegistration(null);
      setRejectionReason('');

    } catch (error) {
      console.error("Erro ao processar aprovação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar a solicitação."
      });
    }
    setIsProcessing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Toaster />
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">Acesso Restrito</h2>
            <p className="text-red-700 mb-6">
              Esta área é exclusiva do administrador principal da plataforma.
            </p>
            <div className="text-sm text-red-600">
              Redirecionando em alguns segundos...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Aprovação de Cadastros
          </h1>
          <p className="text-slate-600">
            Gerencie as solicitações de acesso à plataforma Aurea Lab.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{registrations.length}</p>
                </div>
                <UsersIcon className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pendentes</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Aprovados</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Rejeitados</p>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Pesquisar por nome, email, clínica ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-slate-900">
              Solicitações de Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Usuário</TableHead>
                      <TableHead className="font-semibold">Clínica</TableHead>
                      <TableHead className="font-semibold">Contato</TableHead>
                      <TableHead className="font-semibold">Localização</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          Nenhuma solicitação encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900">{registration.full_name}</div>
                              <div className="text-sm text-slate-500">{registration.email}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Stethoscope className="w-3 h-3" />
                                {registration.main_specialty}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{registration.clinic_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {registration.phone}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {registration.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{registration.city_state}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(registration.status)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(registration.created_date)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Dialog onOpenChange={(open) => open && setSelectedRegistration(registration)}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Ver
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Cadastro</DialogTitle>
                                  </DialogHeader>
                                  {selectedRegistration && (
                                    <div className="space-y-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Informações Pessoais</h4>
                                          <div className="space-y-2 text-sm">
                                            <p><strong>Nome:</strong> {selectedRegistration.full_name}</p>
                                            <p><strong>Email:</strong> {selectedRegistration.email}</p>
                                            <p><strong>Telefone:</strong> {selectedRegistration.phone}</p>
                                            <p><strong>Localização:</strong> {selectedRegistration.city_state}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Informações Profissionais</h4>
                                          <div className="space-y-2 text-sm">
                                            <p><strong>Clínica:</strong> {selectedRegistration.clinic_name}</p>
                                            <p><strong>Especialidade:</strong> {selectedRegistration.main_specialty}</p>
                                            <p><strong>Status:</strong> {getStatusBadge(selectedRegistration.status)}</p>
                                            <p><strong>Cadastro:</strong> {formatDate(selectedRegistration.created_date)}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {selectedRegistration.status === 'pending' && (
                                        <div className="flex flex-col gap-4 pt-6 border-t">
                                          <Label>Motivo da rejeição (necessário para rejeitar)</Label>
                                          <Textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Ex: Informações de cadastro incompletas."
                                            className="mt-1"
                                          />
                                          <div className="flex gap-4">
                                            <Button
                                              onClick={() => handleApproval(selectedRegistration.id, true)}
                                              disabled={isProcessing}
                                              className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                              <UserCheck className="w-4 h-4 mr-2" />
                                              Aprovar Acesso
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              className="flex-1"
                                              onClick={() => {
                                                if (rejectionReason.trim()) {
                                                  handleApproval(selectedRegistration.id, false, rejectionReason);
                                                } else {
                                                  toast({
                                                    variant: "destructive",
                                                    title: "Motivo Obrigatório",
                                                    description: "Você precisa informar o motivo para rejeitar um cadastro."
                                                  });
                                                }
                                              }}
                                              disabled={isProcessing || !rejectionReason.trim()}
                                            >
                                              <UserX className="w-4 h-4 mr-2" />
                                              Rejeitar Cadastro
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {selectedRegistration.status === 'rejected' && selectedRegistration.rejection_reason && (
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                                          <h4 className="font-semibold text-red-900 mb-2">Motivo da Rejeição:</h4>
                                          <p className="text-red-700">{selectedRegistration.rejection_reason}</p>
                                        </div>
                                      )}
                                       {selectedRegistration.status === 'approved' && (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                                          <h4 className="font-semibold text-green-900 mb-2">Cadastro Aprovado</h4>
                                          <p className="text-green-700">Aprovado por: {selectedRegistration.approved_by || 'N/A'}</p>
                                           <p className="text-green-700">Em: {formatDate(selectedRegistration.approved_at)}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {registration.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproval(registration.id, true)}
                                    disabled={isProcessing}
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </Button>
                                  <Dialog onOpenChange={(open) => { if (open) { setSelectedRegistration(registration); setRejectionReason(''); }}}>
                                     <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={isProcessing}
                                          className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <UserX className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Rejeitar Cadastro</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                           <p>Você está prestes a rejeitar o cadastro de <strong>{selectedRegistration?.full_name}</strong>. Por favor, informe o motivo.</p>
                                           <Textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Ex: Documentação inválida."
                                          />
                                        </div>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleApproval(selectedRegistration.id, false, rejectionReason)}
                                          disabled={isProcessing || !rejectionReason.trim()}
                                        >
                                          Confirmar Rejeição
                                        </Button>
                                      </DialogContent>
                                  </Dialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}