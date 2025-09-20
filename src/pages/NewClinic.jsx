
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clinic } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Save, Loader2 } from "lucide-react";
import { createPageUrl } from '@/utils';

const initialFormState = {
  name: '',
  cnpj: '',
  address: {
    street: '',
    number: '',
    city: '',
    state: '',
    zip_code: ''
  },
  phone: '',
  email: '',
  settings: {
    timezone: 'America/Sao_Paulo',
    default_appointment_duration: 30,
    allow_online_scheduling: true
  },
  subscription_plan: 'trial',
  is_active: true
};

export default function NewClinic() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [clinicId, setClinicId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const loadClinicData = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const result = await Clinic.filter({ id: id });
      if (result && result.length > 0) {
        const clinicData = result[0];
        setFormData({
          ...initialFormState,
          ...clinicData,
          address: clinicData.address || initialFormState.address,
          settings: { ...initialFormState.settings, ...(clinicData.settings || {}) }
        });
      } else {
        toast({ variant: "destructive", title: "Erro", description: "Clínica não encontrada." });
        navigate(createPageUrl("Clinics"));
      }
    } catch (error) {
      console.error("Erro ao carregar dados da clínica:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." });
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]); // Added toast and navigate to dependencies

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setIsEditing(true);
      setClinicId(id);
      loadClinicData(id);
    } else {
      setIsLoading(false);
    }
  }, [location.search, loadClinicData]); // Added loadClinicData to dependencies

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.cnpj) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Validação", 
        description: "Nome da clínica e CNPJ são obrigatórios." 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Dados a serem salvos:', formData);

      // Garantir que os dados estão no formato correto
      const clinicData = {
        ...formData,
        address: formData.address || {},
        settings: formData.settings || initialFormState.settings
      };

      let result;
      if (isEditing) {
        result = await Clinic.update(clinicId, clinicData);
        toast({ title: "Sucesso!", description: "Clínica atualizada com sucesso." });
      } else {
        result = await Clinic.create(clinicData);
        toast({ title: "Sucesso!", description: "Clínica cadastrada com sucesso." });
      }
      
      console.log('Resultado da operação:', result);
      navigate(createPageUrl("Clinics"));
      
    } catch (error) {
      console.error("Erro ao salvar clínica:", error);
      
      let errorMessage = "Não foi possível salvar a clínica.";
      
      // Tentar extrair uma mensagem de erro mais específica
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];


  const subscriptionPlans = [
  { value: 'trial', label: 'Trial (Gratuito)' },
  { value: 'basic', label: 'Básico' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' }];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Clinics"))} className="bg-slate-100 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Editar Clínica' : 'Nova Clínica'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditing ? 'Atualize os dados da clínica.' : 'Preencha os dados para cadastrar uma nova clínica.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Básicos */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-slate-100 p-6 flex flex-col space-y-1.5">
              <CardTitle className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-100 pt-0 p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome da Clínica *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Clínica Médica XYZ" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>CNPJ *</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    required
                    placeholder="00.000.000/0000-00" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@clinica.com" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-slate-100 p-6 flex flex-col space-y-1.5">
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-100 pt-0 p-6 space-y-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Rua das Flores" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    placeholder="123" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.address.zip_code}
                    onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
                    placeholder="00000-000" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="São Paulo" className="bg-slate-100 text-slate-600 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.address.state}
                    onValueChange={(v) => handleInputChange('address.state', v)}>

                    <SelectTrigger className="bg-slate-100 px-3 py-2 text-sm flex h-10 w-full items-center justify-between rounded-md border border-input ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) =>
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-slate-100 p-6 flex flex-col space-y-1.5">
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-100 pt-0 p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={formData.settings.timezone}
                    onValueChange={(v) => handleInputChange('settings.timezone', v)}>

                    <SelectTrigger className="bg-slate-100 px-3 py-2 text-sm flex h-10 w-full items-center justify-between rounded-md border border-input ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                      <SelectItem value="America/Manaus">América/Manaus</SelectItem>
                      <SelectItem value="America/Rio_Branco">América/Rio Branco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração padrão da consulta (min)</Label>
                  <Input
                    type="number"
                    value={formData.settings.default_appointment_duration}
                    onChange={(e) => handleInputChange('settings.default_appointment_duration', parseInt(e.target.value))} className="bg-slate-100 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

                </div>
                <div className="space-y-2">
                  <Label>Plano de Assinatura</Label>
                  <Select
                    value={formData.subscription_plan}
                    onValueChange={(v) => handleInputChange('subscription_plan', v)}>

                    <SelectTrigger className="bg-slate-100 px-3 py-2 text-sm flex h-10 w-full items-center justify-between rounded-md border border-input ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan) =>
                      <SelectItem key={plan.value} value={plan.value}>{plan.label}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow_online_scheduling"
                    checked={formData.settings.allow_online_scheduling}
                    onCheckedChange={(checked) => handleInputChange('settings.allow_online_scheduling', checked)} className="bg-sky-600 text-slate-100 peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />

                  <Label htmlFor="allow_online_scheduling" className="cursor-pointer">
                    Permitir agendamento online
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)} />

                  <Label htmlFor="is_active" className="cursor-pointer">
                    Clínica ativa
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl('Clinics'))}
              disabled={isSubmitting}>

              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isSubmitting}>

              {isSubmitting ?
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

              <Save className="w-4 h-4 mr-2" />
              }
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Clínica'}
            </Button>
          </div>
        </form>
      </div>
    </div>);

}
