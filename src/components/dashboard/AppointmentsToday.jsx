import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentItem = ({ appointment }) => {
  const statusConfig = {
    agendado: 'bg-blue-100 text-blue-700',
    confirmado: 'bg-green-100 text-green-700',
    concluido: 'bg-slate-200 text-slate-600',
    cancelado: 'bg-red-100 text-red-700',
    falta: 'bg-yellow-100 text-yellow-700',
    em_andamento: 'bg-orange-100 text-orange-700',
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{getInitials(appointment.patient_name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{appointment.patient_name}</p>
        <p className="text-sm text-slate-500">Dr(a). {appointment.doctor_name}</p>
      </div>
      <div className="text-right">
        <p className="font-medium text-slate-700 flex items-center gap-2 justify-end">
          <Clock className="w-4 h-4 text-slate-400" />
          {format(new Date(appointment.starts_at), 'HH:mm')}
        </p>
        <Badge className={`mt-1 capitalize ${statusConfig[appointment.status] || 'bg-gray-200'}`}>{appointment.status}</Badge>
      </div>
    </div>
  );
};

export default function AppointmentsToday({ appointments }) {
  return (
    <Card className="rounded-2xl shadow-md border-0 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-slate-800">Consultas de Hoje</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {appointments && appointments.length > 0 ? (
          <div className="space-y-2 -mx-4 -my-2 overflow-y-auto">
            {appointments.map((apt) => (
              <AppointmentItem key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
            <Calendar className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Nenhuma consulta hoje</h3>
            <p className="text-slate-500 mt-1 mb-4">A agenda de hoje está livre.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}