# 🗄️ Guia de Configuração do Banco de Dados Supabase

## 📋 ETAPA 2: Implementação do Banco de Dados

Este guia contém todas as instruções para configurar o banco de dados Supabase com o schema completo do Aurea Labs.

---

## 🎯 **IMPORTANTE: LIMITAÇÃO TÉCNICA**

**❌ Não posso executar automaticamente** porque requer:
- Acesso ao Dashboard do Supabase
- Execução manual de scripts SQL
- Configuração de Storage no painel web

**✅ Solução:** Criados **4 arquivos SQL** prontos para execução manual.

---

## 📁 **Arquivos Criados**

### 1. **`supabase_schema.sql`** - Schema Principal
- ✅ Todos os tipos ENUM
- ✅ Todas as tabelas com UUID
- ✅ Índices para performance
- ✅ Foreign Keys
- ✅ Comentários nas tabelas

### 2. **`supabase_rls_policies.sql`** - Políticas de Segurança
- ✅ Funções auxiliares de permissão
- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas por tipo de usuário
- ✅ Isolamento por clínica

### 3. **`supabase_functions_triggers.sql`** - Funções e Triggers
- ✅ Trigger `updated_at` automático
- ✅ Sistema de auditoria completo
- ✅ Geração de API keys
- ✅ Funções de busca e estatísticas

### 4. **`supabase_storage_setup.sql`** - Configuração de Storage
- ✅ 3 buckets configurados
- ✅ Políticas de acesso por bucket
- ✅ Funções para upload/download

### 5. **`supabase_seed_data.sql`** - Dados Iniciais
- ✅ 50+ exames padrão do catálogo
- ✅ Especialidades médicas
- ✅ Convênios médicos
- ✅ Estados brasileiros

---

## 🚀 **INSTRUÇÕES DE EXECUÇÃO**

### **Passo 1: Acessar o Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto "Aurea Labs"
3. Vá para **"SQL Editor"**

### **Passo 2: Executar o Schema Principal**
1. Abra o arquivo `supabase_schema.sql`
2. Cole todo o conteúdo no SQL Editor
3. Clique em **"Run"**
4. ✅ Verifique se todas as tabelas foram criadas

### **Passo 3: Executar as Políticas RLS**
1. Abra o arquivo `supabase_rls_policies.sql`
2. Cole todo o conteúdo no SQL Editor
3. Clique em **"Run"**
4. ✅ Verifique se as políticas foram criadas

### **Passo 4: Executar Funções e Triggers**
1. Abra o arquivo `supabase_functions_triggers.sql`
2. Cole todo o conteúdo no SQL Editor
3. Clique em **"Run"**
4. ✅ Verifique se as funções foram criadas

### **Passo 5: Configurar Storage**
1. Abra o arquivo `supabase_storage_setup.sql`
2. Cole todo o conteúdo no SQL Editor
3. Clique em **"Run"**
4. ✅ Vá para **"Storage"** e verifique os buckets

### **Passo 6: Inserir Dados Iniciais**
1. Abra o arquivo `supabase_seed_data.sql`
2. Cole todo o conteúdo no SQL Editor
3. Clique em **"Run"**
4. ✅ Verifique se os exames foram inseridos

---

## 🔍 **Verificações de Validação**

### **Tabelas Criadas (18 tabelas):**
- [ ] `users` - Usuários do sistema
- [ ] `clinics` - Clínicas cadastradas
- [ ] `clinic_addresses` - Endereços das clínicas
- [ ] `doctors` - Médicos
- [ ] `patients` - Pacientes
- [ ] `patient_addresses` - Endereços dos pacientes
- [ ] `emergency_contacts` - Contatos de emergência
- [ ] `exams` - Catálogo de exames
- [ ] `appointments` - Consultas
- [ ] `medical_records` - Prontuários
- [ ] `receptions` - Recepcionistas
- [ ] `clinic_users` - Relacionamento clínica-usuário
- [ ] `patient_assignments` - Atribuições de pacientes
- [ ] `audit_logs` - Logs de auditoria
- [ ] `user_api_keys` - Chaves API
- [ ] `user_registrations` - Registros pendentes
- [ ] `newsletter_subscribers` - Assinantes da newsletter
- [ ] `receptions_contact` - Contatos de recepção

### **Buckets de Storage (3 buckets):**
- [ ] `aurea-labs-uploads` - Uploads gerais (público)
- [ ] `aurea-labs-documents` - Documentos médicos (privado)
- [ ] `aurea-labs-images` - Imagens de perfil (público)

### **Dados Iniciais:**
- [ ] 50+ exames no catálogo
- [ ] Especialidades médicas
- [ ] Convênios médicos
- [ ] Estados brasileiros

---

## ⚠️ **Problemas Comuns e Soluções**

### **Erro: "relation does not exist"**
**Solução:** Execute os scripts na ordem correta (schema → rls → functions → storage → seed)

### **Erro: "permission denied"**
**Solução:** Certifique-se de estar logado como owner do projeto

### **Erro: "bucket already exists"**
**Solução:** Delete o bucket existente ou use um nome diferente

### **Erro: "function already exists"**
**Solução:** Use `CREATE OR REPLACE FUNCTION` ou `DROP FUNCTION` primeiro

---

## 🎯 **Próximos Passos Após Configuração**

1. **Testar RLS:** Criar usuário de teste e verificar isolamento
2. **Configurar Admin:** Criar usuário admin inicial
3. **Testar Upload:** Fazer upload de arquivo de teste
4. **Validar Políticas:** Verificar se as políticas estão funcionando

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs no **"Logs"** > **"Postgres"**
2. Consulte a documentação: https://supabase.com/docs/guides/database
3. Entre em contato com o suporte do Supabase

---

**IMPORTANTE:** Após configurar tudo, marque as tarefas da ETAPA 2 como concluídas no arquivo `SUPABASE_AUTH_DB_INTEGRATION.md`.

---

*Guia criado para Aurea Labs - Sistema de Gestão Médica*

