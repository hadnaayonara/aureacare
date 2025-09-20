import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar } from 'lucide-react';
import NewAppointmentDialog from './NewAppointmentDialog';

export default function AgendaHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  onRefresh,
  patients,
  doctors,
  userRole,
  userClinicId
}) {

  const getHeaderDate = () => {
    if (viewMode === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'd')} - ${format(end, "d 'de' MMMM", { locale: ptBR })}`;
      }
      return `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM", { locale: ptBR })}`;
    }
    return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
            <p className="text-sm text-slate-600">Gerenciamento de consultas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onToday} 
            variant="outline"
            className="bg-white/80 border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200 rounded-xl"
          >
            Hoje
          </Button>
          
          <div className="flex items-center gap-1 bg-white/80 rounded-xl border border-slate-200 shadow-sm">
            <Button 
              onClick={onPrevious} 
              variant="ghost" 
              size="icon"
              className="hover:bg-slate-100 rounded-l-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onNext} 
              variant="ghost" 
              size="icon"
              className="hover:bg-slate-100 rounded-r-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-700 capitalize hidden lg:block">
          {getHeaderDate()}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Seletor de Visualização */}
          <div className="bg-white/80 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex">
              {[
                { value: 'day', label: 'Dia' },
                { value: 'week', label: 'Semana' },
                { value: 'month', label: 'Mês' }
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onViewModeChange(mode.value)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === mode.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <NewAppointmentDialog
            patients={patients || []}
            doctors={doctors || []}
            onAppointmentCreated={onRefresh}
            userRole={userRole}
            userClinicId={userClinicId} 
          />

          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="icon"
            className="bg-white/80 border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}