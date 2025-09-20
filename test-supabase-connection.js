#!/usr/bin/env node

/**
 * Script para testar a conexão com Supabase
 * Execute com: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configurar dotenv para carregar .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

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

async function testSupabaseConnection() {
  log('\n🔍 TESTANDO CONEXÃO COM SUPABASE...', 'bold')
  log('================================', 'blue')

  // Verificar variáveis de ambiente
  log('\n📋 Verificando variáveis de ambiente:', 'yellow')
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY

  if (!supabaseUrl) {
    log('❌ VITE_SUPABASE_URL não encontrada', 'red')
    return false
  }
  log('✅ VITE_SUPABASE_URL encontrada', 'green')

  if (!supabaseAnonKey) {
    log('❌ VITE_SUPABASE_ANON_KEY não encontrada', 'red')
    return false
  }
  log('✅ VITE_SUPABASE_ANON_KEY encontrada', 'green')

  if (!supabaseServiceKey) {
    log('⚠️  VITE_SUPABASE_SERVICE_KEY não encontrada (opcional)', 'yellow')
  } else {
    log('✅ VITE_SUPABASE_SERVICE_KEY encontrada', 'green')
  }

  // Testar conexão básica
  log('\n🔗 Testando conexão básica:', 'yellow')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Testar conexão com uma query simples
    const { data, error } = await supabase
      .from('clinics')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        log('⚠️  Tabela "clinics" não existe - scripts SQL não executados', 'yellow')
        log('📝 Execute os scripts SQL no Supabase Dashboard', 'blue')
      } else {
        log(`❌ Erro na conexão: ${error.message}`, 'red')
        return false
      }
    } else {
      log('✅ Conexão com Supabase estabelecida', 'green')
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

    log('\n🎉 TESTE CONCLUÍDO!', 'bold')
    log('================================', 'blue')
    
    if (!error || error.code === 'PGRST116') {
      log('✅ Conexão com Supabase: OK', 'green')
      log('📝 Próximo passo: Execute os scripts SQL', 'yellow')
      return true
    } else {
      log('❌ Conexão com Supabase: FALHOU', 'red')
      return false
    }

  } catch (error) {
    log(`❌ Erro inesperado: ${error.message}`, 'red')
    return false
  }
}

// Executar teste
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    log(`❌ Erro fatal: ${error.message}`, 'red')
    process.exit(1)
  })

