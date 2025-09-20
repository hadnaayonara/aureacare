import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Pill, AlertTriangle } from 'lucide-react';

const ConditionSection = ({ icon: Icon, title, items, badgeClass }) => (
    <div>
        <h4 className="font-semibold text-text-secondary mb-2 flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4" />
            {title}
        </h4>
        <div className="flex flex-wrap gap-2">
            {(items || []).length > 0 ? (
                items.map((item, i) => (
                    <Badge key={i} variant="outline" className={`rounded-full font-normal ${badgeClass}`}>
                        {item}
                    </Badge>
                ))
            ) : (
                <p className="text-xs text-text-muted">Nenhuma informação.</p>
            )}
        </div>
    </div>
);

export default function HealthConditionsCard({ patient }) {
    return (
        <Card className="bg-white rounded-xl shadow-md p-0">
            <CardHeader className="p-[var(--card-pad)] border-b border-slate-100">
                <CardTitle className="text-base font-bold text-text-primary">Condições de Saúde</CardTitle>
            </CardHeader>
            <CardContent className="p-[var(--card-pad)] space-y-[var(--block-gap)]">
                <ConditionSection
                    icon={AlertTriangle}
                    title="Alergias"
                    items={patient.allergies}
                    badgeClass="bg-rose-50 border-rose-200 text-rose-800"
                />
                <ConditionSection
                    icon={HeartPulse}
                    title="Condições Crônicas"
                    items={patient.chronic_conditions}
                    badgeClass="bg-amber-50 border-amber-200 text-amber-800"
                />
                <ConditionSection
                    icon={Pill}
                    title="Medicações Atuais"
                    items={patient.current_medications}
                    badgeClass="bg-blue-50 border-blue-200 text-blue-800"
                />
            </CardContent>
        </Card>
    );
}