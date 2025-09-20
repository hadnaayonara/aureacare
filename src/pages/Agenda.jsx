
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Appointment } from '@/api/entities';
import { Patient } from '@/api/entities';
import { PatientAssignment } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { User } from '@/api/entities';
import { format, addDays, subDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AgendaHeader from '../components/agenda/AgendaHeader';
import WeeklyCalendarView from '../components/agenda/WeeklyCalendarView';
import DailyCalendarView from '../components/agenda/DailyCalendarView';
import MonthlyCalendarView from '../components/agenda/MonthlyCalendarView';
import AgendaFilters from '../components/agenda/AgendaFilters';
import AgendaSummary from '../components/agenda/AgendaSummary';
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from '../components/auth/AuthGuard';
import { useNavigate } from 'react-router-dom';
import NewAppointmentDialog from '../components/agenda/NewAppointmentDialog';

// Placeholder for createPageUrl
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Patients":
      return "/patients";
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

// Função auxiliar para sanitizar dados
const sanitizeData = (data, type = 'unknown') => {
  console.log(`[Agenda] Sanitizing ${type}:`, data);

  if (!data) {
    console.log(`[Agenda] ${type} is null/undefined, returning empty array`);
    return [];
  }

  if (!Array.isArray(data)) {
    console.log(`[Agenda] ${type} is not array:`, typeof data, data);
    return [];
  }

  // Filter out any null/undefined items and validate required fields
  const sanitized = data.filter(item => {
    if (!item) {
      console.log(`[Agenda] Removing null/undefined item from ${type}`);
      return false;
    }

    if (type === 'patients' && !item.full_name) {
      console.log(`[Agenda] Removing patient without full_name:`, item);
      return false;
    }

    if (type === 'doctors' && !item.full_name) {
      console.log(`[Agenda] Removing doctor without full_name:`, item);
      return false;
    }

    return true;
  });

  console.log(`[Agenda] Sanitized ${type}, before: ${data.length}, after: ${sanitized.length}`);
  return sanitized;
};

function AgendaContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    doctor: 'all',
    status: 'all'
  });

  // User context state
  const [userContext, setUserContext] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // FIX: Funções para botões da barra lateral
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user context from localStorage
    const activeClinicStored = localStorage.getItem('activeClinic');
    const userTypeStored = localStorage.getItem('userType');

    if (activeClinicStored) {
      setUserContext({
        ...JSON.parse(activeClinicStored),
        type: userTypeStored
      });
    } else {
      setUserContext({
        type: userTypeStored || 'user',
        id: 'default'
      });
    }

    // Fetch current user data from the backend once on component mount
    const fetchCurrentUser = async () => {
      try {
        const user = await User.me();
        console.log('[Agenda] Current user loaded:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error("[Agenda] Failed to fetch current user:", error);
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const loadData = useCallback(async () => {
    console.log('[Agenda] Starting loadData...');
    console.log('[Agenda] Current user:', currentUser?.email);
    console.log('[Agenda] User context:', userContext);
    
    setIsLoading(true);

    // Reset all arrays to empty state first
    setAppointments([]);
    setPatients([]);
    setDoctors([]);

    if (!currentUser || !currentUser.email) {
      console.warn("[Agenda] Current user not loaded. Cannot fetch data.");
      setIsLoading(false);
      return;
    }

    if (!userContext) {
      console.warn("[Agenda] User context not loaded. Cannot fetch data.");
      setIsLoading(false);
      return;
    }

    try {
      console.log('[Agenda] Loading data for user type:', userContext.type);
      console.log('[Agenda] Active clinic:', userContext);

      let appointmentsResponse, patientsResponse, doctorsResponse;

      if (userContext.type === 'reception') {
        // RECEPÇÃO: Carregar dados da clínica específica vinculada
        console.log('[Agenda] Loading data for reception user, clinic:', userContext.id);
        
        [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
          Appointment.filter({ clinic_id: userContext.id }, '-starts_at'),
          Patient.filter({ clinic_id: userContext.id }, '-created_date'),
          Doctor.filter({ clinic_id: userContext.id })
        ]);
      } else if (userContext.type === 'doctor') {
        // MÉDICO: Carregar apenas agendamentos do próprio médico
        console.log('[Agenda] Loading data for doctor user, doctor_id:', userContext.doctor_id);
        
        [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
          Appointment.filter({ doctor_id: userContext.doctor_id }, '-starts_at'),
          Patient.list('-created_date'), // Médicos podem ver todos os pacientes
          Doctor.filter({ id: userContext.doctor_id }) // Só o próprio médico
        ]);
      } else {
        // HOST: Carregar dados do usuário (comportamento original)
        console.log('[Agenda] Loading data for host user:', currentUser.email);
        
        if (userContext.id && userContext.id !== 'all' && userContext.id !== 'default') {
          // Filtrar por clínica específica se selecionada
          [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
            Appointment.filter({ clinic_id: userContext.id }, '-starts_at'),
            Patient.filter({ clinic_id: userContext.id }, '-created_date'),
            Doctor.filter({ clinic_id: userContext.id })
          ]);
        } else {
          // Carregar todos os dados do usuário
          [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
            Appointment.filter({ created_by: currentUser.email }, '-starts_at'),
            Patient.filter({ created_by: currentUser.email }, '-created_date'),
            Doctor.filter({ created_by: currentUser.email })
          ]);
        }
      }

      console.log('[Agenda] Raw appointments response:', appointmentsResponse?.length || 0, 'items');
      console.log('[Agenda] Raw doctors response:', doctorsResponse?.length || 0, 'items');
      console.log('[Agenda] Raw patients response:', patientsResponse?.length || 0, 'items');

      const sanitizedDoctors = sanitizeData(doctorsResponse, 'doctors');
      setDoctors(sanitizedDoctors);

      const sanitizedPatients = sanitizeData(patientsResponse, 'patients');
      setPatients(sanitizedPatients);

      const sanitizedAppointments = sanitizeData(appointmentsResponse, 'appointments');
      setAppointments(sanitizedAppointments);
      
      console.log('[Agenda] Final state - Appointments:', sanitizedAppointments.length);
      console.log('[Agenda] Final state - Doctors:', sanitizedDoctors.length);
      console.log('[Agenda] Final state - Patients:', sanitizedPatients.length);

    } catch (error) {
      console.error("[Agenda] Error loading data:", error);
      setAppointments([]);
      setPatients([]);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, userContext]);

  useEffect(() => {
    if (currentUser && userContext) {
      console.log('[Agenda] Dependencies changed, calling loadData...');
      loadData();
    }
  }, [loadData, currentUser, userContext]);

  const filteredAppointments = useMemo(() => {
    const appointmentsArray = sanitizeData(appointments, 'filtered_appointments');

    // Para recepção, não precisa filtrar por clínica novamente (já vem filtrado)
    // Para host, aplicar filtro de clínica se selecionada
    let clinicFilteredAppointments = appointmentsArray;
    
    if (userContext?.type === 'host' && userContext?.id && userContext.id !== 'all') {
      clinicFilteredAppointments = appointmentsArray.filter(apt => apt.clinic_id === userContext.id);
    }

    // Aplicar filtros da barra lateral (médico e status)
    return clinicFilteredAppointments.filter((apt) => {
      const doctorMatch = filters.doctor === 'all' || apt.doctor_id === filters.doctor;
      const statusMatch = filters.status === 'all' || apt.status === filters.status;
      return doctorMatch && statusMatch;
    });
  }, [appointments, filters, userContext]);

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate((prev) => addDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate((prev) => addDays(prev, 7));
    else if (viewMode === 'month') setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handlePrevious = () => {
    if (viewMode === 'day') setCurrentDate((prev) => subDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate((prev) => subDays(prev, 7));
    else if (viewMode === 'month') setCurrentDate((prev) => subMonths(prev, 1));
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return <DailyCalendarView appointments={filteredAppointments} currentDate={currentDate} isLoading={isLoading} onUpdate={loadData} />;
      case 'month':
        return <MonthlyCalendarView appointments={filteredAppointments} currentDate={currentDate} isLoading={isLoading} onUpdate={loadData} />;
      case 'week':
      default:
        return <WeeklyCalendarView appointments={filteredAppointments} currentDate={currentDate} isLoading={isLoading} onUpdate={loadData} />;
    }
  };

  // FIX: Funções para botões da barra lateral
  const handleNewAppointment = () => {
    setShowNewAppointmentDialog(true);
  };

  const handleNewPatient = () => {
    navigate(createPageUrl("Patients"));
  };

  // FIX: Melhorar a função de callback do agendamento
  const handleAppointmentCreated = useCallback(() => {
    console.log('[Agenda] 🔄 Agendamento criado, recarregando dados...');
    setShowNewAppointmentDialog(false);
    // Pequeno delay para garantir que o banco foi atualizado antes de recarregar
    setTimeout(() => {
      loadData();
    }, 500); 
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster />
      
      {/* Header Moderno */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <AgendaHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={() => setCurrentDate(new Date())}
            onRefresh={loadData}
            patients={patients || []}
            doctors={doctors || []}
            userRole={userContext?.type}
            userClinicId={userContext?.id} 
          />
        </div>
      </div>

      {/* Layout Principal */}
      <div className="max-w-7xl mx-auto p-6 flex gap-6 min-h-[calc(100vh-120px)]">
        
        {/* Sidebar Esquerda - Filtros e Resumo */}
        <aside className="w-80 space-y-6">
          {/* Card de Filtros */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Filtros da Agenda
            </h3>
            <AgendaFilters
              filters={filters}
              onFilterChange={setFilters}
              doctors={doctors || []}
              userRole={userContext?.type} 
            />
          </div>

          {/* Card de Resumo do Dia */}
          <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <AgendaSummary 
              appointments={filteredAppointments || []} 
              onNewAppointment={handleNewAppointment}
              onNewPatient={handleNewPatient}
            />
          </div>
        </aside>

        {/* Área Central - Calendário */}
        <main className="flex-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="h-full min-h-[600px]">
              {renderCalendarView()}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog de novo agendamento */}
      {showNewAppointmentDialog && (
        <NewAppointmentDialog
          patients={patients || []}
          doctors={doctors || []}
          onAppointmentCreated={handleAppointmentCreated}
          userRole={userContext?.type}
          userClinicId={userContext?.id}
          isOpen={showNewAppointmentDialog}
          onClose={() => setShowNewAppointmentDialog(false)}
        />
      )}
    </div>
  );
}

export default function Agenda() {
  return (
    <AuthGuard>
      <AgendaContent />
    </AuthGuard>
  );
}
