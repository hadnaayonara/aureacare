import React from 'react';
import NewPatientForm from '../components/patients/NewPatientForm';
import AuthGuard from '../components/auth/AuthGuard';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/api/entities';
import { MedicalRecord } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";

function NewPatientPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSave = async (patientData) => {
        try {
            const { firstConsultationRecord, ...corePatientData } = patientData;

            // 1. Criar o paciente
            const newPatient = await Patient.create(corePatientData);

            // 2. Se houver um prontuário inicial, criá-lo associado ao novo paciente
            if (firstConsultationRecord && newPatient.id) {
                await MedicalRecord.create({
                    ...firstConsultationRecord,
                    patient_id: newPatient.id,
                });
            }

            toast({
                title: "Sucesso!",
                description: "Novo paciente cadastrado com sucesso.",
            });
            navigate(createPageUrl(`PatientDetails?id=${newPatient.id}`));
        } catch (error) {
            console.error("Erro ao criar novo paciente:", error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível criar o novo paciente.",
            });
        }
    };
    
    const handleCancel = () => {
        navigate(createPageUrl('Patients'));
    };

    return (
         <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <NewPatientForm onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
}


export default function NewPatient() {
    return (
        <AuthGuard>
            <NewPatientPage />
        </AuthGuard>
    )
}