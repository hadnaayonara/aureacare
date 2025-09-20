import React, { useState, useEffect, useCallback } from "react";
import { Patient } from "@/api/entities";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "../components/auth/AuthGuard";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PatientListHeader from "../components/patients/list/PatientListHeader";
import PatientList from "../components/patients/list/PatientList";
import { FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

function PatientsContent() {
  const [allPatients, setAllPatients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const loadInitialData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // RLS no backend já filtra, então apenas listamos.
      const patientsData = await Patient.list('-created_date');
      setAllPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os pacientes." });
      setAllPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setUserRole(localStorage.getItem('userType'));
      } catch (e) {
        console.error("Usuário não autenticado", e);
        setIsLoading(false);
      }
    };
    fetchUserAndData();
  }, []);

  useEffect(() => {
    if (userRole === 'doctor') {
      setIsLoading(false);
      setAllPatients([]);
      return;
    }
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser, userRole, loadInitialData, location]);

  const filteredPatients = React.useMemo(() => {
    if (!allPatients) return [];
    if (!debouncedSearchTerm.trim()) return allPatients;
    
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return allPatients.filter(p =>
      p.full_name?.toLowerCase().includes(lowercasedTerm) ||
      p.cpf?.includes(debouncedSearchTerm) ||
      p.phone?.includes(debouncedSearchTerm)
    );
  }, [allPatients, debouncedSearchTerm]);

  const handleDeletePatient = async (patientId) => {
    // Manter a lógica de exclusão, mas será chamada pelo novo componente de item
    setIsLoading(true);
    try {
      await Patient.delete(patientId);
      toast({ title: "Sucesso", description: "Paciente excluído." });
      await loadInitialData();
    } catch (error) {
      console.error("Erro ao excluir paciente", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o paciente." });
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole === 'doctor') {
    return (
      <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-brand-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-text-primary">Acesso via Prontuários</h2>
            <p className="text-text-secondary mt-2">Como profissional de saúde, você acessa seus pacientes pela tela de Prontuários.</p>
            <Button onClick={() => navigate(createPageUrl('Prontuarios'))} className="mt-6">
                Ir para Prontuários
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <Toaster />
      <div className="space-y-[var(--section-gap)]">
        <PatientListHeader
          patientCount={filteredPatients.length}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onImportComplete={loadInitialData}
          onNewPatient={() => navigate(createPageUrl('NewPatient'))} // Supondo uma rota para novo paciente
        />
        <PatientList
          patients={filteredPatients}
          isLoading={isLoading}
          onDelete={handleDeletePatient}
          onSelect={(patient) => navigate(createPageUrl(`PatientDetails?id=${patient.id}`))}
          onNewPatientClick={() => navigate(createPageUrl('NewPatient'))}
        />
      </div>
    </div>
  );
}

export default function Patients() {
  return (
    <AuthGuard>
      <PatientsContent />
    </AuthGuard>
  );
}