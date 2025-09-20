
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Bot,
  FileText,
  Activity } from
"lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar } from
"recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function OverviewDashboard({ data, stats, isLoading, dateRange }) {

  // Generate mock data for charts based on real data
  const generateChartData = () => {
    const days = parseInt(dateRange);
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayAppointments = data.appointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === date.toDateString();
      }).length;

      chartData.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        agendamentos: dayAppointments,
        pacientes: Math.floor(dayAppointments * 0.8) // Simulated
      });
    }

    return chartData;
  };

  const appointmentStatusData = [
  { name: 'Concluído', value: stats.completedAppointments || 0, color: '#10B981' },
  { name: 'Agendado', value: (stats.totalAppointments || 0) - (stats.completedAppointments || 0), color: '#3B82F6' },
  { name: 'Cancelado', value: Math.floor((stats.totalAppointments || 0) * 0.1), color: '#EF4444' }];


  const kpiCards = [
  {
    title: "Total de Agendamentos",
    value: stats.totalAppointments || 0,
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    trend: "+12%"
  },
  {
    title: "Novos Pacientes",
    value: stats.newPatients || 0,
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    trend: "+8%"
  },
  {
    title: "Taxa de Comparecimento",
    value: `${stats.attendanceRate || 0}%`,
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    trend: "+3%"
  },
  {
    title: "Receita Estimada",
    value: `R$ ${(stats.estimatedRevenue || 0).toLocaleString()}`,
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    trend: "+15%"
  },
  {
    title: "Tempo Resp. IA",
    value: stats.avgResponseTime || "< 2 min",
    icon: Bot,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    trend: "-20s"
  },
  {
    title: "Taxa de Cancelamento",
    value: `${stats.cancellationRate || 0}%`,
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    trend: "-2%"
  }];


  const chartData = generateChartData();

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) =>
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {kpi.title}
                  </p>
                  {isLoading ?
                <Skeleton className="h-8 w-20" /> :

                <p className="text-3xl font-bold text-slate-900">
                      {kpi.value}
                    </p>
                }
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {kpi.trend} vs período anterior
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Appointments Trend */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="p-6 flex flex-col space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tendência de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-6">
            {isLoading ?
            <Skeleton className="h-64 w-full" /> :

            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} />

                  <Area
                  type="monotone"
                  dataKey="agendamentos"
                  stroke="#10B981"
                  fill="url(#colorAgendamentos)"
                  strokeWidth={2} />

                  <defs>
                    <linearGradient id="colorAgendamentos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="p-6 flex flex-col space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-blue-600" />
              Status dos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-6">
            {isLoading ?
            <Skeleton className="h-64 w-full" /> :

            <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>

                      {appointmentStatusData.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                    </Pie>
                    <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} />

                  </PieChart>
                </ResponsiveContainer>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="p-6 flex flex-col space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-purple-600" />
            Resumo do Período
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.totalRecords || 0}</p>
              <p className="text-sm text-slate-500">Prontuários Criados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">98.5%</p>
              <p className="text-sm text-slate-500">Uptime da IA</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">4.8/5</p>
              <p className="text-sm text-slate-500">Satisfação Pacientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">89%</p>
              <p className="text-sm text-slate-500">Conversão IA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

}
