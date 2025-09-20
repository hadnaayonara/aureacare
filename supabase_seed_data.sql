-- =====================================================
-- DADOS INICIAIS (SEED) PARA SUPABASE
-- =====================================================

-- =====================================================
-- EXAMES PADRÃO DO CATÁLOGO
-- =====================================================

-- Inserir exames com proteção contra duplicações
INSERT INTO exams (name, category, instructions, notes, price, duration, status) VALUES
('Hemograma Completo', 'Laboratório', 'Jejum de 12 horas. Trazer documento de identidade.', 'Exame básico para avaliação geral da saúde', 25.00, 30, 'active'),
('Glicemia de Jejum', 'Laboratório', 'Jejum de 12 horas. Não ingerir álcool 24h antes.', 'Avaliação dos níveis de glicose no sangue', 15.00, 30, 'active'),
('Colesterol Total', 'Laboratório', 'Jejum de 12 horas. Evitar exercícios físicos intensos.', 'Avaliação dos níveis de colesterol', 20.00, 30, 'active'),
('Creatinina', 'Laboratório', 'Não é necessário jejum. Hidratar bem.', 'Avaliação da função renal', 18.00, 30, 'active'),
('TSH', 'Laboratório', 'Não é necessário jejum. Trazer medicamentos em uso.', 'Avaliação da função tireoidiana', 35.00, 30, 'active'),
('Raio-X de Tórax', 'Imagem', 'Remover objetos metálicos. Trazer exames anteriores.', 'Avaliação pulmonar e cardíaca', 45.00, 30, 'active'),
('Ultrassom Abdominal', 'Imagem', 'Jejum de 8 horas. Beber 1L de água 1h antes.', 'Avaliação de órgãos abdominais', 80.00, 45, 'active'),
('Ecocardiograma', 'Imagem', 'Não é necessário jejum. Trazer exames anteriores.', 'Avaliação da função cardíaca', 120.00, 60, 'active'),
('Mamografia', 'Imagem', 'Não usar desodorante. Trazer exames anteriores.', 'Rastreamento de câncer de mama', 65.00, 30, 'active'),
('Densitometria Óssea', 'Imagem', 'Não usar suplementos de cálcio 24h antes.', 'Avaliação da densidade óssea', 95.00, 45, 'active'),
('Eletrocardiograma', 'Cardiologia', 'Não é necessário jejum. Evitar cafeína 2h antes.', 'Avaliação do ritmo cardíaco', 30.00, 30, 'active'),
('Teste Ergométrico', 'Cardiologia', 'Jejum de 3 horas. Usar roupas confortáveis.', 'Avaliação da função cardíaca em esforço', 150.00, 60, 'active'),
('Holter 24h', 'Cardiologia', 'Trazer o aparelho de volta no horário marcado.', 'Monitoramento contínuo do ritmo cardíaco', 180.00, 30, 'active'),
('Papanicolau', 'Ginecologia', 'Não ter relação sexual 48h antes. Evitar duchas.', 'Rastreamento de câncer cervical', 40.00, 30, 'active'),
('Ultrassom Transvaginal', 'Ginecologia', 'Beber 1L de água 1h antes. Evitar urinar.', 'Avaliação ginecológica', 70.00, 45, 'active'),
('Colposcopia', 'Ginecologia', 'Não ter relação sexual 48h antes.', 'Avaliação detalhada do colo do útero', 85.00, 45, 'active'),
('PSA', 'Urologia', 'Não ter relação sexual 48h antes. Evitar exercícios.', 'Rastreamento de câncer de próstata', 35.00, 30, 'active'),
('Ultrassom da Próstata', 'Urologia', 'Beber 1L de água 1h antes. Evitar urinar.', 'Avaliação da próstata', 75.00, 45, 'active'),
('Urodinâmica', 'Urologia', 'Trazer lista de medicamentos em uso.', 'Avaliação da função da bexiga', 200.00, 90, 'active'),
('Eletroencefalograma', 'Neurologia', 'Lavar o cabelo na véspera. Evitar cafeína.', 'Avaliação da atividade cerebral', 80.00, 60, 'active'),
('Ressonância Magnética', 'Neurologia', 'Remover objetos metálicos. Trazer exames anteriores.', 'Avaliação detalhada do sistema nervoso', 300.00, 60, 'active'),
('Tomografia Computadorizada', 'Neurologia', 'Jejum de 4 horas. Trazer exames anteriores.', 'Avaliação por imagem do sistema nervoso', 250.00, 45, 'active'),
('Dermatoscopia', 'Dermatologia', 'Não usar cremes na área a ser examinada.', 'Avaliação de lesões de pele', 50.00, 30, 'active'),
('Biópsia de Pele', 'Dermatologia', 'Não usar anti-inflamatórios 7 dias antes.', 'Coleta de amostra para análise', 80.00, 45, 'active'),
('Fundoscopia', 'Oftalmologia', 'Usar óculos de sol após o exame.', 'Avaliação do fundo do olho', 60.00, 30, 'active'),
('Campo Visual', 'Oftalmologia', 'Não usar lentes de contato.', 'Avaliação do campo de visão', 70.00, 45, 'active'),
('Paquimetria', 'Oftalmologia', 'Não usar lentes de contato 24h antes.', 'Medição da espessura da córnea', 55.00, 30, 'active'),
('Audiometria', 'Otorrinolaringologia', 'Evitar exposição a ruídos altos 24h antes.', 'Avaliação da audição', 65.00, 45, 'active'),
('Videolaringoscopia', 'Otorrinolaringologia', 'Jejum de 4 horas. Não usar anestésicos.', 'Avaliação da laringe', 90.00, 30, 'active'),
('Timpanometria', 'Otorrinolaringologia', 'Não ter infecção no ouvido.', 'Avaliação da função do ouvido médio', 40.00, 30, 'active'),
('Raio-X Articular', 'Ortopedia', 'Remover objetos metálicos. Trazer exames anteriores.', 'Avaliação óssea e articular', 35.00, 30, 'active'),
('Ressonância Articular', 'Ortopedia', 'Remover objetos metálicos. Trazer exames anteriores.', 'Avaliação detalhada de articulações', 280.00, 60, 'active'),
('Avaliação Neuropsicológica', 'Psicologia', 'Trazer relatórios escolares e médicos.', 'Avaliação das funções cognitivas', 200.00, 120, 'active'),
('Teste de Personalidade', 'Psicologia', 'Responder com sinceridade. Não há respostas certas.', 'Avaliação de traços de personalidade', 150.00, 90, 'active'),
('Avaliação de Ansiedade', 'Psicologia', 'Trazer relato dos sintomas atuais.', 'Avaliação dos níveis de ansiedade', 100.00, 60, 'active')
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    instructions = EXCLUDED.instructions,
    notes = EXCLUDED.notes,
    price = EXCLUDED.price,
    duration = EXCLUDED.duration,
    status = EXCLUDED.status,
    updated_at = now();

