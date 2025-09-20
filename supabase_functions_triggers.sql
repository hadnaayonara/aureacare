-- =====================================================
-- FUNÇÕES E TRIGGERS PARA SUPABASE
-- =====================================================

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

-- Trigger para tabela users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela clinics
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela clinic_addresses
CREATE TRIGGER update_clinic_addresses_updated_at
    BEFORE UPDATE ON clinic_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela doctors
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela patients
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela patient_addresses
CREATE TRIGGER update_patient_addresses_updated_at
    BEFORE UPDATE ON patient_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela emergency_contacts
CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela exams
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela appointments
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela medical_records
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela receptions
CREATE TRIGGER update_receptions_updated_at
    BEFORE UPDATE ON receptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela clinic_users
CREATE TRIGGER update_clinic_users_updated_at
    BEFORE UPDATE ON clinic_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela patient_assignments
CREATE TRIGGER update_patient_assignments_updated_at
    BEFORE UPDATE ON patient_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela user_api_keys
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela user_registrations
CREATE TRIGGER update_user_registrations_updated_at
    BEFORE UPDATE ON user_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela newsletter_subscribers
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela receptions_contact
CREATE TRIGGER update_receptions_contact_updated_at
    BEFORE UPDATE ON receptions_contact
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO DE AUDITORIA
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    action_type audit_log_action;
    old_values jsonb;
    new_values jsonb;
BEGIN
    -- Determinar tipo de ação
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
        old_values := NULL;
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
        old_values := to_jsonb(OLD);
        new_values := NULL;
    END IF;

    -- Inserir log de auditoria
    INSERT INTO audit_logs (
        user_id,
        clinic_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        COALESCE(NEW.clinic_id, OLD.clinic_id),
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_values,
        new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );

    -- Retornar registro apropriado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS DE AUDITORIA
-- =====================================================

-- Trigger de auditoria para tabela users
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela clinics
CREATE TRIGGER clinics_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela doctors
CREATE TRIGGER doctors_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela patients
CREATE TRIGGER patients_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela appointments
CREATE TRIGGER appointments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela medical_records
CREATE TRIGGER medical_records_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Trigger de auditoria para tabela clinic_users
CREATE TRIGGER clinic_users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clinic_users
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNÇÃO PARA GERAR API KEY SEGURA
-- =====================================================

CREATE OR REPLACE FUNCTION generate_secure_api_key()
RETURNS text AS $$
DECLARE
    api_key text;
    api_key_hash text;
BEGIN
    -- Gerar API key aleatória
    api_key := 'AUREA_' || encode(gen_random_bytes(32), 'hex');
    
    RETURN api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA HASH DE API KEY
-- =====================================================

