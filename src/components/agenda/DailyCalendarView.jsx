import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';

export default function DailyCalendarView({ currentDate, appointments, isLoading, onUpdate }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const timeSlots = Array.from({ length: 28 }).map((_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const getAppointmentsForSlot = (time) => {
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    const [hour, minute] = time.split(':').map(Number);
    
    return appointmentsArray.filter(apt => {
      if (!apt.appointment_date || !apt.appointment_time) return false;
      
      // FIX: Comparação melhorada usando formato de data consistente
      const currentDateFormatted = format(currentDate, 'yyyy-MM-dd');
      const [aptHour, aptMinute] = apt.appointment_time.split(':').map(Number);
      
      return apt.appointment_date === currentDateFormatted && 
             aptHour === hour && 
             Math.abs(aptMinute - minute) < 30;
    });
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <>
      <div className="grid grid-cols-12 flex-1">
        {/* Time column */}
        <div className="col-span-1">
          <div className="h-16 border-b"></div>
          {timeSlots.map(time => (
            <div key={time} className="h-20 text-right pr-2 pt-1 text-sm text-slate-500 border-r border-t">
              {time}
            </div>
          ))}
        </div>
        
        {/* Day column */}
        <div className="col-span-11 border-r">
          <div className="text-center p-4 h-16 border-b sticky top-0 bg-white z-10">
            <p className="font-semibold text-slate-800 text-lg capitalize">{format(currentDate, 'EEEE, d', { locale: ptBR })}</p>
            <p className="text-xs text-slate-500 uppercase">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</p>
          </div>
          {timeSlots.map(time => (
            <div key={time} className="h-20 border-t relative">
              <div className="absolute inset-0 p-1 flex flex-col gap-1 overflow-y-auto">
                {getAppointmentsForSlot(time).map(apt => (
                   <AppointmentCard key={apt.id} appointment={apt} onSelect={setSelectedAppointment} />
                ))}
              </div>
            </div>
          ))}
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