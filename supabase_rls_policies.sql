-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY) PARA SUPABASE
-- =====================================================

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND app_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é host
CREATE OR REPLACE FUNCTION is_host()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND app_role = 'host'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é médico
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND app_role = 'doctor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é recepcionista
CREATE OR REPLACE FUNCTION is_reception()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND app_role = 'reception'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário tem acesso à clínica
CREATE OR REPLACE FUNCTION has_clinic_access(clinic_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Admin tem acesso a todas as clínicas
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- Verificar se o usuário tem acesso à clínica específica
  RETURN EXISTS (
    SELECT 1 FROM clinic_users 
    WHERE user_id = auth.uid() 
    AND clinic_id = clinic_uuid 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter clínicas do usuário
CREATE OR REPLACE FUNCTION get_user_clinics()
RETURNS uuid[] AS $$
BEGIN
  -- Admin tem acesso a todas as clínicas
  IF is_admin() THEN
    RETURN ARRAY(SELECT id FROM clinics WHERE is_active = true);
  END IF;
  
  -- Retornar clínicas do usuário
  RETURN ARRAY(
    SELECT clinic_id FROM clinic_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptions_contact ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABELA USERS
-- =====================================================

-- Usuários podem ver e editar seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admin pode ver todos os usuários
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (is_admin());

-- Host pode ver usuários de suas clínicas
CREATE POLICY "Host can view clinic users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu1
      JOIN clinic_users cu2 ON cu1.clinic_id = cu2.clinic_id
      WHERE cu1.user_id = auth.uid()
      AND cu2.user_id = users.id
      AND cu1.role IN ('owner', 'admin')
      AND cu1.is_active = true
      AND cu2.is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA CLINICS
-- =====================================================

-- Usuários podem ver clínicas que pertencem
CREATE POLICY "Users can view own clinics" ON clinics
  FOR SELECT USING (has_clinic_access(id));

-- Admin pode ver todas as clínicas
CREATE POLICY "Admin can view all clinics" ON clinics
  FOR SELECT USING (is_admin());

-- Host pode criar clínicas
CREATE POLICY "Host can create clinics" ON clinics
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND 
    is_host()
  );

-- Owner/Admin da clínica pode atualizar
CREATE POLICY "Clinic owners can update" ON clinics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = clinics.id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA CLINIC_ADDRESSES
-- =====================================================

-- Usuários podem ver endereços das clínicas que pertencem
CREATE POLICY "Users can view clinic addresses" ON clinic_addresses
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Owner/Admin da clínica pode gerenciar endereços
CREATE POLICY "Clinic owners can manage addresses" ON clinic_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = clinic_addresses.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA DOCTORS
-- =====================================================

-- Usuários podem ver médicos das clínicas que pertencem
CREATE POLICY "Users can view clinic doctors" ON doctors
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Médicos podem ver seus próprios dados
CREATE POLICY "Doctors can view own data" ON doctors
  FOR SELECT USING (user_id = auth.uid());

-- Host/Admin pode gerenciar médicos
CREATE POLICY "Host can manage doctors" ON doctors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = doctors.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA PATIENTS
-- =====================================================

-- Usuários podem ver pacientes das clínicas que pertencem
CREATE POLICY "Users can view clinic patients" ON patients
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Médicos podem ver pacientes atribuídos
CREATE POLICY "Doctors can view assigned patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_assignments pa
      JOIN doctors d ON pa.doctor_id = d.id
      WHERE d.user_id = auth.uid()
      AND pa.patient_id = patients.id
      AND pa.is_active = true
    )
  );

-- Host/Admin/Reception pode gerenciar pacientes
CREATE POLICY "Clinic staff can manage patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = patients.clinic_id 
      AND role IN ('owner', 'admin', 'reception')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA PATIENT_ADDRESSES
-- =====================================================

-- Usuários podem ver endereços de pacientes das clínicas que pertencem
CREATE POLICY "Users can view patient addresses" ON patient_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_addresses.patient_id
      AND has_clinic_access(p.clinic_id)
    )
  );

-- Host/Admin/Reception pode gerenciar endereços
CREATE POLICY "Clinic staff can manage patient addresses" ON patient_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      JOIN clinic_users cu ON cu.clinic_id = p.clinic_id
      WHERE p.id = patient_addresses.patient_id
      AND cu.user_id = auth.uid()
      AND cu.role IN ('owner', 'admin', 'reception')
      AND cu.is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA EMERGENCY_CONTACTS
-- =====================================================

-- Usuários podem ver contatos de emergência de pacientes das clínicas que pertencem
CREATE POLICY "Users can view emergency contacts" ON emergency_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = emergency_contacts.patient_id
      AND has_clinic_access(p.clinic_id)
    )
  );

