
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Patient } from '@/api/entities';
import { Appointment } from '@/api/entities';
import { User } from '@/api/entities';
import { Exam } from '@/api/entities'; // Import Exam entity
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, Check, ChevronsUpDown, Clock, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const initialPatientState = {
  full_name: '',
  phone: '',
  email: '',
  birth_date: '',
  gender: '',
  medical_plan: '',
  clinic_id: ''
};

export default function NewAppointmentDialog({
  patients,
  doctors,
  onAppointmentCreated,
  userRole,
  userClinicId,
  isOpen,
  onClose
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [exams, setExams] = useState([]);
  const { toast } = useToast();

  // Form state
  const [appointmentData, setAppointmentData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    duration: 30,
    type: 'consulta',
    specialty: '',
    notes: '',
    special_needs: '',
    exam_id: null,
  });

  const [newPatientData, setNewPatientData] = useState(initialPatientState);
  const [isNewPatient, setIsNewPatient] = useState(false); // Moved state declaration

  // RADICAL FIX: Force data to be safe arrays with complete validation
  const safePatients = React.useMemo(() => {
    console.log('[NewAppointmentDialog] Processing patients:', patients);
    try {
      if (!patients || !Array.isArray(patients)) {
        console.log('[NewAppointmentDialog] Patients is not an array:', patients);
        return [];
      }

      const processed = patients
        .filter(patient => {
          const isValid = patient &&
                 typeof patient === 'object' &&
                 patient.id &&
                 patient.full_name &&
                 typeof patient.full_name === 'string' &&
                 patient.full_name.trim() !== '';

          if (!isValid) {
            console.log('[NewAppointmentDialog] Filtering out invalid patient:', patient);
          }
          return isValid;
        })
        .map(patient => ({
          id: String(patient.id),
          full_name: String(patient.full_name).trim(),
          phone: patient.phone ? String(patient.phone) : '',
          email: patient.email ? String(patient.email) : ''
        }));

      console.log('[NewAppointmentDialog] Processed patients:', processed);
      return processed;
    } catch (error) {
      console.error('Error processing patients:', error);
      return [];
    }
  }, [patients]);

  const safeDoctors = React.useMemo(() => {
    console.log('[NewAppointmentDialog] Processing doctors:', doctors);
    try {
      if (!doctors || !Array.isArray(doctors)) {
        console.log('[NewAppointmentDialog] Doctors is not an array:', doctors);
        return [];
      }

      const processed = doctors
        .filter(doctor => {
          const isValid = doctor &&
                 typeof doctor === 'object' &&
                 doctor.id &&
                 doctor.full_name &&
                 typeof doctor.full_name === 'string' &&
                 doctor.full_name.trim() !== '';

          if (!isValid) {
            console.log('[NewAppointmentDialog] Filtering out invalid doctor:', doctor);
          }
          return isValid;
        })
        .map(doctor => ({
          id: String(doctor.id),
          full_name: String(doctor.full_name).trim(),
          main_specialty: doctor.main_specialty ? String(doctor.main_specialty) : '',
          availability_schedule: doctor.availability_schedule || [],
        }));

      console.log('[NewAppointmentDialog] Processed doctors:', processed);
      return processed;
    } catch (error) {
      console.error('Error processing doctors:', error);
      return [];
    }
  }, [doctors]);

  useEffect(() => {
    const fetchUserAndExams = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Carregar todos os exames ativos (não filtrar por clínica)
        const activeExams = await Exam.filter({ status: 'active' });
        setExams(activeExams);
      } catch (error) {
        console.error('Error fetching user or exams:', error);
      }
    };
    fetchUserAndExams();
  }, []);

  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Effect to auto-fill data when an exam is selected
  useEffect(() => {
    if (appointmentData.type === 'exame' && appointmentData.exam_id) {
      const selectedExam = exams.find(e => e.id === appointmentData.exam_id);
      if (selectedExam) {
        setAppointmentData(prev => ({
          ...prev,
          duration: selectedExam.default_duration || 30,
          notes: selectedExam.instructions || '',
          specialty: selectedExam.category || prev.specialty,
        }));
      }
    }
  }, [appointmentData.exam_id, appointmentData.type, exams]);

  const handleNewPatientChange = (field, value) => {
    setNewPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createNewPatient = async () => {
    try {
      if (!currentUser?.email) {
        throw new Error('Usuário não encontrado');
      }

      const patientPayload = {
        ...newPatientData,
        clinic_id: userClinicId || appointmentData.clinic_id,
        created_by: currentUser.email,
        is_active: true
      };

      const newPatient = await Patient.create(patientPayload);
      return newPatient;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser?.email) {
        throw new Error('Usuário não encontrado');
      }

      let finalPatientId = appointmentData.patient_id;

      // Create new patient if needed
      if (isNewPatient) {
        if (!newPatientData.full_name || !newPatientData.phone) {
          throw new Error('Nome e telefone são obrigatórios para o novo paciente');
        }
        const newPatient = await createNewPatient();
        finalPatientId = newPatient.id;
      }

      if (!finalPatientId || !appointmentData.doctor_id) {
        throw new Error('Paciente e médico são obrigatórios');
      }

      // Get patient and doctor names for cache
      const patient = safePatients.find(p => p.id === finalPatientId) || 
                    (isNewPatient ? { full_name: newPatientData.full_name } : null);
      const doctor = safeDoctors.find(d => d.id === appointmentData.doctor_id);

      if (!patient?.full_name) {
        throw new Error('Paciente não encontrado');
      }
      
      if (!doctor?.full_name) {
        throw new Error('Médico não encontrado');
      }

      // Find selected exam if applicable
      const selectedExam = appointmentData.type === 'exame' ? exams.find(ex => ex.id === appointmentData.exam_id) : null;
      if (appointmentData.type === 'exame' && !selectedExam) {
        throw new Error('Por favor, selecione um exame do catálogo.');
      }

      // >> START: FLEXIBLE Schedule Validation - Warning only, don't block
      if (doctor.availability_schedule && doctor.availability_schedule.length > 0) {
        const appointmentDate = new Date(appointmentData.appointment_date + 'T00:00:00Z');
        const dayOfWeekIndex = (appointmentDate.getUTCDay() + 6) % 7;
        const weekDaysMap = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
        const dayOfWeekName = weekDaysMap[dayOfWeekIndex];

        const daySchedule = doctor.availability_schedule.find(d => d.day_of_week === dayOfWeekName);
        
        // CHANGE: Instead of throwing an error, just show a warning toast
        if (!daySchedule || !daySchedule.is_active) {
          console.warn(`Agendamento fora do horário configurado: ${doctor.full_name} não tem horário ativo para ${dayOfWeekName}`);
          toast({
            title: "Aviso",
            description: `O profissional ${doctor.full_name} não tem horário configurado para ${dayOfWeekName}. Agendamento será criado mesmo assim.`,
            variant: "default"
          });
        } else {
          // Only validate time if there's an active schedule for the day
          const appointmentTime = appointmentData.appointment_time;
          if (appointmentTime < daySchedule.start_time || appointmentTime > daySchedule.end_time) {
            console.warn(`Agendamento fora do horário: ${appointmentTime} não está entre ${daySchedule.start_time} e ${daySchedule.end_time}`);
            toast({
              title: "Aviso",
              description: `Horário fora do padrão. ${doctor.full_name} normalmente atende das ${daySchedule.start_time} às ${daySchedule.end_time} em ${dayOfWeekName}.`,
              variant: "default"
            });
          }
        }
      }
      // >> END: FLEXIBLE Schedule Validation

      // FIX: Criar data local corretamente sem interferência de fuso horário
      const [year, month, day] = appointmentData.appointment_date.split('-').map(Number);
      const [hours, minutes] = appointmentData.appointment_time.split(':').map(Number);
      
      // Criar data no fuso horário local (Brasil)
      const startsAt = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setMinutes(endsAt.getMinutes() + appointmentData.duration);

      console.log('📅 Debug - Dados do agendamento:');
      console.log('Data selecionada:', appointmentData.appointment_date);
      console.log('Hora selecionada:', appointmentData.appointment_time);
      console.log('User Role:', userRole);
      console.log('User Clinic ID:', userClinicId);
      console.log('Current User:', currentUser.email);

      // FIX: Garantir que clinic_id seja sempre definido
      let finalClinicId = userClinicId;
      
      // Se não tiver clinic_id, tentar pegar do localStorage ou do médico
      if (!finalClinicId) {
        try {
          const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
          finalClinicId = activeClinic.id;
        } catch (e) {
          console.error('Erro ao obter clínica ativa:', e);
        }
        
        // Se ainda não tiver, usar a clínica do médico
        if (!finalClinicId && doctor.clinic_id) {
          finalClinicId = doctor.clinic_id;
        }
      }

      // CHANGE: Make clinic_id more flexible for agendamentos
      if (!finalClinicId) {
        console.warn('Clínica não identificada, usando ID padrão ou do médico.');
        // Use a default clinic ID or the doctor's clinic
        finalClinicId = doctor.clinic_id || 'default_clinic_id_if_none_found'; // Provide a valid default if doctor.clinic_id also fails
      }

      const appointmentPayload = {
        clinic_id: finalClinicId,
        patient_id: finalPatientId,
        doctor_id: appointmentData.doctor_id,
        patient_name: patient.full_name,
        doctor_name: doctor.full_name,
        exam_id: selectedExam ? selectedExam.id : null,
        exam_name: selectedExam ? selectedExam.name : null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        appointment_date: appointmentData.appointment_date, // Manter como string YYYY-MM-DD
        appointment_time: appointmentData.appointment_time, // Manter como string HH:mm
        duration: appointmentData.duration,
        type: appointmentData.type,
        specialty: appointmentData.specialty || doctor.main_specialty || '',
        notes: appointmentData.notes,
        special_needs: appointmentData.special_needs,
        status: 'agendado',
        source: 'presencial',
        created_by: currentUser.email
      };

      console.log('📋 Payload final do agendamento:', appointmentPayload);

      const createdAppointment = await Appointment.create(appointmentPayload);
      console.log('✅ Agendamento criado com sucesso:', createdAppointment);

      toast({
        title: "Sucesso!",
        description: "Agendamento criado com sucesso."
      });

      // Reset form
      setAppointmentData({
        patient_id: '',
        doctor_id: '',
        appointment_date: format(new Date(), 'yyyy-MM-dd'),
        appointment_time: '09:00',
        duration: 30,
        type: 'consulta',
        specialty: '',
        notes: '',
        special_needs: '',
        exam_id: null,
      });
      setNewPatientData(initialPatientState);
      setIsNewPatient(false);
      
      // Fechar o diálogo
      if (onClose) {
        onClose();
      }
      
      // Chamar callback para atualizar a lista
      if (onAppointmentCreated) {
        console.log('🔄 Chamando onAppointmentCreated para recarregar dados...');
        onAppointmentCreated();
      }

    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível criar o agendamento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-slate-900">
              Seleção do Paciente
            </Label>

            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="patientType"
                  checked={!isNewPatient}
                  onChange={() => setIsNewPatient(false)}
                  className="text-blue-600"
                />
                <span>Paciente existente</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="patientType"
                  checked={isNewPatient}
                  onChange={() => setIsNewPatient(true)}
                  className="text-blue-600"
                />
                <span>Novo paciente</span>
              </label>
            </div>

            {!isNewPatient ? (
              <div className="space-y-2">
                <Label>Paciente ({safePatients.length} encontrados)</Label>
                <Select value={appointmentData.patient_id} onValueChange={(value) => handleInputChange('patient_id', value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Selecionar paciente... (${safePatients.length} disponíveis)`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {safePatients.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        <UserIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>Nenhum paciente encontrado</p>
                        <p className="text-xs">Cadastre um paciente primeiro</p>
                      </div>
                    ) : (
                      safePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id} className="py-3">
                          <div className="flex flex-col items-start">
                            <div className="font-medium text-slate-900">{patient.full_name}</div>
                            <div className="text-sm text-slate-500 flex gap-2">
                              {patient.phone && <span>📞 {patient.phone}</span>}
                              {patient.email && <span>✉️ {patient.email}</span>}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* New Patient Form */
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="col-span-2">
                  <Label htmlFor="new_full_name">Nome completo *</Label>
                  <Input
                    id="new_full_name"
                    value={newPatientData.full_name}
                    onChange={(e) => handleNewPatientChange('full_name', e.target.value)}
                    placeholder="Nome completo do paciente"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="new_phone">Telefone *</Label>
                  <Input
                    id="new_phone"
                    value={newPatientData.phone}
                    onChange={(e) => handleNewPatientChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="new_email">Email</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => handleNewPatientChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="new_birth_date">Data de nascimento</Label>
                  <Input
                    id="new_birth_date"
                    type="date"
                    value={newPatientData.birth_date}
                    onChange={(e) => handleNewPatientChange('birth_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="new_gender">Gênero</Label>
                  <Select value={newPatientData.gender} onValueChange={(value) => handleNewPatientChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor_id" className="text-base font-semibold text-slate-900">
              Profissional ({safeDoctors.length} encontrados) *
            </Label>
            <Select value={appointmentData.doctor_id} onValueChange={(value) => handleInputChange('doctor_id', value)} required>
              <SelectTrigger>
                <SelectValue placeholder={`Selecionar profissional... (${safeDoctors.length} disponíveis)`} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {safeDoctors.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <UserIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>Nenhum profissional encontrado</p>
                    <p className="text-xs">Cadastre um profissional primeiro</p>
                  </div>
                ) : (
                  safeDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                      <div className="flex flex-col items-start">
                        <div className="font-medium text-slate-900">{doctor.full_name}</div>
                        {doctor.main_specialty && (
                          <div className="text-sm text-slate-500">🩺 {doctor.main_specialty}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Data *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={appointmentData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time">Horário *</Label>
              <Input
                id="appointment_time"
                type="time"
                value={appointmentData.appointment_time}
                onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select value={String(appointmentData.duration)} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={appointmentData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="exame">Exame</SelectItem>
                  <SelectItem value="procedimento">Procedimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {appointmentData.type === 'exame' && (
            <div className="space-y-2">
              <Label htmlFor="exam_id">Selecione o Exame *</Label>
              <Select value={appointmentData.exam_id || ''} onValueChange={(value) => handleInputChange('exam_id', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um exame do catálogo..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      <p>Nenhum exame encontrado.</p>
                      <p className="text-xs">Cadastre exames ativos na seção de cadastros.</p>
                    </div>
                  ) : (
                    exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              value={appointmentData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              placeholder="Especialidade médica"
            />
          </div>

          {/* Special Needs - NOVO CAMPO */}
          <div className="space-y-2">
            <Label htmlFor="special_needs">Necessidades Especiais</Label>
            <Textarea
              id="special_needs"
              value={appointmentData.special_needs}
              onChange={(e) => handleInputChange('special_needs', e.target.value)}
              placeholder="Cadeirante, deficiência auditiva, etc..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={appointmentData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
