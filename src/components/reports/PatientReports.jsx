import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Repeat, MapPin } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { differenceInYears, parseISO } from "date-fns";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PatientReports({ patients, appointments, isLoading, dateRange }) {
  
  const processAgeGroups = () => {
    const groups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    
    patients.forEach(patient => {
      if (patient.birth_date) {
        const age = differenceInYears(new Date(), new Date(patient.birth_date));
        if (age <= 18) groups['0-18']++;
        else if (age <= 35) groups['19-35']++;
        else if (age <= 50) groups['36-50']++;
        else if (age <= 65) groups['51-65']++;
        else groups['65+']++;
      }
    });
    
    return Object.entries(groups).map(([range, count]) => ({ range, count }));
  };

  const processGenderDistribution = () => {
    const genders = {};
    patients.forEach(patient => {
      const gender = patient.gender || 'Não informado';
      genders[gender] = (genders[gender] || 0) + 1;
    });
    
    return Object.entries(genders).map(([gender, count]) => ({ gender, count }));
  };

  const processCityDistribution = () => {
    const cities = {};
    patients.forEach(patient => {
      const city = patient.address?.city || 'Não informado';
      cities[city] = (cities[city] || 0) + 1;
    });
    
    return Object.entries(cities)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const processPatientFrequency = () => {
    const frequency = {};
    appointments.forEach(apt => {
      const patientName = apt.patient_name;
      frequency[patientName] = (frequency[patientName] || 0) + 1;
    });
    
    const ranges = { '1': 0, '2-3': 0, '4-5': 0, '6+': 0 };
    Object.values(frequency).forEach(count => {
      if (count === 1) ranges['1']++;
      else if (count <= 3) ranges['2-3']++;
      else if (count <= 5) ranges['4-5']++;
      else ranges['6+']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({ range: `${range} consulta${range === '1' ? '' : 's'}`, count }));
  };

  const ageData = processAgeGroups();
  const genderData = processGenderDistribution();
  const cityData = processCityDistribution();
  const frequencyData = processPatientFrequency();

  // Calculate key metrics
  const totalPatients = patients.length;
  const patientsThisMonth = patients.filter(p => {
    const createdDate = new Date(p.created_date);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  const recurringPatients = appointments.reduce((acc, apt) => {
    acc[apt.patient_name] = (acc[apt.patient_name] || 0) + 1;
    return acc;
  }, {});
  
  const recurringCount = Object.values(recurringPatients).filter(count => count > 1).length;
  const recurringRate = totalPatients > 0 ? ((recurringCount / totalPatients) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total de Pacientes</p>
                <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Novos este Mês</p>
                <p className="text-2xl font-bold text-emerald-600">{patientsThisMonth}</p>
              </div>
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Taxa de Retorno</p>
                <p className="text-2xl font-bold text-purple-600">{recurringRate}%</p>
              </div>
              <Repeat className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Consultas/Paciente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalPatients > 0 ? (appointments.length / totalPatients).toFixed(1) : 0}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Age Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição por Idade</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ gender, count }) => `${gender}: ${count}`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Principais Cidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{item.city}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...cityData.map(c => c.count))) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visit Frequency */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Frequência de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}