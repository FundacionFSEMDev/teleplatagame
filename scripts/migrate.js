/**
 * 🚀 SCRIPT DE MIGRACIÓN PARA SUPABASE
 * 
 * Ejecuta SOLO la última migración creada en la carpeta migrations/
 * Con logs detallados y manejo robusto de errores
 * 
 * Uso:
 *   node scripts/migrate.js
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(message, 'green');
}

function logWarning(message) {
  log(message, 'yellow');
}

function logInfo(message) {
  log(message, 'cyan');
}

function logStep(step, total, message) {
  log(`[${step}/${total}] ${message}`, 'blue');
}

/**
 * Cargar configuración
 */
function loadConfig() {
  logStep(1, 5, 'Cargando configuración...');
  
  const configPath = join(__dirname, '../config.json');
  
  if (!existsSync(configPath)) {
    throw new Error('❌ No se encontró el archivo config.json en la raíz del proyecto');
  }
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    if (!config.supabase?.url || !config.supabase?.serviceRoleKey) {
      throw new Error('❌ Configuración de Supabase incompleta en config.json');
    }
    
    logInfo(`   ✓ URL: ${config.supabase.url}`);
    logInfo(`   ✓ Service Key: ${config.supabase.serviceRoleKey.substring(0, 20)}...`);
    
    return config;
  } catch (error) {
    if (error.message.includes('Unexpected')) {
      throw new Error('❌ Error al parsear config.json. Verifica que sea JSON válido.');
    }
    throw error;
  }
}

/**
 * Obtener la última migración
 */
function getLatestMigration() {
  logStep(2, 5, 'Buscando última migración...');
  
  const migrationsDir = join(__dirname, '../migrations');
  
  if (!existsSync(migrationsDir)) {
    throw new Error('❌ No existe la carpeta migrations/');
  }
  
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  if (files.length === 0) {
    throw new Error('❌ No se encontraron archivos .sql en la carpeta migrations/');
  }
  
  logInfo(`   ✓ Encontrados ${files.length} archivos de migración`);
  
  // Mostrar todos los archivos
  files.forEach((file, index) => {
    if (index === files.length - 1) {
      logSuccess(`   → ${file} (ÚLTIMA - se ejecutará esta)`);
    } else {
      log(`   · ${file}`, 'gray');
    }
  });
  
  const latestFile = files[files.length - 1];
  const migrationPath = join(migrationsDir, latestFile);
  const sql = readFileSync(migrationPath, 'utf-8');
  
  logInfo(`   ✓ Archivo: ${latestFile}`);
  logInfo(`   ✓ Tamaño: ${sql.length} caracteres`);
  
  return { file: latestFile, path: migrationPath, sql };
}

/**
 * Parsear SQL en statements individuales
 */
