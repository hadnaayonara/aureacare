import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TimelineCard({ records }) {
  const timelineRecords = [...(Array.isArray(records) ? records : [])].reverse(); // Oldest first

  return (
    <Card className="bg-white rounded-xl shadow-md p-0">
      <CardHeader className="p-[var(--card-pad)] border-b border-slate-100 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-blue-600"/>
            Histórico e Evolução
        </CardTitle>
        <Button size="sm" variant="outline" className="bg-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Evolução
        </Button>
      </CardHeader>
      <CardContent className="p-[var(--card-pad)]">
        {timelineRecords.length > 0 ? (
          <div className="relative pl-6 space-y-8 border-l-2 border-slate-200">
            {timelineRecords.map((record) => (
              <div key={record.id} className="relative">
                <div className="absolute -left-[35px] top-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full ring-4 ring-white">
                   <Calendar className="w-4 h-4 text-brand-blue-600"/>
                </div>
                <p className="text-sm font-semibold text-text-primary">{format(new Date(record.consultation_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                {record.doctor && <p className="text-xs text-text-muted flex items-center gap-1.5"><User className="w-3 h-3"/> com {record.doctor}</p>}
                
                <div className="mt-2 text-sm text-text-secondary space-y-1">
                  {record.chief_complaint && (
                    <p><span className="font-semibold text-text-primary">Queixa:</span> {record.chief_complaint}</p>
                  )}
                  {record.history_present_illness && (
                    <p className="whitespace-pre-wrap"><span className="font-semibold text-text-primary">Evolução:</span> {record.history_present_illness}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">Nenhum histórico encontrado.</div>
        )}
      </CardContent>
    </Card>
  );
}