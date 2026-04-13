import fs from 'fs';
import path from 'path';

/**
 * Carrega as variáveis de ambiente a partir de um arquivo .env
 * Tenta múltiplos caminhos possíveis
 */
export function loadEnvFile() {
  const possiblePaths = [
    path.join(process.cwd(), '.env'),                    // /app/.env
    path.join(__dirname, '../../.env'),                 // ../../../.env
    path.join(__dirname, '../../..', '.env'),           // Raiz do projeto
    '/.env',                                             // Root filesystem
  ];

  console.log('\n🔍 Procurando arquivo .env nos seguintes caminhos:');
  for (const filePath of possiblePaths) {
    console.log(`   - ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(`      ✅ ENCONTRADO! Carregando...`);
      const envContent = fs.readFileSync(filePath, 'utf-8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue; // Ignora linhas vazias e comentários

        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();

        if (key && value) {
          process.env[key] = value;
          const status = key.includes('KEY') || key.includes('TOKEN') ? '***' : value.substring(0, 20);
          console.log(`      ✅ ${key} = ${status}`);
        }
      }
      return true;
    }
  }

  console.log('   ⚠️  Nenhum arquivo .env encontrado. Usando variáveis de ambiente do sistema.\n');
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

  console.log('\n🔐 Validando Variáveis Essenciais:');
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
    console.error(`\n❌ ERRO: As seguintes variáveis obrigatórias não estão definidas:\n   ${missing.join('\n   ')}\n`);
    process.exit(1);
  }

  console.log('✅ Todas as variáveis obrigatórias estão configuradas!\n');
}
