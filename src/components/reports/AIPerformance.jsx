import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";

export default function AIPerformance({ appointments, isLoading, dateRange }) {
  
  // Mock AI performance data (in a real app, this would come from AI analytics)
  const generateAIMetrics = () => {
    const totalLeads = Math.floor(appointments.length * 1.5); // Assume more leads than actual appointments
    const convertedLeads = appointments.filter(apt => apt.whatsapp_thread).length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      avgResponseTime: "1.2 min",
      avgMessagesPerLead: "4.8",
      abandonmentRate: "12.5%",
      satisfactionScore: "4.7/5",
      uptime: "99.2%"
    };
  };

  const generateConversationTrend = () => {
    const days = parseInt(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        conversations: Math.floor(Math.random() * 20) + 10,
        conversions: Math.floor(Math.random() * 15) + 5,
      });
    }
    
    return data;
  };

  const generateResponseTimeData = () => {
    const hours = ['00h', '06h', '12h', '18h'];
    return hours.map(hour => ({
      hour,
      responseTime: Math.random() * 3 + 0.5, // Between 0.5 and 3.5 minutes
    }));
  };

  const aiMetrics = generateAIMetrics();
  const conversationTrend = generateConversationTrend();
  const responseTimeData = generateResponseTimeData();

  const commonObjections = [
    { objection: "Preço muito alto", count: 24, percentage: "35%" },
    { objection: "Horário indisponível", count: 18, percentage: "26%" },
    { objection: "Prefere ligar", count: 12, percentage: "18%" },
    { objection: "Quer consultar família", count: 8, percentage: "12%" },
    { objection: "Não tem plano", count: 6, percentage: "9%" }
  ];

  return (
    <div className="space-y-8">
      {/* AI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Leads Atendidos</p>
                <p className="text-2xl font-bold text-slate-900">{aiMetrics.totalLeads}</p>
                <Badge variant="outline" className="text-xs mt-2 bg-green-50 text-green-700">
                  +18% vs período anterior
                </Badge>
              </div>
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-emerald-600">{aiMetrics.conversionRate}%</p>
                <Badge variant="outline" className="text-xs mt-2 bg-green-50 text-green-700">
                  +5% vs período anterior
                </Badge>
              </div>
              <Target className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tempo Resp. Médio</p>
                <p className="text-2xl font-bold text-purple-600">{aiMetrics.avgResponseTime}</p>
                <Badge variant="outline" className="text-xs mt-2 bg-green-50 text-green-700">
                  -15s vs período anterior
                </Badge>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Satisfação</p>
                <p className="text-2xl font-bold text-orange-600">{aiMetrics.satisfactionScore}</p>
                <Badge variant="outline" className="text-xs mt-2 bg-green-50 text-green-700">
                  +0.2 vs período anterior
                </Badge>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Conversation Trends */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Tendência de Conversas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={conversationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversations" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Response Time by Hour */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Tempo de Resposta por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value.toFixed(1)} min`, 'Tempo de Resposta']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Common Objections */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Principais Objeções Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonObjections.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">{item.objection}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.count}</Badge>
                    <span className="text-sm font-bold text-slate-900">{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mensagens por Lead</span>
                <span className="font-bold text-slate-900">{aiMetrics.avgMessagesPerLead}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Taxa de Abandono</span>
                <span className="font-bold text-red-600">{aiMetrics.abandonmentRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Uptime do Sistema</span>
                <span className="font-bold text-green-600">{aiMetrics.uptime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Leads Convertidos</span>
                <span className="font-bold text-emerald-600">{aiMetrics.convertedLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}