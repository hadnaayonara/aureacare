import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AppointmentDetailsDialog from './AppointmentDetailsDialog';

export default function MonthlyCalendarView({ currentDate, appointments, isLoading, onUpdate }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }), // Sunday
    end: endOfWeek(lastDayOfMonth, { weekStartsOn: 0 })
  });

  const getAppointmentsForDay = (day) => {
    // Ensure appointments is always an array
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    
    return appointmentsArray.filter(apt => {
        if (!apt.appointment_date) return false;
        return new Date(apt.appointment_date).toDateString() === day.toDateString()
    });
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <>
      <div className="grid grid-cols-7 border-t border-l">
        {/* Weekday headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center p-2 font-semibold text-slate-600 border-r border-b bg-slate-50">
            {day}
          </div>
        ))}
        {/* Day cells */}
        {daysInMonth.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div 
              key={day.toString()}
              className={`h-32 border-r border-b p-2 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}
            >
              <div className={`flex justify-end mb-1 ${isCurrentDay ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayAppointments.slice(0, 2).map(apt => (
                  <div 
                    key={apt.id} 
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    {apt.patient_name}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="text-xs text-center text-blue-600 cursor-pointer hover:underline">
                        + {dayAppointments.length - 2} mais
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                       <h4 className="font-semibold text-sm mb-2">Consultas em {format(day, 'dd/MM')}</h4>
                       <div className="space-y-2">
                        {dayAppointments.map(apt => (
                           <div 
                            key={apt.id} 
                            className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                            onClick={() => { setSelectedAppointment(apt); }}
                           >
                            {apt.appointment_time} - {apt.patient_name}
                           </div>
                        ))}
                       </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
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