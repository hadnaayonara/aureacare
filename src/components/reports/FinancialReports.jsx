import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

export default function FinancialReports({ appointments, stats, isLoading, dateRange }) {
  
  const generateRevenueByMonth = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: format(date, 'MMM/yy', { locale: ptBR }),
        monthNumber: date.getMonth(),
        year: date.getFullYear()
      });
    }

    return months.map(({ month, monthNumber, year }) => {
      const monthAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.appointment_date);
        return appointmentDate.getMonth() === monthNumber && appointmentDate.getFullYear() === year;
      });

      const completed = monthAppointments.filter(a => a.status === 'concluido').length;
      const cancelled = monthAppointments.filter(a => a.status === 'cancelado' || a.status === 'falta').length;
      const potential = monthAppointments.length;

      return {
        month,
        revenue: completed * 150,
        lostRevenue: cancelled * 150,
        potentialRevenue: potential * 150,
        appointments: potential,
        completedAppointments: completed
      };
    });
  };

  const getRevenueByStatus = () => {
    const completed = appointments.filter(a => a.status === 'concluido').length;
    const cancelled = appointments.filter(a => a.status === 'cancelado').length;
    const noShow = appointments.filter(a => a.status === 'falta').length;
    const pending = appointments.filter(a => a.status === 'agendado' || a.status === 'confirmado').length;

    return [
      { status: 'Receita Realizada', value: completed * 150, count: completed, color: '#10B981' },
      { status: 'Receita Perdida (Cancelado)', value: cancelled * 150, count: cancelled, color: '#EF4444' },
      { status: 'Receita Perdida (Falta)', value: noShow * 150, count: noShow, color: '#F59E0B' },
      { status: 'Receita Potencial (Pendente)', value: pending * 150, count: pending, color: '#3B82F6' }
    ];
  };

  const getPaymentMethodStats = () => {
    // Simulando dados de método de pagamento (em uma implementação real, viria do banco de dados)
    const totalCompleted = appointments.filter(a => a.status === 'concluido').length;
    return [
      { method: 'Dinheiro', count: Math.floor(totalCompleted * 0.35), percentage: '35%' },
      { method: 'Cartão Débito', count: Math.floor(totalCompleted * 0.25), percentage: '25%' },
      { method: 'Cartão Crédito', count: Math.floor(totalCompleted * 0.20), percentage: '20%' },
      { method: 'PIX', count: Math.floor(totalCompleted * 0.15), percentage: '15%' },
      { method: 'Convênio', count: Math.floor(totalCompleted * 0.05), percentage: '5%' }
    ];
  };

  const revenueByMonth = generateRevenueByMonth();
  const revenueByStatus = getRevenueByStatus();
  const paymentMethods = getPaymentMethodStats();

  const totalRevenue = stats.estimatedRevenue || 0;
  const totalLostRevenue = stats.lostRevenue || 0;
  const totalPotentialRevenue = stats.potentialRevenue || 0;
  const revenueEfficiency = totalPotentialRevenue > 0 ? ((totalRevenue / totalPotentialRevenue) * 100).toFixed(1) : 0;

  const currentMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?.revenue || 0;
  const monthlyGrowth = previousMonthRevenue > 0 ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Receita Realizada</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {monthlyGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
                  <span className={`text-xs ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyGrowth}% vs mês anterior
                  </span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Receita Perdida</p>
                <p className="text-2xl font-bold text-red-600">R$ {totalLostRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalPotentialRevenue > 0 ? ((totalLostRevenue / totalPotentialRevenue) * 100).toFixed(1) : 0}% do potencial
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Receita Potencial</p>
                <p className="text-2xl font-bold text-blue-600">R$ {totalPotentialRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  100% das consultas agendadas
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Eficiência Financeira</p>
                <p className="text-2xl font-bold text-purple-600">{revenueEfficiency}%</p>
                <Badge variant={revenueEfficiency >= 80 ? "default" : revenueEfficiency >= 60 ? "secondary" : "destructive"} className="mt-1">
                  {revenueEfficiency >= 80 ? "Excelente" : revenueEfficiency >= 60 ? "Bom" : "Melhorar"}
                </Badge>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Evolução da Receita (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lostRevenue" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Receita por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ status, value }) => `R$ ${value.toLocaleString()}`}
                  >
                    {revenueByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByMonth.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3B82F6" name="Consultas Totais" />
                  <Bar dataKey="completedAppointments" fill="#10B981" name="Consultas Concluídas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">{method.method}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: method.percentage }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{method.count}</div>
                      <div className="text-xs text-slate-500">{method.percentage}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">💰 Oportunidade de Crescimento</h4>
              <p className="text-sm text-green-700">
                Com {revenueEfficiency}% de eficiência, há potencial de aumento de 
                R$ {(totalPotentialRevenue - totalRevenue).toLocaleString()} na receita.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📈 Tendência de Crescimento</h4>
              <p className="text-sm text-blue-700">
                {monthlyGrowth >= 0 ? 'Crescimento' : 'Redução'} de {Math.abs(monthlyGrowth)}% 
                na receita comparado ao mês anterior.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Receita Perdida</h4>
              <p className="text-sm text-orange-700">
                R$ {totalLostRevenue.toLocaleString()} perdidos por cancelamentos e faltas. 
                Foque em estratégias de retenção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}