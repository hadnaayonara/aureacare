
import React, { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { User } from '@/api/entities';
import { MedicalRecord } from '@/api/entities'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from 'date-fns';
import {
  ArrowLeft,
  User as UserIcon,
  HeartPulse,
  Stethoscope,
  Save,
  Plus,
  Trash2,
  Building2,
  FileText,
  AlertTriangle,
  Info 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ensureArray } from '../utils';

const initialFormState = {
  // Clínica e Médico (These fields will remain in state, but their UI elements move and are optional for patient entity)
  // These are primarily for MedicalRecord creation, not for the Patient entity itself.
  clinic_id: '',
  assigned_doctor_id: '',

  // Dados Pessoais
  full_name: '',
  cpf: '',
  birth_date: '',
  gender: '',
  phone: '',
  email: '',
  address: {
    street: '',
    number: '',
    city: '',
    state: '',
    zip_code: ''
  },
  emergency_contact: {
    name: '',
    phone: '',
    relationship: ''
  },
  medical_plan: '',

  // Histórico Médico (These are part of Patient entity)
  allergies_text: '',
  chronic_conditions_text: '',
  current_medications_text: '',
  surgeries_text: '',
  hospitalizations_text: '',
  family_medical_history: '',

  // Prontuário Médico (Primeira Consulta) - These are filled if the optional section is used. Not part of Patient entity directly.
  consultation_date: format(new Date(), 'yyyy-MM-dd'),
  chief_complaint: '',
  history_present_illness: '',
  physical_examination: '',
  treatment_plan: '',
  follow_up_date: '',
  diagnosis: [''], // Note: Diagnosis and Prescriptions are also stored on Patient entity historically.
  prescriptions: [{
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }],

  // Nova Evolução do Paciente (Temporary field for new evolution)
  evolution_notes: ''
};

export default function NewPatientForm({ patientToEdit, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableClinics, setAvailableClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingEvolutions, setExistingEvolutions] = useState([]); // Evoluções existentes
  const { toast } = useToast();
  const isEditing = !!patientToEdit;

  // 1. Carregar usuário atual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        if (user && user.email) {
          setCurrentUser(user);
        } else {
          console.error("Usuário não encontrado ou sem email");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  // 2. Carregar clínicas disponíveis quando o usuário for carregado
  useEffect(() => {
    if (currentUser && currentUser.email) {
      const loadAvailableClinics = async (user) => {
        setIsLoadingClinics(true);
        try {
          if (!user || !user.email) {
            console.error("Usuário inválido para carregar clínicas");
            setAvailableClinics([]);
            return;
          }
    
          const userType = localStorage.getItem('userType');
          let clinicsResponse = [];
          
          if (userType === 'reception') {
            // For reception users, get clinics from the active clinic data
            const activeClinicData = JSON.parse(localStorage.getItem('activeClinic') || '{}');
            if (activeClinicData.id) {
              const clinic = await Clinic.get(activeClinicData.id);
              clinicsResponse = clinic ? [clinic] : [];
            }
          } else {
            // For host users, get their own clinics
            clinicsResponse = await Clinic.filter({
              created_by: user.email,
              is_active: true
            });
          }
    
          // FIX: Proteger contra dados indefinidos
          const userClinics = clinicsResponse ? ensureArray(clinicsResponse) : [];
          console.log("Clínicas carregadas:", userClinics);
          setAvailableClinics(userClinics);
    
        } catch (error) {
          console.error('Erro ao carregar clínicas:', error);
          setAvailableClinics([]);
        } finally {
          setIsLoadingClinics(false);
        }
      };
      loadAvailableClinics(currentUser);
    }
  }, [currentUser]);

  // 3. Carregar médicos quando uma clínica é selecionada
  useEffect(() => {
    if (formData.clinic_id && formData.clinic_id.trim() !== '') {
      const loadDoctorsForClinic = async (clinicId) => {
        setIsLoadingDoctors(true);
        try {
          if (!clinicId || clinicId.trim() === '') {
            console.error("ID da clínica inválido");
            setAvailableDoctors([]);
            return;
          }
    
          const doctorsResponse = await Doctor.filter({
            clinic_id: clinicId,
          });
    
          // FIX: Proteger contra dados indefinidos
          const clinicDoctors = doctorsResponse ? ensureArray(doctorsResponse) : [];
          console.log("Médicos carregados para clínica", clinicId, ":", clinicDoctors);
          setAvailableDoctors(clinicDoctors);
    
        } catch (error) {
          console.error('Erro ao carregar médicos:', error);
          setAvailableDoctors([]);
        } finally {
          setIsLoadingDoctors(false);
        }
      };
      loadDoctorsForClinic(formData.clinic_id);
    } else {
      setAvailableDoctors([]); // Limpa a lista de médicos se nenhuma clínica estiver selecionada
    }
  }, [formData.clinic_id]);

  const loadPatientEvolutions = useCallback(async () => {
    if (!patientToEdit || !patientToEdit.id) return;
    try {
      const evolutions = await MedicalRecord.filter(
        { patient_id: patientToEdit.id },
        '-consultation_date' // Assuming sorting by date desc
      );
      // Sort by consultation_date (descending) and created_date (descending) if consultation_date is the same
      const sortedEvolutions = ensureArray(evolutions).sort((a, b) => {
        const dateA = new Date(a.consultation_date);
        const dateB = new Date(b.consultation_date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        // If consultation_dates are equal, sort by created_date
        const createdA = new Date(a.created_date);
        const createdB = new Date(b.created_date);
        return createdB.getTime() - createdA.getTime();
      });
      setExistingEvolutions(sortedEvolutions);
    } catch (error) {
      console.error('Erro ao carregar evoluções do paciente:', error);
      setExistingEvolutions([]);
    }
  }, [patientToEdit]);

  // Carregar evoluções existentes quando em modo de edição
  useEffect(() => {
    if (patientToEdit && patientToEdit.id) {
      loadPatientEvolutions();
    }
  }, [patientToEdit, loadPatientEvolutions]);

  // Preencher formulário com dados do paciente para edição
  useEffect(() => {
    if (patientToEdit) {
      // FIX: Proteger contra propriedades indefinidas
      const allergies_text = (patientToEdit.allergies && Array.isArray(patientToEdit.allergies))
        ? patientToEdit.allergies.join(', ')
        : '';
      const chronic_conditions_text = (patientToEdit.chronic_conditions && Array.isArray(patientToEdit.chronic_conditions))
        ? patientToEdit.chronic_conditions.join(', ')
        : '';
      const current_medications_text = (patientToEdit.current_medications && Array.isArray(patientToEdit.current_medications))
        ? patientToEdit.current_medications.join(', ')
        : '';
      const surgeries_text = (patientToEdit.surgeries && Array.isArray(patientToEdit.surgeries))
        ? patientToEdit.surgeries.join(', ')
        : '';
      const hospitalizations_text = (patientToEdit.hospitalizations && Array.isArray(patientToEdit.hospitalizations))
        ? patientToEdit.hospitalizations.join(', ')
        : '';

      setFormData({
        ...initialFormState, // Start with initial state to clear new evolution_notes
        ...patientToEdit, // This will spread patientToEdit's properties, including those like diagnosis/prescriptions
        // If patientToEdit does not have clinic_id, then initialFormState's empty clinic_id will be used.
        allergies_text,
        chronic_conditions_text,
        current_medications_text,
        surgeries_text,
        hospitalizations_text,
        // FIX: Garantir que campos de array não sejam indefinidos no modo de edição
        diagnosis: Array.isArray(patientToEdit.diagnosis) ? patientToEdit.diagnosis : [''],
        prescriptions: Array.isArray(patientToEdit.prescriptions) && patientToEdit.prescriptions.length > 0
          ? patientToEdit.prescriptions
          : [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        // Garantir que objetos aninhados existam
        address: patientToEdit.address || { street: '', number: '', city: '', state: '', zip_code: '' },
        emergency_contact: patientToEdit.emergency_contact || { name: '', phone: '', relationship: '' },
        // Ensure evolution_notes is reset for new entries when editing
        evolution_notes: ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [patientToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSimpleArrayChange = (field, index, value) => {
    // FIX: Garantir que sempre trabalhamos com um array
    const oldArray = Array.isArray(formData[field]) ? formData[field] : [];
    const newArray = [...oldArray];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addSimpleArrayItem = (field, defaultValue) => {
    // FIX: Garantir que sempre trabalhamos com um array
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    setFormData(prev => ({
      ...prev,
      [field]: [...currentArray, defaultValue]
    }));
  };

  const removeSimpleArrayItem = (field, index) => {
    // FIX: Garantir que sempre trabalhamos com um array
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    if (currentArray.length <= 1) return; // Não permitir remoção se só há 1 item

    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    // FIX: Garantir que sempre trabalhamos com um array
    const currentPrescriptions = Array.isArray(formData.prescriptions) ? formData.prescriptions : [];
    const newPrescriptions = [...currentPrescriptions];

    if (newPrescriptions[index]) {
      newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    } else {
      // Se o índice não existir, criar um novo objeto
      newPrescriptions[index] = { medication: '', dosage: '', frequency: '', duration: '', instructions: '', [field]: value };
    }

    setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
  };

  const addPrescription = () => {
    // FIX: Garantir que sempre trabalhamos com um array
    const currentPrescriptions = Array.isArray(formData.prescriptions) ? formData.prescriptions : [];
    setFormData(prev => ({
      ...prev,
      prescriptions: [...currentPrescriptions, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removePrescription = (index) => {
    // FIX: Garantir que sempre trabalhamos com um array
    const currentPrescriptions = Array.isArray(formData.prescriptions) ? formData.prescriptions : [];
    if (currentPrescriptions.length <= 1) return;

    const newPrescriptions = currentPrescriptions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
        toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: "Seu usuário não foi identificado. Por favor, faça login novamente."
        });
        return;
    }

    setIsSubmitting(true);

    try {
      // Basic validation for patient entity itself (only full_name is mandatory now)
      if (!formData.full_name) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nome completo é obrigatório para o paciente."
        });
        setIsSubmitting(false);
        return;
      }

      // Determinar o host da conta
      const hostEmail = currentUser.app_role === 'host' || currentUser.app_role === 'admin' 
        ? currentUser.email 
        : currentUser.my_host_email;

      if (!hostEmail) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível identificar a conta proprietária para salvar o paciente."
        });
        setIsSubmitting(false);
        return;
      }

      // Processar arrays de texto
      const processTextToArray = (text) => {
        if (!text || typeof text !== 'string') return [];
        return text.split(',').map(item => item.trim()).filter(item => item !== '');
      };

      // Destructure medical record related fields and text-array fields from formData
      const {
        clinic_id, // Medical record specific
        assigned_doctor_id, // Medical record specific
        consultation_date, // Medical record specific
        chief_complaint, // Medical record specific
        history_present_illness, // Medical record specific
        physical_examination, // Medical record specific
        treatment_plan, // Medical record specific
        follow_up_date, // Medical record specific
        diagnosis, // Medical record specific (also on patient entity directly)
        prescriptions, // Medical record specific (also on patient entity directly)
        evolution_notes, // Medical record specific evolution
        allergies_text, // Patient history, but needs processing
        chronic_conditions_text, // Patient history, but needs processing
        current_medications_text, // Patient history, but needs processing
        surgeries_text, // Patient history, but needs processing
        hospitalizations_text, // Patient history, but needs processing
        ...patientCoreFormData // All other fields that are directly patient properties
      } = formData;

      // Prepare data for saving the main patient (excluding medical record specific fields)
      const patientData = {
        ...patientCoreFormData,
        owning_host_email: hostEmail, // ADICIONAR O HOST PROPRIETÁRIO
        allergies: processTextToArray(allergies_text),
        chronic_conditions: processTextToArray(chronic_conditions_text),
        current_medications: processTextToArray(current_medications_text),
        surgeries: processTextToArray(surgeries_text),
        hospitalizations: processTextToArray(hospitalizations_text),
        // Diagnosis and prescriptions are also stored on the Patient entity directly.
        diagnosis: Array.isArray(patientCoreFormData.diagnosis) ? patientCoreFormData.diagnosis.filter(d => d && d.trim() !== '') : [],
        prescriptions: Array.isArray(patientCoreFormData.prescriptions)
          ? patientCoreFormData.prescriptions.filter(p => p && p.medication && p.medication.trim() !== '')
          : [],
      };

      // --- Handle Medical Record creation (First Consultation or Evolution) ---

      let medicalRecordCreated = false; // This flag will now primarily track evolution creation from this component.

      // 1. New Patient & First Consultation filled (only if not editing)
      // We prepare the first consultation record to be passed to onSave,
      // the actual creation of MedicalRecord will be done in the parent's onSave.
      if (!isEditing && (
        chief_complaint || // Using destructured variables
        history_present_illness ||
        physical_examination ||
        (diagnosis && diagnosis.some(d => d.trim() !== '')) || // Using destructured variables
        (prescriptions && prescriptions.some(p => p.medication.trim() !== '')) || // Using destructured variables
        treatment_plan
      )) {
        // If any first consultation field is filled, clinic_id becomes mandatory for the Medical Record
        if (!clinic_id) { // Using destructured variable
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Para criar um prontuário de primeira consulta, a clínica é obrigatória."
          });
          setIsSubmitting(false);
          return;
        }
        if (!currentUser) { // Ensure user is available for created_by
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar a primeira consulta: usuário não identificado."
          });
          setIsSubmitting(false);
          return;
        }

        const firstConsultationRecord = {
          clinic_id: clinic_id, // Using destructured variable
          // patient_id will be set AFTER the patient is saved and we get its ID
          doctor_id: assigned_doctor_id || currentUser.id, // Using destructured variable
          consultation_date: consultation_date, // Using destructured variable
          chief_complaint: chief_complaint, // Using destructured variable
          history_present_illness: history_present_illness, // Using destructured variable
          physical_examination: physical_examination, // Using destructured variable
          diagnosis: patientData.diagnosis, // Using processed patientData diagnosis
          treatment_plan: treatment_plan, // Using destructured variable
          prescriptions: patientData.prescriptions, // Using processed patientData prescriptions
          follow_up_date: follow_up_date, // Using destructured variable
          created_by: currentUser.email,
          created_date: new Date().toISOString()
        };
        patientData.firstConsultationRecord = firstConsultationRecord; // Temporarily attach to patientData
      }

      // 2. Existing Patient & New Evolution filled
      if (isEditing && evolution_notes && evolution_notes.trim() !== '') { // Using destructured variable
        if (!currentUser) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar a evolução: usuário não identificado."
          });
          setIsSubmitting(false);
          return;
        }
        // For an evolution, clinic_id is mandatory. It must be selected in the form.
        const clinicIdForEvolution = clinic_id; // Using destructured clinic_id

        if (!clinicIdForEvolution) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Para salvar uma evolução, é necessário selecionar uma clínica."
          });
          setIsSubmitting(false);
          return;
        }

        const evolutionRecord = {
          clinic_id: clinicIdForEvolution,
          patient_id: patientToEdit.id,
          doctor_id: assigned_doctor_id || currentUser.id, // Using destructured variable
          consultation_date: format(new Date(), 'yyyy-MM-dd'),
          chief_complaint: 'Evolução do paciente',
          history_present_illness: evolution_notes, // Using destructured variable
          physical_examination: '', // Evolutions might not have these detailed fields
          diagnosis: [],
          treatment_plan: '',
          prescriptions: [],
          created_by: currentUser.email,
          created_date: new Date().toISOString()
        };

        try {
          await MedicalRecord.create(evolutionRecord);
          toast({
            title: "Sucesso!",
            description: "Evolução do paciente salva com sucesso."
          });
          medicalRecordCreated = true;
          await loadPatientEvolutions(); // Reload evolutions after saving
          setFormData(prev => ({ ...prev, evolution_notes: '' })); // Clear evolution notes after saving
        } catch (evolutionError) {
          console.error("Erro ao salvar evolução:", evolutionError);
          toast({
            variant: "destructive",
            title: "Erro ao salvar evolução",
            description: "Não foi possível salvar a evolução do paciente."
          });
          // Do not return, continue to save/update patient data
        }
      }

      // Save/update the main patient data
      // patientData already excludes clinic_id, assigned_doctor_id, and temporary fields
      const finalPatientData = { ...patientData };
      // firstConsultationRecord is now passed to onSave for parent component to handle
      // delete finalPatientData.firstConsultationRecord; // This is not needed anymore as onSave expects it if present.

      // MODIFICAÇÃO: Não esperamos mais o retorno do onSave, pois a lógica de prontuário foi simplificada.
      // Apenas passamos os dados completos.
      await onSave(finalPatientData);

      // A lógica de criação do prontuário agora está toda dentro do onSave na página Patients.js,
      // para garantir que o ID do paciente exista primeiro.
      // Esta simplificação evita a necessidade de `savedPatient` aqui.

      // Show success toast for patient save if no medical record was created internally (e.g., evolution).
      // If a first consultation was handled by the parent, its toast will come from there.
      if (!medicalRecordCreated) { // Only show this if an evolution was NOT just saved.
        toast({
          title: "Sucesso!",
          description: `Paciente ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.`
        });
      }

    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o paciente. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onCancel}
            className="bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditing ? 'Atualize as informações do paciente.' : 'Preencha as informações do paciente.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card de Dados Pessoais (replaces first accordion item visually) */}
          <Card className="shadow-lg border-0 mb-6 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <UserIcon className="w-6 h-6 text-blue-600" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Dados Pessoais */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <Label>Nome completo *</Label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plano de saúde</Label>
                  <Input
                    name="medical_plan"
                    value={formData.medical_plan}
                    onChange={handleInputChange}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Endereço */}
              <h4 className="font-semibold text-slate-600 mb-4 border-t pt-4 mt-6">Endereço</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input
                    value={formData.address?.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={formData.address?.number || ''}
                    onChange={(e) => handleNestedInputChange('address', 'number', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.address?.zip_code || ''}
                    onChange={(e) => handleNestedInputChange('address', 'zip_code', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.address?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.address?.state || ''}
                    onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Contato de emergência */}
              <h4 className="font-semibold text-slate-600 mb-4 border-t pt-4 mt-6">Contato de Emergência</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.emergency_contact?.name || ''}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'name', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.emergency_contact?.phone || ''}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'phone', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parentesco</Label>
                  <Input
                    value={formData.emergency_contact?.relationship || ''}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'relationship', e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Opcional de Prontuário - only for new patient, as evolutions are for existing */}
          {!isEditing && (
            <Accordion type="single" collapsible className="w-full mb-6">
              <AccordionItem value="first-consultation" className="border-0 shadow-lg bg-white rounded-lg">
                <AccordionTrigger className="p-6 hover:no-underline text-lg font-bold text-slate-900">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Adicionar Primeira Consulta (Opcional)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 border-t">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Preencha esta seção para criar o primeiro prontuário junto com o cadastro do paciente. Você pode deixar em branco e criar o prontuário depois.
                    </p>
                  </div>

                  {/* Clinic and Doctor Selection for First Consultation */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="clinic_id" className="font-semibold flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-blue-600" /> Clínica
                        {
                          (formData.chief_complaint ||
                            formData.history_present_illness ||
                            formData.physical_examination ||
                            (formData.diagnosis && formData.diagnosis.some(d => d.trim() !== '')) ||
                            (formData.prescriptions && formData.prescriptions.some(p => p.medication.trim() !== '')) ||
                            formData.treatment_plan
                          ) && <span className="text-red-500 ml-1">*</span>
                        }
                      </Label>
                      {isLoadingClinics ? (
                        <div className="flex items-center gap-2 text-blue-700 mt-1">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Carregando clínicas...</span>
                        </div>
                      ) : (
                        <Select
                          value={formData.clinic_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, clinic_id: value, assigned_doctor_id: '' }))}
                        >
                          <SelectTrigger id="clinic_id" className="mt-1 bg-white">
                            <SelectValue placeholder="Selecione a clínica" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClinics.length > 0 ? (
                              availableClinics.map((clinic) => (
                                <SelectItem key={clinic.id} value={clinic.id}>
                                  {clinic.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value={null} disabled>Nenhuma clínica encontrada</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {availableClinics.length === 0 && !isLoadingClinics && (
                        <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Nenhuma clínica ativa encontrada. Cadastre uma clínica primeiro.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="assigned_doctor_id" className="font-semibold flex items-center gap-1">
                        <Stethoscope className="w-4 h-4 text-green-600" /> Profissional
                      </Label>
                      {isLoadingDoctors ? (
                        <div className="flex items-center gap-2 text-green-700 mt-1">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Carregando médicos...</span>
                        </div>
                      ) : (
                        <Select
                          value={formData.assigned_doctor_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_doctor_id: value }))}
                          disabled={!formData.clinic_id}
                        >
                          <SelectTrigger id="assigned_doctor_id" className="mt-1 bg-white">
                            <SelectValue placeholder="Selecione o profissional (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Sem médico específico</SelectItem>
                            {availableDoctors.length > 0 ? (
                              availableDoctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.full_name} - {doctor.main_specialty}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value={null} disabled>Nenhum médico encontrado nesta clínica</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {availableDoctors.length === 0 && !isLoadingDoctors && formData.clinic_id && (
                        <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Nenhum médico encontrado nesta clínica. Você pode cadastrar o prontuário sem médico responsável.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* First Consultation Fields */}
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Data da consulta</Label>
                        <Input
                          type="date"
                          value={formData.consultation_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, consultation_date: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de retorno</Label>
                        <Input
                          type="date"
                          value={formData.follow_up_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Queixa principal</Label>
                      <Textarea
                        placeholder="Descreva a queixa principal do paciente"
                        value={formData.chief_complaint}
                        onChange={(e) => setFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>História da doença atual</Label>
                      <Textarea
                        placeholder="Descreva a história da doença atual"
                        value={formData.history_present_illness}
                        onChange={(e) => setFormData(prev => ({ ...prev, history_present_illness: e.target.value }))}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Exame físico</Label>
                      <Textarea
                        placeholder="Descreva os achados do exame físico"
                        value={formData.physical_examination}
                        onChange={(e) => setFormData(prev => ({ ...prev, physical_examination: e.target.value }))}
                        className="bg-white"
                      />
                    </div>

                    {/* Diagnósticos */}
                    <div className="space-y-2">
                      <Label>Diagnósticos</Label>
                      {(Array.isArray(formData.diagnosis) ? formData.diagnosis : ['']).map((diagnosis, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Diagnóstico ${index + 1}`}
                            value={diagnosis}
                            onChange={(e) => handleSimpleArrayChange('diagnosis', index, e.target.value)}
                            className="bg-white"
                          />
                          {formData.diagnosis.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSimpleArrayItem('diagnosis', index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSimpleArrayItem('diagnosis', '')}
                        className="bg-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Diagnóstico
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Plano de tratamento</Label>
                      <Textarea
                        placeholder="Descreva o plano de tratamento"
                        value={formData.treatment_plan}
                        onChange={(e) => setFormData(prev => ({ ...prev, treatment_plan: e.target.value }))}
                        className="bg-white"
                      />
                    </div>

                    {/* Prescrições */}
                    <div className="space-y-4">
                      <Label>Prescrições</Label>
                      {(Array.isArray(formData.prescriptions) ? formData.prescriptions : []).map((prescription, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 border p-4 rounded-lg bg-slate-50">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Medicação</Label>
                            <Input
                              placeholder="Nome da medicação"
                              value={prescription.medication || ''}
                              onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosagem</Label>
                            <Input
                              placeholder="50mg"
                              value={prescription.dosage || ''}
                              onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequência</Label>
                            <Input
                              placeholder="2x ao dia"
                              value={prescription.frequency || ''}
                              onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duração</Label>
                            <Input
                              placeholder="7 dias"
                              value={prescription.duration || ''}
                              onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="md:col-span-5 space-y-2">
                            <Label>Instruções</Label>
                            <div className="flex items-start gap-2">
                              <Textarea
                                placeholder="Instruções de uso"
                                value={prescription.instructions || ''}
                                onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                                className="bg-white h-20"
                              />
                              {formData.prescriptions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePrescription(index)}
                                  className="mt-1"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPrescription}
                        className="bg-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Prescrição
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Main Accordion for Historical Data and Evolutions */}
          <Accordion type="multiple" defaultValue={isEditing ? ["item-4"] : []} className="w-full space-y-6">

            {/* Histórico Médico */}
            <AccordionItem value="item-2" className="border-0 shadow-lg bg-white rounded-lg">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                  <HeartPulse className="w-6 h-6 text-red-600" />
                  Histórico Médico
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 border-t">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Alergias</Label>
                    <Textarea
                      placeholder="Liste as alergias separadas por vírgula"
                      value={formData.allergies_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies_text: e.target.value }))}
                      className="bg-white h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condições crônicas</Label>
                    <Textarea
                      placeholder="Liste as condições crônicas separadas por vírgula"
                      value={formData.chronic_conditions_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, chronic_conditions_text: e.target.value }))}
                      className="bg-white h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Medicações atuais</Label>
                    <Textarea
                      placeholder="Liste as medicações atuais separadas por vírgula"
                      value={formData.current_medications_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_medications_text: e.target.value }))}
                      className="bg-white h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cirurgias anteriores</Label>
                    <Textarea
                      placeholder="Liste as cirurgias separadas por vírgula"
                      value={formData.surgeries_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, surgeries_text: e.target.value }))}
                      className="bg-white h-24"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Internações anteriores</Label>
                    <Textarea
                      placeholder="Liste as internações separadas por vírgula"
                      value={formData.hospitalizations_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, hospitalizations_text: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Histórico familiar</Label>
                    <Textarea
                      placeholder="Descreva o histórico familiar de doenças"
                      value={formData.family_medical_history}
                      onChange={(e) => setFormData(prev => ({ ...prev, family_medical_history: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Nova seção: Evolução do Paciente (apenas para edição) */}
            {isEditing && (
              <AccordionItem value="item-4" className="border-0 shadow-lg bg-white rounded-lg">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex items-center gap-3 text-lg text-slate-900 font-bold">
                    <HeartPulse className="w-6 h-6 text-emerald-600" />
                    Evolução do Paciente
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 border-t">

                  {/* Evoluções Anteriores */}
                  {existingEvolutions.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Evoluções Anteriores
                      </h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {existingEvolutions.map((evolution, index) => (
                          <div key={evolution.id || index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">
                                  {format(new Date(evolution.consultation_date), 'dd/MM/yyyy')}
                                </span>
                                {evolution.doctor && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Dr. {evolution.doctor}
                                  </span>
                                )}
                                {evolution.created_by && evolution.created_by !== (evolution.doctor || '') && (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    Reg. por: {evolution.created_by.split('@')[0]}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500">
                                {format(new Date(evolution.created_date), 'HH:mm')}
                              </span>
                            </div>

                            {evolution.chief_complaint && evolution.chief_complaint !== 'Evolução do paciente' && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-slate-600">Queixa: </span>
                                <span className="text-sm text-slate-700">{evolution.chief_complaint}</span>
                              </div>
                            )}

                            {evolution.history_present_illness && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-slate-600">Evolução: </span>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{evolution.history_present_illness}</p>
                              </div>
                            )}

                            {evolution.treatment_plan && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-slate-600">Plano: </span>
                                <span className="text-sm text-slate-700">{evolution.treatment_plan}</span>
                              </div>
                            )}

                            {evolution.diagnosis && evolution.diagnosis.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {evolution.diagnosis.map((diag, diagIndex) => (
                                  <span key={diagIndex} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {diag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {evolution.prescriptions && evolution.prescriptions.length > 0 && (
                               <div className="mt-2">
                                  <span className="text-xs font-medium text-slate-600">Prescrições: </span>
                                  <ul className="list-disc list-inside text-sm text-slate-700">
                                    {evolution.prescriptions.map((p, pIndex) => (
                                      <li key={pIndex}>{p.medication} - {p.dosage} ({p.frequency})</li>
                                    ))}
                                  </ul>
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nova Evolução */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-600" />
                      Nova Evolução
                    </h4>

                    {/* Clinic and Doctor Selection for Evolution (if not already selected via patient data) */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="clinic_id_evolution" className="font-semibold flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-blue-600" /> Clínica <span className="text-red-500 ml-1">*</span>
                        </Label>
                        {isLoadingClinics ? (
                          <div className="flex items-center gap-2 text-blue-700 mt-1">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Carregando clínicas...</span>
                          </div>
                        ) : (
                          <Select
                            value={formData.clinic_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, clinic_id: value, assigned_doctor_id: '' }))}
                            id="clinic_id_evolution"
                          >
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Selecione a clínica para a evolução" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableClinics.length > 0 ? (
                                availableClinics.map((clinic) => (
                                  <SelectItem key={clinic.id} value={clinic.id}>
                                    {clinic.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value={null} disabled>Nenhuma clínica encontrada</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {availableClinics.length === 0 && !isLoadingClinics && (
                          <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Nenhuma clínica ativa encontrada.
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="assigned_doctor_id_evolution" className="font-semibold flex items-center gap-1">
                          <Stethoscope className="w-4 h-4 text-green-600" /> Profissional
                        </Label>
                        {isLoadingDoctors ? (
                          <div className="flex items-center gap-2 text-green-700 mt-1">
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Carregando médicos...</span>
                          </div>
                        ) : (
                          <Select
                            value={formData.assigned_doctor_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_doctor_id: value }))}
                            disabled={!formData.clinic_id}
                            id="assigned_doctor_id_evolution"
                          >
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Selecione o profissional (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>Sem médico específico</SelectItem>
                              {availableDoctors.length > 0 ? (
                                availableDoctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.full_name} - {doctor.main_specialty}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value={null} disabled>Nenhum médico encontrado nesta clínica</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {availableDoctors.length === 0 && !isLoadingDoctors && formData.clinic_id && (
                          <p className="text-sm text-amber-700 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Nenhum médico encontrado nesta clínica.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium text-emerald-800">
                          Data: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
                        </span>
                        {currentUser && (
                          <span className="text-sm text-emerald-700">
                            - {currentUser.full_name}
                          </span>
                        )}
                      </div>

                      <Textarea
                        placeholder="Descreva a evolução do paciente, observações da consulta atual, mudanças no quadro clínico, resposta ao tratamento, etc..."
                        value={formData.evolution_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, evolution_notes: e.target.value }))}
                        className="bg-white min-h-32"
                        rows={6}
                      />

                      <p className="text-xs text-emerald-700 mt-2">
                        💡 Esta evolução será salva como um novo registro no prontuário do paciente.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 mt-8 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