-- =====================================================
-- CONFIGURAÇÕES PADRÃO DO SISTEMA
-- =====================================================

-- Inserir configurações padrão (se houver tabela de configurações)
-- INSERT INTO system_settings (key, value, description) VALUES
-- ('default_appointment_duration', '30', 'Duração padrão das consultas em minutos'),
-- ('business_hours_start', '08:00', 'Horário de início do funcionamento'),
-- ('business_hours_end', '18:00', 'Horário de fim do funcionamento'),
-- ('weekend_work', 'false', 'Se trabalha nos fins de semana'),
-- ('reminder_hours_before', '24', 'Horas antes do agendamento para enviar lembrete'),
-- ('max_appointments_per_day', '50', 'Máximo de consultas por dia por médico'),
-- ('auto_confirm_appointments', 'false', 'Confirmar consultas automaticamente'),
-- ('require_patient_phone', 'true', 'Telefone do paciente é obrigatório'),
-- ('allow_online_scheduling', 'true', 'Permitir agendamento online'),
-- ('default_consultation_price', '150.00', 'Preço padrão das consultas'),
-- ('currency', 'BRL', 'Moeda padrão do sistema'),
-- ('timezone', 'America/Sao_Paulo', 'Fuso horário padrão');

-- =====================================================
-- ESPECIALIDADES MÉDICAS PADRÃO
-- =====================================================

-- Criar tabela de especialidades se não existir
-- CREATE TABLE IF NOT EXISTS medical_specialties (
--     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name varchar(255) UNIQUE NOT NULL,
--     description text,
--     is_active boolean DEFAULT true,
--     created_at timestamp DEFAULT now()
-- );

-- INSERT INTO medical_specialties (name, description) VALUES
-- ('Clínica Médica', 'Medicina interna e clínica geral'),
-- ('Cardiologia', 'Especialidade médica que trata do coração e sistema cardiovascular'),
-- ('Dermatologia', 'Especialidade médica que trata da pele, cabelos e unhas'),
-- ('Endocrinologia', 'Especialidade médica que trata de hormônios e metabolismo'),
-- ('Ginecologia', 'Especialidade médica que trata da saúde da mulher'),
-- ('Neurologia', 'Especialidade médica que trata do sistema nervoso'),
-- ('Ortopedia', 'Especialidade médica que trata do sistema musculoesquelético'),
-- ('Pediatria', 'Especialidade médica que trata da saúde de crianças e adolescentes'),
-- ('Psiquiatria', 'Especialidade médica que trata de transtornos mentais'),
-- ('Urologia', 'Especialidade médica que trata do sistema urinário e genital masculino'),
-- ('Oftalmologia', 'Especialidade médica que trata dos olhos e visão'),
-- ('Otorrinolaringologia', 'Especialidade médica que trata de ouvido, nariz e garganta'),
-- ('Gastroenterologia', 'Especialidade médica que trata do sistema digestivo'),
-- ('Pneumologia', 'Especialidade médica que trata do sistema respiratório'),
-- ('Nefrologia', 'Especialidade médica que trata dos rins'),
-- ('Reumatologia', 'Especialidade médica que trata de doenças reumáticas'),
-- ('Oncologia', 'Especialidade médica que trata do câncer'),
-- ('Geriatria', 'Especialidade médica que trata da saúde do idoso'),
-- ('Medicina do Trabalho', 'Especialidade médica que trata da saúde ocupacional'),
-- ('Medicina de Emergência', 'Especialidade médica que trata de emergências médicas');

