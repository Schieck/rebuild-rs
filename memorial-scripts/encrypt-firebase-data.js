/**
 * Encrypt Firebase Data Script for Memorial
 * 
 * This script encrypts all personal identifiable information (PII) in the Firebase database
 * while keeping statistical and aggregate data visible for the memorial.
 * 
 * ⚠️  WARNING: This permanently modifies your Firebase data!
 * Make sure you have a backup before running this script.
 * 
 * Usage:
 *   node encrypt-firebase-data.js
 */

require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');
const { encrypt, encryptCoordinates, isValidKey } = require('./crypto-utils');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const ENCRYPTION_KEY = process.env.MEMORIAL_ENCRYPTION_KEY;

// Validate encryption key
if (!isValidKey(ENCRYPTION_KEY)) {
  console.error('❌ ERROR: Invalid or missing MEMORIAL_ENCRYPTION_KEY in .env file');
  console.error('   The key must be exactly 64 hexadecimal characters (32 bytes).');
  console.error('   Generate one by running: node generate-key.js');
  process.exit(1);
}

/**
 * Prompts user for confirmation
 */
async function confirmAction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  This will PERMANENTLY encrypt personal data in your Firebase database.\n' +
      '   Have you created a backup? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Encrypts all markers in all cities
 */
async function encryptMarkers() {
  console.log('\n🔐 Encrypting markers...');
  let totalMarkers = 0;
  let totalEncrypted = 0;
  
  const cities = await db.collection('cities').get();
  
  for (const cityDoc of cities.docs) {
    const cityId = cityDoc.id;
    const markers = await db.collection(`cities/${cityId}/markers`).get();
    
    for (const markerDoc of markers.docs) {
      totalMarkers++;
      const data = markerDoc.data();
      
      // Skip if already encrypted
      if (data._encrypted) {
        console.log(`   ⏭️  Skipping already encrypted marker: ${markerDoc.id}`);
        continue;
      }
      
      try {
        // Encrypt sensitive fields
        const updates = {
          // Encrypted fields (with _encrypted suffix)
          contact_encrypted: encrypt(data.contact || '', ENCRYPTION_KEY),
          document_encrypted: encrypt(data.document || '', ENCRYPTION_KEY),
          description_encrypted: encrypt(data.description || '', ENCRYPTION_KEY),
          coordinates_encrypted: encryptCoordinates(data.lat || 0, data.lng || 0, ENCRYPTION_KEY),
          
          // Replace original sensitive fields with placeholders
          contact: '[ENCRYPTED]',
          document: '[ENCRYPTED]',
          description: '[ENCRYPTED - Para memorial]',
          lat: 0,
          lng: 0,
          
          // Keep non-sensitive data as-is:
          // - needs (object of boolean flags)
          // - status (string)
          // - createdAt (timestamp)
          // - adults, kids, elderly, pcd (numbers/boolean)
          // - isCityHall (boolean)
          // - images (array - consider encrypting URLs if they contain identifying info)
          
          // Mark as encrypted
          _encrypted: true,
          _encryptedAt: admin.firestore.FieldValue.serverTimestamp(),
          _encryptionVersion: '1.0'
        };
        
        // If images exist, clear them (or encrypt URLs if needed)
        if (data.images && data.images.length > 0) {
          updates.images = []; // Clear images for privacy
          updates.images_encrypted = encrypt(JSON.stringify(data.images), ENCRYPTION_KEY);
        }
        
        await markerDoc.ref.update(updates);
        totalEncrypted++;
        
        if (totalEncrypted % 10 === 0) {
          console.log(`   ✓ Encrypted ${totalEncrypted} markers so far...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to encrypt marker ${markerDoc.id}:`, error.message);
      }
    }
    
    console.log(`   ✓ Completed city: ${cityId} (${markers.size} markers)`);
  }
  
  console.log(`\n✅ Marker encryption complete: ${totalEncrypted}/${totalMarkers} encrypted`);
  return { total: totalMarkers, encrypted: totalEncrypted };
}

/**
 * Encrypts all user data
 */
async function encryptUsers() {
  console.log('\n🔐 Encrypting users...');
  let totalUsers = 0;
  let totalEncrypted = 0;
  
  const users = await db.collection('users').get();
  
  for (const userDoc of users.docs) {
    totalUsers++;
    const data = userDoc.data();
    
    // Skip if already encrypted
    if (data._encrypted) {
      console.log(`   ⏭️  Skipping already encrypted user: ${userDoc.id}`);
      continue;
    }
    
    try {
      const updates = {
        // Encrypted fields
        email_encrypted: encrypt(data.email || '', ENCRYPTION_KEY),
        name_encrypted: encrypt(data.name || '', ENCRYPTION_KEY),
        phoneNumber_encrypted: encrypt(data.phoneNumber || '', ENCRYPTION_KEY),
        
        // Replace with placeholders
        email: '[ENCRYPTED]',
        name: '[ENCRYPTED]',
        phoneNumber: '[ENCRYPTED]',
        
        // Keep role and city for statistics
        // role: data.role (unchanged)
        // city: data.city (unchanged)
        
        // Mark as encrypted
        _encrypted: true,
        _encryptedAt: admin.firestore.FieldValue.serverTimestamp(),
        _encryptionVersion: '1.0'
      };
      
      await userDoc.ref.update(updates);
      totalEncrypted++;
    } catch (error) {
      console.error(`   ❌ Failed to encrypt user ${userDoc.id}:`, error.message);
    }
  }
  
  console.log(`✅ User encryption complete: ${totalEncrypted}/${totalUsers} encrypted`);
  return { total: totalUsers, encrypted: totalEncrypted };
}

/**
 * Encrypts comments
 */
async function encryptComments() {
  console.log('\n🔐 Encrypting comments...');
  let totalComments = 0;
  let totalEncrypted = 0;
  
  const comments = await db.collection('comments').get();
  
  for (const commentDoc of comments.docs) {
    totalComments++;
    const data = commentDoc.data();
    
    // Skip if already encrypted
    if (data._encrypted) {
      console.log(`   ⏭️  Skipping already encrypted comment: ${commentDoc.id}`);
      continue;
    }
    
    try {
      const updates = {
        // Encrypt comment content and author info
        text_encrypted: encrypt(data.text || '', ENCRYPTION_KEY),
        author_encrypted: encrypt(data.author || data.userId || '', ENCRYPTION_KEY),
        
        // Replace with placeholders
        text: '[ENCRYPTED]',
        author: '[ENCRYPTED]',
        
        // Keep timestamp for statistics
        // timestamp: data.timestamp (unchanged)
        
        _encrypted: true,
        _encryptedAt: admin.firestore.FieldValue.serverTimestamp(),
        _encryptionVersion: '1.0'
      };
      
      await commentDoc.ref.update(updates);
      totalEncrypted++;
    } catch (error) {
      console.error(`   ❌ Failed to encrypt comment ${commentDoc.id}:`, error.message);
    }
  }
  
  console.log(`✅ Comment encryption complete: ${totalEncrypted}/${totalComments} encrypted`);
  return { total: totalComments, encrypted: totalEncrypted };
}

/**
 * Deletes audit/tracking collections
 */
async function deleteAuditLogs() {
  console.log('\n🗑️  Deleting audit logs...');
  
  const collectionsToDelete = ['userReads', 'userUpdates'];
  let totalDeleted = 0;
  
  for (const collectionName of collectionsToDelete) {
    try {
      const count = await deleteCollection(collectionName);
      totalDeleted += count;
      console.log(`   ✓ Deleted ${count} documents from ${collectionName}`);
    } catch (error) {
      console.error(`   ❌ Failed to delete ${collectionName}:`, error.message);
    }
  }
  
  console.log(`✅ Audit log deletion complete: ${totalDeleted} documents deleted`);
  return totalDeleted;
}

/**
 * Helper function to delete a collection
 */
async function deleteCollection(collectionPath, batchSize = 500) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject, 0);
  });
}

