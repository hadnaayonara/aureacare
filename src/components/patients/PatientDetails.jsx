
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Pill,
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
  Shield,
  Edit,
  PlusCircle,
  Paperclip,
  Download, // New import
  Loader2 // New import
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NewMedicalRecordForm from "./NewMedicalRecordForm";
import { MedicalRecord } from '@/api/entities';
import { ensureArray } from '../utils';
import { exportPatientHistory } from '@/api/functions'; // New import

export default function PatientDetails({ patient, onBack, onEdit, onDelete }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // New state

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patient || !patient.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch newest first for the "Prontuários" tab
        const recordsData = await MedicalRecord.filter({ patient_id: patient.id }, '-consultation_date'); 
        setRecords(ensureArray(recordsData));
      } catch (error) {
        console.error("Erro ao carregar prontuários do paciente:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPatientData();
  }, [patient]);

  const handleUpdate = () => {
    // Refetch the data after a new record is saved
    const loadPatientData = async () => {
      setIsLoading(true);
      try {
        const recordsData = await MedicalRecord.filter({ patient_id: patient.id }, '-consultation_date');
        setRecords(ensureArray(recordsData));
      } catch (error) { console.error("Erro ao carregar prontuários:", error); }
      finally { setIsLoading(false); }
    };
    loadPatientData();
  };

  const getPatientInitials = (name) => {
    if (!name) return 'P';
    const names = name.split(' ');
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), new Date(birthDate));
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'agendado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-emerald-100 text-emerald-800',
      'em_andamento': 'bg-purple-100 text-purple-800',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
      'falta': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'falta': 'Falta'
    };
    return labels[status] || status;
  };
  
  const handleSaveNewRecord = async (recordData) => {
    try {
      await MedicalRecord.create({
        ...recordData,
        patient_id: patient.id,
      });
      setShowNewRecordDialog(false);
      handleUpdate(); // Call handleUpdate to refetch data
    } catch (error) {
      console.error("Erro ao salvar novo prontuário:", error);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await exportPatientHistory({ patient_id: patient.id });
      
      if (response.status === 200) {
        // Assuming response.data is an ArrayBuffer or Blob
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico_${patient.full_name.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        // TODO: Add a success toast/notification
      } else {
        console.error("Erro ao gerar PDF:", response.data?.error || `Status: ${response.status}`);
        // TODO: Add an error toast/notification
      }
    } catch (error) {
      console.error("Erro na chamada de exportação:", error);
      // TODO: Add an error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  const allAttachments = (records || []).flatMap(record => 
    (record.attachments || []).map(att => ({ ...att, record_date: record.consultation_date }))
  );
  
  // Create a reversed copy for the chronological timeline (oldest first)
  const timelineRecords = [...records].reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ficha do Paciente</h1>
            <p className="text-slate-600 mt-1">Histórico médico, agendamentos e informações</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="records">Prontuários</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600">
                        <AvatarFallback className="text-white font-bold text-2xl">{getPatientInitials(patient.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl text-slate-900">{patient.full_name}</CardTitle>
                        <div className="text-slate-600 mt-2">{patient.cpf ? `CPF: ${patient.cpf}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(patient)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
                      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Exportar PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-500">Data de Nascimento</h4>
                        <p className="text-slate-800">{patient.birth_date ? `${format(new Date(patient.birth_date), "dd/MM/yyyy", { locale: ptBR })} (${calculateAge(patient.birth_date)} anos)` : 'Não informado'}</p>
                      </div>
                       <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-500">Plano de Saúde</h4>
                        <p className="text-slate-800">{patient.medical_plan || 'Não informado'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-500">Contato</h4>
                        <p className="text-slate-800">{patient.phone || 'Não informado'}</p>
                        <p className="text-slate-800">{patient.email || ''}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-500">Endereço</h4>
                        <p className="text-slate-800">{patient.address ? `${patient.address.street}, ${patient.address.number}` : 'Não informado'}</p>
                      </div>
                    </div>
                    {patient.emergency_contact?.name && (
                       <div className="mt-4 pt-4 border-t space-y-1">
                        <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2"><UserCheck className="w-4 h-4"/>Contato de Emergência</h4>
                        <p className="text-slate-800">{patient.emergency_contact.name} ({patient.emergency_contact.relationship}) - {patient.emergency_contact.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Histórico e Evolução Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-blue-600"/>
                      Histórico e Evolução do Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : timelineRecords.length > 0 ? (
                      <div className="relative pl-6 space-y-8 border-l-2 border-slate-200">
                        {timelineRecords.map((record, index) => (
                          <div key={record.id} className="relative">
                            <div className="absolute -left-[35px] top-1 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                               <Calendar className="w-4 h-4 text-blue-600"/>
                            </div>
                            <p className="text-sm text-slate-500">{format(new Date(record.consultation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                            <h4 className="text-md font-semibold text-slate-800 mt-1">{index === 0 ? "Primeira Consulta" : "Evolução"}</h4>
                            {record.doctor && <p className="text-sm text-slate-600">com {record.doctor}</p>}
                            
                            <div className="mt-4 p-4 bg-slate-50/80 rounded-lg space-y-3">
                              {record.chief_complaint && (
                                <div>
                                  <h5 className="font-semibold text-sm">Queixa Principal:</h5>
                                  <p className="text-sm text-slate-700">{record.chief_complaint}</p>
                                </div>
                              )}
                              {record.history_present_illness && (
                                <div>
                                  <h5 className="font-semibold text-sm">Observações/Histórico:</h5>
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{record.history_present_illness}</p>
                                </div>
                              )}
                              {(record.diagnosis || []).length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-sm">Diagnóstico(s):</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {record.diagnosis.map((d, i) => <Badge key={i} variant="secondary">{d}</Badge>)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">Nenhum histórico de consulta ou evolução encontrado.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                 <Card className="border-0 shadow-lg">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Heart className="w-5 h-5 text-red-500" />Condições de Saúde</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" />Alergias</h4>
                        {(patient.allergies || []).length > 0 ? (patient.allergies || []).map((allergy, i) => <Badge key={i} variant="outline" className="mr-1 mb-1">{allergy}</Badge>) : <p className="text-sm text-slate-500">Nenhuma</p>}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" />Condições Crônicas</h4>
                        {(patient.chronic_conditions || []).length > 0 ? (patient.chronic_conditions || []).map((c, i) => <Badge key={i} variant="destructive" className="mr-1 mb-1">{c}</Badge>) : <p className="text-sm text-slate-500">Nenhuma</p>}
                      </div>
                       <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-500" />Medicações Atuais</h4>
                        {(patient.current_medications || []).length > 0 ? (patient.current_medications || []).map((m, i) => <Badge key={i} variant="secondary" className="mr-1 mb-1">{m}</Badge>) : <p className="text-sm text-slate-500">Nenhuma</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="records">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Prontuários</CardTitle>
                <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
                  <DialogTrigger asChild>
                    <Button><PlusCircle className="w-4 h-4 mr-2" />Novo Registro</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Novo Registro no Prontuário de {patient.full_name}</DialogTitle>
                    </DialogHeader>
                    <NewMedicalRecordForm onSave={handleSaveNewRecord} onCancel={() => setShowNewRecordDialog(false)} />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> :
                  (records || []).length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {(records || []).map(record => (
                        <AccordionItem value={record.id} key={record.id}>
                          <AccordionTrigger className="hover:bg-slate-50 px-4">
                            <div className="flex justify-between w-full pr-4">
                              <span className="font-semibold">{format(new Date(record.consultation_date), "dd/MM/yyyy", { locale: ptBR })} - {record.specialty || (record.history_present_illness ? 'Evolução' : 'Consulta')}</span>
                              <span className="text-slate-600">{record.doctor}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 space-y-4 bg-white">
                            <div><h4 className="font-semibold">Queixa Principal:</h4><p>{record.chief_complaint}</p></div>
                            <div><h4 className="font-semibold">Histórico/Evolução:</h4><p className="whitespace-pre-wrap">{record.history_present_illness}</p></div>
                            <div><h4 className="font-semibold">Diagnóstico(s):</h4>{(record.diagnosis || []).map((d, i) => <Badge key={i} className="mr-1">{d}</Badge>)}</div>
                            <div><h4 className="font-semibold">Plano de Tratamento:</h4><p>{record.treatment_plan}</p></div>
                             <div><h4 className="font-semibold">Prescrições:</h4>
                               {(record.prescriptions || []).map((p, i) => <p key={i}>- {p.medication} {p.dosage}, {p.frequency}</p>)}
                             </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : <p className="text-center text-slate-500 py-8">Nenhum prontuário encontrado.</p>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
             <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Histórico de Agendamentos</CardTitle></CardHeader>
                <CardContent>
                   {isLoading ? <Skeleton className="h-40 w-full" /> :
                    (records || []).length > 0 ? ( // Simulating appointments from records for now
                      <div className="space-y-3">
                        {(records || []).map(apt => (
                          <div key={apt.id} className="flex justify-between items-center p-3 rounded-lg border">
                            <div>
                              <p className="font-semibold">{apt.specialty || 'Consulta'} com {apt.doctor}</p>
                              <p className="text-sm text-slate-600">{format(new Date(apt.consultation_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                            </div>
                            <Badge className={'bg-green-100 text-green-800'}>Concluído</Badge>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-center text-slate-500 py-8">Nenhum agendamento encontrado.</p>
                   }
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle>Anexos do Paciente</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> :
                  allAttachments.length > 0 ? (
                    <div className="space-y-3">
                      {allAttachments.map((att, i) => (
                         <a href={att.file_url} target="_blank" rel="noopener noreferrer" key={i} className="flex justify-between items-center p-3 rounded-lg border hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-slate-500"/>
                              <div>
                                <p className="font-semibold">{att.file_name || 'Anexo'}</p>
                                <p className="text-sm text-slate-600">{att.description || ''}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-500">{format(new Date(att.record_date), "dd/MM/yyyy")}</p>
                          </a>
                      ))}
                    </div>
                  ) : <p className="text-center text-slate-500 py-8">Nenhum anexo encontrado.</p>
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
