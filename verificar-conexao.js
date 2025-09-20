#!/usr/bin/env node

/**
 * Script simples para verificar a conexão com Supabase
 * Execute com: node verificar-conexao.js
 */

import { createClient } from '@supabase/supabase-js'

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function verificarConexao() {
  log('\n🔍 VERIFICANDO CONEXÃO COM SUPABASE...', 'bold')
  log('=====================================', 'blue')

  // Verificar se as variáveis estão definidas
  log('\n📋 Verificando variáveis de ambiente:', 'yellow')
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    log('❌ VITE_SUPABASE_URL não encontrada', 'red')
    log('💡 Crie o arquivo .env.local na raiz do projeto', 'yellow')
    log('💡 Adicione: VITE_SUPABASE_URL=https://seu-projeto.supabase.co', 'yellow')
    return false
  }
  log(`✅ VITE_SUPABASE_URL encontrada: ${supabaseUrl.substring(0, 30)}...`, 'green')

  if (!supabaseAnonKey) {
    log('❌ VITE_SUPABASE_ANON_KEY não encontrada', 'red')
    log('💡 Adicione ao .env.local: VITE_SUPABASE_ANON_KEY=sua_chave_aqui', 'yellow')
    return false
  }
  log(`✅ VITE_SUPABASE_ANON_KEY encontrada: ${supabaseAnonKey.substring(0, 20)}...`, 'green')

  // Testar conexão
  log('\n🔗 Testando conexão com Supabase:', 'yellow')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Testar conexão com uma query simples
    const { data, error } = await supabase
      .from('exams')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        log('⚠️  Tabela "exams" não existe', 'yellow')
        log('💡 Execute os scripts SQL no Supabase Dashboard:', 'blue')
        log('   1. supabase_schema.sql', 'blue')
        log('   2. supabase_rls_policies.sql', 'blue')
        log('   3. supabase_functions_triggers.sql', 'blue')
        log('   4. supabase_storage_setup.sql', 'blue')
        log('   5. supabase_seed_data.sql', 'blue')
      } else {
        log(`❌ Erro na conexão: ${error.message}`, 'red')
        return false
      }
    } else {
      log('✅ Conexão com Supabase estabelecida', 'green')
      log('✅ Tabelas criadas com sucesso', 'green')
    }

    // Testar autenticação
    log('\n🔐 Testando sistema de autenticação:', 'yellow')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      log(`❌ Erro na autenticação: ${authError.message}`, 'red')
    } else {
      log('✅ Sistema de autenticação funcionando', 'green')
    }

    // Testar real-time
    log('\n⚡ Testando real-time:', 'yellow')
    try {
      const channel = supabase.channel('test-connection')
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log('✅ Real-time funcionando', 'green')
        } else if (status === 'CHANNEL_ERROR') {
          log('❌ Erro no real-time', 'red')
        }
      })
      
      // Desconectar após teste
      setTimeout(() => {
        supabase.removeChannel(channel)
      }, 1000)
    } catch (rtError) {
      log(`❌ Erro no real-time: ${rtError.message}`, 'red')
    }

    log('\n🎉 VERIFICAÇÃO CONCLUÍDA!', 'bold')
    log('============================', 'blue')
    
    if (!error || error.code === 'PGRST116') {
      log('✅ Status: PRONTO PARA USO!', 'green')
      log('🚀 Execute: npm run dev', 'yellow')
      return true
    } else {
      log('❌ Status: ERRO NA CONFIGURAÇÃO', 'red')
      return false
    }

  } catch (error) {
    log(`❌ Erro inesperado: ${error.message}`, 'red')
    return false
  }
}

// Executar verificação
verificarConexao()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'red')
    process.exit(1)
  })

