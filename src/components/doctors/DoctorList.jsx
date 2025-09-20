import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit,
  Trash2,
  User as UserIcon,
  Shield,
  ShieldOff,
  Stethoscope,
  Star,
  Phone,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DoctorList({ doctors, isLoading, onEdit, onDelete, userRole }) {

  const getInitials = (name) => {
    if (!name) return 'DR';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white rounded-xl shadow-md border-0">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Stethoscope className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Nenhum profissional encontrado
        </h3>
        <p className="text-slate-600 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Comece cadastrando um novo profissional na sua clínica.
        </p>
        <Link to={createPageUrl("NewDoctor")}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl px-6 py-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Stethoscope className="w-5 h-5 mr-2" />
            Cadastrar Profissional
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="bg-white rounded-xl shadow-md border-0 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-xs font-semibold text-slate-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                4.{Math.floor(Math.random() * 9) + 1}
              </span>
            </div>
          </div>

          {/* Dropdown Menu - Only for host users */}
          {userRole === 'host' && (
            <div className="absolute top-3 left-3 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white/100 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-0 shadow-xl">
                  <DropdownMenuItem onClick={() => onEdit(doctor.id)} className="rounded-lg">
                    <Edit className="mr-2 h-4 w-4" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(doctor.id)} className="text-red-600 rounded-lg">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          <Link to={createPageUrl(`DoctorView?id=${doctor.id}`)}>
            <CardContent className="p-6 text-center">
              {/* Avatar Circular Centralizado */}
              <div className="mb-4">
                <Avatar className="w-20 h-20 mx-auto shadow-lg border-4 border-white ring-2 ring-slate-100">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {getInitials(doctor.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Nome do Profissional */}
              <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {doctor.full_name}
              </h3>
              
              {/* Especialidade */}
              <div className="mb-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 rounded-full px-3 py-1 text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {doctor.main_specialty}
                </Badge>
              </div>
              
              {/* Informações do Conselho */}
              <div className="text-sm text-slate-600 mb-3 space-y-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <p className="font-medium">{doctor.council_type}: {doctor.council_number}</p>
                <p className="text-xs">Estado: {doctor.council_state}</p>
              </div>
              
              {/* Status de Acesso */}
              <div className="mb-4">
                {doctor.has_system_access ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 rounded-full px-3 py-1 text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Shield className="w-3 h-3 mr-1" />
                    Sistema Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-600 border-slate-200 rounded-full px-3 py-1 text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <ShieldOff className="w-3 h-3 mr-1" />
                    Sem Acesso
                  </Badge>
                )}
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 py-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 py-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Phone className="w-3 h-3 mr-1" />
                  Contato
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}