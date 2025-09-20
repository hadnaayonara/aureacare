
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AuthGuard from '../components/auth/AuthGuard';
import { Patient } from '@/api/entities';
import { MedicalRecord } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Edit, Download, CalendarPlus } from 'lucide-react';
import PatientOverviewTab from '../components/patients/details/PatientOverviewTab';
import { Toaster } from "@/components/ui/toaster";
import { createPageUrl } from '@/utils';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

function PatientDetailsContent() {
    const query = useQuery();
    const patientId = query.get('id');

    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!patientId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [patientData, recordsData] = await Promise.all([
                Patient.get(patientId),
                MedicalRecord.filter({ patient_id: patientId }, '-consultation_date')
            ]);
            setPatient(patientData);
            setRecords(Array.isArray(recordsData) ? recordsData : []);
        } catch (error) {
            console.error("Erro ao carregar dados do paciente:", error);
        } finally {
            setIsLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    if (isLoading) {
        return (
            <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    if (!patient) {
        return <div className="text-center p-8">Paciente não encontrado.</div>;
    }

    return (
        <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Toaster />
            <div className="space-y-[var(--section-gap)]">
                {/* Header */}
                <header className="space-y-4">
                    <div className="flex items-center text-sm text-text-muted">
                        <Link to={createPageUrl('Patients')} className="hover:text-text-primary">Pacientes</Link>
                        <ChevronRight className="w-4 h-4 mx-1" />
                        <span className="font-medium text-text-primary">{patient.full_name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-text-primary">Ficha do Paciente</h1>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white"><Download className="w-4 h-4 mr-2" />Exportar PDF</Button>
                            <Button variant="outline" className="bg-white"><Edit className="w-4 h-4 mr-2" />Editar</Button>
                            <Button className="bg-brand-blue-600 hover:bg-brand-blue-600/90 shadow-md"><CalendarPlus className="w-4 h-4 mr-2"/>Novo Agendamento</Button>
                        </div>
                    </div>
                </header>

                {/* Abas de Navegação */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="records">Prontuários</TabsTrigger>
                        <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                        <TabsTrigger value="files">Arquivos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                        <PatientOverviewTab patient={patient} records={records} />
                    </TabsContent>
                    
                    <TabsContent value="records" className="mt-6">
                        <div className="bg-white rounded-xl shadow-md p-6">WIP: Lista de Prontuários aqui.</div>
                    </TabsContent>
                    
                    <TabsContent value="appointments" className="mt-6">
                        <div className="bg-white rounded-xl shadow-md p-6">WIP: Lista de Agendamentos aqui.</div>
                    </TabsContent>

                    <TabsContent value="files" className="mt-6">
                        <div className="bg-white rounded-xl shadow-md p-6">WIP: Galeria de Arquivos aqui.</div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function PatientDetailsPage() {
    return (
        <AuthGuard>
            <PatientDetailsContent />
        </AuthGuard>
    );
}