-- Host/Admin/Reception pode gerenciar contatos
CREATE POLICY "Clinic staff can manage emergency contacts" ON emergency_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      JOIN clinic_users cu ON cu.clinic_id = p.clinic_id
      WHERE p.id = emergency_contacts.patient_id
      AND cu.user_id = auth.uid()
      AND cu.role IN ('owner', 'admin', 'reception')
      AND cu.is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA EXAMS
-- =====================================================

-- Exames são globais (todos podem ver)
CREATE POLICY "Everyone can view exams" ON exams
  FOR SELECT USING (status = 'active');

-- Apenas admin pode gerenciar exames
CREATE POLICY "Admin can manage exams" ON exams
  FOR ALL USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA APPOINTMENTS
-- =====================================================

-- Usuários podem ver consultas das clínicas que pertencem
CREATE POLICY "Users can view clinic appointments" ON appointments
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Médicos podem ver suas próprias consultas
CREATE POLICY "Doctors can view own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = appointments.doctor_id
      AND d.user_id = auth.uid()
    )
  );

-- Host/Admin/Reception pode gerenciar consultas
CREATE POLICY "Clinic staff can manage appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = appointments.clinic_id 
      AND role IN ('owner', 'admin', 'reception')
      AND is_active = true
    )
  );

-- Médicos podem atualizar suas consultas
CREATE POLICY "Doctors can update own appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = appointments.doctor_id
      AND d.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA MEDICAL_RECORDS
-- =====================================================

-- Usuários podem ver prontuários das clínicas que pertencem
CREATE POLICY "Users can view clinic medical records" ON medical_records
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Médicos podem ver e editar seus próprios prontuários
CREATE POLICY "Doctors can manage own medical records" ON medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = medical_records.doctor_id
      AND d.user_id = auth.uid()
    )
  );

-- Host/Admin pode ver todos os prontuários da clínica
CREATE POLICY "Host can view all clinic medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = medical_records.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA RECEPTIONS
-- =====================================================

-- Usuários podem ver recepcionistas das clínicas que pertencem
CREATE POLICY "Users can view clinic receptions" ON receptions
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Recepcionistas podem ver seus próprios dados
CREATE POLICY "Receptions can view own data" ON receptions
  FOR SELECT USING (user_id = auth.uid());

-- Host/Admin pode gerenciar recepcionistas
CREATE POLICY "Host can manage receptions" ON receptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = receptions.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA CLINIC_USERS
-- =====================================================

-- Usuários podem ver seus próprios relacionamentos com clínicas
CREATE POLICY "Users can view own clinic relationships" ON clinic_users
  FOR SELECT USING (user_id = auth.uid());

-- Host/Admin pode ver relacionamentos de suas clínicas
CREATE POLICY "Host can view clinic relationships" ON clinic_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.clinic_id = clinic_users.clinic_id
      AND cu.role IN ('owner', 'admin')
      AND cu.is_active = true
    )
  );

-- Host/Admin pode gerenciar relacionamentos
CREATE POLICY "Host can manage clinic relationships" ON clinic_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.clinic_id = clinic_users.clinic_id
      AND cu.role IN ('owner', 'admin')
      AND cu.is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA PATIENT_ASSIGNMENTS
-- =====================================================

-- Usuários podem ver atribuições das clínicas que pertencem
CREATE POLICY "Users can view clinic patient assignments" ON patient_assignments
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Host/Admin pode gerenciar atribuições
CREATE POLICY "Host can manage patient assignments" ON patient_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = patient_assignments.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELA AUDIT_LOGS
-- =====================================================

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Admin pode ver todos os logs
CREATE POLICY "Admin can view all audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- Host pode ver logs de suas clínicas
CREATE POLICY "Host can view clinic audit logs" ON audit_logs
  FOR SELECT USING (
    clinic_id IN (SELECT unnest(get_user_clinics()))
  );

-- =====================================================
-- POLÍTICAS PARA TABELA USER_API_KEYS
-- =====================================================

-- Usuários podem gerenciar suas próprias API keys
CREATE POLICY "Users can manage own api keys" ON user_api_keys
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA TABELA USER_REGISTRATIONS
-- =====================================================

-- Usuários podem ver seus próprios registros
CREATE POLICY "Users can view own registrations" ON user_registrations
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Admin pode gerenciar todos os registros
CREATE POLICY "Admin can manage all registrations" ON user_registrations
  FOR ALL USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA NEWSLETTER_SUBSCRIBERS
-- =====================================================

-- Newsletter é público (todos podem ver)
CREATE POLICY "Everyone can view newsletter subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);

-- Apenas admin pode gerenciar
CREATE POLICY "Admin can manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA RECEPTIONS_CONTACT
-- =====================================================

-- Usuários podem ver contatos de suas clínicas
CREATE POLICY "Users can view clinic contacts" ON receptions_contact
  FOR SELECT USING (has_clinic_access(clinic_id));

-- Host/Admin pode gerenciar contatos
CREATE POLICY "Host can manage clinic contacts" ON receptions_contact
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_users 
      WHERE user_id = auth.uid() 
      AND clinic_id = receptions_contact.clinic_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

