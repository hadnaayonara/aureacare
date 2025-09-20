import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { Calendar } from 'lucide-react';

export default function WeeklyCalendarView({ currentDate, appointments, isLoading, onUpdate }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    return addDays(monday, i);
  });

  const timeSlots = Array.from({ length: 28 }).map((_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const getAppointmentsForSlot = (day, time) => {
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    const [hour, minute] = time.split(':').map(Number);
    
    return appointmentsArray.filter((apt) => {
      if (!apt.appointment_date || !apt.appointment_time) return false;
      
      const dayFormatted = format(day, 'yyyy-MM-dd');
      const [aptHour, aptMinute] = apt.appointment_time.split(':').map(Number);
      
      return apt.appointment_date === dayFormatted && 
             aptHour === hour && 
             Math.abs(aptMinute - minute) < 30;
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header dos dias */}
        <div className="grid grid-cols-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="col-span-1 p-4"></div>
          {weekDays.map((day, index) => (
            <div key={day.toString()} className="col-span-1 p-4 text-center border-r border-slate-100 last:border-r-0">
              <div className={`font-bold text-lg ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-blue-600' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {format(day, 'MMM', { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Grid de horários e agendamentos */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8">
            {/* Coluna de horários */}
            <div className="col-span-1 bg-gradient-to-b from-slate-50 to-slate-100">
              {timeSlots.map((time) => (
                <div key={time} className="h-20 flex items-center justify-end pr-4 border-b border-slate-100 text-sm text-slate-600 font-medium">
                  {time}
                </div>
              ))}
            </div>
            
            {/* Colunas dos dias */}
            {weekDays.map((day, dayIndex) => (
              <div key={day.toString()} className="col-span-1 border-r border-slate-100 last:border-r-0">
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className={`h-20 border-b border-slate-100 p-1 ${timeIndex % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'}`}>
                    <div className="space-y-1 h-full overflow-y-auto">
                      {getAppointmentsForSlot(day, time).map((apt) => (
                        <AppointmentCard key={apt.id} appointment={apt} onSelect={setSelectedAppointment} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}