import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ClinicSelector() {
    const [userClinics, setUserClinics] = useState([]);
    const [activeClinic, setActiveClinic] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const clinicsStored = localStorage.getItem('userClinics');
        if (clinicsStored) {
            setUserClinics(JSON.parse(clinicsStored));
        }

        const activeClinicStored = localStorage.getItem('activeClinic');
        if (activeClinicStored) {
            setActiveClinic(JSON.parse(activeClinicStored));
        }
    }, [location]);

    const handleClinicChange = (clinicId) => {
        const selected = userClinics.find(c => c.id === clinicId);
        if (selected) {
            const activeClinicData = {
                id: selected.id,
                name: selected.name,
                role: 'host' // Assuming this selector is for hosts
            };
            localStorage.setItem('activeClinic', JSON.stringify(activeClinicData));
            setActiveClinic(activeClinicData);
            
            // Reload the page to apply the new context
            window.location.reload();
        }
    };

    if (userClinics.length <= 1) {
        return null; // Don't show selector if there's only one or zero clinics
    }

    return (
        <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <Select 
                value={activeClinic?.id || ''} 
                onValueChange={handleClinicChange}
            >
                <SelectTrigger className="w-48 bg-white">
                    <SelectValue placeholder="Selecionar Clínica..." />
                </SelectTrigger>
                <SelectContent>
                    {userClinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}