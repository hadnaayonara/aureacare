
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doctor } from '@/api/entities';
import { ClinicUser } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase, // Used for 'Editar Cadastro' button
  Loader2,
  Shield,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Calendar as CalendarIcon, // Aliased to avoid conflict with potential Calendar component
  Stethoscope,
  CreditCard,
  AlertCircle,
  Link as LinkIcon,
  Download // New icon for PDF export
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { exportDoctorProfile } from '@/api/functions'; // New import for export functionality

export default function DoctorView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState(null); // New state to store doctorId
  const [doctorData, setDoctorData] = useState(null); // Renamed from 'doctor' to 'doctorData'
  const [clinicData, setClinicData] = useState(null); // Added as per outline, not explicitly used in provided logic
  const [isLoading, setIsLoading] = useState(true);
  const [existingInvitation, setExistingInvitation] = useState(null);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // New state for export loading

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setDoctorId(id); // Store the ID in state
      loadDoctorData(id);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do profissional não fornecido."
      });
      navigate(createPageUrl('Doctors'));
    }
  }, [location.search, navigate, toast]);

  const loadDoctorData = async (id) => {
    setIsLoading(true);
    try {
      const doctorsData = await Doctor.filter({ id: id });
      if (doctorsData && doctorsData.length > 0) {
        const fetchedDoctorData = doctorsData[0];
        setDoctorData(fetchedDoctorData); // Set the renamed doctorData state
        
        // Check for existing invitation
        if (fetchedDoctorData.email && fetchedDoctorData.clinic_id) {
          try {
            const existingInvites = await ClinicUser.filter({
              clinic_id: fetchedDoctorData.clinic_id,
              invited_email: fetchedDoctorData.email,
              role: 'doctor'
            });

            if (existingInvites.length > 0) {
              setExistingInvitation(existingInvites[0]);
            }
          } catch (inviteError) {
            console.warn("Erro ao carregar convite existente:", inviteError);
          }
        }
      } else {
        toast({ 
          variant: "destructive", 
          title: "Erro", 
          description: "Profissional não encontrado." 
        });
        navigate(createPageUrl('Doctors'));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do profissional:', error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Não foi possível carregar os dados do profissional." 
      });
    }
    setIsLoading(false);
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleGenerateInvite = async () => {
    if (!doctorData || !doctorData.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Profissional deve ter um email válido para gerar convite."
      });
      return;
    }

    setIsProcessingInvite(true);
    try {
      const invitationToken = generateInvitationToken();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const clinicUserEntry = await ClinicUser.create({
        clinic_id: doctorData.clinic_id,
        user_id: 'pending',
        role: 'doctor',
        is_active: false,
        invitation_token: invitationToken,
        invitation_expires_at: expirationDate.toISOString(),
        invited_email: doctorData.email,
        doctor_id: doctorData.id
      });

      setExistingInvitation(clinicUserEntry);
      
      toast({
        title: "Convite Gerado!",
        description: "O link de convite foi gerado com sucesso e é válido por 7 dias."
      });
    } catch (error) {
      console.error("Erro ao gerar convite:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar o convite."
      });
    } finally {
      setIsProcessingInvite(false);
    }
  };

  const handleRenewInvite = async () => {
    if (!existingInvitation) return;

    setIsProcessingInvite(true);
    try {
      const newInvitationToken = generateInvitationToken();
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 7);

      const updatedInvite = await ClinicUser.update(existingInvitation.id, {
        invitation_token: newInvitationToken,
        invitation_expires_at: newExpirationDate.toISOString(),
      });

      setExistingInvitation(updatedInvite);
      
      toast({
        title: "Convite Renovado!",
        description: "Um novo link foi gerado e é válido por 7 dias."
      });
    } catch (error) {
      console.error("Erro ao renovar convite:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível renovar o convite."
      });
    } finally {
      setIsProcessingInvite(false);
    }
  };

  const copyInviteLink = () => {
    if (existingInvitation?.invitation_token) {
      const inviteUrl = `${window.location.origin}${createPageUrl('InviteAccept')}?token=${existingInvitation.invitation_token}`;
      navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link Copiado!",
        description: "O link de convite foi copiado para a área de transferência."
      });
    }
  };

  const openInviteLink = () => {
    if (existingInvitation?.invitation_token) {
      const inviteUrl = `${window.location.origin}${createPageUrl('InviteAccept')}?token=${existingInvitation.invitation_token}`;
      window.open(inviteUrl, '_blank');
    }
  };

  const getInvitationStatus = () => {
    if (!existingInvitation) return null;

    if (existingInvitation.accepted_at) {
      return { 
        status: 'accepted', 
        label: 'Aceito', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle 
      };
    }

    if (existingInvitation.invitation_expires_at) {
      const now = new Date();
      const expirationDate = new Date(existingInvitation.invitation_expires_at);

      if (expirationDate < now) {
        return { 
          status: 'expired', 
          label: 'Expirado', 
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle 
        };
      }
    }

    return { 
      status: 'pending', 
      label: 'Pendente', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock 
    };
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      if (!doctorId || !doctorData) {
        toast({ variant: "destructive", title: "Erro", description: "Dados do profissional não disponíveis para exportação." });
        return;
      }
      
      const response = await exportDoctorProfile({ doctor_id: doctorId });
      
      if (response && response.status === 200 && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = doctorData.full_name ? doctorData.full_name.replace(/\s/g, '_') : 'profissional';
        a.download = `perfil_${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({ title: "PDF Exportado", description: "O perfil do profissional foi exportado com sucesso." });
      } else {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar o PDF. Resposta inesperada do servidor." });
      }
    } catch (error) {
      console.error("Erro na chamada de exportação:", error);
      toast({ variant: "destructive", title: "Erro", description: `Ocorreu um erro na exportação: ${error.message || ''}` });
    } finally {
      setIsExporting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profissional não encontrado.</p>
      </div>
    );
  }

  const invitationStatus = getInvitationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Doctors'))}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Perfil do Profissional</h1>
              <p className="text-slate-600 mt-1">Detalhes de cadastro e serviços.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Exportar PDF
            </Button>
            <Button
              onClick={() => navigate(createPageUrl(`NewDoctor?id=${doctorId}`))}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Editar Cadastro
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{doctorData.full_name}</h2>
                  <p className="text-slate-600">{doctorData.main_specialty}</p>
                </div>
                
                {doctorData.sub_specialties && doctorData.sub_specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Subespecialidades:</h4>
                    <div className="flex flex-wrap gap-2">
                      {doctorData.sub_specialties.map((spec, index) => (
                        <Badge key={index} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{doctorData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Telefone</p>
                      <p className="font-medium">{doctorData.phone}</p>
                    </div>
                  </div>
                  {doctorData.cpf && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">CPF</p>
                        <p className="font-medium">{doctorData.cpf}</p>
                      </div>
                    </div>
                  )}
                  {doctorData.birth_date && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Data de Nascimento</p>
                        <p className="font-medium">
                          {new Date(doctorData.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-indigo-600" />
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Conselho</p>
                    <p className="font-medium">{doctorData.council_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Registro</p>
                    <p className="font-medium">{doctorData.council_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">UF</p>
                    <p className="font-medium">{doctorData.council_state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Card */}
            {doctorData.services && doctorData.services.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doctorData.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-slate-600">
                            {service.duration} minutos
                            {service.telemedicine_eligible && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800">Telemedicina</Badge>
                            )}
                          </p>
                        </div>
                        {service.price && (
                          <p className="font-semibold text-green-600">R$ {service.price}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule Card */}
            {doctorData.availability_schedule && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                    Disponibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {doctorData.availability_schedule.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="font-medium text-slate-700">{schedule.day_of_week}</span>
                        {schedule.is_active ? (
                          <span className="text-green-600 font-medium">
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        ) : (
                          <span className="text-slate-400">Indisponível</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* System Access Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  Acesso ao Sistema
                  {invitationStatus && (
                    <Badge className={`${invitationStatus.color} ml-2`}>
                      <invitationStatus.icon className="w-3 h-3 mr-1" />
                      {invitationStatus.label}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {!existingInvitation && (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-slate-600">
                      Este profissional ainda não possui acesso ao sistema.
                    </p>
                    <Button
                      onClick={handleGenerateInvite}
                      disabled={isProcessingInvite || !doctorData.email}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                    >
                      {isProcessingInvite ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Gerar Link de Convite
                        </>
                      )}
                    </Button>
                    {!doctorData.email && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          É necessário um email válido para gerar o convite.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {invitationStatus?.status === 'pending' && (
                  <div className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Convite pendente. O profissional ainda não acessou o link.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Button
                        onClick={copyInviteLink}
                        className="w-full"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link de Convite
                      </Button>
                      <Button
                        onClick={openInviteLink}
                        className="w-full"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Link
                      </Button>
                    </div>
                  </div>
                )}

                {invitationStatus?.status === 'expired' && (
                  <div className="space-y-4">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        O convite expirou. Gere um novo link para o profissional.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={handleRenewInvite}
                      disabled={isProcessingInvite}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    >
                      {isProcessingInvite ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Renovando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renovar Convite
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {invitationStatus?.status === 'accepted' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Acesso Ativo!</strong> O profissional já possui acesso ao sistema.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <h5 className="font-semibold text-slate-700 mb-2">Como funciona:</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Gere o link de convite para este profissional</li>
                    <li>• Copie e envie o link por email ou WhatsApp</li>
                    <li>• O profissional faz login e ganha acesso ao sistema</li>
                    <li>• Links são válidos por 7 dias</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Insurance/Plan Info */}
            {doctorData.accepted_insurances && doctorData.accepted_insurances.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    Convênios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {doctorData.accepted_insurances.map((insurance, index) => (
                      <div key={index} className="p-2 bg-slate-50 rounded">
                        <p className="font-medium">{insurance.name}</p>
                        {insurance.specific_rules && (
                          <p className="text-sm text-slate-600">{insurance.specific_rules}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
