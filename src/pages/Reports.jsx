
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Patient } from "@/api/entities";
import { Appointment } from "@/api/entities";
import { MedicalRecord } from "@/api/entities";
import { User } from "@/api/entities";
import { Doctor } from "@/api/entities"; // Added Doctor import
import { Clinic } from "@/api/entities"; // Added Clinic import
import { PatientAssignment } from "@/api/entities"; // Added PatientAssignment import
import { Exam } from "@/api/entities"; // Import Exam entity
import {
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Bot,
  Download,
  Filter,
  RefreshCw,
  Building2, // Added Building2 icon
  Stethoscope, // Added Stethoscope icon
  UserPlus, // Added UserPlus icon
  Loader2, // Added Loader2 for loading state
  Beaker // Added Beaker icon for exams
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { toast, useToast } from "@/components/ui/use-toast"; // Added useToast import

import { exportFullReport } from '@/api/functions'; // Importar a nova função

import OverviewDashboard from "../components/reports/OverviewDashboard";
import AppointmentReports from "../components/reports/AppointmentReports";
import PatientReports from "../components/reports/PatientReports";
import AIPerformance from "../components/reports/AIPerformance";
import DoctorReports from "../components/reports/DoctorReports"; // Added DoctorReports component
import FinancialReports from "../components/reports/FinancialReports"; // Added FinancialReports component
import ExamReports from "../components/reports/ExamReports"; // Import ExamReports

export default function Reports() {
  const [data, setData] = useState({
    appointments: [],
    patients: [],
    records: [],
    doctors: [], // New state for doctors
    clinics: [], // New state for clinics
    assignments: [], // New state for patient assignments
    exams: [] // New state for exams
  });
  const [dateRange, setDateRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedClinic, setSelectedClinic] = useState("all"); // New state for clinic filter
  const [isExporting, setIsExporting] = useState(false); // Adicionar estado de exportação
  const { toast } = useToast(); // Hook for toast messages

  const calculateAdvancedStats = useCallback((appointments, patients, records, doctors, clinics, assignments) => {
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Filter data by date range
    const filteredAppointments = appointments.filter((apt) =>
      new Date(apt.created_date) >= startDate
    );
    const filteredPatients = patients.filter((patient) =>
      new Date(patient.created_date) >= startDate
    );
    const filteredRecords = records.filter((record) =>
      new Date(record.created_date) >= startDate
    );

    // Basic metrics
    const totalAppointments = filteredAppointments.length;
    const completedAppointments = filteredAppointments.filter((apt) => apt.status === 'concluido').length;
    const cancelledAppointments = filteredAppointments.filter((apt) => apt.status === 'cancelado').length;
    const noShowAppointments = filteredAppointments.filter((apt) => apt.status === 'falta').length;
    const pendingAppointments = filteredAppointments.filter((apt) => apt.status === 'agendado' || apt.status === 'confirmado').length;

    // Advanced calculations
    const attendanceRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;
    const cancellationRate = totalAppointments > 0 ? ((cancelledAppointments + noShowAppointments) / totalAppointments * 100).toFixed(1) : 0;
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments * 100).toFixed(1) : 0;

    // Revenue calculations
    const estimatedRevenue = completedAppointments * 150; // Assuming average consultation price
    const lostRevenue = (cancelledAppointments + noShowAppointments) * 150;
    const potentialRevenue = totalAppointments * 150;

    // Doctor performance
    const doctorStats = doctors.map(doctor => {
      const doctorAppointments = filteredAppointments.filter(apt => apt.doctor_id === doctor.id);
      const doctorCompleted = doctorAppointments.filter(apt => apt.status === 'concluido').length;
      const doctorPatients = patients.filter(p =>
        assignments.some(a => a.doctor_id === doctor.id && a.patient_id === p.id)
      ).length;

      return {
        id: doctor.id,
        name: doctor.full_name,
        specialty: doctor.main_specialty,
        totalAppointments: doctorAppointments.length,
        completedAppointments: doctorCompleted,
        patients: doctorPatients,
        attendanceRate: doctorAppointments.length > 0 ? (doctorCompleted / doctorAppointments.length * 100).toFixed(1) : 0,
        revenue: doctorCompleted * 150
      };
    }).sort((a, b) => b.totalAppointments - a.totalAppointments);

    // Patient demographics
    const patientsByAge = patients.reduce((acc, patient) => {
      if (patient.birth_date) {
        const birthDate = parseISO(patient.birth_date);
        if (!isNaN(birthDate.getTime())) { // Check for valid date
          const age = differenceInDays(now, birthDate) / 365.25; // More precise age calculation
          if (age < 18) acc['0-17']++;
          else if (age < 30) acc['18-29']++;
          else if (age < 50) acc['30-49']++;
          else if (age < 65) acc['50-64']++;
          else acc['65+']++;
        }
      }
      return acc;
    }, { '0-17': 0, '18-29': 0, '30-49': 0, '50-64': 0, '65+': 0 });

    const patientsByGender = patients.reduce((acc, patient) => {
      const gender = patient.gender || 'Não informado';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Time analysis
    const busyHours = filteredAppointments.reduce((acc, apt) => {
      if (apt.appointment_time) {
        const hour = apt.appointment_time.split(':')[0];
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {});

    const busyDays = filteredAppointments.reduce((acc, apt) => {
      const aptDate = parseISO(apt.appointment_date);
      if (!isNaN(aptDate.getTime())) { // Check for valid date
        const dayOfWeek = aptDate.getDay();
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dayName = dayNames[dayOfWeek];
        acc[dayName] = (acc[dayName] || 0) + 1;
      }
      return acc;
    }, {});

    // Monthly trends (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(startOfMonth(now), i);
      const monthKey = format(date, 'yyyy-MM');

      const monthAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return !isNaN(aptDate.getTime()) && format(aptDate, 'yyyy-MM') === monthKey;
      });

      const monthPatients = patients.filter(patient => {
        const patientDate = parseISO(patient.created_date);
        return !isNaN(patientDate.getTime()) && format(patientDate, 'yyyy-MM') === monthKey;
      });

      monthlyData.push({
        month: format(date, 'MMM/yy', { locale: ptBR }),
        appointments: monthAppointments.length,
        patients: monthPatients.length,
        revenue: monthAppointments.filter(apt => apt.status === 'concluido').length * 150
      });
    }

    setStats({
      // Basic stats
      totalAppointments,
      newPatients: filteredPatients.length,
      attendanceRate,
      cancellationRate,
      noShowRate,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      pendingAppointments,

      // Financial stats
      estimatedRevenue,
      lostRevenue,
      potentialRevenue,
      avgRevenuePerAppointment: completedAppointments > 0 ? (estimatedRevenue / completedAppointments) : 0,

      // Resource stats
      totalDoctors: doctors.length,
      totalClinics: clinics.length,
      totalRecords: filteredRecords.length, // Records created within date range
      avgAppointmentsPerDoctor: doctors.length > 0 ? (totalAppointments / doctors.length).toFixed(1) : 0,
      avgPatientsPerDoctor: doctors.length > 0 ? (patients.length / doctors.length).toFixed(1) : 0,

      // Performance stats
      avgResponseTime: "< 2 min", // Simulated AI response time
      systemUptime: "99.8%", // Simulated system uptime

      // Detailed data for charts
      doctorStats,
      patientsByAge,
      patientsByGender,
      busyHours,
      busyDays,
      monthlyData,

      // Growth metrics
      monthlyGrowth: monthlyData.length > 1 && monthlyData[monthlyData.length - 2].appointments > 0 ?
        (((monthlyData[monthlyData.length - 1].appointments - monthlyData[monthlyData.length - 2].appointments) /
          monthlyData[monthlyData.length - 2].appointments) * 100).toFixed(1) : 0
    });
  }, [dateRange]); // Added dateRange as a dependency for calculateAdvancedStats

  const loadReportsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current user to filter by created_by
      const currentUser = await User.me();

      const [appointmentsData, patientsData, recordsData, doctorsData, clinicsData, assignmentsData, examsData] = await Promise.all([
        Appointment.filter({ created_by: currentUser.email }, '-appointment_date'),
        Patient.filter({ created_by: currentUser.email }, '-created_date'),
        MedicalRecord.filter({ created_by: currentUser.email }, '-consultation_date'),
        Doctor.filter({ created_by: currentUser.email }), // Fetch doctors
        Clinic.filter({ created_by: currentUser.email }), // Fetch clinics
        PatientAssignment.list(), // Fetch patient assignments
        Exam.filter({ created_by: currentUser.email }) // Fetch exams
      ]);

      // Filter by clinic if selected
      let filteredData = {
        appointments: appointmentsData || [],
        patients: patientsData || [],
        records: recordsData || [],
        doctors: doctorsData || [],
        clinics: clinicsData || [],
        assignments: assignmentsData || [],
        exams: examsData || [] // Add exams to data
      };

      if (selectedClinic !== "all") {
        filteredData.appointments = filteredData.appointments.filter(a => a.clinic_id === selectedClinic);
        filteredData.patients = filteredData.patients.filter(p => p.clinic_id === selectedClinic);
        filteredData.records = filteredData.records.filter(r => r.clinic_id === selectedClinic);
        filteredData.doctors = filteredData.doctors.filter(d => d.clinic_id === selectedClinic);
        filteredData.clinics = filteredData.clinics.filter(c => c.id === selectedClinic); // Keep only the selected clinic
        filteredData.assignments = filteredData.assignments.filter(a => a.clinic_id === selectedClinic);
        filteredData.exams = filteredData.exams.filter(e => e.clinic_id === selectedClinic);
      }

      setData(filteredData);
      // Pass all relevant data to calculateAdvancedStats, including assignments
      calculateAdvancedStats(filteredData.appointments, filteredData.patients, filteredData.records, filteredData.doctors, filteredData.clinics, filteredData.assignments);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados dos relatórios. Tente novamente.",
      });
    }
    setIsLoading(false);
  }, [selectedClinic, dateRange, toast, calculateAdvancedStats]); // Added calculateAdvancedStats to dependencies

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]); // Now use the memoized function

  const handleExport = async (type) => {
    if (type !== 'pdf') {
        toast({
            variant: "default",
            title: "Funcionalidade em breve",
            description: `Exportação para ${type.toUpperCase()} ainda não está disponível.`,
        });
        return;
    }
    
    setIsExporting(true);
    try {
        const response = await exportFullReport({ dateRange, clinicId: selectedClinic });
        
        if (response.status === 200) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_aurea_lab_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast({
                title: "Sucesso!",
                description: "Relatório PDF gerado e download iniciado.",
            });
        } else {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar o relatório em PDF. Por favor, tente novamente." });
        }
    } catch (error) {
        console.error("Erro na exportação do relatório:", error);
        toast({ variant: "destructive", title: "Erro", description: "Ocorreu um erro ao gerar o relatório. Verifique sua conexão e tente novamente." });
    } finally {
        setIsExporting(false);
    }
  };

  const periods = [
    { value: "7", label: "Últimos 7 dias" },
    { value: "30", label: "Últimos 30 dias" },
    { value: "90", label: "Últimos 3 meses" },
    { value: "365", label: "Último ano" }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Relatórios Completos e Analytics
            </h1>
            <p className="text-slate-600 mt-2">
              Análise detalhada de performance, financeiro e operacional
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Clinic Filter */}
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger className="w-48 bg-white">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por clínica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Clínicas</SelectItem>
                {data.clinics.map(clinic => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={loadReportsData}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>

            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-40 bg-white" disabled={isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                <SelectValue placeholder="Exportar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel" disabled>Excel (em breve)</SelectItem>
                <SelectItem value="csv" disabled>CSV (em breve)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-100 text-slate-800 mb-8 p-1 h-10 items-center justify-center rounded-md grid w-full grid-cols-6"> {/* Updated grid-cols-5 to grid-cols-6 */}
            <TabsTrigger value="overview" className="bg-slate-200 text-slate-800 px-3 py-1.5 text-sm font-medium inline-flex items-center justify-center whitespace-nowrap rounded-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="doctors">Profissionais</TabsTrigger> {/* New Tab */}
            <TabsTrigger value="exams">Exames</TabsTrigger> {/* New Tab */}
            <TabsTrigger value="financial">Financeiro</TabsTrigger> {/* New Tab */}
          </TabsList>

          <TabsContent value="overview">
            <OverviewDashboard
              data={data}
              stats={stats}
              isLoading={isLoading}
              dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentReports
              appointments={data.appointments}
              isLoading={isLoading}
              dateRange={dateRange}
              stats={stats} /> {/* Added stats prop */}
          </TabsContent>

          <TabsContent value="patients">
            <PatientReports
              patients={data.patients}
              appointments={data.appointments}
              isLoading={isLoading}
              dateRange={dateRange}
              stats={stats} /> {/* Added stats prop */}
          </TabsContent>

          <TabsContent value="doctors"> {/* New TabsContent */}
            <DoctorReports
              doctors={data.doctors}
              appointments={data.appointments}
              patients={data.patients}
              assignments={data.assignments}
              isLoading={isLoading}
              stats={stats}
            />
          </TabsContent>
          
          <TabsContent value="exams"> {/* New TabsContent */}
            <ExamReports
              appointments={data.appointments}
              exams={data.exams}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="financial"> {/* New TabsContent */}
            <FinancialReports
              appointments={data.appointments}
              stats={stats}
              isLoading={isLoading}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="ai-performance">
            <AIPerformance
              appointments={data.appointments}
              isLoading={isLoading}
              dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
