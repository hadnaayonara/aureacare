# Integração Supabase - Aurea Labs

## 📋 Visão Geral
Este documento detalha todas as tarefas necessárias para integrar o Supabase na aplicação Aurea Labs, substituindo as implementações mock por uma autenticação real e banco de dados em tempo real.

---

## 🎯 Fase 1: Configuração Inicial do Supabase



### 1.2 Configuração Local
- [x] Instalar dependências do Supabase
  ```bash
  npm install @supabase/supabase-js
  ```
- [x] Criar arquivo `.env.local` com variáveis de ambiente
- [x] Configurar `.env.example` como template
- [x] Atualizar `.gitignore` para excluir arquivos de ambiente

### 1.3 Estrutura de Arquivos
- [x] Criar `src/lib/supabase.js` - Cliente Supabase
- [x] Criar `src/config/supabase.js` - Configurações
- [x] Criar `src/hooks/useAuth.js` - Hook de autenticação
- [x] Criar `src/contexts/AuthContext.jsx` - Contexto de autenticação

---

## 🗄️ Fase 2: Design e Criação do Banco de Dados

### 2.1 Análise de Entidades Existentes
- [ ] Mapear entidades do sistema atual:
  - [ ] User (usuários)
  - [ ] Patient (pacientes)
  - [ ] Doctor (médicos)
  - [ ] Clinic (clínicas)
  - [ ] Appointment (consultas)
  - [ ] MedicalRecord (prontuários)
  - [ ] Exam (exames)
  - [ ] ClinicUser (relação clínica-usuário)

### 2.2 Criação das Tabelas
- [ ] **users** (perfil de usuário)
  ```sql
  - id (uuid, primary key)
  - email (text, unique)
  - full_name (text)
  - user_type (enum: admin, host, reception, doctor)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **clinics** (clínicas)
  ```sql
  - id (uuid, primary key)
  - name (text)
  - address (text)
  - phone (text)
  - email (text)
  - owner_id (uuid, foreign key to users)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **clinic_users** (relação clínica-usuário)
  ```sql
  - id (uuid, primary key)
  - clinic_id (uuid, foreign key to clinics)
  - user_id (uuid, foreign key to users)
  - role (enum: owner, admin, reception, doctor)
  - created_at (timestamp)
  ```