async function deleteQueryBatch(query, resolve, reject, totalDeleted) {
  try {
    const snapshot = await query.get();
    
    if (snapshot.size === 0) {
      return resolve(totalDeleted);
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    totalDeleted += snapshot.size;
    
    // Recurse on the next process tick
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject, totalDeleted);
    });
  } catch (error) {
    reject(error);
  }
}

/**
 * Creates memorial metadata
 */
async function createMemorialMetadata(stats) {
  console.log('\n📝 Creating memorial metadata...');
  
  await db.collection('_memorial').doc('info').set({
    status: 'encrypted',
    encryptedAt: admin.firestore.FieldValue.serverTimestamp(),
    encryptionVersion: '1.0',
    algorithm: 'AES-256-CBC',
    message: 'All personal data encrypted. Decryption key required for recovery.',
    purpose: 'Rebuild RS Memorial - Enchentes RS 2024',
    statistics: stats,
    instructions: 'See MEMORIAL.md for decryption instructions'
  });
  
  console.log('✅ Memorial metadata created');
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   REBUILD RS - MEMORIAL DATA ENCRYPTION SCRIPT             ║');
  console.log('║   Encrypting personal data while preserving statistics     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Confirm action
  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log('\n❌ Operation cancelled. Please create a backup first.');
    process.exit(0);
  }
  
  console.log('\n🚀 Starting encryption process...\n');
  
  try {
    // Encrypt data
    const markerStats = await encryptMarkers();
    const userStats = await encryptUsers();
    const commentStats = await encryptComments();
    
    // Delete audit logs
    const deletedLogs = await deleteAuditLogs();
    
    // Create memorial metadata
    await createMemorialMetadata({
      markers: markerStats,
      users: userStats,
      comments: commentStats,
      deletedAuditLogs: deletedLogs
    });
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ ENCRYPTION COMPLETE                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   • Markers encrypted: ${markerStats.encrypted}/${markerStats.total}`);
    console.log(`   • Users encrypted: ${userStats.encrypted}/${userStats.total}`);
    console.log(`   • Comments encrypted: ${commentStats.encrypted}/${commentStats.total}`);
    console.log(`   • Audit logs deleted: ${deletedLogs} documents`);
    console.log(`\n🔑 IMPORTANT: Keep your MEMORIAL_ENCRYPTION_KEY safe!`);
    console.log(`   Store it in multiple secure locations (offline preferred)`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Deploy read-only Firestore rules: firebase deploy --only firestore:rules`);
    console.log(`   2. Deploy read-only Storage rules: firebase deploy --only storage`);
    console.log(`   3. Test memorial access with encryption in place`);
    
  } catch (error) {
    console.error('\n❌ ENCRYPTION FAILED:', error);
    console.error('\nThe process may be incomplete. Check your Firebase console.');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
main();


