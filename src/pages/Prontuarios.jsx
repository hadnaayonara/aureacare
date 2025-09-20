
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MedicalRecord } from '@/api/entities';
import { Patient } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { Doctor } from '@/api/entities';
import { User } from '@/api/entities';
import { FileText, Search, Plus, MoreVertical, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import AuthGuard from '../components/auth/AuthGuard';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Placeholder for a list of medical records. This will be expanded later.
const MedicalRecordsList = ({ records, onRecordSelect, isLoading }) => {
  const navigate = useNavigate();

  // statusConfig is defined in the outline but not used in the Card component's final rendering.
  // Keeping it as it might be for future expansion or for visual reference.
  const statusConfig = {
    'concluido': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Concluído' },
    'em_andamento': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Em Andamento' },
    'agendado': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Agendado' },
    'default': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'N/A' },
  };

  const getStatus = (status) => statusConfig[status] || statusConfig.default;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
        <FileText className="mx-auto h-16 w-16 text-slate-400" />
        <h3 className="mt-4 text-xl font-semibold text-slate-800">Nenhum prontuário encontrado</h3>
        <p className="mt-2 text-slate-500">Comece adicionando um novo prontuário para um paciente.</p>
        <Button onClick={() => navigate(createPageUrl('NewMedicalRecord'))} className="mt-6 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Prontuário
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map(record => {
        const patientName = record.patient?.full_name || 'Paciente não encontrado';
        const doctorName = record.doctor?.full_name || 'Médico não encontrado';

        return (
          <Card key={record.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 overflow-hidden">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-slate-900 mb-2">{patientName}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full -mt-2 -mr-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRecordSelect(record)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-slate-500 font-medium">Dr(a). {doctorName}</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400"/>
                  <span>{format(new Date(record.consultation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="text-sm text-slate-600 line-clamp-2">
                  <span className="font-semibold text-slate-700">Queixa:</span> {record.chief_complaint || 'Não informado'}
                </div>
            </CardContent>
             <CardFooter className="p-6 pt-0 flex justify-end">
                <Button onClick={() => onRecordSelect(record)} variant="outline" className="rounded-xl">Ver Prontuário</Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

// Placeholder for RecordDetails component (not provided in outline, so creating a basic one)
const RecordDetails = ({ record, onBack }) => {
  if (!record) return null;

  return (
    <Card className="rounded-2xl shadow-lg p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 mb-4">Detalhes do Prontuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg"><strong>Paciente:</strong> {record.patient?.full_name || 'N/A'}</p>
        <p className="text-lg"><strong>Médico:</strong> {record.doctor?.full_name || 'N/A'}</p>
        <p><strong>Data da Consulta:</strong> {format(new Date(record.consultation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        <p><strong>Queixa Principal:</strong> {record.chief_complaint || 'N/A'}</p>
        <p><strong>Diagnóstico:</strong> {record.diagnosis || 'Não informado'}</p> {/* Assuming a diagnosis field */}
        <p><strong>Observações:</strong> {record.notes || 'N/A'}</p> {/* Assuming a notes field */}
      </CardContent>
      <CardFooter className="mt-6">
        <Button onClick={onBack} className="rounded-xl">Voltar</Button>
      </CardFooter>
    </Card>
  );
};


function ProntuariosContent() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all'); // Renamed from doctorFilter, removed clinicFilter
  const [selectedRecord, setSelectedRecord] = useState(null); // New state for selected record details

  const loadInitialData = useCallback(async (user, role) => {
    setIsLoading(true);
    try {
      let recordsQuery = {}, patientsQuery = {}, clinicsQuery = {}, doctorsQuery = {};
      const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');

      if (role === 'reception' && activeClinic.id) {
        recordsQuery = { clinic_id: activeClinic.id };
        patientsQuery = { clinic_id: activeClinic.id };
        doctorsQuery = { clinic_id: activeClinic.id };
        clinicsQuery = { id: activeClinic.id }; // Apenas a própria clínica
      } else if (role === 'doctor' && activeClinic.doctor_id) {
        recordsQuery = { doctor_id: activeClinic.doctor_id }; // Doutor só vê seus prontuários
        patientsQuery = { clinic_id: activeClinic.id }; // Mas pode ver todos os pacientes da clínica
        doctorsQuery = { id: activeClinic.doctor_id };
        clinicsQuery = { id: activeClinic.id };
      } else { // Host
         if (activeClinic.id) {
            recordsQuery = { clinic_id: activeClinic.id };
            patientsQuery = { clinic_id: activeClinic.id };
            doctorsQuery = { clinic_id: activeClinic.id };
            clinicsQuery = { created_by: user.email }; // Host vê todas as suas clínicas no filtro
         } else {
            // Fallback para host sem clínica selecionada
            // These queries are too broad for a host without an active clinic selected,
            // generally, a host should only see records/patients/doctors belonging to clinics they created.
            // For now, mirroring previous logic, but consider refining if scope is only within created clinics.
            recordsQuery = {}; // Fetch all, then filter by created_by if needed later or rely on general filters
            patientsQuery = {};
            doctorsQuery = {};
            clinicsQuery = { created_by: user.email };
         }
      }

      const [recordsData, patientsData, clinicsData, doctorsData] = await Promise.all([
        MedicalRecord.filter(recordsQuery),
        Patient.filter(patientsQuery),
        Clinic.filter(clinicsQuery),
        Doctor.filter(doctorsQuery)
      ]);
      
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setClinics(Array.isArray(clinicsData) ? clinicsData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados dos prontuários." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        const storedRole = localStorage.getItem('userType');
        setUserRole(storedRole);
        
        await loadInitialData(user, storedRole);
      } catch (e) {
        console.error("Usuário não autenticado", e);
        setIsLoading(false);
      }
    };
    fetchUserAndData();
  }, [location, loadInitialData]);

  const filteredRecords = useMemo(() => {
    let recordsToProcess = medicalRecords.map(record => {
      const patient = patients.find(p => p.id === record.patient_id);
      const doctor = doctors.find(d => d.id === record.doctor_id);
      return {
        ...record,
        patient: patient,
        doctor: doctor,
      };
    });

    // Role-based filtering (existing logic, applied to enriched records)
    if (userRole === 'doctor') {
      const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
      if (activeClinic && activeClinic.doctor_id) {
        recordsToProcess = recordsToProcess.filter(r => r.doctor_id === activeClinic.doctor_id);
      } else {
        recordsToProcess = [];
      }
    } else if (userRole === 'reception') {
      const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
      if (activeClinic && activeClinic.id) {
        recordsToProcess = recordsToProcess.filter(r => r.clinic_id === activeClinic.id);
      } else {
        recordsToProcess = [];
      }
    }
    // For 'host', the initial loadData handles clinic/user-specific records.
    // The explicit 'clinicFilter' was removed from UI, so we assume the loaded data for host is already correct,
    // or further filtering is only by doctor and search term.

    // Apply doctor filter regardless of role, if selected
    if (selectedDoctor !== 'all') {
      recordsToProcess = recordsToProcess.filter(r => r.doctor_id === selectedDoctor);
    }
    
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      recordsToProcess = recordsToProcess.filter(r =>
        r.patient?.full_name?.toLowerCase().includes(lowercasedTerm) ||
        r.patient?.cpf?.includes(lowercasedTerm) ||
        r.doctor?.full_name?.toLowerCase().includes(lowercasedTerm) ||
        r.chief_complaint?.toLowerCase().includes(lowercasedTerm) // Search chief complaint as a proxy for diagnosis
        // Add a dedicated 'diagnosis' field search here if MedicalRecord entity has it
      );
    }

    return recordsToProcess;
  }, [medicalRecords, patients, doctors, searchTerm, selectedDoctor, userRole]);


  return (
    <div className="min-h-screen p-0 md:p-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Prontuários
            </h1>
            <p className="text-slate-600 mt-2">
              Pesquise e gerencie o histórico clínico dos pacientes.
            </p>
          </div>
          { (userRole === 'host' || userRole === 'reception') && (
            <Button onClick={() => navigate(createPageUrl('NewMedicalRecord'))} className="rounded-xl h-12 px-6 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Novo Prontuário
            </Button>
          )}
        </div>

        <Card className="mb-8 border-0 shadow-lg rounded-2xl">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Pesquisar por paciente, médico ou diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-slate-50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500" />

            </div>
             <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-full md:w-[200px] h-14 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Filtrar por Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Médicos</SelectItem>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedRecord ? (
          <RecordDetails record={selectedRecord} onBack={() => setSelectedRecord(null)} />
        ) : (
          <MedicalRecordsList records={filteredRecords} onRecordSelect={setSelectedRecord} isLoading={isLoading} />
        )}

      </div>
      <Toaster />
    </div>
  );
}

export default function Prontuarios() {
  return (
    <AuthGuard>
      <ProntuariosContent />
    </AuthGuard>
  );
}
