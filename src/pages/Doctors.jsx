
import React, { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/api/entities';
import { Clinic } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Stethoscope, Search, Plus, Building2, UserCheck, Filter, Grid3X3, List } from 'lucide-react';
import DoctorList from '../components/doctors/DoctorList';
import { ensureArray } from '../components/utils';
import ImportDoctorsModal from '../components/doctors/ImportDoctorsModal';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clinicFilter, setClinicFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);

  // Unified loadDoctors function, wrapped in useCallback for stability
  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user) {
        // Get user type from localStorage
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        
        const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
        let doctorsFilter = {}, clinicsFilter = {};

        if (storedUserType === 'reception' && activeClinic.id) {
          doctorsFilter = { clinic_id: activeClinic.id };
          clinicsFilter = { id: activeClinic.id };
        } else { // Host
          // Host vê médicos da clínica selecionada ou todos que ele criou
          if (activeClinic.id) {
            doctorsFilter = { clinic_id: activeClinic.id };
          } else {
            doctorsFilter = { created_by: user.email };
          }
          clinicsFilter = { created_by: user.email }; // Host sempre vê suas clínicas para o filtro
        }

        // Fetch doctors and clinics in parallel
        const [doctorsData, clinicsData] = await Promise.all([
          Doctor.filter(doctorsFilter),
          Clinic.filter(clinicsFilter)
        ]);
        
        const safeDoctors = ensureArray(doctorsData);
        const safeClinics = ensureArray(clinicsData);
        
        setDoctors(safeDoctors);
        setClinics(safeClinics);
        
        // Extract unique specialties from doctors
        const specialties = [...new Set(safeDoctors
          .map(doc => doc.main_specialty)
          .filter(Boolean)
          .sort()
        )];
        setAvailableSpecialties(specialties);
        
      } else {
        setDoctors([]);
        setClinics([]);
        setAvailableSpecialties([]);
      }
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os profissionais.",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors, location]);

  // Combined filtering logic
  useEffect(() => {
    let filtered = ensureArray(doctors);

    // Filter by clinic
    if (clinicFilter !== 'all') {
      filtered = filtered.filter(doc => doc.clinic_id === clinicFilter);
    }

    // Filter by specialty
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(doc => doc.main_specialty === specialtyFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.full_name?.toLowerCase().includes(lowercasedFilter) ||
        doc.main_specialty?.toLowerCase().includes(lowercasedFilter) ||
        doc.council_number?.includes(searchTerm) ||
        doc.email?.toLowerCase().includes(lowercasedFilter)
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, clinicFilter, specialtyFilter, searchTerm]);

  const handleEdit = (doctorId) => {
    navigate(createPageUrl(`NewDoctor?id=${doctorId}`));
  };

  const handleDelete = async (doctorId) => {
    // Only allow deletion for host users
    if (userType !== 'host') {
      toast({ 
        variant: "destructive", 
        title: "Permissão Negada", 
        description: "Apenas administradores podem excluir profissionais." 
      });
      return;
    }

    try {
      await Doctor.delete(doctorId);
      toast({ title: "Sucesso!", description: "Profissional excluído." });
      loadDoctors(); 
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o profissional." });
    }
  };

  const handleImportComplete = (results) => {
    toast({
      title: "Importação Concluída!",
      description: `${results.summary.created_count || 0} profissionais criados, ${results.summary.updated_count || 0} atualizados.`,
    });
    loadDoctors();
  };

  // Get active clinic ID from localStorage for import modal
  const getActiveClinicId = () => {
    try {
      const activeClinic = JSON.parse(localStorage.getItem('activeClinic') || '{}');
      return activeClinic.id || 'default-clinic-id';
    } catch {
      return 'default-clinic-id';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Toaster />
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Moderno */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                Profissionais
              </h1>
              <p className="text-slate-600 mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {filteredDoctors.length} de {doctors.length} profissionais {filteredDoctors.length !== doctors.length ? 'filtrados' : 'cadastrados'}
              </p>
            </div>
            <div className="flex gap-3">
              {userType === 'host' && (
                <>
                  <ImportDoctorsModal 
                    onImportComplete={handleImportComplete}
                    clinicId={getActiveClinicId()}
                  />
                  <Link to={createPageUrl("NewDoctor")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl px-6 py-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <Plus className="w-5 h-5 mr-2" />
                      Novo Profissional
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Pesquisar por nome, especialidade ou nº do conselho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white pl-12 h-12 rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>

            {/* Filtros */}
            {userType === 'host' && (
              <>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={clinicFilter} onValueChange={setClinicFilter}>
                    <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <SelectValue placeholder="Clínica..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Clínicas</SelectItem>
                      {ensureArray(clinics).map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <SelectValue placeholder="Especialidade..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Especialidades</SelectItem>
                      {availableSpecialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Filtros Ativos */}
          {(clinicFilter !== 'all' || specialtyFilter !== 'all' || searchTerm.trim()) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-600 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>Filtros ativos:</span>
              {clinicFilter !== 'all' && (
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Building2 className="w-3 h-3" />
                  <span>
                    {clinics.find(c => c.id === clinicFilter)?.name || 'Clínica'}
                  </span>
                </div>
              )}
              {specialtyFilter !== 'all' && (
                <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <UserCheck className="w-3 h-3" />
                  <span>{specialtyFilter}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClinicFilter('all');
                  setSpecialtyFilter('all');
                  setSearchTerm('');
                }}
                className="text-slate-500 hover:text-slate-700 rounded-full"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Filter className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          )}
        </div>

        <DoctorList
          doctors={filteredDoctors}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={userType} 
        />

      </div>
    </div>
  );
}
