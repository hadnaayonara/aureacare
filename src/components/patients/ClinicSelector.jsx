
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from '@/api/entities'; // Added import
import { Clinic } from '@/api/entities'; // Added import
import { ensureArray } from '../utils'; // Added import

export default function ClinicSelector({ onClinicChange, currentUser }) {
    const [userClinics, setUserClinics] = useState([]);
    const [activeClinic, setActiveClinic] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) { // Added condition
            loadUserClinics();
        }
    }, [currentUser]);

    const loadUserClinics = async () => {
        setIsLoading(true);
        try {
            // BUSCA DIRETA: Busca as clínicas mais recentes do banco de dados
            const clinicsResponse = await Clinic.filter({ 
                created_by: currentUser.email, 
                is_active: true 
            });
            const freshClinics = ensureArray(clinicsResponse);
            
            setUserClinics(freshClinics);
            // ATUALIZA O CACHE: Salva a lista fresca no localStorage
            localStorage.setItem('userClinics', JSON.stringify(freshClinics));

            const activeClinicStored = localStorage.getItem('activeClinic');
            let currentActiveClinic = activeClinicStored ? JSON.parse(activeClinicStored) : null;

            // Se não houver clínica ativa ou a ativa não estiver na lista fresca, define a primeira como padrão
            if (!currentActiveClinic || !freshClinics.some(c => c.id === currentActiveClinic.id)) {
                if (freshClinics.length > 0) {
                    handleClinicChange(freshClinics[0].id, freshClinics);
                } else {
                    // Se não houver clínicas, limpa a clínica ativa
                    localStorage.removeItem('activeClinic');
                    setActiveClinic(null);
                }
            } else {
                setActiveClinic(currentActiveClinic);
            }

        } catch (error) {
            console.error('Erro ao carregar clínicas:', error);
            setUserClinics([]); // Set to empty array on error
        } finally { // Added finally block
            setIsLoading(false);
        }
    };

    const handleClinicChange = (clinicId, clinicsArray = userClinics) => {
        const selected = clinicsArray.find(c => c.id === clinicId);
        if (selected) {
            const activeClinicData = {
                id: selected.id,
                name: selected.name,
                role: 'host'
            };
            localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
            setActiveClinic(activeClinicData);
            
            // Notificar o componente pai sobre a mudança
            if (onClinicChange) {
                onClinicChange(activeClinicData);
            }
        }
    };

    const handleShowAll = () => {
        const allClinicsData = {
            id: 'all',
            name: 'Todas as Clínicas',
            role: 'host'
        };
        localStorage.setItem('activeClinic', JSON.stringify(allClinicsData));
        setActiveClinic(allClinicsData);
        
        if (onClinicChange) {
            onClinicChange(allClinicsData);
        }
    };

    if (isLoading) {
        return (
            <Card className="mb-6 border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-slate-400 animate-pulse" />
                        <div className="h-4 bg-slate-200 rounded animate-pulse flex-1"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (userClinics.length === 0) {
        return (
            <Card className="mb-6 border-0 shadow-lg bg-blue-50 border border-blue-200">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-blue-800">
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium text-sm md:text-base">Para adicionar pacientes, primeiro cadastre uma clínica.</span>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shrink-0">
                        <Link to={createPageUrl('NewClinic')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Cadastrar Clínica
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 border-0 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-slate-700">Filtrar por Clínica:</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Select 
                            value={activeClinic?.id || ''} 
                            onValueChange={(value) => handleClinicChange(value)}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Selecionar Clínica..." />
                            </SelectTrigger>
                            <SelectContent>
                                {userClinics.map(clinic => (
                                    <SelectItem key={clinic.id} value={clinic.id}>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {clinic.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {userClinics.length > 1 && (
                            <Button 
                                variant="outline" 
                                onClick={handleShowAll}
                                className={activeClinic?.id === 'all' ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                            >
                                Ver Todas
                            </Button>
                        )}
                    </div>
                    
                    {activeClinic && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">Ativa:</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {activeClinic.name}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