- [ ] **doctors** (médicos)
  ```sql
  - id (uuid, primary key)
  - user_id (uuid, foreign key to users)
  - clinic_id (uuid, foreign key to clinics)
  - crm (text, unique)
  - specialty (text)
  - phone (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **patients** (pacientes)
  ```sql
  - id (uuid, primary key)
  - clinic_id (uuid, foreign key to clinics)
  - full_name (text)
  - cpf (text, unique)
  - phone (text)
  - email (text)
  - birth_date (date)
  - address (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **appointments** (consultas)
  ```sql
  - id (uuid, primary key)
  - clinic_id (uuid, foreign key to clinics)
  - doctor_id (uuid, foreign key to doctors)
  - patient_id (uuid, foreign key to patients)
  - appointment_date (timestamp)
  - status (enum: scheduled, completed, cancelled)
  - notes (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **medical_records** (prontuários)
  ```sql
  - id (uuid, primary key)
  - patient_id (uuid, foreign key to patients)
  - doctor_id (uuid, foreign key to doctors)
  - clinic_id (uuid, foreign key to clinics)
  - appointment_id (uuid, foreign key to appointments)
  - diagnosis (text)
  - treatment (text)
  - prescriptions (jsonb)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

- [ ] **exams** (exames)
  ```sql
  - id (uuid, primary key)
  - clinic_id (uuid, foreign key to clinics)
  - name (text)
  - description (text)
  - price (decimal)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```

### 2.3 Configuração de RLS (Row Level Security)
- [ ] Habilitar RLS em todas as tabelas
- [ ] Criar políticas de segurança:
  - [ ] Usuários só podem ver dados de suas clínicas
  - [ ] Médicos só podem ver seus próprios pacientes
  - [ ] Administradores têm acesso total
  - [ ] Recepcionistas têm acesso limitado

### 2.4 Triggers e Funções
- [ ] Trigger para `updated_at` automático
- [ ] Função para gerar API keys únicas
- [ ] Função para auditoria de mudanças
- [ ] Trigger para logs de auditoria

---

## 🔐 Fase 3: Sistema de Autenticação

### 3.1 Configuração de Auth no Supabase
- [ ] Configurar provedores de autenticação:
  - [ ] Email/Password (principal)
  - [ ] Google (opcional)
  - [ ] WhatsApp (opcional)
- [ ] Configurar templates de email
- [ ] Configurar redirects após login/logout
- [ ] Configurar domínios permitidos

### 3.2 Implementação de Autenticação
- [ ] **AuthContext.jsx**
  - [ ] Estado global de autenticação
  - [ ] Funções de login/logout
  - [ ] Persistência de sessão
  - [ ] Verificação de token

- [ ] **useAuth.js hook**
  - [ ] Hook personalizado para autenticação
  - [ ] Estados de loading/error
  - [ ] Funções de login/logout/signup
  - [ ] Verificação de permissões

- [ ] **AuthGuard.jsx**
  - [ ] Componente de proteção de rotas
  - [ ] Redirecionamento baseado em permissões
  - [ ] Loading states

### 3.3 Páginas de Autenticação
- [ ] **Login.jsx**
  - [ ] Formulário de login
  - [ ] Validação com Zod
  - [ ] Integração com Supabase Auth
  - [ ] Tratamento de erros

- [ ] **Registration.jsx**
  - [ ] Formulário de cadastro
  - [ ] Validação de dados
  - [ ] Criação de usuário
  - [ ] Confirmação por email

- [ ] **PasswordReset.jsx**
  - [ ] Formulário de recuperação
  - [ ] Envio de email de reset
  - [ ] Nova senha

---

## 🔄 Fase 4: Migração da API Mock

### 4.1 Substituição do Cliente API
- [ ] **src/api/client.js**
  - [ ] Remover implementações mock
  - [ ] Implementar cliente Supabase
  - [ ] Manter interface compatível

- [ ] **src/api/entities.js**
  - [ ] Migrar entidades para Supabase
  - [ ] Implementar CRUD operations
  - [ ] Adicionar filtros e paginação

- [ ] **src/api/functions.js**
  - [ ] Migrar funções para Edge Functions
  - [ ] Implementar serverless functions
  - [ ] Manter compatibilidade

- [ ] **src/api/integrations.js**
  - [ ] Migrar integrações
  - [ ] Implementar com Supabase
  - [ ] Manter funcionalidades

### 4.2 Hooks de Dados
- [ ] **usePatients.js**
  - [ ] Hook para gerenciar pacientes
  - [ ] CRUD operations
  - [ ] Cache e otimização

- [ ] **useDoctors.js**
  - [ ] Hook para médicos
  - [ ] Filtros por clínica
  - [ ] Busca e paginação

- [ ] **useAppointments.js**
  - [ ] Hook para consultas
  - [ ] Filtros por data/médico
  - [ ] Estados de consulta

- [ ] **useClinics.js**
  - [ ] Hook para clínicas
  - [ ] Gerenciamento de clínicas
  - [ ] Usuários da clínica

---

## 📊 Fase 5: Funcionalidades Avançadas

### 5.1 Sistema de Permissões
- [ ] **PermissionService.js**
  - [ ] Verificação de permissões
  - [ ] Roles e permissões granulares
  - [ ] Middleware de autorização

- [ ] **Componentes Protegidos**
  - [ ] Wrapper para componentes
  - [ ] Verificação de permissões
  - [ ] Fallback para usuários sem permissão

### 5.2 Sistema de Notificações
- [ ] **Realtime Subscriptions**
  - [ ] Notificações em tempo real
  - [ ] Atualizações de consultas
  - [ ] Mensagens do sistema

- [ ] **NotificationService.js**
  - [ ] Gerenciamento de notificações
  - [ ] Persistência no banco
  - [ ] Interface de usuário

### 5.3 Upload de Arquivos
- [ ] **Supabase Storage**
  - [ ] Configuração de buckets
  - [ ] Políticas de acesso
  - [ ] Upload de imagens/documentos

- [ ] **FileUpload.jsx**
  - [ ] Componente de upload
  - [ ] Preview de arquivos
  - [ ] Progress indicators

---

## 🧪 Fase 6: Testes e Validação

### 6.1 Testes de Integração
- [ ] **Testes de Autenticação**
  - [ ] Login/logout
  - [ ] Registro de usuários
  - [ ] Recuperação de senha

- [ ] **Testes de CRUD**
  - [ ] Operações em todas as entidades
  - [ ] Validação de permissões
  - [ ] Tratamento de erros

### 6.2 Testes de Performance
- [ ] **Otimização de Queries**
  - [ ] Índices no banco
  - [ ] Paginação eficiente
  - [ ] Cache de dados

- [ ] **Testes de Carga**
  - [ ] Múltiplos usuários
  - [ ] Operações simultâneas
  - [ ] Performance do banco

### 6.3 Testes de Segurança
- [ ] **RLS Policies**
  - [ ] Verificação de isolamento de dados
  - [ ] Testes de permissões
  - [ ] Validação de acesso

---

## 🚀 Fase 7: Deploy e Produção

### 7.1 Configuração de Produção
- [ ] **Variáveis de Ambiente**
  - [ ] Configurar produção no Supabase
  - [ ] Atualizar URLs e chaves
  - [ ] Configurar domínios

- [ ] **Build de Produção**
  - [ ] Otimizar build
  - [ ] Configurar CDN
  - [ ] Compressão de assets

### 7.2 Deploy
- [ ] **Plataforma de Deploy**
  - [ ] Vercel/Netlify (frontend)
  - [ ] Configurar domínio
  - [ ] SSL/HTTPS

- [ ] **Monitoramento**
  - [ ] Logs de erro
  - [ ] Métricas de performance
  - [ ] Alertas de sistema

### 7.3 Backup e Recuperação
- [ ] **Backup do Banco**
  - [ ] Configurar backups automáticos
  - [ ] Testar restauração
  - [ ] Documentar processo

---

## 📝 Fase 8: Documentação e Treinamento

### 8.1 Documentação Técnica
- [ ] **API Documentation**
  - [ ] Documentar endpoints
  - [ ] Exemplos de uso
  - [ ] Guias de integração

- [ ] **Database Schema**
  - [ ] Diagrama ER
  - [ ] Documentação de tabelas
  - [ ] Relacionamentos

### 8.2 Documentação de Usuário
- [ ] **User Manual**
  - [ ] Guia de uso da aplicação
  - [ ] Troubleshooting
  - [ ] FAQ

- [ ] **Admin Guide**
  - [ ] Gerenciamento de usuários
  - [ ] Configurações do sistema
  - [ ] Manutenção

---

## ⏱️ Cronograma Estimado

| Fase | Duração Estimada | Dependências |
|------|------------------|--------------|
| Fase 1: Configuração Inicial | 1-2 dias | - |
| Fase 2: Banco de Dados | 3-4 dias | Fase 1 |
| Fase 3: Autenticação | 2-3 dias | Fase 1, 2 |
| Fase 4: Migração API | 4-5 dias | Fase 2, 3 |
| Fase 5: Funcionalidades Avançadas | 3-4 dias | Fase 4 |
| Fase 6: Testes | 2-3 dias | Fase 5 |
| Fase 7: Deploy | 1-2 dias | Fase 6 |
| Fase 8: Documentação | 1-2 dias | Fase 7 |

**Total Estimado: 17-25 dias**

---

## 🔧 Ferramentas e Tecnologias

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Hook Form
- Zod (validação)

### Backend
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS)
- Edge Functions
- Real-time subscriptions

### Deploy
- Vercel/Netlify
- Supabase (hosted)

---

## 📋 Checklist de Validação

### Funcionalidades Core
- [ ] Login/logout funcionando
- [ ] Registro de usuários
- [ ] CRUD de pacientes
- [ ] CRUD de médicos
- [ ] CRUD de consultas
- [ ] CRUD de prontuários
- [ ] Sistema de permissões
- [ ] Upload de arquivos

### Performance
- [ ] Carregamento rápido (< 3s)
- [ ] Queries otimizadas
- [ ] Cache funcionando
- [ ] Real-time updates

### Segurança
- [ ] RLS configurado
- [ ] Permissões validadas
- [ ] Dados isolados por clínica
- [ ] HTTPS em produção

---

## 🎯 Próximos Passos

1. **Imediato**: Iniciar Fase 1 (Configuração Inicial)
2. **Semana 1**: Completar Fases 1-3
3. **Semana 2**: Completar Fases 4-5
4. **Semana 3**: Completar Fases 6-7
5. **Semana 4**: Finalizar Fase 8 e testes finais

---

*Documento criado em: $(date)*
*Versão: 1.0*
*Status: Em desenvolvimento*
