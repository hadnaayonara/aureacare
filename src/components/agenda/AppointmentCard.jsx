import React from 'react';
import { Bot, User, Clock, Stethoscope } from 'lucide-react';

export default function AppointmentCard({ appointment, onSelect }) {
  const statusConfig = {
    agendado: { 
      bg: 'bg-blue-50 border-l-blue-500', 
      text: 'text-blue-800',
      dot: 'bg-blue-500'
    },
    confirmado: { 
      bg: 'bg-emerald-50 border-l-emerald-500', 
      text: 'text-emerald-800',
      dot: 'bg-emerald-500'
    },
    em_andamento: { 
      bg: 'bg-purple-50 border-l-purple-500', 
      text: 'text-purple-800',
      dot: 'bg-purple-500'
    },
    concluido: { 
      bg: 'bg-green-50 border-l-green-500', 
      text: 'text-green-800',
      dot: 'bg-green-500'
    },
    cancelado: { 
      bg: 'bg-red-50 border-l-red-500', 
      text: 'text-red-800 line-through',
      dot: 'bg-red-500'
    },
    falta: { 
      bg: 'bg-orange-50 border-l-orange-500', 
      text: 'text-orange-800 line-through',
      dot: 'bg-orange-500'
    },
    bloqueio: { 
      bg: 'bg-slate-100 border-l-slate-500', 
      text: 'text-slate-600',
      dot: 'bg-slate-500'
    },
  };

  const config = statusConfig[appointment.type === 'bloqueio' ? 'bloqueio' : appointment.status] || statusConfig.agendado;

  return (
    <div 
      onClick={() => onSelect(appointment)}
      className={`${config.bg} border-l-4 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-white/20`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`w-2 h-2 ${config.dot} rounded-full mt-2`}></div>
        {appointment.whatsapp_thread && (
          <Bot className="w-3 h-3 text-slate-500" />
        )}
      </div>
      
      <div className="space-y-1">
        <p className={`font-semibold text-sm ${config.text} truncate`}>
          {appointment.patient_name || appointment.notes}
        </p>
        
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Stethoscope className="w-3 h-3" />
          <span className="truncate">{appointment.specialty || appointment.type}</span>
        </div>
        
        {appointment.appointment_time && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{appointment.appointment_time}</span>
          </div>
        )}
      </div>
    </div>
  );
}