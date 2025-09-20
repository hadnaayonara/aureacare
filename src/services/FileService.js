import { supabase } from '@/lib/supabase';

// =====================================================
// SERVIÇO DE GERENCIAMENTO DE ARQUIVOS - AUREA LABS
// =====================================================

class FileService {
  constructor() {
    this.buckets = {
      uploads: 'aurea-labs-uploads',
      documents: 'aurea-labs-documents',
      images: 'aurea-labs-images'
    };
  }

  // =====================================================
  // FUNÇÕES DE UPLOAD
  // =====================================================

  /**
   * Faz upload de um arquivo para o Supabase Storage
   * @param {File} file - Arquivo a ser enviado
   * @param {string} bucket - Bucket de destino
   * @param {string} path - Caminho no bucket
   * @param {Object} metadata - Metadados do arquivo
   * @returns {Promise<Object>} - Resultado do upload
   */
  async uploadFile(file, bucket, path, metadata = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            ...metadata,
            uploaded_at: new Date().toISOString(),
            file_size: file.size,
            file_type: file.type
          }
        });

      if (error) throw error;

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          id: data.id
        }
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Faz upload de múltiplos arquivos
   * @param {Array} files - Array de arquivos
   * @param {string} bucket - Bucket de destino
   * @param {string} basePath - Caminho base no bucket
   * @param {Object} metadata - Metadados dos arquivos
   * @returns {Promise<Array>} - Resultados dos uploads
   */
  async uploadMultipleFiles(files, bucket, basePath, metadata = {}) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now() + i;
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      const filePath = basePath ? `${basePath}/${fileName}` : fileName;

      const result = await this.uploadFile(file, bucket, filePath, {
        ...metadata,
        original_name: file.name,
        file_index: i
      });

      results.push({
        ...result,
        originalFile: file,
        fileName,
        filePath
      });
    }

    return results;
  }

  // =====================================================
  // FUNÇÕES DE DOWNLOAD
  // =====================================================

  /**
   * Obtém URL pública de um arquivo
   * @param {string} bucket - Bucket do arquivo
   * @param {string} path - Caminho do arquivo
   * @returns {string} - URL pública
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Gera URL assinada para arquivo privado
   * @param {string} bucket - Bucket do arquivo
   * @param {string} path - Caminho do arquivo
   * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns {Promise<string>} - URL assinada
   */
  async getSignedUrl(bucket, path, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return {
        success: true,
        url: data.signedUrl
      };
    } catch (error) {
      console.error('Signed URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Faz download de um arquivo
   * @param {string} bucket - Bucket do arquivo
   * @param {string} path - Caminho do arquivo
   * @returns {Promise<Blob>} - Arquivo como Blob
   */
  async downloadFile(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // =====================================================
  // FUNÇÕES DE GERENCIAMENTO
  // =====================================================

  /**
   * Lista arquivos em um bucket/caminho
   * @param {string} bucket - Bucket
   * @param {string} path - Caminho (opcional)
   * @returns {Promise<Array>} - Lista de arquivos
   */
  async listFiles(bucket, path = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 100,
          offset: 0
        });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove um arquivo
   * @param {string} bucket - Bucket do arquivo
   * @param {string} path - Caminho do arquivo
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove múltiplos arquivos
   * @param {string} bucket - Bucket dos arquivos
   * @param {Array} paths - Caminhos dos arquivos
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteMultipleFiles(bucket, paths) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Delete multiple files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Move um arquivo
   * @param {string} bucket - Bucket do arquivo
   * @param {string} fromPath - Caminho origem
   * @param {string} toPath - Caminho destino
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async moveFile(bucket, fromPath, toPath) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Move file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Copia um arquivo
   * @param {string} bucket - Bucket do arquivo
   * @param {string} fromPath - Caminho origem
   * @param {string} toPath - Caminho destino
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async copyFile(bucket, fromPath, toPath) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Copy file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // =====================================================
  // FUNÇÕES ESPECÍFICAS POR TIPO DE ARQUIVO
  // =====================================================

  /**
   * Upload de imagem de perfil
   * @param {File} file - Arquivo de imagem
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Resultado do upload
   */
  async uploadProfileImage(file, userId) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${timestamp}-${randomId}.${fileExtension}`;
    const path = `${userId}/profile/${fileName}`;

    return await this.uploadFile(file, this.buckets.images, path, {
      user_id: userId,
      file_category: 'profile_image'
    });
  }

  /**
   * Upload de documento médico
   * @param {File} file - Arquivo do documento
   * @param {string} clinicId - ID da clínica
   * @param {string} patientId - ID do paciente (opcional)
   * @param {string} medicalRecordId - ID do prontuário (opcional)
   * @returns {Promise<Object>} - Resultado do upload
   */
  async uploadMedicalDocument(file, clinicId, patientId = null, medicalRecordId = null) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `doc-${timestamp}-${randomId}.${fileExtension}`;
    
    let path = `${clinicId}/documents`;
    if (patientId) path += `/patients/${patientId}`;
    if (medicalRecordId) path += `/records/${medicalRecordId}`;
    path += `/${fileName}`;

    return await this.uploadFile(file, this.buckets.documents, path, {
      clinic_id: clinicId,
      patient_id: patientId,
      medical_record_id: medicalRecordId,
      file_category: 'medical_document'
    });
  }

  /**
   * Upload de arquivo geral
   * @param {File} file - Arquivo
   * @param {string} userId - ID do usuário
   * @param {string} category - Categoria do arquivo
   * @returns {Promise<Object>} - Resultado do upload
   */
  async uploadGeneralFile(file, userId, category = 'general') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${category}-${timestamp}-${randomId}.${fileExtension}`;
    const path = `${userId}/${category}/${fileName}`;

    return await this.uploadFile(file, this.buckets.uploads, path, {
      user_id: userId,
      file_category: category
    });
  }

  // =====================================================
  // FUNÇÕES DE LIMPEZA
  // =====================================================

  /**
   * Remove arquivos órfãos (sem referência no banco)
   * @param {string} bucket - Bucket para limpeza
   * @param {Array} validPaths - Caminhos válidos (referenciados no banco)
   * @returns {Promise<Object>} - Resultado da limpeza
   */
  async cleanupOrphanFiles(bucket, validPaths) {
    try {
      // Listar todos os arquivos no bucket
      const { data: allFiles, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (listError) throw listError;

      // Encontrar arquivos órfãos
      const orphanFiles = allFiles.filter(file => 
        !validPaths.includes(file.name)
      );

      if (orphanFiles.length === 0) {
        return {
          success: true,
          cleaned: 0,
          message: 'Nenhum arquivo órfão encontrado'
        };
      }

      // Remover arquivos órfãos
      const orphanPaths = orphanFiles.map(file => file.name);
      const deleteResult = await this.deleteMultipleFiles(bucket, orphanPaths);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error);
      }

      return {
        success: true,
        cleaned: orphanFiles.length,
        message: `${orphanFiles.length} arquivos órfãos removidos`
      };

    } catch (error) {
      console.error('Cleanup orphan files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // =====================================================
  // FUNÇÕES DE VALIDAÇÃO
  // =====================================================

  /**
   * Valida um arquivo antes do upload
   * @param {File} file - Arquivo a ser validado
   * @param {Object} options - Opções de validação
   * @returns {Object} - Resultado da validação
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt']
    } = options;

    const errors = [];

    // Verificar tamanho
    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Verificar tipo MIME
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    // Verificar extensão
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`Extensão não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera nome único para arquivo
   * @param {string} originalName - Nome original do arquivo
   * @param {string} prefix - Prefixo opcional
   * @returns {string} - Nome único
   */
  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = originalName.split('.').pop();
    
    if (prefix) {
      return `${prefix}-${timestamp}-${randomId}.${fileExtension}`;
    }
    
    return `${timestamp}-${randomId}.${fileExtension}`;
  }

  /**
   * Formata tamanho do arquivo
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} - Tamanho formatado
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// =====================================================
// INSTÂNCIA SINGLETON
// =====================================================

const fileService = new FileService();

export default fileService;
export { FileService };
