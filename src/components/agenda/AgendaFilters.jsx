import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Activity, Filter } from 'lucide-react';

export default function AgendaFilters({
  filters,
  onFilterChange,
  doctors = [],
  userRole,
}) {
  const handleFilterChange = (filterName, value) => {
    onFilterChange(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Filtro por Profissional - Visível para host e recepção */}
      {(userRole === 'host' || userRole === 'reception') && (
        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            Profissional
          </label>
          <Select
            value={filters.doctor}
            onValueChange={(value) => handleFilterChange('doctor', value)}
          >
            <SelectTrigger className="w-full bg-white/80 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <SelectValue placeholder="Todos os Profissionais" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              {doctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.id}>{doctor.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro por Status da Consulta */}
      <div>
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          Status da Consulta
        </label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-full bg-white/80 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="agendado">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Agendado
              </div>
            </SelectItem>
            <SelectItem value="confirmado">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Confirmado
              </div>
            </SelectItem>
            <SelectItem value="em_andamento">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Em Andamento
              </div>
            </SelectItem>
            <SelectItem value="concluido">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Concluído
              </div>
            </SelectItem>
            <SelectItem value="cancelado">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Cancelado
              </div>
            </SelectItem>
            <SelectItem value="falta">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Falta
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}