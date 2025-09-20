import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, UserPlus, Plus, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgendaSummary({ appointments, onNewAppointment, onNewPatient }) {
  const appointmentsArray = Array.isArray(appointments) ? appointments : [];
  const today = new Date().toDateString();
  const todayAppointments = appointmentsArray.filter((apt) => new Date(apt.appointment_date).toDateString() === today);

  const completed = todayAppointments.filter((a) => a.status === 'concluido').length;
  const cancelled = todayAppointments.filter((a) => a.status === 'cancelado').length;
  const pending = todayAppointments.filter((a) => a.status === 'agendado' || a.status === 'confirmado').length;
  const total = todayAppointments.length;

  const hasAppointments = todayAppointments.length > 0;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        Resumo de Hoje
      </h3>
      
      {hasAppointments ? (
        <div className="space-y-4">
          {/* Estatísticas do dia */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-slate-800">{total}</div>
              <div className="text-sm text-slate-600">consultas hoje</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <div className="font-bold text-emerald-700">{completed}</div>
                <div className="text-emerald-600">Concluídas</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="font-bold text-blue-700">{pending}</div>
                <div className="text-blue-600">Pendentes</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="font-bold text-red-700">{cancelled}</div>
                <div className="text-red-600">Canceladas</div>
              </div>
            </div>
          </div>

          {/* Progresso do dia */}
          <div className="bg-white/60 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progresso</span>
              <span className="text-sm text-slate-500">{Math.round((completed / total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(completed / total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-2">
            <Button 
              onClick={onNewAppointment}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button 
              onClick={onNewPatient}
              variant="outline"
              className="w-full bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:shadow-md transition-all duration-200 rounded-xl h-10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-800 mb-2">Agenda Livre</h4>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Nenhum agendamento para hoje.<br />
            Aproveite para organizar novos compromissos!
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onNewAppointment}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button 
              onClick={onNewPatient}
              variant="outline"
              className="w-full bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:shadow-md transition-all duration-200 rounded-xl h-10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}