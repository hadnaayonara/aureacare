import React from 'react';
import { Appointment } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Calendar, Clock, Stethoscope, Check, X, MessageSquare, Bot } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AppointmentDetailsDialog({ appointment, isOpen, onClose, onUpdate }) {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus) => {
    try {
      await Appointment.update(appointment.id, { status: newStatus });
      toast({
        title: "Status Atualizado!",
        description: `O agendamento foi marcado como "${newStatus}".`,
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível atualizar o status.",
      });
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Detalhes do Agendamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <User className="w-5 h-5 text-slate-600" />
            <Link to={createPageUrl(`Patients?patient_id=${appointment.patient_id}`)} className="font-semibold text-slate-900 hover:underline">
              {appointment.patient_name}
            </Link>
          </div>
          <div className="flex items-center gap-3 p-3">
            <Clock className="w-5 h-5 text-slate-500" />
            <p>{format(new Date(appointment.appointment_date), "EEEE, dd 'de' MMMM", { locale: ptBR })} às {appointment.appointment_time}</p>
          </div>
          <div className="flex items-center gap-3 p-3">
            <Stethoscope className="w-5 h-5 text-slate-500" />
            <p>{appointment.specialty} com {appointment.doctor}</p>
          </div>
          <div className="flex items-center justify-between p-3">
            <p>Status:</p>
            <Badge>{appointment.status}</Badge>
          </div>
          {appointment.whatsapp_thread && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Bot className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">Agendado pela IA via WhatsApp</p>
            </div>
          )}
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => handleStatusChange('confirmado')}><Check className="w-4 h-4 mr-2" />Confirmar</Button>
          <Button variant="destructive" onClick={() => handleStatusChange('cancelado')}><X className="w-4 h-4 mr-2" />Cancelar</Button>
          <Button variant="secondary" className="col-span-2"><MessageSquare className="w-4 h-4 mr-2" />Enviar Lembrete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}