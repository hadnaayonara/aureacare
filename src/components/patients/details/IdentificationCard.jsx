
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Calendar, MapPin, PersonStanding, AlertTriangle, HeartPulse, Pill } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const DataItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-text-muted mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <p className="text-sm text-text-primary">{value || 'Não informado'}</p>
        </div>
    </div>
);

export default function IdentificationCard({ patient }) {
    const age = patient.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : null;

    return (
        <Card className="bg-white rounded-xl shadow-md p-0">
            <CardHeader className="p-[var(--card-pad)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-20 w-20 text-2xl">
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-text-secondary font-medium">
                        {getInitials(patient.full_name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-text-primary">{patient.full_name}</CardTitle>
                    <p className="text-sm text-text-muted">{patient.cpf || 'CPF não informado'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(patient.allergies || []).length > 0 && <Badge variant="destructive" className="rounded-full"><AlertTriangle className="w-3 h-3 mr-1.5"/>Alergia</Badge>}
                        {(patient.chronic_conditions || []).length > 0 && <Badge variant="outline" className="rounded-full border-amber-300 text-amber-800 bg-amber-50"><HeartPulse className="w-3 h-3 mr-1.5"/>Crônico</Badge>}
                        {(patient.current_medications || []).length > 0 && <Badge variant="outline" className="rounded-full"><Pill className="w-3 h-3 mr-1.5"/>Medicação</Badge>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-[var(--card-pad)] border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                    <DataItem
                        icon={Calendar}
                        label="Nascimento"
                        value={patient.birth_date ? `${format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })} (${age} anos)` : null}
                    />
                    <DataItem
                        icon={PersonStanding}
                        label="Gênero"
                        value={patient.gender}
                    />
                     <DataItem
                        icon={Phone}
                        label="Telefone"
                        value={patient.phone}
                    />
                    <DataItem
                        icon={Mail}
                        label="Email"
                        value={patient.email}
                    />
                    <DataItem
                        icon={MapPin}
                        label="Endereço"
                        value={patient.address ? `${patient.address.street}, ${patient.address.number}` : null}
                    />
                    <DataItem
                        icon={HeartPulse}
                        label="Plano de Saúde"
                        value={patient.medical_plan}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
