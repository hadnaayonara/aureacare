# 🚀 Guia de Configuração do Supabase Dashboard

## 📋 Tarefa 1.1 - Configuração do Supabase Auth

Esta tarefa deve ser executada **manualmente no Dashboard do Supabase** porque requer acesso administrativo ao projeto.

---

## 🎯 PASSO A PASSO - CONFIGURAÇÃO NO SUPABASE DASHBOARD

### 1. Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto "Aurea Labs"

### 2. Configurar Provedores de Autenticação

#### 2.1 Email/Password (Principal)
1. No menu lateral, clique em **"Authentication"**
2. Clique na aba **"Providers"**
3. Certifique-se que **"Email"** está **HABILITADO**
4. Configure as seguintes opções:
   - ✅ **Enable email confirmations**: Ativado
   - ✅ **Enable email change confirmations**: Ativado
   - ✅ **Enable secure email change**: Ativado

#### 2.2 Configurar Templates de Email
1. Na aba **"Email Templates"**
2. Personalize os templates:

**Template de Confirmação de Email:**
```html
<h2>Bem-vindo ao Aurea Labs!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Este link expira em 24 horas.</p>
<p>Equipe Aurea Labs</p>
```

**Template de Reset de Senha:**
```html
<h2>Redefinir Senha - Aurea Labs</h2>
<p>Você solicitou a redefinição de sua senha.</p>
<p>Clique no link abaixo para criar uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou isso, ignore este email.</p>
<p>Equipe Aurea Labs</p>
```

### 3. Configurar URLs de Redirect

#### 3.1 URLs Permitidas
1. Na aba **"URL Configuration"**
2. Adicione as seguintes URLs:

**Site URL:**
```
http://localhost:5173
https://seu-dominio.com
```

**Redirect URLs:**
```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
https://seu-dominio.com/auth/callback
https://seu-dominio.com/reset-password
```

### 4. Configurar Domínios Permitidos
1. Na seção **"Auth Providers"**
2. Em **"Additional Settings"**
3. Adicione os domínios:

```
localhost:5173
localhost:3000
seu-dominio.com
*.seu-dominio.com
```

### 5. Configurar Políticas de Senha

#### 5.1 Políticas de Complexidade
1. Na aba **"Policies"**
2. Configure as seguintes políticas:

```json
{
  "password_min_length": 8,
  "password_require_uppercase": true,
  "password_require_lowercase": true,
  "password_require_numbers": true,
  "password_require_symbols": false
}
```

#### 5.2 Configurações de Sessão
```json
{
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "refresh_token_reuse_interval": 10
}
```

### 6. Configurar Rate Limiting
1. Na seção **"Rate Limits"**
2. Configure:

```json
{
  "email_signup": {
    "max_requests": 5,
    "interval": 3600
  },
  "email_login": {
    "max_requests": 10,
    "interval": 3600
  },
  "password_reset": {
    "max_requests": 3,
    "interval": 3600
  }
}
```

---

## 🔧 CONFIGURAÇÕES ADICIONAIS RECOMENDADAS

### 1. Configurar RLS (Row Level Security)
1. Vá para **"Database"** > **"Tables"**
2. Para cada tabela que será criada, habilite RLS
3. Configure as políticas conforme o arquivo `banco.md`

### 2. Configurar Storage
1. Vá para **"Storage"**
2. Crie os buckets necessários:
   - `aurea-labs-uploads`
   - `aurea-labs-documents`
   - `aurea-labs-images`

### 3. Configurar Edge Functions (Opcional)
1. Vá para **"Edge Functions"**
2. Crie funções para:
   - Geração de API keys
   - Envio de emails personalizados
   - Processamento de uploads

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após configurar tudo, teste:

- [ ] **Registro de usuário** com email válido
- [ ] **Confirmação de email** funcionando
- [ ] **Login** com credenciais corretas
- [ ] **Reset de senha** funcionando
- [ ] **Logout** funcionando
- [ ] **Sessão persistente** após refresh
- [ ] **Rate limiting** funcionando
- [ ] **URLs de redirect** corretas

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Erro: "Invalid redirect URL"
**Solução:** Verifique se a URL está na lista de URLs permitidas

### Erro: "Email not confirmed"
**Solução:** Verifique se o template de email está configurado corretamente

### Erro: "Rate limit exceeded"
**Solução:** Aguarde o tempo de cooldown ou ajuste os limites

### Erro: "Invalid password"
**Solução:** Verifique se a senha atende aos critérios de complexidade

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique os logs em **"Logs"** > **"Auth"**
2. Consulte a documentação: https://supabase.com/docs/guides/auth
3. Entre em contato com o suporte do Supabase

---

**IMPORTANTE:** Após configurar tudo no Dashboard, marque a tarefa 1.1 como concluída no arquivo `SUPABASE_AUTH_DB_INTEGRATION.md`.

