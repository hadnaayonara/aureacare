
import React, { useState, useEffect, useCallback } from 'react';
import { MedicalRecord } from '@/api/entities';
import { Patient } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Building2,
  Stethoscope,
  User as UserIcon,
  FileText,
  HeartPulse,
  TestTube,
  Pill,
  StickyNote,
  Paperclip,
  Syringe,
  Brain,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Upload,
  Save
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from '../components/auth/AuthGuard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UploadFile } from '@/api/integrations';

const initialFormState = {
  // Seleção inicial
  clinic_id: '',
  doctor_id: '',
  patient_id: '',
  
  // Dados da Consulta
  consultation_date: format(new Date(), 'yyyy-MM-dd'),
  follow_up_date: '',
  chief_complaint: '',
  history_present_illness: '',
  physical_examination: '',
  diagnosis: [''],
  
  // Histórico Médico
  allergies: '',
  chronic_conditions: '',
  current_medications: '',
  previous_surgeries: '',
  previous_hospitalizations: '',
  family_history: '',
  
  // Exames Complementares
  lab_tests: [{
    test_name: '',
    result: '',
    date: '',
    reference_values: '',
    file_url: ''
  }],
  
  // Prescrições
  prescriptions: [{
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }],
  
  // Plano de Tratamento
  treatment_plan: '',
  
  // Notas de Evolução
  progress_notes: '',
  
  // Anexos
  attachments: [],
  
  // Vacinas
  vaccines: [{
    vaccine_name: '',
    application_date: '',
    next_dose_date: '',
    batch_number: '',
    notes: ''
  }],
  
  // Avaliação Psicológica/Social
  psychological_assessment: '',
  social_support: '',
  emotional_state: '',
  
  specialty: '',
  is_confidential: false
};

