
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { ClinicUser } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User as UserIcon, Briefcase, Save, Plus, Trash2, Loader2, Shield, AlertCircle, Clock, CheckCircle, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

const initialFormState = {
  full_name: '',
  cpf: '',
  birth_date: '',
  gender: 'Prefiro não informar',
  languages: [''],
  council_type: '',
  council_number: '',
  council_state: '',
  main_specialty: '',
  sub_specialties: [''],
  email: '',
  phone: '',
  landline: '',
  services: [{ name: '', duration: 30, price: '', telemedicine_eligible: false }],
  accepted_insurances: [{ name: '', specific_rules: '' }],
  availability_schedule: [
    { day_of_week: 'Segunda-feira', is_active: false, start_time: '08:00', end_time: '18:00' },
    { day_of_week: 'Terça-feira', is_active: false, start_time: '08:00', end_time: '18:00' },
    { day_of_week: 'Quarta-feira', is_active: false, start_time: '08:00', end_time: '18:00' },
    { day_of_week: 'Quinta-feira', is_active: false, start_time: '08:00', end_time: '18:00' },
    { day_of_week: 'Sexta-feira', is_active: false, start_time: '08:00', end_time: '18:00' },
    { day_of_week: 'Sábado', is_active: false, start_time: '09:00', end_time: '12:00' },
    { day_of_week: 'Domingo', is_active: false, start_time: '09:00', end_time: '12:00' },
  ],
  has_system_access: false
};

