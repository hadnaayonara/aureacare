import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Patient } from '@/api/entities';
import { Appointment } from '@/api/entities';
import { MedicalRecord } from '@/api/entities';
import { Doctor } from '@/api/entities';
import DashboardStats from './DashboardStats';
import AppointmentsToday from './AppointmentsToday';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import { useLocation } from 'react-router-dom';
import DashboardCardSkeleton from './DashboardCardSkeleton'; // Import do Skeleton

export default function DashboardContent() {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, records: 0, doctors: 0 });
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadDashboardData = async () => {
      // Começa o carregamento
      setIsLoading(true);
      setIsContentVisible(false);

      try {
        const currentUser = await User.me();
        const userType = localStorage.getItem('userType');
        const activeClinic = JSON.parse(localStorage.getItem('activeClinic'));

        let queryFilter = {};

        if (userType === 'reception' && activeClinic?.id) {
          queryFilter = { clinic_id: activeClinic.id };
        } else if (userType === 'host') {
          if (activeClinic?.id) {
             queryFilter = { clinic_id: activeClinic.id };
          } else {
             queryFilter = { created_by: currentUser.email };
          }
        } else if (userType === 'doctor' && activeClinic?.doctor_id) {
           const doctorAppointments = await Appointment.filter({ doctor_id: activeClinic.doctor_id });
           const clinicPatients = await Patient.filter({ clinic_id: activeClinic.id });
           setAppointmentsToday(doctorAppointments.filter(a => new Date(a.starts_at).toDateString() === new Date().toDateString()));
           setRecentPatients(clinicPatients.slice(0, 5));
           setStats({ 
             patients: clinicPatients.length, 
             appointments: doctorAppointments.length, 
             records: 0,
             doctors: 1 
            });
           setIsLoading(false);
           return;
        }


        const [patients, appointments, records, doctors] = await Promise.all([
          Patient.filter(queryFilter),
          Appointment.filter(queryFilter),
          MedicalRecord.filter(queryFilter),
          Doctor.filter(queryFilter)
        ]);

        const safePatients = Array.isArray(patients) ? patients : [];
        const safeAppointments = Array.isArray(appointments) ? appointments : [];
        const safeRecords = Array.isArray(records) ? records : [];
        const safeDoctors = Array.isArray(doctors) ? doctors : [];
        
        setStats({
          patients: safePatients.length,
          appointments: safeAppointments.length,
          records: safeRecords.length,
          doctors: safeDoctors.length,
        });

        const today = new Date().toDateString();
        setAppointmentsToday(safeAppointments.filter(a => new Date(a.starts_at).toDateString() === today));
        setRecentPatients(safePatients.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5));

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        // Finaliza o carregamento
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [location]);

  // Efeito para transição de fade-in
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsContentVisible(true), 50); // Pequeno delay para garantir a transição
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
            </div>
            {/* Adicione skeletons para as outras seções se desejar */}
        </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto transition-opacity duration-500 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="space-y-6">
            <DashboardStats stats={stats} />
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <AppointmentsToday appointments={appointmentsToday} />
                </div>
                <div className="xl:col-span-2">
                    <div className="space-y-6">
                        <RecentActivity patients={recentPatients} />
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}