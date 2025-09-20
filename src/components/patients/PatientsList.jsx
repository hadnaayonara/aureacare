
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Pill,
  Plus,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientsList({ 
  patients, 
  onPatientSelect, 
  onEdit, 
  onDelete, 
  isLoading, 
  searchTerm, 
  userRole, 
  onAddNewPatient 
}) {
  const getPatientInitials = (name) => {
    if (!name) return 'P';
    const names = name.split(' ');
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getPatientStatusColor = (patient) => {
    if ((patient.chronic_conditions || []).length > 0) return 'bg-orange-100 text-orange-800 border-orange-200';
    if ((patient.allergies || []).length > 0) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getPatientStatusText = (patient) => {
    if ((patient.chronic_conditions || []).length > 0) return 'Atenção Especial';
    if ((patient.allergies || []).length > 0) return 'Tem Alergias';
    return 'Saudável';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2 bg-slate-200" />
                  <Skeleton className="h-4 w-24 bg-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-200" />
                <Skeleton className="h-4 w-3/4 bg-slate-200" />
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-12 text-center">
          <User className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-700 mb-3">
            {searchTerm 
              ? 'Nenhum paciente encontrado' 
              : userRole === 'doctor' 
                ? 'Nenhum paciente atribuído' 
                : 'Bem-vindo à Aurea Lab!'
            }
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            {searchTerm 
              ? 'Tente alterar os termos de busca ou verifique a ortografia' 
              : userRole === 'doctor' 
                ? 'Você ainda não tem pacientes atribuídos. Cadastre seu primeiro paciente ou aguarde a atribuição pelo administrador.' 
                : 'Você ainda não tem pacientes cadastrados. Comece criando o perfil do seu primeiro paciente para organizar o atendimento.'
            }
          </p>
          {!searchTerm && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={onAddNewPatient}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                {userRole === 'doctor' ? 'Cadastrar Paciente' : 'Cadastrar Primeiro Paciente'}
              </Button>
              {userRole !== 'doctor' && (
                <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-2" />
                  Importar do Excel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <Card
          key={patient.id}
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col bg-white"
        >
          <CardContent
            className="p-6 cursor-pointer flex-grow bg-white"
            onClick={() => onPatientSelect(patient)}
          >
            {/* Header com Avatar e Nome */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0">
                <AvatarFallback className="text-white font-semibold text-lg bg-transparent">
                  {getPatientInitials(patient.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-700 transition-colors truncate">
                  {patient.full_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {patient.birth_date 
                      ? `${calculateAge(patient.birth_date)} anos` 
                      : 'Idade não informada'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-2 mb-4">
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.phone}</span>
                </div>
              )}

              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}

              {patient.address?.city && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.address.city}, {patient.address.state}</span>
                </div>
              )}
            </div>

            {/* Status e Condições */}
            <div className="space-y-3">
              {/* Badges de condições */}
              <div className="flex flex-wrap gap-2">
                {(patient.chronic_conditions || []).length > 0 && (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex-shrink-0">
                    <Heart className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {(patient.chronic_conditions || []).length} condição{(patient.chronic_conditions || []).length > 1 ? 'ões' : ''}
                    </span>
                  </Badge>
                )}

                {(patient.allergies || []).length > 0 && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex-shrink-0">
                    <Pill className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {(patient.allergies || []).length} alergia{(patient.allergies || []).length > 1 ? 's' : ''}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Badge de status principal */}
              <div className="flex justify-end">
                <Badge variant="outline" className={`text-xs ${getPatientStatusColor(patient)} max-w-[140px]`}>
                  <span className="truncate">{getPatientStatusText(patient)}</span>
                </Badge>
              </div>
            </div>

            {/* Plano de Saúde */}
            {patient.medical_plan && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Plano:</span>
                  <span className="ml-1 truncate inline-block max-w-[180px]">
                    {patient.medical_plan}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          {/* Action buttons - Updated to respect user permissions */}
          <div className="px-6 pb-4 mt-auto border-t bg-slate-50 pt-4 flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(patient);
              }}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Edit className="w-4 h-4 mr-2" /> 
              Editar
            </Button>
            {/* Only show delete button for host users */}
            {userRole === 'host' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o paciente e todos os seus prontuários associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(patient.id)} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