export default function NewDoctor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [doctorId, setDoctorId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [existingInvitation, setExistingInvitation] = useState(null);

  const loadClinics = useCallback(async () => {
    if (!currentUser) return;
    try {
      const clinicsResponse = await Clinic.filter({ created_by: currentUser.email });
      const clinicsData = ensureArray(clinicsResponse);
      const activeClinics = clinicsData.filter((clinic) => clinic.is_active);
      setClinics(activeClinics);

      if (activeClinics.length > 0) {
        setSelectedClinicId(activeClinics[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar clínicas:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as clínicas." });
    }
  }, [currentUser, toast]);

  const loadDoctorData = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const result = await Doctor.filter({ id: id });
      if (result && result.length > 0) {
        const doctorData = result[0];
        setFormData({
          ...initialFormState,
          ...doctorData,
          languages: doctorData.languages?.length > 0 ? doctorData.languages : [''],
          sub_specialties: doctorData.sub_specialties?.length > 0 ? doctorData.sub_specialties : [''],
          services: doctorData.services?.length > 0 ? doctorData.services : [{ name: '', duration: 30, price: '', telemedicine_eligible: false }],
          accepted_insurances: doctorData.accepted_insurances?.length > 0 ? doctorData.accepted_insurances : [{ name: '', specific_rules: '' }],
          availability_schedule: doctorData.availability_schedule?.length > 0 ? doctorData.availability_schedule : initialFormState.availability_schedule,
        });
        if (doctorData.clinic_id) {
          setSelectedClinicId(doctorData.clinic_id);
        }

        if (doctorData.has_system_access && doctorData.email && doctorData.clinic_id) {
          try {
            const existingInvites = await ClinicUser.filter({
              clinic_id: doctorData.clinic_id,
              invited_email: doctorData.email,
              role: 'doctor'
            });

            if (existingInvites.length > 0) {
              setExistingInvitation(existingInvites[0]);
            } else {
              setExistingInvitation(null);
            }
          } catch (inviteError) {
            console.warn("Erro ao carregar convite existente:", inviteError);
            setExistingInvitation(null);
          }
        } else {
          setExistingInvitation(null);
        }
      } else {
        toast({ variant: "destructive", title: "Erro", description: "Profissional não encontrado." });
        navigate(createPageUrl("Doctors"));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do profissional:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." });
    }
    setIsLoading(false);
  }, [toast, navigate]);

  useEffect(() => {
    if (currentUser) {
      loadClinics();
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (id) {
        setIsEditing(true);
        setDoctorId(id);
        loadDoctorData(id);
      } else {
        setIsLoading(false);
      }
    }
  }, [location.search, currentUser, loadClinics, loadDoctorData]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDynamicListChange = (listName, index, field, value) => {
    const newList = [...formData[listName]];
    if (typeof newList[index] === 'object') {
      newList[index] = { ...newList[index], [field]: value };
    } else {
      newList[index] = value;
    }
    setFormData((prev) => ({ ...prev, [listName]: newList }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.availability_schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData((prev) => ({ ...prev, availability_schedule: newSchedule }));
  };

  const addDynamicListItem = (listName, itemTemplate) => {
    setFormData((prev) => ({ ...prev, [listName]: [...(prev[listName] || []), itemTemplate] }));
  };

  const removeDynamicListItem = (listName, index) => {
    if (formData[listName].length <= 1) return;
    const newList = formData[listName].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [listName]: newList }));
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

  const handleRenewInvitation = async () => {
    if (!existingInvitation) return;
    
    setIsRenewing(true);
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
      setIsRenewing(false);
    }
  };

  const getInvitationStatus = () => {
    if (!existingInvitation) return null;

    if (existingInvitation.accepted_at) {
      return { status: 'accepted', label: 'Aceito', color: 'bg-green-100 text-green-800' };
    }

    if (existingInvitation.invitation_expires_at) {
      const now = new Date();
      const expirationDate = new Date(existingInvitation.invitation_expires_at);

      if (expirationDate < now) {
        return { status: 'expired', label: 'Expirado', color: 'bg-red-100 text-red-800' };
      }
    }

    return { status: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
  };
  
  const invitationStatus = getInvitationStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedClinicId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma clínica."
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const processedData = {
        ...formData,
        clinic_id: selectedClinicId,
        languages: formData.languages.filter((l) => l && l.trim() !== ''),
        sub_specialties: formData.sub_specialties.filter((s) => s && s.trim() !== ''),
        services: formData.services.filter((s) => s && s.name.trim() !== ''),
        accepted_insurances: formData.accepted_insurances.filter((i) => i && i.name.trim() !== '')
      };

      let createdOrUpdatedDoctor;

      if (isEditing) {
        await Doctor.update(doctorId, processedData);
        createdOrUpdatedDoctor = { id: doctorId, ...processedData };
        toast({ title: "Sucesso!", description: "Profissional atualizado com sucesso." });
      } else {
        createdOrUpdatedDoctor = await Doctor.create(processedData);
        toast({ title: "Sucesso!", description: "Profissional cadastrado com sucesso." });
      }

      // Process system access invitation - ONLY if it doesn't exist yet
      if (formData.has_system_access && formData.email && !existingInvitation) {
        try {
          const invitationToken = generateInvitationToken();
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);

          const clinicUserEntry = await ClinicUser.create({
            clinic_id: selectedClinicId,
            user_id: null, // Will be filled upon acceptance
            role: 'doctor',
            is_active: false, // Inicia como inativo
            invitation_token: invitationToken,
            invitation_expires_at: expirationDate.toISOString(),
            invited_email: formData.email,
            doctor_id: createdOrUpdatedDoctor.id,
            invited_by: currentUser.email // Consistência de campo
          });
          setExistingInvitation(clinicUserEntry);
          toast({ title: "Convite Criado", description: "O link de convite já pode ser copiado." });
        } catch (error) {
          console.error("Erro ao criar convite:", error);
          toast({ variant: "destructive", title: "Erro no Convite", description: "O profissional foi salvo, mas houve erro ao gerar o convite." });
        }
      }
      
      if (isEditing && !formData.has_system_access && existingInvitation && !existingInvitation.accepted_at) {
        try {
          await ClinicUser.delete(existingInvitation.id);
          setExistingInvitation(null);
          toast({ title: "Convite Removido", description: "O acesso ao sistema foi revogado." });
        } catch (error) {
          console.error("Erro ao remover convite:", error);
          toast({ variant: "destructive", title: "Erro", description: "Falha ao remover convite existente." });
        }
      }

      if (!isEditing) {
        navigate(createPageUrl("Doctors"));
      }
      // If editing, stay on the page to show the results (like the copyable link)
      
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o profissional." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const brazilianStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Doctors"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Editar Profissional' : 'Cadastro de Profissional'}</h1>
            <p className="text-slate-600 mt-1">{isEditing ? 'Atualize os dados do profissional.' : 'Preencha os dados do médico ou terapeuta.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full space-y-6">

            {/* Dados Pessoais e Profissionais */}
            <AccordionItem value="item-1" className="border-0 shadow-lg bg-white rounded-lg">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  Dados Pessoais e Credenciais
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-base font-semibold text-blue-900">Clínica *</Label>
                  <Select value={selectedClinicId} onValueChange={setSelectedClinicId} required>
                    <SelectTrigger className="bg-white mt-2"><SelectValue placeholder="Selecione a clínica" /></SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2 space-y-2"><Label>Nome completo *</Label><Input value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>CPF</Label><Input value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Data de nascimento</Label><Input type="date" value={formData.birth_date} onChange={(e) => handleInputChange('birth_date', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Gênero</Label><Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem><SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem></SelectContent></Select></div>
                </div>
                <h4 className="font-semibold text-slate-600 mb-4 border-t pt-4">Credenciais</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="space-y-2"><Label>Conselho *</Label><Input placeholder="CRM, CRP..." value={formData.council_type} onChange={(e) => handleInputChange('council_type', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Nº Registro *</Label><Input value={formData.council_number} onChange={(e) => handleInputChange('council_number', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>UF *</Label><Select value={formData.council_state} onValueChange={(v) => handleInputChange('council_state', v)} required><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{brazilianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Especialidade Principal *</Label><Input value={formData.main_specialty} onChange={(e) => handleInputChange('main_specialty', e.target.value)} required /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Idiomas</Label>{(formData.languages || ['']).map((lang, i) => <div key={i} className="flex gap-2"><Input value={lang} onChange={(e) => handleDynamicListChange('languages', i, null, e.target.value)} />{formData.languages.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('languages', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}</div>)}<Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('languages', '')}><Plus className="w-4 h-4 mr-2" />Adicionar</Button></div>
                  <div className="space-y-2"><Label>Subespecialidades</Label>{(formData.sub_specialties || ['']).map((sub, i) => <div key={i} className="flex gap-2"><Input value={sub} onChange={(e) => handleDynamicListChange('sub_specialties', i, null, e.target.value)} />{formData.sub_specialties.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('sub_specialties', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}</div>)}<Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('sub_specialties', '')}><Plus className="w-4 h-4 mr-2" />Adicionar</Button></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contato, Serviços e Convênios */}
            <AccordionItem value="item-2" className="border-0 shadow-lg bg-white rounded-lg">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                  Contato, Serviços e Convênios
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t">
                <h4 className="font-semibold text-slate-600 mb-4">Contato</h4>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2"><Label>E-mail *</Label><Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Celular/WhatsApp *</Label><Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Telefone Fixo</Label><Input value={formData.landline} onChange={(e) => handleInputChange('landline', e.target.value)} /></div>
                </div>
                <h4 className="font-semibold text-slate-600 mb-4 border-t pt-4">Serviços</h4>
                <div className="space-y-4 mb-6">{(formData.services || [{ name: '', duration: 30, price: '' }]).map((s, i) => <div key={i} className="grid md:grid-cols-5 gap-3 p-4 border rounded-lg items-end"><div className="md:col-span-2 space-y-2"><Label>Serviço</Label><Input value={s.name} onChange={(e) => handleDynamicListChange('services', i, 'name', e.target.value)} /></div><div className="space-y-2"><Label>Duração (min)</Label><Input type="number" value={s.duration} onChange={(e) => handleDynamicListChange('services', i, 'duration', e.target.value)} /></div><div className="space-y-2"><Label>Valor (R$)</Label><Input value={s.price} onChange={(e) => handleDynamicListChange('services', i, 'price', e.target.value)} /></div><div className="flex gap-4 items-center"><div className="flex items-center gap-2 pt-6"><Checkbox checked={s.telemedicine_eligible} onCheckedChange={(c) => handleDynamicListChange('services', i, 'telemedicine_eligible', c)} /><Label>Telemedicina</Label></div>{formData.services.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('services', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}</div></div>)}<Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('services', { name: '', duration: 30, price: '', telemedicine_eligible: false })}><Plus className="w-4 h-4 mr-2" />Adicionar</Button></div>
                <h4 className="font-semibold text-slate-600 mb-4 border-t pt-4">Convênios</h4>
                <div className="space-y-4">{(formData.accepted_insurances || [{ name: '', rules: '' }]).map((ins, i) => <div key={i} className="grid md:grid-cols-3 gap-3 p-4 border rounded-lg items-start"><div className="space-y-2"><Label>Convênio</Label><Input value={ins.name} onChange={(e) => handleDynamicListChange('accepted_insurances', i, 'name', e.target.value)} /></div><div className="md:col-span-2 flex items-start gap-2"><div className="flex-1 space-y-2"><Label>Regras</Label><Textarea value={ins.specific_rules} onChange={(e) => handleDynamicListChange('accepted_insurances', i, 'specific_rules', e.target.value)} /></div>{formData.accepted_insurances.length > 1 && <Button className="mt-7" type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('accepted_insurances', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}</div></div>)}<Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('accepted_insurances', { name: '', specific_rules: '' })}><Plus className="w-4 h-4 mr-2" />Adicionar</Button></div>
              </AccordionContent>
            </AccordionItem>

            {/* Disponibilidade de Horários */}
            <AccordionItem value="item-4" className="border-0 shadow-lg bg-white rounded-lg">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                  <Clock className="w-6 h-6 text-cyan-600" />
                  Disponibilidade de Horários
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t">
                <div className="space-y-4">{formData.availability_schedule.map((day, i) => <div key={i} className="grid md:grid-cols-4 gap-4 items-center p-3 border rounded-lg"><div className="md:col-span-1 flex items-center gap-3"><Checkbox id={`is_active_${i}`} checked={day.is_active} onCheckedChange={(c) => handleScheduleChange(i, 'is_active', c)} /><Label htmlFor={`is_active_${i}`} className="font-semibold">{day.day_of_week}</Label></div><div className="md:col-span-3 grid grid-cols-2 gap-4"><div><Label>Início</Label><Input type="time" value={day.start_time} onChange={(e) => handleScheduleChange(i, 'start_time', e.target.value)} disabled={!day.is_active} /></div><div><Label>Fim</Label><Input type="time" value={day.end_time} onChange={(e) => handleScheduleChange(i, 'end_time', e.target.value)} disabled={!day.is_active} /></div></div></div>)}</div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Acesso ao Sistema - REBUILT LOGIC */}
            {invitationStatus?.status !== 'accepted' && (
              <AccordionItem value="item-3" className="border-0 shadow-lg bg-white rounded-lg">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                    <Shield className="w-6 h-6 text-emerald-600" />
                    Acesso ao Sistema
                    {invitationStatus && <Badge className={`${invitationStatus.color} ml-2`}>{invitationStatus.label}</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 border-t">
                  
                  {!invitationStatus && (
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-200">
                      <div className="flex items-start gap-4">
                        <Checkbox id="has_system_access" checked={formData.has_system_access} onCheckedChange={(c) => handleInputChange('has_system_access', c)} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="has_system_access" className="text-base font-semibold text-emerald-900 cursor-pointer">🔗 Gerar link de convite para acesso ao sistema</Label>
                          <p className="text-sm text-emerald-700 mt-2">Ao marcar e salvar, um link de convite único será gerado.</p>
                          {formData.has_system_access && !formData.email && <Alert className="mt-4 border-orange-300 bg-orange-50"><AlertCircle className="h-4 w-4 text-orange-600" /><AlertDescription className="text-orange-800">Preencha o email na seção "Contato" para gerar o convite.</AlertDescription></Alert>}
                        </div>
                      </div>
                    </div>
                  )}

                  {invitationStatus?.status === 'pending' && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Convite Pendente</h3>
                      <p className="text-blue-700 mb-4">Um link de convite já foi gerado e aguarda aceitação.</p>
                      <div className="flex gap-2"><Button type="button" onClick={copyInviteLink} className="flex-1"><Copy className="w-4 h-4 mr-2" />Copiar Link</Button><Button type="button" variant="outline" onClick={() => window.open(`${window.location.origin}${createPageUrl('InviteAccept')}?token=${existingInvitation.invitation_token}`, '_blank')}><ExternalLink className="w-4 h-4" /></Button></div>
                    </div>
                  )}

                  {invitationStatus?.status === 'expired' && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Convite Expirado</h3>
                      <p className="text-red-700 mb-4">O link anterior expirou. Clique abaixo para gerar um novo.</p>
                      <Button type="button" onClick={handleRenewInvitation} disabled={isRenewing}>
                        {isRenewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Renovar Convite
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold text-slate-700 mb-3">Como funciona:</h4>
                    <ul className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                        <li>Após salvar, o link de convite é gerado e exibido aqui.</li>
                        <li>Copie e envie o link para o profissional.</li>
                        <li>O profissional clica, faz login com Google e o acesso é liberado.</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <div className="flex justify-end gap-4 mt-8 pb-8">
            <Button type="button" variant="outline" onClick={() => navigate(isEditing ? createPageUrl(`DoctorView?id=${doctorId}`) : createPageUrl('Doctors'))} disabled={isSubmitting}>
              {isEditing ? 'Voltar' : 'Cancelar'}
            </Button>
            <Button type="submit" disabled={isSubmitting || isRenewing}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Profissional'}
            </Button>
          </div>
        </form>
      </div>
    </div>);
}