function parseSQL(sql) {
  logStep(3, 5, 'Parseando SQL...');
  
  // Eliminar comentarios de línea primero
  const lines = sql.split('\n');
  const cleanedLines = lines.map(line => {
    const commentIndex = line.indexOf('--');
    if (commentIndex !== -1) {
      // Verificar que el -- no esté dentro de un string
      const beforeComment = line.substring(0, commentIndex);
      const singleQuotes = (beforeComment.match(/'/g) || []).length;
      const doubleQuotes = (beforeComment.match(/"/g) || []).length;
      
      // Si hay un número impar de comillas, el -- está dentro de un string
      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
        return line.substring(0, commentIndex);
      }
    }
    return line;
  });
  
  const cleanedSQL = cleanedLines.join('\n');
  
  // Parser mejorado que respeta bloques delimitados por $...$
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';
  
  for (let i = 0; i < cleanedSQL.length; i++) {
    const char = cleanedSQL[i];
    
    // Detectar inicio/fin de bloque delimitado por $ (ej: $$, $function$, etc.)
    if (char === '$') {
      // Extraer el tag completo (ej: "function" en $function$)
      let tag = '$';
      let j = i + 1;
      while (j < cleanedSQL.length && cleanedSQL[j] !== '$' && /[a-zA-Z_]/.test(cleanedSQL[j])) {
        tag += cleanedSQL[j];
        j++;
      }
      if (j < cleanedSQL.length && cleanedSQL[j] === '$') {
        tag += '$';
      }
      
      if (!inDollarQuote) {
        // Iniciando bloque delimitado
        inDollarQuote = true;
        dollarQuoteTag = tag;
        current += tag;
        i = j; // Saltar el tag completo
        continue;
      } else if (tag === dollarQuoteTag) {
        // Finalizando bloque delimitado
        inDollarQuote = false;
        current += tag;
        i = j; // Saltar el tag completo
        continue;
      }
    }
    
    // Si encontramos ';' y NO estamos en un bloque delimitado
    if (char === ';' && !inDollarQuote) {
      current += char;
      const trimmed = current.trim();
      if (trimmed && trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // Agregar último statement si existe
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }
  
  logInfo(`   ✓ Parseados ${statements.length} statements SQL`);
  
  // Mostrar preview de cada statement
  statements.forEach((stmt, index) => {
    // Obtener primera línea significativa (no vacía)
    const firstSignificantLine = stmt.split('\n').find(line => line.trim().length > 0) || '';
    const preview = firstSignificantLine.trim().substring(0, 60);
    log(`   ${index + 1}. ${preview}${firstSignificantLine.length > 60 ? '...' : ''}`, 'gray');
  });
  
  return statements;
}

/**
 * Ejecutar migración
 */
async function executeMigration(supabase, statements) {
  logStep(4, 5, 'Ejecutando migración...');
  log('');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const stmtNum = i + 1;
    
    // Preview del statement
    const preview = statement.split('\n')[0].substring(0, 50);
    logInfo(`   [${stmtNum}/${statements.length}] Ejecutando: ${preview}...`);
    
    try {
      // Ejecutar SQL directamente usando rpc
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_string: statement 
      });
      
      if (error) {
        throw error;
      }
      
      logSuccess(`   [${stmtNum}/${statements.length}] ✅ Éxito`);
      successCount++;
      results.push({ statement: preview, success: true });
      
    } catch (error) {
      // Si falla porque no existe la función exec_sql, intentar crear tabla directamente
      if (error.message?.includes('exec_sql') || error.code === 'PGRST202') {
        logWarning(`   [${stmtNum}/${statements.length}] ⚠️  Función exec_sql no existe, intentando método alternativo...`);
        
        try {
          // Método alternativo: usar fetch directo a PostgreSQL REST API
          const { error: altError } = await supabase.from('_').select('*').limit(0);
          
          // Si llegamos aquí, la conexión funciona
          logWarning(`   [${stmtNum}/${statements.length}] ℹ️  Ejecuta este SQL manualmente en SQL Editor:`);
          logError(`\n${statement}\n`);
          
          results.push({ statement: preview, success: false, error: 'Requiere ejecución manual' });
          errorCount++;
          
        } catch (altError) {
          logError(`   [${stmtNum}/${statements.length}] ❌ Error: ${altError.message}`);
          logError(`   Detalles: ${JSON.stringify(altError, null, 2)}`);
          results.push({ statement: preview, success: false, error: altError.message });
          errorCount++;
        }
      } else {
        logError(`   [${stmtNum}/${statements.length}] ❌ Error: ${error.message}`);
        
        if (error.details) {
          logError(`   Detalles: ${error.details}`);
        }
        if (error.hint) {
          logWarning(`   Hint: ${error.hint}`);
        }
        if (error.code) {
          logError(`   Código: ${error.code}`);
        }
        
        // Mostrar el SQL completo que falló
        logError(`\n   SQL que falló:\n${statement}\n`);
        
        results.push({ statement: preview, success: false, error: error.message });
        errorCount++;
      }
    }
  }
  
  return { results, successCount, errorCount, total: statements.length };
}

/**
 * Main
 */
async function main() {
  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║      🚀 MIGRACIÓN DE SUPABASE - SISTEMA DE GAMIFICACIÓN   ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // 1. Cargar configuración
    const config = loadConfig();
    console.log('');
    
    // 2. Obtener última migración
    const { file, path, sql } = getLatestMigration();
    console.log('');
    
    // 3. Parsear SQL
    const statements = parseSQL(sql);
    console.log('');
    
    // 4. Crear cliente de Supabase
    logStep(4, 5, 'Conectando con Supabase...');
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    logSuccess('   ✓ Cliente de Supabase creado');
    console.log('');
    
    // 5. Ejecutar migración
    const { results, successCount, errorCount, total } = await executeMigration(supabase, statements);
    
    console.log('');
    log('═'.repeat(60), 'bright');
    
    // Resumen
    if (errorCount === 0) {
      logSuccess('✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
      logSuccess(`   ${successCount}/${total} statements ejecutados correctamente`);
    } else if (successCount > 0) {
      logWarning('⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS');
      logSuccess(`   ${successCount}/${total} statements exitosos`);
      logError(`   ${errorCount}/${total} statements fallidos`);
    } else {
      logError('❌ MIGRACIÓN FALLIDA');
      logError(`   ${errorCount}/${total} statements fallidos`);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logInfo(`   Duración: ${duration}s`);
    
    log('═'.repeat(60), 'bright');
    console.log('');
    
    // Próximos pasos
    if (errorCount === 0) {
      logInfo('💡 Próximos pasos:');
      logInfo('   1. Verificar tablas en Supabase Dashboard → Database → Tables');
      logInfo('   2. Revisar datos insertados (si los hay)');
      logInfo('   3. Continuar con el desarrollo');
    } else {
      logWarning('💡 Acción requerida:');
      logWarning('   1. Revisa los errores arriba');
      logWarning('   2. Si dice "Requiere ejecución manual":');
      logWarning('      → Copia el SQL del archivo de migración');
      logWarning('      → Ve a Supabase Dashboard → SQL Editor');
      logWarning('      → Pega y ejecuta el SQL');
      logWarning('   3. Corrige el archivo de migración si es necesario');
    }
    
    console.log('');
    
    // Exit code
    process.exit(errorCount > 0 ? 1 : 0);
    
  } catch (error) {
    console.log('');
    log('═'.repeat(60), 'red');
    logError('❌ ERROR CRÍTICO DURANTE LA MIGRACIÓN');
    log('═'.repeat(60), 'red');
    console.log('');
    
    logError(`Mensaje: ${error.message}`);
    
    if (error.stack) {
      log('', 'gray');
      log('Stack trace:', 'gray');
      log(error.stack, 'gray');
    }
    
    console.log('');
    logWarning('💡 Posibles soluciones:');
    logWarning('   • Verifica que config.json exista y tenga las credenciales correctas');
    logWarning('   • Verifica que la carpeta migrations/ exista y tenga archivos .sql');
    logWarning('   • Verifica tu conexión a internet');
    logWarning('   • Verifica que el proyecto de Supabase esté activo');
    console.log('');
    
    process.exit(1);
  }
}

main();
