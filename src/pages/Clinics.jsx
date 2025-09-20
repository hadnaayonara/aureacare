
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/api/entities";
import { Clinic } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ensureArray } from '../components/utils';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define loadClinics using useCallback so it can be called from effects and event handlers
  const loadClinics = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me(); // Fetch user inside loadClinics
      if (user) {
        // ✅ CORREÇÃO: Troca .list() por .filter() para buscar apenas as clínicas do usuário logado
        // e garante que o retorno é um array com ensureArray
        const clinicsData = await Clinic.filter({ created_by: user.email });
        const safeClinics = ensureArray(clinicsData);
        setClinics(safeClinics);
        setFilteredClinics(safeClinics);
      } else {
        // Handle case where user is not logged in or found
        setClinics([]);
        setFilteredClinics([]);
      }
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as clínicas." });
    }
    setIsLoading(false);
  }, [toast]); // Dependency on toast

  // Effect to load clinics on component mount and when loadClinics function changes (due to useCallback)
  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  // Function to filter clinics based on search term
  const filterClinics = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredClinics(clinics);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = clinics.filter((clinic) =>
      clinic.name?.toLowerCase().includes(lowercasedFilter) ||
      clinic.cnpj?.toLowerCase().includes(lowercasedFilter) || // CNPJ also lowercased for consistency
      clinic.email?.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredClinics(filtered);
  }, [searchTerm, clinics]); // Dependencies on searchTerm and clinics

  // Effect to apply filtering when search term or clinics data changes
  useEffect(() => {
    filterClinics();
  }, [filterClinics]);

  const handleDelete = async (clinicId) => {
    try {
      await Clinic.delete(clinicId);
      toast({ title: "Sucesso!", description: "Clínica excluída." });
      loadClinics(); // Refresh clinics after deletion
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a clínica." });
    }
  };

  const handleEdit = (clinicId) => {
    navigate(createPageUrl(`NewClinic?id=${clinicId}`));
  };

  const getStatusColor = (isActive) => {
    return isActive ?
      "bg-green-100 text-green-800 border-green-200" :
      "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusLabel = (isActive) => {
    return isActive ? "Ativa" : "Inativa";
  };

  return (
    <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Clínicas
            </h1>
            <p className="text-slate-600 mt-2">
              {clinics.length} clínicas cadastradas
            </p>
          </div>
          <Link to={createPageUrl("NewClinic")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nova Clínica
            </Button>
          </Link>
        </div>

        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="bg-white p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Pesquisar por nome, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white pl-10 h-12" />
            </div>
          </CardContent>
        </Card>

        {filteredClinics.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) =>
              <Card key={clinic.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white h-full flex flex-col">
                <CardHeader className="pb-4 p-6 flex flex-col space-y-1.5">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {clinic.name}
                    </CardTitle>
                    <Badge variant="outline" className={getStatusColor(clinic.is_active)}>
                      {getStatusLabel(clinic.is_active)}
                    </Badge>
                  </div>
                  <p className="text-slate-500 font-medium">{clinic.cnpj}</p>
                </CardHeader>
                <CardContent className="pt-0 p-6 flex-1 flex flex-col">
                  <div className="space-y-3 mb-6 flex-1">
                    {clinic.email &&
                      <div className="text-sm text-slate-600">
                        <strong>Email:</strong> {clinic.email}
                      </div>
                    }
                    {clinic.phone &&
                      <div className="text-sm text-slate-600">
                        <strong>Telefone:</strong> {clinic.phone}
                      </div>
                    }
                    {clinic.address?.city &&
                      <div className="text-sm text-slate-600">
                        <strong>Localização:</strong> {clinic.address.city}, {clinic.address.state}
                      </div>
                    }
                    <div className="text-sm text-slate-600">
                      <strong>Plano:</strong>
                      <Badge variant="outline" className="ml-2">
                        {clinic.subscription_plan?.toUpperCase() || 'TRIAL'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(clinic.id)} className="bg-slate-100 text-slate-500 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a clínica e todos os dados associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(clinic.id)}
                            className="bg-red-600 hover:bg-red-700">
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {filteredClinics.length === 0 && !isLoading && (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 400px)' }}>
                <Card className="border-0 shadow-lg max-w-lg w-full">
                <CardContent className="p-12 text-center">
                    <Building2 className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                    {searchTerm ? 'Nenhuma clínica encontrada' : 'Nenhuma clínica cadastrada'}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                    {searchTerm ?
                        'Tente alterar os termos de busca ou verifique a ortografia' :
                        'Comece cadastrando sua primeira clínica para organizar o sistema.'
                    }
                    </p>
                    {!searchTerm &&
                    <Link to={createPageUrl("NewClinic")}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Primeira Clínica
                        </Button>
                    </Link>
                    }
                </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
