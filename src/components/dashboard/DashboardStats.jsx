import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Stethoscope, ArrowUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-xl ${color.bg}`}>
          <Icon className={`w-7 h-7 ${color.text}`} />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
       {trend && (
        <div className="flex items-center text-sm text-green-600 mt-4">
          <ArrowUp className="w-4 h-4 mr-1" />
          <span>{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);


export default function DashboardStats({ stats }) {
  const statItems = [
    { title: 'Pacientes Ativos', value: stats.patients, icon: Users, color: { bg: 'bg-blue-100', text: 'text-blue-600' }, trend: '+5 este mês' },
    { title: 'Consultas (Mês)', value: stats.appointments, icon: Calendar, color: { bg: 'bg-emerald-100', text: 'text-emerald-600' }, trend: '+12 este mês' },
    { title: 'Prontuários', value: stats.records, icon: FileText, color: { bg: 'bg-purple-100', text: 'text-purple-600' } },
    { title: 'Profissionais', value: stats.doctors, icon: Stethoscope, color: { bg: 'bg-orange-100', text: 'text-orange-600' } },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  );
}