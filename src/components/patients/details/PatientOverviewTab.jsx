import React from 'react';
import IdentificationCard from './IdentificationCard';
import HealthConditionsCard from './HealthConditionsCard';
import TimelineCard from './TimelineCard';

export default function PatientOverviewTab({ patient, records }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--section-gap)] items-start">
      
      {/* Coluna Larga */}
      <div className="lg:col-span-8 space-y-[var(--section-gap)]">
        <IdentificationCard patient={patient} />
        <TimelineCard records={records} />
      </div>

      {/* Coluna Estreita */}
      <div className="lg:col-span-4 space-y-[var(--section-gap)]">
        <HealthConditionsCard patient={patient} />
        {/* WIP: Cards de Arquivos e Próximos Agendamentos */}
      </div>

    </div>
  );
}