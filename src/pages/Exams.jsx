
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/api/entities";
import { Exam } from "@/api/entities";
import { Beaker, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "../components/auth/AuthGuard";
import ExamFormDialog from "../components/exams/ExamFormDialog";
import ExamList from "../components/exams/ExamList";
import { ensureArray } from '../components/utils';

function ExamsContent() {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const { toast } = useToast();

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carrega todos os exames do usuário, sem filtro de clínica
      const examsData = await Exam.filter({ created_by: currentUser.email });
      const safeExams = ensureArray(examsData);
      setExams(safeExams);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os exames." });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Carregar exames quando o usuário for definido
  useEffect(() => {
    if (currentUser) {
      loadExams();
    }
  }, [currentUser, loadExams]);

  const filteredExams = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return exams.filter((exam) =>
      exam.name?.toLowerCase().includes(lowercasedTerm) ||
      exam.category?.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, exams]);

  const handleOpenForm = (exam = null) => {
    setEditingExam(exam);
    setIsFormOpen(true);
  };

  const handleSaveExam = async () => {
    setIsFormOpen(false);
    setEditingExam(null);
    await loadExams();
  };

  return (
    <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Beaker className="w-8 h-8 text-blue-600" />
            Catálogo de Exames
          </h1>
          <p className="text-slate-600 mt-2">
            Gerencie todos os exames oferecidos.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Exame
        </Button>
      </div>

      <Card className="mb-8 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Pesquisar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white"
            />
          </div>
        </CardContent>
      </Card>
      
      {filteredExams.length > 0 && !isLoading ? (
        <ExamList
          exams={filteredExams}
          isLoading={isLoading}
          onEdit={handleOpenForm}
          onStatusChange={handleSaveExam}
        />
      ) : !isLoading && (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 400px)' }}>
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Beaker className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">Nenhum exame encontrado</h3>
                    <p className="text-slate-500 mt-2">
                        {searchTerm 
                            ? "Tente um termo de busca diferente."
                            : "Cadastre o primeiro exame para começar a gerenciar seu catálogo."
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
      )}

      {isFormOpen && (
        <ExamFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveExam}
          examToEdit={editingExam}
        />
      )}
    </div>
  );
}

export default function Exams() {
  return (
    <AuthGuard>
      <ExamsContent />
    </AuthGuard>
  );
}
