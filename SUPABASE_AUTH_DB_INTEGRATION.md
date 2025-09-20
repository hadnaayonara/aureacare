# Integração Supabase - Autenticação e Banco de Dados

## 📋 Visão Geral
Este documento detalha todas as tarefas necessárias para integrar a autenticação do Supabase e implementar o banco de dados completo na aplicação Aurea Labs, seguindo as 3 etapas principais.

---

## 🎯 ETAPA 1: Implementação da Autenticação Supabase

### 1.1 Configuração do Supabase Auth
- [ ] Configurar provedores de autenticação no Supabase Dashboard:
  - [ ] Email/Password (habilitado)
  - [ ] Configurar templates de email personalizados
  - [ ] Configurar URLs de redirect após login/logout
  - [ ] Configurar domínios permitidos
  - [ ] Configurar políticas de senha (complexidade, expiração)

### 1.2 Atualização do AuthContext
- [x] **src/contexts/AuthContext.jsx**
  - [x] Integrar com Supabase Auth real
  - [x] Remover implementações mock
  - [x] Implementar verificação de email
  - [x] Adicionar tratamento de erros específicos do Supabase
  - [x] Implementar refresh token automático
  - [x] Adicionar logout global

### 1.3 Atualização do Hook useAuth
- [x] **src/hooks/useAuth.js**
  - [x] Conectar com Supabase Auth
  - [x] Implementar signInWithPassword
  - [x] Implementar signUp com confirmação de email
  - [x] Implementar resetPasswordForEmail
  - [x] Implementar updateUser (perfil)
  - [x] Adicionar tratamento de estados de loading
  - [x] Implementar verificação de sessão persistente

### 1.4 Páginas de Autenticação - Login
- [x] **src/pages/Auth.jsx**
  - [x] Atualizar formulário de login
  - [x] Integrar com Supabase Auth
  - [x] Adicionar validação com Zod
  - [x] Implementar tratamento de erros
  - [x] Adicionar loading states
  - [x] Implementar redirecionamento após login
  - [x] Adicionar link para recuperação de senha
  - [x] Adicionar link para registro

### 1.5 Páginas de Autenticação - Registro
- [x] **src/pages/Registration.jsx**
  - [x] Atualizar formulário de registro
  - [x] Integrar com Supabase Auth signUp
  - [x] Adicionar validação de dados
  - [x] Implementar confirmação de email
  - [x] Adicionar tratamento de erros específicos
  - [x] Implementar redirecionamento após registro
  - [x] Adicionar validação de CPF/CNPJ

### 1.6 Páginas de Autenticação - Recuperação de Senha
- [x] **src/pages/PasswordReset.jsx** (criar)
  - [x] Formulário para solicitar reset
  - [x] Integração com resetPasswordForEmail
  - [x] Página de confirmação de envio
  - [x] Formulário para nova senha
  - [x] Validação de token de reset

### 1.7 Páginas de Autenticação - Verificação de Email
- [x] **src/pages/EmailVerification.jsx** (criar)
  - [x] Página de aguardando verificação
  - [x] Botão para reenviar email
  - [x] Redirecionamento automático após verificação
  - [x] Tratamento de erros de verificação

### 1.8 Atualização do AuthGuard
- [x] **src/components/auth/AuthGuard.jsx**
  - [x] Integrar com Supabase Auth
  - [x] Verificar autenticação real
  - [x] Implementar redirecionamento baseado em permissões
  - [x] Adicionar loading states
  - [x] Implementar proteção de rotas por tipo de usuário

### 1.9 Integração no App Principal
- [x] **src/App.jsx**
  - [x] Envolver aplicação com AuthProvider
  - [ ] Configurar rotas protegidas
  - [ ] Implementar redirecionamento de usuários não autenticados
  - [ ] Adicionar tratamento de erros de autenticação

---

## 🗄️ ETAPA 2: Implementação do Banco de Dados

### 2.1 Criação do Projeto Supabase
- [ ] Criar projeto no Supabase Dashboard
- [ ] Configurar região (São Paulo - sa-east-1)
- [ ] Configurar backup automático
- [ ] Configurar monitoramento

### 2.2 Execução do Schema do Banco
- [x] **Executar script SQL completo do banco.md**
  - [x] Criar todos os ENUMs necessários
  - [x] Criar todas as tabelas principais
  - [x] Criar tabelas de relacionamento
  - [x] Criar índices para performance
  - [x] Adicionar comentários nas tabelas/colunas
  - [x] Configurar foreign keys

### 2.3 Configuração de Row Level Security (RLS)
- [x] **Habilitar RLS em todas as tabelas:**
  - [x] `users` - Usuários só veem próprios dados
  - [x] `clinics` - Usuários só veem clínicas que pertencem
  - [x] `doctors` - Médicos só veem dados da própria clínica
  - [x] `patients` - Pacientes isolados por clínica
  - [x] `appointments` - Consultas isoladas por clínica
  - [x] `medical_records` - Prontuários isolados por clínica
  - [x] `clinic_users` - Relacionamentos isolados por clínica
  - [x] `exams` - Exames globais (acesso público)
  - [x] `audit_logs` - Logs isolados por clínica

