import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Beaker } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function ExamReports({ appointments, exams, isLoading }) {
  
  const examsReportData = useMemo(() => {
    if (!appointments || !exams || appointments.length === 0 || exams.length === 0) {
      return [];
    }

    const examCounts = appointments
      .filter(apt => apt.type === 'exame' && apt.exam_id)
      .reduce((acc, apt) => {
        acc[apt.exam_id] = (acc[apt.exam_id] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(examCounts)
      .map(([examId, count]) => {
        const examDetails = exams.find(e => e.id === examId);
        return {
          name: examDetails ? examDetails.name : `ID: ${examId.substring(0, 5)}...`,
          count: count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 most frequent exams

  }, [appointments, exams]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-6 h-6 text-blue-600" />
            Exames Mais Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {examsReportData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={examsReportData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="name" stroke="#64748b" width={200} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                <Legend />
                <Bar dataKey="count" name="Nº de Agendamentos" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhum dado de exame para exibir no período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}