import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ImportPatientsModal from '../ImportPatientsModal';
import { Users, Plus, Search, SlidersHorizontal } from 'lucide-react';

export default function PatientListHeader({ patientCount, searchTerm, onSearchTermChange, onImportComplete, onNewPatient }) {
  return (
    <div className="space-y-[var(--block-gap)]">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-brand-blue-600 to-brand-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pacientes</h1>
            <p className="text-sm text-text-secondary">{patientCount} paciente{patientCount !== 1 ? 's' : ''} encontrado{patientCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ImportPatientsModal onImportComplete={onImportComplete} />
          <Button onClick={onNewPatient} className="bg-brand-blue-600 hover:bg-brand-blue-600/90 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>
      
      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            placeholder="Buscar por nome, CPF, telefone..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 h-12 bg-white rounded-xl shadow-sm border-slate-200 w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 bg-white rounded-xl shadow-sm border-slate-200 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
            <DropdownMenuItem>Status</DropdownMenuItem>
            <DropdownMenuItem>Médico</DropdownMenuItem>
            <DropdownMenuItem>Clínica</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}