import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format, parseISO, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppointmentReports({ appointments, isLoading, dateRange }) {
  
  const processAppointmentsByWeekday = () => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const data = weekdays.map(day => ({ day, count: 0 }));
    
    appointments.forEach(apt => {
      const date = new Date(apt.appointment_date);
      const weekday = date.getDay();
      data[weekday].count++;
    });
    
    return data;
  };

  const processAppointmentsByHour = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h
    const data = hours.map(hour => ({ 
      hour: `${hour}:00`, 
      count: 0 
    }));
    
    appointments.forEach(apt => {
      if (apt.appointment_time) {
        const [hourStr] = apt.appointment_time.split(':');
        const hour = parseInt(hourStr);
        const index = hour - 8;
        if (index >= 0 && index < data.length) {
          data[index].count++;
        }
      }
    });
    
    return data;
  };

  const processAppointmentsByType = () => {
    const types = {};
    appointments.forEach(apt => {
      const type = apt.type || 'consulta';
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));
  };

  const processAppointmentsByDoctor = () => {
    const doctors = {};
    appointments.forEach(apt => {
      const doctor = apt.doctor || 'Não informado';
      doctors[doctor] = (doctors[doctor] || 0) + 1;
    });
    
    return Object.entries(doctors).map(([doctor, count]) => ({
      doctor,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const weekdayData = processAppointmentsByWeekday();
  const hourData = processAppointmentsByHour();
  const typeData = processAppointmentsByType();
  const doctorData = processAppointmentsByDoctor();

  const statusCounts = {
    agendado: appointments.filter(apt => apt.status === 'agendado').length,
    confirmado: appointments.filter(apt => apt.status === 'confirmado').length,
    concluido: appointments.filter(apt => apt.status === 'concluido').length,
    cancelado: appointments.filter(apt => apt.status === 'cancelado').length,
    falta: appointments.filter(apt => apt.status === 'falta').length,
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.concluido}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.cancelado + statusCounts.falta}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Taxa Ocupação</p>
                <p className="text-2xl font-bold text-purple-600">76%</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Appointments by Weekday */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Agendamentos por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Appointments by Hour */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Horários Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Appointments by Type */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tipos de Procedimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{item.type}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...typeData.map(t => t.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Doctors */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctorData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{item.doctor}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...doctorData.map(d => d.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}