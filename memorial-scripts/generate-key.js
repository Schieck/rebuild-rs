/**
 * Generate Encryption Key
 * 
 * Generates a secure random 256-bit (32-byte) encryption key
 * for use with the memorial encryption scripts.
 * 
 * Usage:
 *   node generate-key.js
 */

const { generateKey } = require('./crypto-utils');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   MEMORIAL ENCRYPTION KEY GENERATOR                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const key = generateKey();

console.log('🔑 Your encryption key:\n');
console.log(`   ${key}\n`);
console.log('📋 Instructions:');
console.log('   1. Copy the key above');
console.log('   2. Add it to your .env file as:');
console.log(`      MEMORIAL_ENCRYPTION_KEY=${key}`);
console.log('   3. Store the key in a secure location (offline preferred):');
console.log('      - Password manager');
console.log('      - Encrypted USB drive');
console.log('      - Physical paper in a safe');
console.log('   4. NEVER commit the .env file to git!');
console.log('\n⚠️  WARNING: If you lose this key, encrypted data CANNOT be recovered!\n');


