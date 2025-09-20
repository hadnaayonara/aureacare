
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Archive, ArchiveRestore } from "lucide-react";
import { Exam } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

export default function ExamList({ exams, isLoading, onEdit, onStatusChange }) {
  const { toast } = useToast();

  const handleStatusToggle = async (exam) => {
    try {
      const newStatus = exam.status === 'active' ? 'archived' : 'active';
      await Exam.update(exam.id, { status: newStatus });
      toast({ title: "Sucesso!", description: `Exame ${newStatus === 'active' ? 'reativado' : 'arquivado'}.` });
      onStatusChange();
    } catch (error) {
      console.error("Erro ao alterar status do exame:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível alterar o status." });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (exams.length === 0 && !isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <h3 className="text-xl font-semibold text-slate-700">Nenhum exame encontrado</h3>
          <p className="text-slate-500 mt-2">
            Certifique-se de que há uma clínica ativa selecionada e cadastre o primeiro exame para começar a gerenciar seu catálogo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusClass = (status) => {
    return status === 'active' ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 bg-slate-50 text-slate-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <Card key={exam.id} className="border-0 shadow-lg flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">{exam.name}</h3>
              <Badge variant="outline" className={getStatusClass(exam.status)}>
                {exam.status === 'active' ? 'Ativo' : 'Arquivado'}
              </Badge>
            </div>
            {exam.category && <p className="text-sm font-medium text-blue-600 mb-2">{exam.category}</p>}
            <p className="text-sm text-slate-500 line-clamp-2 mb-1">
              <strong>Preparo:</strong> {exam.instructions || 'Nenhum preparo específico.'}
            </p>
            <div className="flex gap-4 text-sm text-slate-600">
              <span><strong>Duração:</strong> {exam.default_duration} min</span>
              {exam.price > 0 && <span><strong>Preço:</strong> R$ {exam.price.toFixed(2)}</span>}
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(exam)}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button
              variant={exam.status === 'active' ? 'secondary' : 'default'}
              size="sm"
              onClick={() => handleStatusToggle(exam)}
            >
              {exam.status === 'active' ?
                <><Archive className="w-4 h-4 mr-2" /> Arquivar</> :
                <><ArchiveRestore className="w-4 h-4 mr-2" /> Reativar</>
              }
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
