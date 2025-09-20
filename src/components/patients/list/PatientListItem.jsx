import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Phone, Mail, Calendar, HeartPulse, MoreHorizontal, Edit, Trash2, CalendarPlus } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const getStatus = (patient) => {
    if ((patient.chronic_conditions || []).length > 0) return { label: 'Crônico', color: 'bg-amber-100 text-amber-800' };
    if ((patient.allergies || []).length > 0) return { label: 'Alérgico', color: 'bg-rose-100 text-rose-800' };
    return { label: 'Saudável', color: 'bg-emerald-100 text-emerald-800' };
};

export default function PatientListItem({ patient, onDelete, onSelect }) {
  const status = getStatus(patient);
  const age = patient.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : 'N/A';

  return (
    <div className="grid grid-cols-12 items-center gap-4 bg-white rounded-xl shadow-sm p-4 hover:bg-slate-50 hover:shadow-md transition-all duration-200 border border-slate-100/80">
      
      {/* Coluna 1: Avatar e Nome/CPF (4/12) */}
      <div className="col-span-12 sm:col-span-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 text-lg">
          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-text-secondary font-medium">
            {getInitials(patient.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate">
          <p
            className="font-semibold text-text-primary truncate cursor-pointer hover:text-brand-blue-600"
            onClick={() => onSelect(patient)}
          >
            {patient.full_name}
          </p>
          <p className="text-sm text-text-muted truncate">{patient.cpf || 'CPF não informado'}</p>
        </div>
      </div>

      {/* Coluna 2: Contato (3/12) */}
      <div className="hidden md:flex col-span-3 flex-col gap-1 truncate text-sm">
        <div className="flex items-center gap-2 text-text-secondary truncate">
          <Mail className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate">{patient.email || 'Email não informado'}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary truncate">
          <Phone className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate">{patient.phone || 'Telefone não informado'}</span>
        </div>
      </div>

      {/* Coluna 3: Idade/Plano (2/12) */}
      <div className="hidden lg:flex col-span-2 flex-col gap-1.5 truncate text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar className="w-4 h-4 shrink-0 text-text-muted" />
          <span>{age} anos</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary truncate">
          <HeartPulse className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate">{patient.medical_plan || 'Particular'}</span>
        </div>
      </div>

      {/* Coluna 4: Status (1/12) */}
      <div className="hidden lg:flex col-span-1 justify-start">
        <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>{status.label}</Badge>
      </div>

      {/* Coluna 5: Ações (2/12) */}
      <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-white" onClick={() => {/* Lógica de agendar */}}>
          <CalendarPlus className="w-4 h-4 mr-2" /> Agendar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelect(patient)}>
              <User className="w-4 h-4 mr-2" /> Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {/* Lógica de editar */}}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(patient.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}