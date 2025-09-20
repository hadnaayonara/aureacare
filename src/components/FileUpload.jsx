import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

// =====================================================
// COMPONENTE DE UPLOAD DE ARQUIVOS
// =====================================================

const FileUpload = ({
  bucket = 'aurea-labs-uploads',
  path = '',
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'],
  multiple = false,
  onUploadComplete = () => {},
  onUploadError = () => {},
  onFileRemove = () => {},
  metadata = {},
  className = ''
}) => {
  const { userProfile } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // =====================================================
  // FUNÇÕES DE VALIDAÇÃO
  // =====================================================

  const validateFile = (file) => {
    // Verificar tamanho
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Verificar tipo
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    return true;
  };

  const validateFiles = (fileList) => {
    const errors = [];
    
    Array.from(fileList).forEach((file, index) => {
      try {
        validateFile(file);
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return true;
  };

  // =====================================================
  // FUNÇÕES DE UPLOAD
  // =====================================================

  const uploadFile = async (file, filePath) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          ...metadata,
          uploaded_by: userProfile?.id,
          uploaded_at: new Date().toISOString()
        }
      });

    if (error) throw error;
    return data;
  };

  const handleFileSelect = useCallback(async (event) => {
    const selectedFiles = event.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      // Validar arquivos
      validateFiles(selectedFiles);

      setError(null);
      setUploading(true);
      setProgress(0);

      const fileArray = Array.from(selectedFiles);
      const uploadedFiles = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomId}.${fileExtension}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        // Adicionar arquivo à lista de uploads
        const fileInfo = {
          id: `${timestamp}-${randomId}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          status: 'uploading',
          progress: 0
        };

        setFiles(prev => [...prev, fileInfo]);

        try {
          // Upload do arquivo
          const uploadResult = await uploadFile(file, filePath);
          
          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          const uploadedFile = {
            ...fileInfo,
            status: 'completed',
            progress: 100,
            url: urlData.publicUrl,
            storagePath: uploadResult.path,
            uploadedAt: new Date().toISOString()
          };

          // Atualizar arquivo na lista
          setFiles(prev => prev.map(f => 
            f.id === fileInfo.id ? uploadedFile : f
          ));

          uploadedFiles.push(uploadedFile);

          // Atualizar progresso geral
          const overallProgress = ((i + 1) / fileArray.length) * 100;
          setProgress(overallProgress);

        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          
          // Marcar arquivo como erro
          setFiles(prev => prev.map(f => 
            f.id === fileInfo.id ? {
              ...f,
              status: 'error',
              error: uploadError.message
            } : f
          ));

          throw uploadError;
        }
      }

      // Chamar callback de sucesso
      onUploadComplete(uploadedFiles);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      onUploadError(error);
    } finally {
      setUploading(false);
      setProgress(0);
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [bucket, path, maxSize, allowedTypes, userProfile, metadata, onUploadComplete, onUploadError]);

  // =====================================================
  // FUNÇÕES DE GERENCIAMENTO
  // =====================================================

  const removeFile = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Se o arquivo foi uploadado, remover do storage
      if (file.status === 'completed' && file.storagePath) {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([file.storagePath]);

        if (error) {
          console.error('Error removing file from storage:', error);
        }
      }

      // Remover da lista local
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      // Chamar callback
      onFileRemove(file);

    } catch (error) {
      console.error('Error removing file:', error);
      setError(error.message);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError(null);
    setProgress(0);
  };

  const retryUpload = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.status !== 'error') return;

    try {
      setError(null);
      
      // Marcar como uploading novamente
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading', progress: 0, error: null } : f
      ));

      // Tentar upload novamente
      const uploadResult = await uploadFile(file.file, file.path);
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(file.path);

      const updatedFile = {
        ...file,
        status: 'completed',
        progress: 100,
        url: urlData.publicUrl,
        storagePath: uploadResult.path,
        uploadedAt: new Date().toISOString()
      };

      setFiles(prev => prev.map(f => 
        f.id === fileId ? updatedFile : f
      ));

      onUploadComplete([updatedFile]);

    } catch (error) {
      console.error('Retry upload error:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          status: 'error',
          error: error.message
        } : f
      ));
    }
  };

  // =====================================================
  // FUNÇÕES DE RENDERIZAÇÃO
  // =====================================================

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileItem = (file) => (
    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {file.status === 'uploading' && (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-xs text-gray-500">{file.progress}%</span>
          </div>
        )}

        {file.status === 'completed' && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}

        {file.status === 'error' && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryUpload(file.id)}
              className="text-xs"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeFile(file.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload de Arquivos</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área de upload */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Clique para selecionar arquivos ou arraste e solte aqui
          </p>
          <p className="text-xs text-gray-500">
            Tamanho máximo: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
          <p className="text-xs text-gray-500">
            Tipos permitidos: {allowedTypes.join(', ')}
          </p>
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedTypes.join(',')}
        />

        {/* Barra de progresso */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando arquivos...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Arquivos selecionados</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllFiles}
                disabled={uploading}
              >
                Limpar todos
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map(renderFileItem)}
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Os arquivos são armazenados de forma segura no Supabase Storage</p>
          <p>• URLs públicas são geradas automaticamente</p>
          <p>• Você pode remover arquivos a qualquer momento</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