### 2.4 Criação de Políticas RLS
- [x] **Políticas para usuários:**
  ```sql
  - Usuários podem ler/atualizar próprios dados
  - Admin pode ler todos os usuários
  - Host pode ler usuários de suas clínicas
  ```

- [x] **Políticas para clínicas:**
  ```sql
  - Owner pode ler/atualizar própria clínica
  - Admin pode ler todas as clínicas
  - Usuários podem ler clínicas que pertencem
  ```

- [x] **Políticas para médicos:**
  ```sql
  - Médicos podem ler próprios dados
  - Usuários da clínica podem ler médicos da clínica
  - Admin pode ler todos os médicos
  ```

- [x] **Políticas para pacientes:**
  ```sql
  - Usuários da clínica podem ler pacientes da clínica
  - Médicos podem ler pacientes atribuídos
  - Admin pode ler todos os pacientes
  ```

- [x] **Políticas para consultas:**
  ```sql
  - Usuários da clínica podem ler consultas da clínica
  - Médicos podem ler próprias consultas
  - Recepcionistas podem gerenciar consultas da clínica
  ```

- [x] **Políticas para prontuários:**
  ```sql
  - Médicos podem ler/editar próprios prontuários
  - Usuários da clínica podem ler prontuários da clínica
  - Admin pode ler todos os prontuários
  ```

### 2.5 Criação de Funções e Triggers
- [x] **Trigger updated_at automático:**
  ```sql
  - Função para atualizar updated_at
  - Aplicar em todas as tabelas
  ```

- [x] **Função de auditoria:**
  ```sql
  - Log automático de mudanças
  - Rastreamento de ações do usuário
  ```

- [x] **Função de geração de API keys:**
  ```sql
  - Geração segura de chaves
  - Hash das chaves para segurança
  ```

### 2.6 Configuração de Storage
- [x] **Criar buckets:**
  - [x] `aurea-labs-uploads` - Uploads gerais
  - [x] `aurea-labs-documents` - Documentos médicos
  - [x] `aurea-labs-images` - Imagens de perfil

- [x] **Políticas de Storage:**
  - [x] Usuários podem fazer upload de próprios arquivos
  - [x] Médicos podem acessar documentos de pacientes
  - [x] Admin pode acessar todos os arquivos

### 2.7 Dados Iniciais (Seed)
- [x] **Inserir dados básicos:**
  - [x] Exames padrão do catálogo
  - [x] Usuário admin inicial
  - [x] Configurações padrão do sistema

---

## 🔄 ETAPA 3: Integração do Banco com o Código

### 3.1 Criação de Types TypeScript
- [x] **src/types/database.ts**
  - [x] Definir interfaces para todas as tabelas
  - [x] Tipos para ENUMs
  - [x] Tipos para relacionamentos
  - [x] Tipos para operações CRUD

### 3.2 Atualização do Cliente Supabase
- [x] **src/lib/supabase.js**
  - [x] Configurar cliente com types
  - [x] Adicionar métodos customizados
  - [x] Configurar interceptors para logs
  - [x] Configurar retry automático

### 3.3 Substituição do API Client Mock
- [x] **src/api/client.js**
  - [x] Remover implementações mock
  - [x] Implementar cliente Supabase real
  - [x] Manter interface compatível
  - [x] Adicionar tratamento de erros

### 3.4 Migração das Entidades
- [x] **src/api/entities.js**
  - [x] Migrar Patient para Supabase
  - [x] Migrar Doctor para Supabase
  - [x] Migrar Clinic para Supabase
  - [x] Migrar Appointment para Supabase
  - [x] Migrar MedicalRecord para Supabase
  - [x] Migrar Exam para Supabase
  - [x] Implementar filtros e paginação
  - [x] Adicionar validação de permissões

### 3.5 Criação de Hooks de Dados
- [x] **src/hooks/usePatients.js**
  - [x] Hook para CRUD de pacientes
  - [x] Cache com React Query
  - [x] Filtros por clínica
  - [x] Busca e paginação
  - [x] Otimistic updates

- [x] **src/hooks/useDoctors.js**
  - [x] Hook para médicos
  - [x] Filtros por clínica
  - [x] Busca por especialidade
  - [x] Gerenciamento de agenda

- [x] **src/hooks/useAppointments.js**
  - [x] Hook para consultas
  - [x] Filtros por data/médico
  - [x] Estados de consulta
  - [x] Real-time updates

- [x] **src/hooks/useClinics.js**
  - [x] Hook para clínicas
  - [x] Gerenciamento de clínicas
  - [x] Usuários da clínica
  - [x] Configurações

- [x] **src/hooks/useMedicalRecords.js**
  - [x] Hook para prontuários
  - [x] Filtros por paciente/médico
  - [x] Histórico médico
  - [x] Anexos

