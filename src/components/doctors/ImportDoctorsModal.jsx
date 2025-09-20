
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, // Added FileText icon
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Users, 
  AlertTriangle,
  Eye,
  FileX,
  Info
} from 'lucide-react';
import { importDoctorsFromExcel } from '@/api/functions';

export default function ImportDoctorsModal({ onImportComplete, clinicId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [importOnlyValid, setImportOnlyValid] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError('Por favor, selecione um arquivo .xlsx, .xls ou .csv');
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo permitido: 5MB');
        return;
      }
      
      setFile(selectedFile);
      setValidationResults(null);
      setCurrentStep(1);
      setError('');
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dry_run', 'true');
      formData.append('clinic_id', clinicId);
      
      const response = await importDoctorsFromExcel(formData);
      
      if (response.status === 200) {
        setValidationResults(response.data);
        setCurrentStep(2);
      } else {
        const errorData = response.data || {};
        setError(errorData.error || 'Erro desconhecido na validação');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes('Rate limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (error.message?.includes('500')) {
        setError('Erro interno do servidor. Tente novamente em alguns minutos.');
      } else {
        setError(`Erro na validação: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validationResults) return;
    
    setIsImporting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dry_run', 'false');
      formData.append('clinic_id', clinicId);
      formData.append('import_only_valid', importOnlyValid.toString());
      
      const response = await importDoctorsFromExcel(formData);
      
      if (response.status === 200) {
        setCurrentStep(3);
        if (onImportComplete) {
          onImportComplete(response.data);
        }
      } else {
        const errorData = response.data || {};
        setError(errorData.error || 'Erro desconhecido na importação');
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      
      if (error.message?.includes('Rate limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (error.message?.includes('500')) {
        setError('Erro interno do servidor. Tente novamente em alguns minutos.');
      } else {
        setError(`Erro na importação: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleFile = async (format = 'xlsx') => {
    try {
      const url = `/api/functions/importDoctorsFromExcel?format=${format}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        const url2 = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url2;
        a.download = format === 'csv' ? 'modelo_profissionais.csv' : 'modelo_profissionais.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url2);
        document.body.removeChild(a);
      } else {
        setError('Erro ao baixar arquivo modelo');
      }
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      setError('Erro ao baixar arquivo modelo');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'update':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ok':
        return 'Novo';
      case 'update':
        return 'Atualização';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const resetModal = () => {
    setFile(null);
    setValidationResults(null);
    setCurrentStep(1);
    setIsValidating(false);
    setIsImporting(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(resetModal, 300); // Delay para esperar a animação de fechamento
  };

  const getFileIcon = () => {
    if (!file) return <FileSpreadsheet className="w-12 h-12 text-gray-400" />;
    const extension = file.name.split('.').pop().toLowerCase();
    return extension === 'csv' || extension === 'xls' ? 
      <FileText className="w-12 h-12 text-gray-400" /> : 
      <FileSpreadsheet className="w-12 h-12 text-gray-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Importar Profissionais (Excel/CSV)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Importar Profissionais via Excel/CSV
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step-1" disabled={currentStep < 1}>
              1. Upload
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={currentStep < 2}>
              2. Pré-visualização
            </TabsTrigger>
            <TabsTrigger value="step-3" disabled={currentStep < 3}>
              3. Resultado
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Upload */}
          <TabsContent value="step-1" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Para evitar problemas, importe no máximo 100 profissionais por vez. 
                Arquivos muito grandes podem causar erros de processamento.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload do Arquivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  {getFileIcon()}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="max-w-sm mx-auto"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Selecione um arquivo .xlsx, .xls ou .csv com os dados dos profissionais
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máximo: 100 profissionais, 5MB
                  </p>
                </div>

                {file && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      {file.name.endsWith('.csv') || file.name.endsWith('.xls') ? 
                        <FileText className="w-5 h-5 text-blue-600" /> :
                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      }
                      <span className="font-medium text-blue-900">{file.name}</span>
                      <Badge variant="outline" className="text-blue-700">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                      <Badge variant="outline" className="text-blue-700">
                        {file.name.split('.').pop().toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant="outline"
                      onClick={() => downloadSampleFile('xlsx')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Baixar Modelo Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadSampleFile('csv')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Baixar Modelo CSV
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleValidate}
                    disabled={!file || isValidating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Validar & Visualizar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Preview */}
          <TabsContent value="step-2" className="space-y-6">
            {validationResults && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo da Validação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{validationResults.summary.total}</div>
                        <div className="text-sm text-slate-600">Total</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{validationResults.summary.valid}</div>
                        <div className="text-sm text-green-600">Novos</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{validationResults.summary.updates}</div>
                        <div className="text-sm text-yellow-600">Atualizações</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{validationResults.summary.invalid}</div>
                        <div className="text-sm text-red-600">Erros</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes por Linha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {validationResults.rows.map((row, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              {getStatusIcon(row.status)}
                              <span className="text-sm font-medium">
                                Linha {row.index}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getStatusLabel(row.status)}
                              </Badge>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {row.parsed?.full_name || 'Nome não informado'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {row.parsed?.council_type} {row.parsed?.council_number} • {row.parsed?.email}
                              </div>
                              {row.messages.length > 0 && (
                                <div className="mt-1">
                                  {row.messages.map((msg, msgIndex) => (
                                    <div key={msgIndex} className={`text-xs ${
                                      row.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                      • {msg}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-only-valid"
                      checked={importOnlyValid}
                      onCheckedChange={setImportOnlyValid}
                    />
                    <label htmlFor="import-only-valid" className="text-sm font-medium">
                      Importar apenas linhas válidas
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Voltar
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || (validationResults.summary.valid + validationResults.summary.updates) === 0}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Confirmar Importação
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Step 3: Results */}
          <TabsContent value="step-3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Importação Concluída
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Profissionais importados com sucesso!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    A importação foi concluída. Confira os resultados abaixo.
                  </p>
                  
                  {validationResults && (
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {validationResults.summary.created_count || 0}
                        </div>
                        <div className="text-sm text-green-600">Criados</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {validationResults.summary.updated_count || 0}
                        </div>
                        <div className="text-sm text-blue-600">Atualizados</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {validationResults.summary.skipped_count || 0}
                        </div>
                        <div className="text-sm text-orange-600">Ignorados</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={closeModal} className="bg-emerald-600 hover:bg-emerald-700">
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
