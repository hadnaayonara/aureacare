-- =====================================================
-- CONFIGURAÇÃO DE STORAGE PARA SUPABASE
-- =====================================================

-- =====================================================
-- CRIAR BUCKETS DE STORAGE
-- =====================================================

-- Bucket para uploads gerais (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'aurea-labs-uploads',
    'aurea-labs-uploads',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
);

-- Bucket para documentos médicos (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'aurea-labs-documents',
    'aurea-labs-documents',
    false,
    20971520, -- 20MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Bucket para imagens de perfil (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'aurea-labs-images',
    'aurea-labs-images',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- =====================================================
-- POLÍTICAS DE STORAGE PARA BUCKET DE UPLOADS GERAIS
-- =====================================================

-- Política para visualizar arquivos públicos
CREATE POLICY "Public uploads are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'aurea-labs-uploads');

-- Política para usuários autenticados fazerem upload
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'aurea-labs-uploads' 
    AND auth.role() = 'authenticated'
);

-- Política para usuários editarem seus próprios arquivos
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'aurea-labs-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários deletarem seus próprios arquivos
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'aurea-labs-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLÍTICAS DE STORAGE PARA BUCKET DE DOCUMENTOS MÉDICOS
-- =====================================================

-- Política para visualizar documentos (apenas usuários da clínica)
CREATE POLICY "Clinic users can view medical documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'aurea-labs-documents' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM clinic_users cu
        WHERE cu.user_id = auth.uid()
        AND cu.is_active = true
        AND cu.clinic_id::text = (storage.foldername(name))[1]
    )
);

-- Política para fazer upload de documentos médicos
CREATE POLICY "Clinic staff can upload medical documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'aurea-labs-documents' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM clinic_users cu
        WHERE cu.user_id = auth.uid()
        AND cu.role IN ('owner', 'admin', 'doctor', 'reception')
        AND cu.is_active = true
        AND cu.clinic_id::text = (storage.foldername(name))[1]
    )
);

-- Política para atualizar documentos médicos
CREATE POLICY "Clinic staff can update medical documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'aurea-labs-documents' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM clinic_users cu
        WHERE cu.user_id = auth.uid()
        AND cu.role IN ('owner', 'admin', 'doctor', 'reception')
        AND cu.is_active = true
        AND cu.clinic_id::text = (storage.foldername(name))[1]
    )
);

-- Política para deletar documentos médicos
CREATE POLICY "Clinic staff can delete medical documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'aurea-labs-documents' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM clinic_users cu
        WHERE cu.user_id = auth.uid()
        AND cu.role IN ('owner', 'admin', 'doctor', 'reception')
        AND cu.is_active = true
        AND cu.clinic_id::text = (storage.foldername(name))[1]
    )
);

-- =====================================================
-- POLÍTICAS DE STORAGE PARA BUCKET DE IMAGENS DE PERFIL
-- =====================================================

-- Política para visualizar imagens de perfil
CREATE POLICY "Profile images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'aurea-labs-images');

-- Política para fazer upload de imagem de perfil
CREATE POLICY "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'aurea-labs-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para atualizar imagem de perfil
CREATE POLICY "Users can update own profile images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'aurea-labs-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para deletar imagem de perfil
CREATE POLICY "Users can delete own profile images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'aurea-labs-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- FUNÇÕES AUXILIARES PARA STORAGE
-- =====================================================

-- Função para gerar URL assinada para arquivo
CREATE OR REPLACE FUNCTION get_signed_url(
    bucket_name text,
    file_path text,
    expires_in integer DEFAULT 3600
)
RETURNS text AS $$
DECLARE
    signed_url text;
BEGIN
    SELECT storage.create_signed_url(bucket_name, file_path, expires_in) INTO signed_url;
    RETURN signed_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para fazer upload de arquivo
CREATE OR REPLACE FUNCTION upload_file(
    bucket_name text,
    file_path text,
    file_data bytea,
    content_type text DEFAULT 'application/octet-stream'
)
RETURNS text AS $$
DECLARE
    file_url text;
BEGIN
    -- Fazer upload do arquivo
    INSERT INTO storage.objects (bucket_id, name, data, content_type)
    VALUES (bucket_name, file_path, file_data, content_type);
    
    -- Retornar URL do arquivo
    SELECT storage.public_url(bucket_name, file_path) INTO file_url;
    RETURN file_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para deletar arquivo
CREATE OR REPLACE FUNCTION delete_file(
    bucket_name text,
    file_path text
)
RETURNS boolean AS $$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = bucket_name AND name = file_path;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- =====================================================

-- Para bucket aurea-labs-uploads:
-- /{user_id}/general/{filename}
-- /{user_id}/temp/{filename}

-- Para bucket aurea-labs-documents:
-- /{clinic_id}/patients/{patient_id}/{filename}
-- /{clinic_id}/medical-records/{record_id}/{filename}
-- /{clinic_id}/appointments/{appointment_id}/{filename}

-- Para bucket aurea-labs-images:
-- /{user_id}/profile/{filename}
-- /{clinic_id}/logos/{filename}

-- =====================================================
-- EXEMPLO DE USO DAS FUNÇÕES
-- =====================================================

-- Exemplo 1: Upload de imagem de perfil
-- SELECT upload_file(
--     'aurea-labs-images',
--     auth.uid()::text || '/profile/avatar.jpg',
--     decode('base64_data_here', 'base64'),
--     'image/jpeg'
-- );

-- Exemplo 2: Upload de documento médico
-- SELECT upload_file(
--     'aurea-labs-documents',
--     'clinic-uuid/patients/patient-uuid/exame.pdf',
--     decode('pdf_data_here', 'base64'),
--     'application/pdf'
-- );

-- Exemplo 3: Gerar URL assinada
-- SELECT get_signed_url(
--     'aurea-labs-documents',
--     'clinic-uuid/patients/patient-uuid/exame.pdf',
--     7200 -- 2 horas
-- );

-- Exemplo 4: Deletar arquivo
-- SELECT delete_file(
--     'aurea-labs-images',
--     auth.uid()::text || '/profile/old-avatar.jpg'
-- );

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. Os buckets são criados automaticamente quando inseridos na tabela storage.buckets
-- 2. As políticas de segurança garantem que apenas usuários autorizados acessem os arquivos
-- 3. A estrutura de pastas ajuda a organizar os arquivos por usuário/clínica
-- 4. URLs assinadas permitem acesso temporário a arquivos privados
-- 5. Os limites de tamanho e tipos de arquivo são definidos por bucket
-- 6. Sempre verifique as permissões antes de fazer upload de arquivos sensíveis