function NewMedicalRecordContent() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    fetchUser();
  }, []);

  // Load clinics
  useEffect(() => {
    if (currentUser) {
      const loadClinics = async () => {
        setIsLoadingClinics(true);
        try {
          const userType = localStorage.getItem('userType');
          let clinicsData = [];
          
          if (userType === 'reception' || userType === 'doctor') {
            const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
            if (activeClinic.id) {
              const clinic = await Clinic.get(activeClinic.id);
              clinicsData = clinic ? [clinic] : [];
            }
          } else {
            clinicsData = await Clinic.filter({ created_by: currentUser.email, is_active: true });
          }
          
          setClinics(clinicsData || []);
        } catch (error) {
          console.error('Erro ao carregar clínicas:', error);
          setClinics([]);
        } finally {
          setIsLoadingClinics(false);
        }
      };
      loadClinics();
    }
  }, [currentUser]);

  // Load doctors when clinic is selected
  useEffect(() => {
    if (formData.clinic_id) {
      const loadDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
          const doctorsData = await Doctor.filter({ clinic_id: formData.clinic_id });
          setDoctors(doctorsData || []);
        } catch (error) {
          console.error('Erro ao carregar médicos:', error);
          setDoctors([]);
        } finally {
          setIsLoadingDoctors(false);
        }
      };
      loadDoctors();
    }
  }, [formData.clinic_id]);

  // Load patients when clinic is selected
  useEffect(() => {
    if (formData.clinic_id) {
      const loadPatients = async () => {
        setIsLoadingPatients(true);
        try {
          const patientsData = await Patient.filter({ clinic_id: formData.clinic_id });
          setPatients(patientsData || []);
        } catch (error) {
          console.error('Erro ao carregar pacientes:', error);
          setPatients([]);
        } finally {
          setIsLoadingPatients(false);
        }
      };
      loadPatients();
    }
  }, [formData.clinic_id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSimpleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addSimpleArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeSimpleArrayItem = (field, index) => {
    if (formData[field].length <= 1) return;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file, type, index = null) => {
    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === 'attachment') {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            file_name: file.name,
            file_url: file_url,
            file_type: file.type,
            description: ''
          }]
        }));
      } else if (type === 'lab_test' && index !== null) {
        handleArrayChange('lab_tests', index, 'file_url', file_url);
      }
      
      toast({ title: "Sucesso!", description: "Arquivo enviado com sucesso." });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível fazer upload do arquivo." });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!formData.clinic_id || !formData.patient_id || !formData.doctor_id) {
        toast({ variant: "destructive", title: "Erro", description: "Clínica, paciente e médico são obrigatórios." });
        return;
      }

      const recordData = {
        clinic_id: formData.clinic_id,
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        consultation_date: formData.consultation_date,
        follow_up_date: formData.follow_up_date || null,
        chief_complaint: formData.chief_complaint,
        history_present_illness: formData.history_present_illness,
        physical_examination: formData.physical_examination,
        diagnosis: formData.diagnosis.filter(d => d.trim() !== ''),
        treatment_plan: formData.treatment_plan,
        prescriptions: formData.prescriptions.filter(p => p.medication.trim() !== ''),
        lab_tests: formData.lab_tests.filter(t => t.test_name.trim() !== ''),
        attachments: formData.attachments,
        is_confidential: formData.is_confidential,
        specialty: formData.specialty,
        created_by: currentUser.email,
        
        // Campos adicionais não padrão da entidade - podem ser salvos como notas ou campos customizados
        additional_data: {
          allergies: formData.allergies,
          chronic_conditions: formData.chronic_conditions,
          current_medications: formData.current_medications,
          previous_surgeries: formData.previous_surgeries,
          previous_hospitalizations: formData.previous_hospitalizations,
          family_history: formData.family_history,
          progress_notes: formData.progress_notes,
          vaccines: formData.vaccines.filter(v => v.vaccine_name.trim() !== ''),
          psychological_assessment: formData.psychological_assessment,
          social_support: formData.social_support,
          emotional_state: formData.emotional_state
        }
      };

      await MedicalRecord.create(recordData);
      
      toast({ title: "Sucesso!", description: "Prontuário criado com sucesso." });
      navigate(createPageUrl('Prontuarios'));
      
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o prontuário." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-0 md:p-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Prontuarios'))} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Novo Prontuário</h1>
            <p className="text-slate-600 mt-1">Criar um novo registro médico completo</p>
          </div>
        </div>

        <Card className="rounded-2xl shadow-lg border-0 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Seleção Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Clínica <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.clinic_id} onValueChange={(value) => handleInputChange('clinic_id', value)}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione a clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                  Médico <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.doctor_id} onValueChange={(value) => handleInputChange('doctor_id', value)} disabled={!formData.clinic_id}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} - {doctor.main_specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <UserIcon className="w-4 h-4 text-purple-600" />
                  Paciente <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleInputChange('patient_id', value)} disabled={!formData.clinic_id}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} {patient.cpf && `- ${patient.cpf}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Tabs defaultValue="consulta" className="w-full">
            <TabsList className="flex items-center gap-2 bg-slate-100 rounded-full p-1.5 mb-8 w-full lg:w-auto">
              <TabsTrigger value="consulta" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Consulta</TabsTrigger>
              <TabsTrigger value="historico" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Histórico</TabsTrigger>
              <TabsTrigger value="exames" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Exames</TabsTrigger>
              <TabsTrigger value="prescricoes" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Plano/Evolução</TabsTrigger>
              <TabsTrigger value="anexos" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Anexos</TabsTrigger>
              <TabsTrigger value="vacinas" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Vacinas</TabsTrigger>
              <TabsTrigger value="psicossocial" className="text-sm px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-semibold transition-all">Psicossocial</TabsTrigger>
            </TabsList>

            {/* Dados da Consulta */}
            <TabsContent value="consulta">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                    Dados da Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Data da consulta</Label>
                      <Input type="date" value={formData.consultation_date} onChange={(e) => handleInputChange('consultation_date', e.target.value)} className="rounded-xl h-12 mt-2"/>
                    </div>
                    <div>
                      <Label>Data de retorno</Label>
                      <Input type="date" value={formData.follow_up_date} onChange={(e) => handleInputChange('follow_up_date', e.target.value)} className="rounded-xl h-12 mt-2"/>
                    </div>
                  </div>

                  <div>
                    <Label>Queixa principal</Label>
                    <Textarea placeholder="Descreva a queixa principal do paciente" value={formData.chief_complaint} onChange={(e) => handleInputChange('chief_complaint', e.target.value)} className="h-24 rounded-xl mt-2" />
                  </div>

                  <div>
                    <Label>História da doença atual</Label>
                    <Textarea placeholder="Descreva a história da doença atual" value={formData.history_present_illness} onChange={(e) => handleInputChange('history_present_illness', e.target.value)} className="h-32 rounded-xl mt-2" />
                  </div>

                  <div>
                    <Label>Exame físico</Label>
                    <Textarea placeholder="Descreva os achados do exame físico" value={formData.physical_examination} onChange={(e) => handleInputChange('physical_examination', e.target.value)} className="h-32 rounded-xl mt-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Diagnósticos</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addSimpleArrayItem('diagnosis')} className="text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {formData.diagnosis.map((diagnosis, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input placeholder={`Diagnóstico ${index + 1}`} value={diagnosis} onChange={(e) => handleSimpleArrayChange('diagnosis', index, e.target.value)} className="rounded-xl h-12"/>
                          {formData.diagnosis.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSimpleArrayItem('diagnosis', index)} className="rounded-full">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Histórico Médico */}
            <TabsContent value="historico">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <HeartPulse className="w-6 h-6 text-red-600" />
                    Histórico Médico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Alergias</Label>
                      <Textarea placeholder="Liste alergias conhecidas" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                    <div>
                      <Label>Condições crônicas</Label>
                      <Textarea placeholder="Liste condições crônicas" value={formData.chronic_conditions} onChange={(e) => handleInputChange('chronic_conditions', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                     <div>
                      <Label>Medicações atuais</Label>
                      <Textarea placeholder="Liste medicações em uso" value={formData.current_medications} onChange={(e) => handleInputChange('current_medications', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                    <div>
                      <Label>Cirurgias anteriores</Label>
                      <Textarea placeholder="Liste cirurgias realizadas" value={formData.previous_surgeries} onChange={(e) => handleInputChange('previous_surgeries', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                    <div>
                      <Label>Internações anteriores</Label>
                      <Textarea placeholder="Liste internações" value={formData.previous_hospitalizations} onChange={(e) => handleInputChange('previous_hospitalizations', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                    <div>
                      <Label>Histórico familiar</Label>
                      <Textarea placeholder="Histórico familiar relevante" value={formData.family_history} onChange={(e) => handleInputChange('family_history', e.target.value)} className="h-24 rounded-xl mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exames Complementares */}
            <TabsContent value="exames">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TestTube className="w-6 h-6 text-green-600" />
                      Exames Complementares
                    </CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('lab_tests', { test_name: '', result: '', date: '', reference_values: '', file_url: '' })} className="text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    {formData.lab_tests.map((test, index) => (
                      <div key={index} className="border rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Exame {index + 1}</h4>
                          {formData.lab_tests.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('lab_tests', index)} className="rounded-full">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nome do exame</Label>
                            <Input placeholder="Ex: Hemograma completo" value={test.test_name} onChange={(e) => handleArrayChange('lab_tests', index, 'test_name', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Data</Label>
                            <Input type="date" value={test.date} onChange={(e) => handleArrayChange('lab_tests', index, 'date', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Resultado</Label>
                            <Textarea placeholder="Descreva o resultado do exame" value={test.result} onChange={(e) => handleArrayChange('lab_tests', index, 'result', e.target.value)} className="h-20 rounded-xl mt-1" />
                          </div>
                          <div>
                            <Label>Valores de referência</Label>
                            <Input placeholder="Ex: 12-16 g/dL" value={test.reference_values} onChange={(e) => handleArrayChange('lab_tests', index, 'reference_values', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Arquivo</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="file" onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'lab_test', index)} className="rounded-xl mt-1" accept=".pdf,.jpg,.jpeg,.png" />
                              {test.file_url && (
                                <Badge variant="default" className="shrink-0 bg-blue-100 text-blue-800">
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  Anexado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prescrições / Plano de Tratamento / Evolução */}
            <TabsContent value="prescricoes">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-xl">
                    <Pill className="w-6 h-6 text-blue-600" />
                    Plano de Tratamento e Evolução
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Prescrições */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-800">Prescrições Médicas</h3>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('prescriptions', { medication: '', dosage: '', frequency: '', duration: '', instructions: '' })} className="text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-6 mt-4">
                     {formData.prescriptions.map((prescription, index) => (
                      <div key={index} className="border rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Item {index + 1}</h4>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('prescriptions', index)} className="rounded-full">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="md:col-span-2">
                            <Label>Medicação</Label>
                            <Input placeholder="Nome da medicação" value={prescription.medication} onChange={(e) => handleArrayChange('prescriptions', index, 'medication', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Dosagem</Label>
                            <Input placeholder="Ex: 500mg" value={prescription.dosage} onChange={(e) => handleArrayChange('prescriptions', index, 'dosage', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Frequência</Label>
                            <Input placeholder="Ex: 2x ao dia" value={prescription.frequency} onChange={(e) => handleArrayChange('prescriptions', index, 'frequency', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                           <div>
                            <Label>Duração</Label>
                            <Input placeholder="Ex: 7 dias" value={prescription.duration} onChange={(e) => handleArrayChange('prescriptions', index, 'duration', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Instruções</Label>
                            <Textarea placeholder="Instruções de uso" value={prescription.instructions} onChange={(e) => handleArrayChange('prescriptions', index, 'instructions', e.target.value)} className="h-20 rounded-xl mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-8" />

                  {/* Plano de Tratamento */}
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">Plano de Tratamento Geral</h3>
                    <Textarea placeholder="Descreva o plano de tratamento geral, metas e próximos passos." value={formData.treatment_plan} onChange={(e) => handleInputChange('treatment_plan', e.target.value)} className="h-32 mt-2 rounded-xl" />
                  </div>

                  <Separator className="my-8" />
                  
                  {/* Notas de Evolução */}
                   <div>
                    <h3 className="font-semibold text-lg text-slate-800">Notas de Evolução</h3>
                    <Textarea placeholder="Registre observações sobre a evolução do paciente, resposta ao tratamento, mudanças no quadro clínico..." value={formData.progress_notes} onChange={(e) => handleInputChange('progress_notes', e.target.value)} className="h-40 mt-2 rounded-xl" />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* Anexos */}
            <TabsContent value="anexos">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Paperclip className="w-6 h-6 text-gray-600" />
                    Anexos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-slate-50">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <Label htmlFor="file-upload" className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600">
                        Clique para fazer upload de arquivos
                      </Label>
                      <Input id="file-upload" type="file" multiple onChange={(e) => Array.from(e.target.files).forEach(file => handleFileUpload(file, 'attachment'))} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                      <p className="text-sm text-gray-500 mt-2">Suporta PDF, imagens, documentos</p>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800">Arquivos anexados:</h4>
                        {formData.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-slate-700">{attachment.file_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input placeholder="Descrição do arquivo" value={attachment.description} onChange={(e) => handleArrayChange('attachments', index, 'description', e.target.value)} className="w-48 rounded-xl h-10" />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('attachments', index)} className="rounded-full">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vacinas */}
            <TabsContent value="vacinas">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Syringe className="w-6 h-6 text-green-600" />
                      Cartão de Vacinas
                    </CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('vaccines', { vaccine_name: '', application_date: '', next_dose_date: '', batch_number: '', notes: '' })} className="text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    {formData.vaccines.map((vaccine, index) => (
                      <div key={index} className="border rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Vacina {index + 1}</h4>
                          {formData.vaccines.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('vaccines', index)} className="rounded-full">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nome da vacina</Label>
                            <Input placeholder="Ex: COVID-19, Influenza" value={vaccine.vaccine_name} onChange={(e) => handleArrayChange('vaccines', index, 'vaccine_name', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Data de aplicação</Label>
                            <Input type="date" value={vaccine.application_date} onChange={(e) => handleArrayChange('vaccines', index, 'application_date', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Próxima dose</Label>
                            <Input type="date" value={vaccine.next_dose_date} onChange={(e) => handleArrayChange('vaccines', index, 'next_dose_date', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div>
                            <Label>Lote</Label>
                            <Input placeholder="Número do lote" value={vaccine.batch_number} onChange={(e) => handleArrayChange('vaccines', index, 'batch_number', e.target.value)} className="rounded-xl mt-1"/>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Observações</Label>
                            <Textarea placeholder="Reações adversas, observações..." value={vaccine.notes} onChange={(e) => handleArrayChange('vaccines', index, 'notes', e.target.value)} className="h-20 rounded-xl mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avaliação Psicossocial */}
            <TabsContent value="psicossocial">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="w-6 h-6 text-purple-600" />
                    Avaliação Psicológica e Social
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div>
                    <Label>Estado emocional</Label>
                    <Textarea placeholder="Avaliação do estado emocional do paciente" value={formData.emotional_state} onChange={(e) => handleInputChange('emotional_state', e.target.value)} className="h-24 rounded-xl mt-2" />
                  </div>
                  
                  <div>
                    <Label>Suporte familiar e social</Label>
                    <Textarea placeholder="Descreva o suporte familiar e social disponível" value={formData.social_support} onChange={(e) => handleInputChange('social_support', e.target.value)} className="h-24 rounded-xl mt-2" />
                  </div>
                  
                  <div>
                    <Label>Avaliação psicológica geral</Label>
                    <Textarea placeholder="Aspectos psicológicos relevantes para o tratamento" value={formData.psychological_assessment} onChange={(e) => handleInputChange('psychological_assessment', e.target.value)} className="h-32 rounded-xl mt-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 mt-8 pb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Prontuarios'))} className="h-12 px-6 rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.clinic_id || !formData.patient_id || !formData.doctor_id} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 px-8 rounded-xl font-semibold">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Prontuário
              </>
            )}
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default function NewMedicalRecord() {
  return (
    <AuthGuard>
      <NewMedicalRecordContent />
    </AuthGuard>
  );
}
