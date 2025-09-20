import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  Users
} from 'lucide-react';
import { importPatientsFromExcel } from '@/api/functions';

export default function ImportPatientsModal({ onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [importOnlyValid, setImportOnlyValid] = useState(true);
  const [step, setStep] = useState('upload'); // 'upload', 'validation', 'import', 'complete'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
        alert('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
      }
      setFile(selectedFile);
      setValidationResults(null);
      setImportResults(null);
      setStep('upload');
    }
  };

  const downloadSample = async (format = 'xlsx') => {
    try {
      const url = `/api/functions/importPatientsFromExcel?format=${format}`;
      const response = await fetch(url);
      
      if (response.status === 200) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = format === 'csv' ? 'modelo_pacientes.csv' : 'modelo_pacientes.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
      }
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      alert('Erro ao baixar o modelo. Tente novamente.');
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setIsValidating(true);
    setStep('validation');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dry_run', 'true');

      const response = await importPatientsFromExcel(formData);
      
      if (response.status === 200) {
        setValidationResults(response.data);
      } else {
        console.error('Erro na validação:', response.data);
        alert(`Erro na validação: ${response.data.error || 'Erro desconhecido'}`);
        setStep('upload');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      alert('Erro ao validar arquivo. Verifique se o arquivo está correto.');
      setStep('upload');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setStep('import');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dry_run', 'false');
      formData.append('import_only_valid', importOnlyValid.toString());

      const response = await importPatientsFromExcel(formData);
      
      if (response.status === 200) {
        setImportResults(response.data);
        setStep('complete');
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        console.error('Erro na importação:', response.data);
        alert(`Erro na importação: ${response.data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar arquivo.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setValidationResults(null);
    setImportResults(null);
    setStep('upload');
    setIsOpen(false);
  };

  const getStepProgress = () => {
    switch (step) {
      case 'upload': return 25;
      case 'validation': return 50;
      case 'import': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileSpreadsheet className="h-4 w-4" />;
    const extension = file.name.split('.').pop().toLowerCase();
    return extension === 'csv' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white">
          <Upload className="w-4 h-4 mr-2" />
          Importar Pacientes
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Importar Pacientes em Massa (CSV/Excel)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progresso da Importação</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="w-full" />
          </div>

          {/* Step 1: Upload File */}
          {step === 'upload' && (
            <div className="space-y-4">
              <Alert>
                {getFileIcon()}
                <AlertDescription>
                  <div className="space-y-3">
                    <p>Faça o upload de um arquivo Excel (.xlsx, .xls) ou CSV (.csv) com os dados dos pacientes.</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => downloadSample('xlsx')}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Baixar Modelo Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadSample('csv')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Baixar Modelo CSV
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Arquivo (CSV, Excel)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-500">Formatos suportados: .xlsx, .xls, .csv (máximo 100 registros)</p>
              </div>

              {file && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Arquivo selecionado: {file.name}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {file.name.split('.').pop().toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Validation Results */}
          {step === 'validation' && validationResults && (
            <div className="space-y-4">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Validação concluída. Revise os resultados abaixo antes de prosseguir com a importação.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{validationResults.summary.total}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationResults.summary.valid}</div>
                  <div className="text-sm text-green-700">Válidos</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{validationResults.summary.updates}</div>
                  <div className="text-sm text-yellow-700">Atualizações</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{validationResults.summary.invalid}</div>
                  <div className="text-sm text-red-700">Inválidos</div>
                </div>
              </div>

              {validationResults.summary.invalid > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="import-only-valid" 
                      checked={importOnlyValid}
                      onCheckedChange={setImportOnlyValid}
                    />
                    <Label htmlFor="import-only-valid">
                      Importar apenas registros válidos (pular erros)
                    </Label>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              {validationResults.rows && validationResults.rows.length > 0 && (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 border-b">Linha</th>
                        <th className="text-left p-2 border-b">Status</th>
                        <th className="text-left p-2 border-b">Nome</th>
                        <th className="text-left p-2 border-b">Mensagens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults.rows.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.index}</td>
                          <td className="p-2">
                            <Badge variant={row.status === 'ok' ? 'default' : row.status === 'update' ? 'secondary' : 'destructive'}>
                              {row.status === 'ok' ? 'Válido' : row.status === 'update' ? 'Atualização' : 'Erro'}
                            </Badge>
                          </td>
                          <td className="p-2">{row.parsed?.full_name || 'N/A'}</td>
                          <td className="p-2">
                            {row.messages.map((msg, i) => (
                              <div key={i} className="text-xs text-slate-600">{msg}</div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'import' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Importando Pacientes...</h3>
              <p className="text-slate-600">Aguarde enquanto processamos os dados.</p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && importResults && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Importação concluída com sucesso!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResults.summary.created_count}</div>
                  <div className="text-sm text-green-700">Criados</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResults.summary.updated_count}</div>
                  <div className="text-sm text-blue-700">Atualizados</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResults.summary.skipped_count}</div>
                  <div className="text-sm text-yellow-700">Ignorados</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResults.summary.errors_count || 0}</div>
                  <div className="text-sm text-red-700">Erros</div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Erros encontrados:</h4>
                  <div className="max-h-32 overflow-y-auto bg-red-50 p-3 rounded border">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step === 'upload' && file && (
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                Validar Arquivo
              </Button>
            )}
            
            {step === 'validation' && validationResults && (
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Importar Pacientes
              </Button>
            )}
            
            {step === 'complete' && (
              <Button onClick={resetModal}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nova Importação
              </Button>
            )}
          </div>
          
          <Button variant="outline" onClick={resetModal}>
            {step === 'complete' ? 'Fechar' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}