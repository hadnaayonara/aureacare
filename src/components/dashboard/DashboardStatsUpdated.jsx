import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Business } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// =====================================================
// COMPONENTE DE ESTATÍSTICAS DO DASHBOARD - SUPABASE
// =====================================================

const DashboardStatsUpdated = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!userProfile) return;

      setLoading(true);
      setError(null);

      try {
        const statsData = await Business.getDashboardStats(
          userProfile.clinic_id,
          new Date().toISOString().split('T')[0], // Hoje
          new Date().toISOString().split('T')[0]  // Hoje
        );

        setStats(statsData);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userProfile]);

  if (loading) {
    return <DashboardStatsSkeleton />;
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">Erro</div>
            <p className="text-xs text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return <DashboardStatsSkeleton />;
  }

  const statCards = [
    {
      title: 'Total de Pacientes',
      value: stats.total_patients || 0,
      icon: Users,
      description: 'Pacientes cadastrados',
      color: 'text-blue-600'
    },
    {
      title: 'Consultas Hoje',
      value: stats.total_appointments || 0,
      icon: Calendar,
      description: 'Agendadas para hoje',
      color: 'text-green-600'
    },
    {
      title: 'Consultas Concluídas',
      value: stats.completed_appointments || 0,
      icon: CheckCircle,
      description: 'Finalizadas hoje',
      color: 'text-emerald-600'
    },
    {
      title: 'Consultas Pendentes',
      value: stats.pending_appointments || 0,
      icon: Clock,
      description: 'Aguardando confirmação',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// =====================================================
// SKELETON LOADING
// =====================================================

const DashboardStatsSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatsUpdated;