-- =====================================================
-- CONVÊNIOS MÉDICOS PADRÃO
-- =====================================================

-- Criar tabela de convênios se não existir
-- CREATE TABLE IF NOT EXISTS insurance_plans (
--     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name varchar(255) UNIQUE NOT NULL,
--     code varchar(50) UNIQUE NOT NULL,
--     is_active boolean DEFAULT true,
--     created_at timestamp DEFAULT now()
-- );

-- INSERT INTO insurance_plans (name, code) VALUES
-- ('Particular', 'PART'),
-- ('Unimed', 'UNIMED'),
-- ('Bradesco Saúde', 'BRADESCO'),
-- ('Amil', 'AMIL'),
-- ('SulAmérica', 'SULAMERICA'),
-- ('Golden Cross', 'GOLDEN'),
-- ('NotreDame Intermédica', 'NOTREDAME'),
-- ('Hapvida', 'HAPVIDA'),
-- ('São Cristóvão', 'SAOCRISTOVAO'),
-- ('MedSênior', 'MEDSENIOR'),
-- ('Cassi', 'CASSI'),
-- ('Fusex', 'FUSEX'),
-- ('Petrobras', 'PETROBRAS'),
-- ('Marítima', 'MARITIMA'),
-- ('Porto Seguro', 'PORTOSEGURO');

-- =====================================================
-- CIDADES E ESTADOS BRASILEIROS
-- =====================================================

-- Criar tabela de estados se não existir
-- CREATE TABLE IF NOT EXISTS states (
--     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name varchar(255) NOT NULL,
--     code varchar(2) UNIQUE NOT NULL,
--     region varchar(50) NOT NULL,
--     is_active boolean DEFAULT true,
--     created_at timestamp DEFAULT now()
-- );

-- INSERT INTO states (name, code, region) VALUES
-- ('Acre', 'AC', 'Norte'),
-- ('Alagoas', 'AL', 'Nordeste'),
-- ('Amapá', 'AP', 'Norte'),
-- ('Amazonas', 'AM', 'Norte'),
-- ('Bahia', 'BA', 'Nordeste'),
-- ('Ceará', 'CE', 'Nordeste'),
-- ('Distrito Federal', 'DF', 'Centro-Oeste'),
-- ('Espírito Santo', 'ES', 'Sudeste'),
-- ('Goiás', 'GO', 'Centro-Oeste'),
-- ('Maranhão', 'MA', 'Nordeste'),
-- ('Mato Grosso', 'MT', 'Centro-Oeste'),
-- ('Mato Grosso do Sul', 'MS', 'Centro-Oeste'),
-- ('Minas Gerais', 'MG', 'Sudeste'),
-- ('Pará', 'PA', 'Norte'),
-- ('Paraíba', 'PB', 'Nordeste'),
-- ('Paraná', 'PR', 'Sul'),
-- ('Pernambuco', 'PE', 'Nordeste'),
-- ('Piauí', 'PI', 'Nordeste'),
-- ('Rio de Janeiro', 'RJ', 'Sudeste'),
-- ('Rio Grande do Norte', 'RN', 'Nordeste'),
-- ('Rio Grande do Sul', 'RS', 'Sul'),
-- ('Rondônia', 'RO', 'Norte'),
-- ('Roraima', 'RR', 'Norte'),
-- ('Santa Catarina', 'SC', 'Sul'),
-- ('São Paulo', 'SP', 'Sudeste'),
-- ('Sergipe', 'SE', 'Nordeste'),
-- ('Tocantins', 'TO', 'Norte');

-- =====================================================
-- RELACIONAMENTOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Exemplo de como criar um usuário admin inicial
-- NOTA: Este usuário deve ser criado manualmente no Supabase Auth
-- e depois vinculado na tabela users com app_role = 'admin'

-- INSERT INTO users (id, email, full_name, app_role, first_login, is_active)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001', -- UUID do usuário admin no auth.users
--     'admin@aurealabs.com',
--     'Administrador do Sistema',
--     'admin',
--     false,
--     true
-- );

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este arquivo contém os dados iniciais necessários para o funcionamento
-- básico do sistema Aurea Labs.
--
-- IMPORTANTE:
-- 1. Execute este script após criar o schema e as políticas RLS
-- 2. O usuário admin deve ser criado manualmente no Supabase Auth
-- 3. Ajuste os preços dos exames conforme sua região
-- 4. Adicione mais especialidades e convênios conforme necessário
-- 5. Os dados podem ser personalizados após a instalação
--
-- Para executar este script:
-- 1. Acesse o SQL Editor no Supabase Dashboard
-- 2. Cole o conteúdo deste arquivo
-- 3. Execute o script
-- 4. Verifique se os dados foram inseridos corretamente

