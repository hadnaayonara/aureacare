import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ActionCard = ({ title, icon: Icon, to, gradient }) => (
  <Link to={to} className="block group">
    <Card className={`rounded-2xl shadow-md border-0 text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${gradient}`}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
        <Icon className="w-8 h-8 mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
        <h3 className="font-semibold">{title}</h3>
      </CardContent>
    </Card>
  </Link>
);

export default function QuickActions() {
  const actions = [
    { title: 'Novo Agendamento', icon: Plus, to: createPageUrl('Agenda'), gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { title: 'Ver Pacientes', icon: Users, to: createPageUrl('Patients'), gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { title: 'Novo Prontuário', icon: FileText, to: createPageUrl('NewMedicalRecord'), gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { title: 'Relatórios', icon: BarChart3, to: createPageUrl('Reports'), gradient: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <ActionCard key={action.title} {...action} />
      ))}
    </div>
  );
}