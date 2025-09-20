import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Users, Calendar, TrendingUp, Clock, Award } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DoctorReports({ doctors, appointments, patients, assignments, isLoading, stats }) {
  
  const getDoctorPerformanceData = () => {
    return doctors.map(doctor => {
      const doctorAppointments = appointments.filter(apt => apt.doctor_id === doctor.id);
      const completedAppointments = doctorAppointments.filter(apt => apt.status === 'concluido').length;
      const doctorPatients = assignments.filter(a => a.doctor_id === doctor.id).length;
      
      return {
        name: doctor.full_name,
        specialty: doctor.main_specialty,
        appointments: doctorAppointments.length,
        completed: completedAppointments,
        patients: doctorPatients,
        attendanceRate: doctorAppointments.length > 0 ? 
          ((completedAppointments / doctorAppointments.length) * 100).toFixed(1) : 0,
        revenue: completedAppointments * 150
      };
    }).sort((a, b) => b.appointments - a.appointments);
  };

  const getSpecialtyDistribution = () => {
    const specialties = {};
    doctors.forEach(doctor => {
      const specialty = doctor.main_specialty || 'Não informado';
      specialties[specialty] = (specialties[specialty] || 0) + 1;
    });
    
    return Object.entries(specialties).map(([specialty, count]) => ({
      specialty,
      count
    }));
  };

  const getAvailabilityStats = () => {
    const availabilityData = {
      totalSlots: 0,
      activeSlots: 0,
      doctorsWithSchedule: 0
    };

    doctors.forEach(doctor => {
      if (doctor.availability_schedule && doctor.availability_schedule.length > 0) {
        const activeSchedules = doctor.availability_schedule.filter(s => s.is_active);
        if (activeSchedules.length > 0) {
          availabilityData.doctorsWithSchedule++;
          availabilityData.totalSlots += doctor.availability_schedule.length;
          availabilityData.activeSlots += activeSchedules.length;
        }
      }
    });

    return availabilityData;
  };

  const doctorPerformance = getDoctorPerformanceData();
  const specialtyDistribution = getSpecialtyDistribution();
  const availabilityStats = getAvailabilityStats();

  const topPerformers = doctorPerformance.slice(0, 5);
  const averageAppointmentsPerDoctor = doctorPerformance.reduce((sum, d) => sum + d.appointments, 0) / Math.max(doctorPerformance.length, 1);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total de Profissionais</p>
                <p className="text-2xl font-bold text-slate-900">{doctors.length}</p>
              </div>
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Com Agenda Configurada</p>
                <p className="text-2xl font-bold text-emerald-600">{availabilityStats.doctorsWithSchedule}</p>
                <p className="text-xs text-slate-500">{((availabilityStats.doctorsWithSchedule / Math.max(doctors.length, 1)) * 100).toFixed(1)}% do total</p>
              </div>
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Consultas/Profissional</p>
                <p className="text-2xl font-bold text-purple-600">{averageAppointmentsPerDoctor.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Média por profissional</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Especialidades</p>
                <p className="text-2xl font-bold text-orange-600">{specialtyDistribution.length}</p>
                <p className="text-xs text-slate-500">Diferentes especialidades</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top 5 Profissionais por Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPerformers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Specialty Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={specialtyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ specialty, count }) => `${specialty}: ${count}`}
                  >
                    {specialtyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Doctor Performance Table */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Detalhada dos Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Profissional</th>
                    <th className="text-left p-3 font-semibold">Especialidade</th>
                    <th className="text-center p-3 font-semibold">Consultas</th>
                    <th className="text-center p-3 font-semibold">Concluídas</th>
                    <th className="text-center p-3 font-semibold">Pacientes</th>
                    <th className="text-center p-3 font-semibold">Taxa Comparecimento</th>
                    <th className="text-center p-3 font-semibold">Receita Est.</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorPerformance.map((doctor, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{doctor.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{doctor.specialty}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-blue-600">{doctor.appointments}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-green-600">{doctor.completed}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-purple-600">{doctor.patients}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={doctor.attendanceRate >= 80 ? "default" : doctor.attendanceRate >= 60 ? "secondary" : "destructive"}
                          className={doctor.attendanceRate >= 80 ? "bg-green-100 text-green-800" : doctor.attendanceRate >= 60 ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          {doctor.attendanceRate}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-emerald-600">R$ {doctor.revenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Availability Analysis */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Análise de Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{availabilityStats.doctorsWithSchedule}</div>
                <div className="text-sm text-slate-500">Com agenda configurada</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{availabilityStats.activeSlots}</div>
                <div className="text-sm text-slate-500">Períodos ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {availabilityStats.totalSlots > 0 ? ((availabilityStats.activeSlots / availabilityStats.totalSlots) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-slate-500">Taxa de utilização</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-slate-700">Resumo da Agenda:</h4>
              {doctors.map((doctor, index) => {
                const activeSchedules = doctor.availability_schedule?.filter(s => s.is_active) || [];
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="font-medium">{doctor.full_name}</span>
                    <span className="text-sm text-slate-600">
                      {activeSchedules.length > 0 ? 
                        `${activeSchedules.length} dias ativos` : 
                        'Agenda não configurada'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}