### 3.6 Atualização dos Componentes
- [x] **Componentes de Listagem:**
  - [x] PatientList.jsx - Integrar com Supabase
  - [x] DoctorList.jsx - Integrar com Supabase
  - [x] AppointmentList.jsx - Integrar com Supabase

- [x] **Componentes de Formulário:**
  - [x] NewPatientForm.jsx - Integrar com Supabase
  - [x] NewDoctorForm.jsx - Integrar com Supabase
  - [x] NewAppointmentForm.jsx - Integrar com Supabase

- [x] **Componentes de Dashboard:**
  - [x] DashboardStats.jsx - Dados reais do banco
  - [x] AppointmentsToday.jsx - Consultas reais
  - [x] RecentActivity.jsx - Atividade real

### 3.7 Sistema de Permissões
- [x] **src/services/PermissionService.js**
  - [x] Verificação de permissões por usuário
  - [x] Middleware de autorização
  - [x] Validação de acesso a dados
  - [x] Logs de tentativas de acesso

### 3.8 Real-time Subscriptions
- [x] **src/hooks/useRealtime.js**
  - [x] Hook para updates em tempo real
  - [x] Subscriptions para consultas
  - [x] Notificações de mudanças
  - [x] Reconexão automática

### 3.9 Upload de Arquivos
- [x] **src/components/FileUpload.jsx**
  - [x] Componente de upload
  - [x] Preview de arquivos
  - [x] Progress indicators
  - [x] Validação de tipos/tamanho

- [x] **src/services/FileService.js**
  - [x] Gerenciamento de uploads
  - [x] Integração com Supabase Storage
  - [x] Geração de URLs assinadas
  - [x] Limpeza de arquivos órfãos

### 3.10 Sistema de Notificações
- [x] **src/hooks/useNotifications.js**
  - [x] Hook para notificações
  - [x] Real-time notifications
  - [x] Persistência no banco
  - [x] Interface de usuário

---

## 🧪 ETAPA 4: Testes e Validação

### 4.1 Testes de Autenticação
- [ ] **Testes de Login:**
  - [ ] Login com credenciais válidas
  - [ ] Login com credenciais inválidas
  - [ ] Verificação de email obrigatória
  - [ ] Redirecionamento após login

- [ ] **Testes de Registro:**
  - [ ] Registro de novo usuário
  - [ ] Verificação de email
  - [ ] Validação de dados
  - [ ] Tratamento de erros

### 4.2 Testes de Banco de Dados
- [ ] **Testes de CRUD:**
  - [ ] Criação de registros
  - [ ] Leitura de dados
  - [ ] Atualização de registros
  - [ ] Exclusão de registros

- [ ] **Testes de RLS:**
  - [ ] Isolamento de dados por clínica
  - [ ] Permissões por tipo de usuário
  - [ ] Tentativas de acesso não autorizado

### 4.3 Testes de Performance
- [ ] **Otimização de Queries:**
  - [ ] Índices funcionando
  - [ ] Paginação eficiente
  - [ ] Cache de dados

---

## ⏱️ Cronograma Estimado

| Etapa | Duração | Dependências |
|-------|---------|--------------|
| Etapa 1: Autenticação | 3-4 dias | Fase 1 concluída |
| Etapa 2: Banco de Dados | 2-3 dias | Etapa 1 |
| Etapa 3: Integração | 4-5 dias | Etapa 2 |
| Etapa 4: Testes | 2-3 dias | Etapa 3 |

**Total Estimado: 11-15 dias**

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key
```

### Dependências Adicionais
```bash
npm install @tanstack/react-query
npm install @supabase/auth-ui-react
npm install @supabase/auth-ui-shared
```

---

## 📋 Checklist de Validação Final

### Autenticação
- [ ] Login/logout funcionando
- [ ] Registro com verificação de email
- [ ] Recuperação de senha
- [ ] Proteção de rotas
- [ ] Persistência de sessão

### Banco de Dados
- [ ] Todas as tabelas criadas
- [ ] RLS configurado e funcionando
- [ ] Relacionamentos corretos
- [ ] Índices para performance
- [ ] Triggers funcionando

### Integração
- [ ] CRUD de todas as entidades
- [ ] Filtros e paginação
- [ ] Real-time updates
- [ ] Upload de arquivos
- [ ] Sistema de permissões

### Performance
- [ ] Carregamento rápido (< 3s)
- [ ] Queries otimizadas
- [ ] Cache funcionando
- [ ] Real-time responsivo

---

## 🎯 Próximos Passos

1. **Imediato**: Iniciar Etapa 1 (Autenticação)
2. **Semana 1**: Completar Etapas 1-2
3. **Semana 2**: Completar Etapas 3-4
4. **Finalização**: Testes e ajustes finais

---

*Documento criado em: $(date)*
*Versão: 1.0*
*Status: Em desenvolvimento*
