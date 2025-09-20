import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, FilePlus } from 'lucide-react';

const ActivityItem = ({ icon: Icon, text, time }) => (
  <div className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="p-2 bg-slate-100 rounded-full">
      <Icon className="w-5 h-5 text-slate-500" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-700">{text}</p>
      <p className="text-xs text-slate-400">{time}</p>
    </div>
  </div>
);

export default function RecentActivity({ patients }) {
  // Mock data, as AuditLog is not fully implemented for this view
  const activities = [
    ...(patients.slice(0,2).map(p => ({
      icon: UserPlus,
      text: `Novo paciente: ${p.full_name}`,
      time: `Hoje`
    }))),
    { icon: FilePlus, text: 'Prontuário de Ana Silva atualizado.', time: 'Há 2 horas' },
  ];

  return (
    <Card className="rounded-2xl shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.length > 0 ? activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          )) : <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade recente.</p>}
        </div>
      </CardContent>
    </Card>
  );
}