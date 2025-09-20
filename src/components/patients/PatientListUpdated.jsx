import React, { useState, useEffect } from 'react';
import { usePatients, usePatientStats } from '@/hooks/usePatients';
import { usePermissions } from '@/services/PermissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Users, 
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// COMPONENTE DE LISTA DE PACIENTES - SUPABASE
// =====================================================

const PatientListUpdated = ({ onPatientSelect, onPatientEdit, onPatientDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    is_active: true,
    limit: 20
  });

  const { 
    patients, 
    loading, 
    error, 
    pagination,
    searchPatients,
    deletePatient,
    loadPatients
  } = usePatients(filters);

  const { stats } = usePatientStats();
  const { canCreate, canUpdate, canDelete } = usePermissions();

  // =====================================================
  // FUNÇÕES DE BUSCA E FILTROS
  // =====================================================

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchPatients(term, filters);
    } else {
      await loadPatients(filters);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPatients({ ...filters, page });
  };

  // =====================================================
  // FUNÇÕES DE AÇÃO
  // =====================================================

  const handleDeletePatient = async (patientId) => {
    if (!canDelete('patients')) {
      alert('Você não tem permissão para deletar pacientes');
      return;
    }

    if (window.confirm('Tem certeza que deseja deletar este paciente?')) {
      try {
        await deletePatient(patientId);
        if (onPatientDelete) {
          onPatientDelete(patientId);
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Erro ao deletar paciente: ' + error.message);
      }
    }
  };

  const handleEditPatient = (patient) => {
    if (!canUpdate('patients')) {
      alert('Você não tem permissão para editar pacientes');
      return;
    }
    
    if (onPatientEdit) {
      onPatientEdit(patient);
    }
  };

  const handleViewPatient = (patient) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };

  // =====================================================
  // RENDERIZAÇÃO
  // =====================================================

  if (loading && patients.length === 0) {
    return <PatientListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar pacientes: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pacientes</h2>
          {stats && (
            <p className="text-muted-foreground">
              {stats.total} pacientes cadastrados • {stats.active} ativos
            </p>
          )}
        </div>
        
        {canCreate('patients') && (
          <Button onClick={() => handleEditPatient(null)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        )}
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Lista de Pacientes</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Barra de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabela de pacientes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.full_name}
                    </TableCell>
                    <TableCell>{patient.cpf}</TableCell>
                    <TableCell>{patient.email || '-'}</TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={patient.is_active ? 'default' : 'secondary'}>
                        {patient.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          {canUpdate('patients') && (
                            <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canDelete('patients') && (
                            <DropdownMenuItem 
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * filters.limit) + 1} a{' '}
                {Math.min(currentPage * filters.limit, pagination.total)} de{' '}
                {pagination.total} pacientes
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <span className="text-sm">
                  Página {currentPage} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {patients.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum paciente encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando um novo paciente'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// =====================================================
// SKELETON LOADING
// =====================================================

const PatientListSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(7)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientListUpdated;
