import fs from 'fs';
import path from 'path';

/**
 * Carrega as variáveis de ambiente com estratégia de fallback múltipla
 * 1. Primeiro: variáveis já carregadas pelo Docker/Sistema
 * 2. Segundo: arquivo .env em múltiplas localizações
 * 3. Terceiro: variáveis padrão (se aplicável)
 */
export function loadEnvFile() {
  console.log('\n📦 Environment Loading Strategy:');
  console.log('=====================================');

  // STRATEGY 1: Check environment variables already loaded by Docker/System
  console.log('\n1️⃣  Checking system environment variables (from Docker/docker-compose):');
  const requiredVars = ['SAFEPAY_PUBLIC_KEY', 'SAFEPAY_SECRET_KEY'];
  const systemEnv = new Set<string>();

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      systemEnv.add(varName);
      const display = process.env[varName]!.substring(0, 20) + '...';
      console.log(`   ✅ ${varName} = ${display} (from system)`);
    }
  }

  // If all required vars found in system env, we're done!
  if (systemEnv.size === requiredVars.length) {
    console.log('\n✅ All required variables found in system environment!');
    console.log('   (Likely passed via docker-compose.yml or Dokploy dashboard)\n');
    return true;
  }

  // STRATEGY 2: Try to load from .env file (fallback)
  console.log(
    `\n2️⃣  System environment incomplete (found ${systemEnv.size}/${requiredVars.length} vars).`
  );
  console.log('   Searching for .env file in multiple locations...\n');

  const possiblePaths = [
    path.join(process.cwd(), '.env'),           // Current working directory
    path.join(__dirname, '../../.env'),         // ../../../.env (relative to src/)
    path.join(__dirname, '../../..', '.env'),   // Root of project
    '/.env',                                     // Root filesystem (Docker container)
  ];

  for (const filePath of possiblePaths) {
    console.log(`   Checking: ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(`      ✅ ENCONTRADO! Carregando...`);
      try {
        const envContent = fs.readFileSync(filePath, 'utf-8');
        const lines = envContent.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim();

          // Only load if not already in system env
          if (key && value && !process.env[key]) {
            process.env[key] = value;
            const display = key.includes('KEY') || key.includes('TOKEN') ? '***' : value.substring(0, 20);
            console.log(`      ✅ Loaded ${key} from file`);
          } else if (key && value && process.env[key]) {
            console.log(`      ⏭️  Skipped ${key} (already in system env)`);
          }
        }
        console.log(`   ✅ Loaded variables from: ${filePath}\n`);
        return true;
      } catch (error) {
        console.error(`   ❌ Error reading ${filePath}:`, error);
      }
    }
  }

  console.log('   ⚠️  No .env file found in any location.');
  console.log('   Variables must come from Docker environment.\n');
  return false;
}

/**
 * Valida se as variáveis essenciais estão configuradas
 */
export function validateEnvVars() {
  const requiredVars = [
    'SAFEPAY_PUBLIC_KEY',
    'SAFEPAY_SECRET_KEY',
  ];

  console.log('\n🔐 Validating Required Variables:');
  console.log('====================================');

  const missing: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      const display = value.substring(0, 20) + '...';
      console.log(`   ✅ ${varName}: ${display}`);
    } else {
      console.log(`   ❌ ${varName}: NÃO DEFINIDA`);
      missing.push(varName);
    }
  }

  console.log('====================================\n');

  if (missing.length > 0) {
    console.error(`\n❌ ERRO FATAL: As seguintes variáveis obrigatórias não estão definidas:\n`);
    for (const varName of missing) {
      console.error(`   - ${varName}`);
    }
    console.error('\n📋 Como resolver:');
    console.error('   1. Se usar docker-compose localmente: crie .env na raiz com as variáveis');
    console.error('   2. Se usar Dokploy: configure as variáveis no dashboard da aplicação');
    console.error('   3. Se usar linha de comando: export VAR=value antes de rodar o container\n');
    process.exit(1);
  }

  console.log('✅ Todas as variáveis obrigatórias estão configuradas!\n');
}