CREATE OR REPLACE FUNCTION hash_api_key(api_key text)
RETURNS text AS $$
BEGIN
    RETURN encode(digest(api_key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA CRIAR API KEY DO USUÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_api_key(
    user_uuid uuid,
    key_name text DEFAULT 'Default API Key'
)
RETURNS TABLE(
    api_key text,
    api_key_preview text
) AS $$
DECLARE
    new_api_key text;
    api_key_hash text;
    api_key_preview text;
BEGIN
    -- Gerar nova API key
    new_api_key := generate_secure_api_key();
    api_key_hash := hash_api_key(new_api_key);
    api_key_preview := 'AUREA_' || substring(api_key_hash, 1, 8);

    -- Inserir na tabela user_api_keys
    INSERT INTO user_api_keys (
        user_id,
        api_key_hash,
        api_key_preview,
        name
    ) VALUES (
        user_uuid,
        api_key_hash,
        api_key_preview,
        key_name
    );

    -- Retornar a API key e preview
    RETURN QUERY SELECT new_api_key, api_key_preview;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA VALIDAR API KEY
-- =====================================================

CREATE OR REPLACE FUNCTION validate_api_key(api_key text)
RETURNS TABLE(
    user_id uuid,
    is_valid boolean
) AS $$
DECLARE
    api_key_hash text;
BEGIN
    api_key_hash := hash_api_key(api_key);
    
    RETURN QUERY
    SELECT 
        uak.user_id,
        (uak.status = 'active' AND (uak.expires_at IS NULL OR uak.expires_at > now()))
    FROM user_api_keys uak
    WHERE uak.api_key_hash = api_key_hash
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA CRIAR PERFIL DE USUÁRIO APÓS REGISTRO
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar perfil na tabela users
    INSERT INTO users (
        id,
        email,
        full_name,
        app_role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'host' -- Default role
    );

    -- Criar API key para o usuário
    PERFORM create_user_api_key(NEW.id, 'Default API Key');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER PARA CRIAR PERFIL APÓS REGISTRO NO AUTH
-- =====================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNÇÃO PARA LOG DE LOGIN/LOGOUT
-- =====================================================

CREATE OR REPLACE FUNCTION log_auth_event(
    event_type audit_log_action,
    user_uuid uuid,
    clinic_uuid uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        clinic_id,
        action,
        table_name,
        ip_address,
        user_agent
    ) VALUES (
        user_uuid,
        clinic_uuid,
        event_type,
        'auth',
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA BUSCAR PACIENTES COM FILTROS
-- =====================================================

CREATE OR REPLACE FUNCTION search_patients(
    search_term text DEFAULT NULL,
    clinic_uuid uuid DEFAULT NULL,
    limit_count integer DEFAULT 50,
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    full_name text,
    cpf text,
    phone text,
    email text,
    clinic_name text,
    created_at timestamp
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.cpf,
        p.phone,
        p.email,
        c.name as clinic_name,
        p.created_at
    FROM patients p
    JOIN clinics c ON c.id = p.clinic_id
    WHERE 
        (search_term IS NULL OR 
         p.full_name ILIKE '%' || search_term || '%' OR
         p.cpf ILIKE '%' || search_term || '%' OR
         p.email ILIKE '%' || search_term || '%')
    AND (clinic_uuid IS NULL OR p.clinic_id = clinic_uuid)
    AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA BUSCAR CONSULTAS COM FILTROS
-- =====================================================

CREATE OR REPLACE FUNCTION search_appointments(
    search_term text DEFAULT NULL,
    clinic_uuid uuid DEFAULT NULL,
    doctor_uuid uuid DEFAULT NULL,
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    status_filter appointment_status DEFAULT NULL,
    limit_count integer DEFAULT 50,
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    patient_name text,
    doctor_name text,
    clinic_name text,
    starts_at timestamp,
    ends_at timestamp,
    type appointment_type,
    status appointment_status,
    specialty text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        p.full_name as patient_name,
        d.full_name as doctor_name,
        c.name as clinic_name,
        a.starts_at,
        a.ends_at,
        a.type,
        a.status,
        a.specialty
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN clinics c ON c.id = a.clinic_id
    WHERE 
        (search_term IS NULL OR 
         p.full_name ILIKE '%' || search_term || '%' OR
         d.full_name ILIKE '%' || search_term || '%')
    AND (clinic_uuid IS NULL OR a.clinic_id = clinic_uuid)
    AND (doctor_uuid IS NULL OR a.doctor_id = doctor_uuid)
    AND (start_date IS NULL OR a.starts_at::date >= start_date)
    AND (end_date IS NULL OR a.starts_at::date <= end_date)
    AND (status_filter IS NULL OR a.status = status_filter)
    ORDER BY a.starts_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA ESTATÍSTICAS DO DASHBOARD
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(
    clinic_uuid uuid DEFAULT NULL,
    start_date date DEFAULT CURRENT_DATE,
    end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_patients bigint,
    total_appointments bigint,
    completed_appointments bigint,
    pending_appointments bigint,
    total_doctors bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM patients p 
         WHERE (clinic_uuid IS NULL OR p.clinic_id = clinic_uuid) 
         AND p.is_active = true) as total_patients,
        
        (SELECT COUNT(*) FROM appointments a 
         WHERE (clinic_uuid IS NULL OR a.clinic_id = clinic_uuid)
         AND a.starts_at::date BETWEEN start_date AND end_date) as total_appointments,
        
        (SELECT COUNT(*) FROM appointments a 
         WHERE (clinic_uuid IS NULL OR a.clinic_id = clinic_uuid)
         AND a.status = 'concluido'
         AND a.starts_at::date BETWEEN start_date AND end_date) as completed_appointments,
        
        (SELECT COUNT(*) FROM appointments a 
         WHERE (clinic_uuid IS NULL OR a.clinic_id = clinic_uuid)
         AND a.status IN ('agendado', 'confirmado')
         AND a.starts_at::date BETWEEN start_date AND end_date) as pending_appointments,
        
        (SELECT COUNT(*) FROM doctors d 
         WHERE (clinic_uuid IS NULL OR d.clinic_id = clinic_uuid)
         AND d.has_system_access = true) as total_doctors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

