import React from 'react';
import PatientListItem from './PatientListItem';
import PatientListItemSkeleton from './PatientListItemSkeleton';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function PatientList({ patients, isLoading, onDelete, onSelect, onNewPatientClick }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <PatientListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-100">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Nenhum paciente encontrado</h3>
        <p className="text-text-secondary mt-2 mb-6">Comece adicionando um novo paciente ao sistema.</p>
        <Button onClick={onNewPatientClick} className="bg-brand-blue-600 hover:bg-brand-blue-600/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Paciente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map(patient => (
        <PatientListItem
          key={patient.id}
          patient={patient}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}