# 🔧 CONFIGURAÇÃO SUPABASE - AUREA LABS

## 📋 **CREDENCIAIS NECESSÁRIAS**

Para conectar o projeto ao Supabase, você precisa criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# =====================================================
# CONFIGURAÇÕES SUPABASE - AUREA LABS
# =====================================================

# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Chave anônima (pública) do Supabase
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Chave de serviço (privada) do Supabase
VITE_SUPABASE_SERVICE_KEY=your_service_key_here
```

## 🎯 **ONDE ENCONTRAR SUAS CREDENCIAIS:**

1. **Acesse o Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em Settings > API**
4. **Copie as credenciais:**
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `VITE_SUPABASE_SERVICE_KEY`

## 🚀 **PASSOS PARA CONECTAR:**

### **1. Criar o arquivo `.env.local`:**
```bash
# Na raiz do projeto (/Users/joe/Downloads/aurea-labs)
touch .env.local
```

### **2. Adicionar as credenciais:**
Cole o conteúdo acima no arquivo `.env.local` e substitua pelos seus valores reais.

### **3. Executar os scripts SQL:**
Execute os seguintes arquivos no Supabase Dashboard > SQL Editor:
- `supabase_schema.sql`
- `supabase_rls_policies.sql`
- `supabase_functions_triggers.sql`
- `supabase_storage_setup.sql`
- `supabase_seed_data.sql`

### **4. Reiniciar o servidor:**
```bash
npm run dev
```

## ✅ **VERIFICAÇÃO:**

Após configurar, o sistema estará:
- ✅ **Conectado ao Supabase**
- ✅ **Autenticação funcionando**
- ✅ **Banco de dados configurado**
- ✅ **Real-time ativo**
- ✅ **Upload de arquivos funcionando**

## 🆘 **SUPORTE:**

Se tiver problemas:
1. Verifique se as credenciais estão corretas
2. Confirme que os scripts SQL foram executados
3. Verifique o console do navegador para erros
4. Reinicie o servidor de desenvolvimento

---
**Status**: ⏳ Aguardando configuração das credenciais

