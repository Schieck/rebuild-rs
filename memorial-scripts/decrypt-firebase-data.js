/**
 * Decrypt Firebase Data Script
 * 
 * This script reverses the encryption process, restoring original personal data.
 * Only use this if you have a legal or legitimate need to access the original data.
 * 
 * ⚠️  WARNING: This permanently modifies your Firebase data!
 * Make sure you understand the implications before running this script.
 * 
 * Usage:
 *   node decrypt-firebase-data.js
 */

require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');
const { decrypt, decryptCoordinates, isValidKey } = require('./crypto-utils');
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
      '\n⚠️  This will PERMANENTLY decrypt and restore personal data.\n' +
      '   Are you sure you want to proceed? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Decrypts all markers in all cities
 */
async function decryptMarkers() {
  console.log('\n🔓 Decrypting markers...');
  let totalMarkers = 0;
  let totalDecrypted = 0;
  
  const cities = await db.collection('cities').get();
  
  for (const cityDoc of cities.docs) {
    const cityId = cityDoc.id;
    const markers = await db.collection(`cities/${cityId}/markers`).get();
    
    for (const markerDoc of markers.docs) {
      totalMarkers++;
      const data = markerDoc.data();
      
      // Skip if not encrypted
      if (!data._encrypted) {
        console.log(`   ⏭️  Skipping non-encrypted marker: ${markerDoc.id}`);
        continue;
      }
      
      try {
        // Decrypt coordinates
        const coords = decryptCoordinates(
          data.coordinates_encrypted,
          ENCRYPTION_KEY
        );
        
        // Decrypt images if they exist
        let images = [];
        if (data.images_encrypted) {
          try {
            const decryptedImagesJson = decrypt(data.images_encrypted, ENCRYPTION_KEY);
            images = JSON.parse(decryptedImagesJson);
          } catch (error) {
            console.warn(`   ⚠️  Failed to decrypt images for ${markerDoc.id}`);
          }
        }
        
        // Prepare updates
        const updates = {
          // Restore original fields
          contact: decrypt(data.contact_encrypted, ENCRYPTION_KEY),
          document: decrypt(data.document_encrypted, ENCRYPTION_KEY),
          description: decrypt(data.description_encrypted, ENCRYPTION_KEY),
          lat: coords.lat,
          lng: coords.lng,
          images: images,
          
          // Remove encrypted fields
          contact_encrypted: admin.firestore.FieldValue.delete(),
          document_encrypted: admin.firestore.FieldValue.delete(),
          description_encrypted: admin.firestore.FieldValue.delete(),
          coordinates_encrypted: admin.firestore.FieldValue.delete(),
          images_encrypted: admin.firestore.FieldValue.delete(),
          
          // Remove encryption metadata
          _encrypted: admin.firestore.FieldValue.delete(),
          _encryptedAt: admin.firestore.FieldValue.delete(),
          _encryptionVersion: admin.firestore.FieldValue.delete()
        };
        
        await markerDoc.ref.update(updates);
        totalDecrypted++;
        
        if (totalDecrypted % 10 === 0) {
          console.log(`   ✓ Decrypted ${totalDecrypted} markers so far...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to decrypt marker ${markerDoc.id}:`, error.message);
      }
    }
    
    console.log(`   ✓ Completed city: ${cityId} (${markers.size} markers)`);
  }
  
  console.log(`\n✅ Marker decryption complete: ${totalDecrypted}/${totalMarkers} decrypted`);
  return { total: totalMarkers, decrypted: totalDecrypted };
}

/**
 * Decrypts all user data
 */
async function decryptUsers() {
  console.log('\n🔓 Decrypting users...');
  let totalUsers = 0;
  let totalDecrypted = 0;
  
  const users = await db.collection('users').get();
  
  for (const userDoc of users.docs) {
    totalUsers++;
    const data = userDoc.data();
    
    // Skip if not encrypted
    if (!data._encrypted) {
      console.log(`   ⏭️  Skipping non-encrypted user: ${userDoc.id}`);
      continue;
    }
    
    try {
      const updates = {
        // Restore original fields
        email: decrypt(data.email_encrypted, ENCRYPTION_KEY),
        name: decrypt(data.name_encrypted, ENCRYPTION_KEY),
        phoneNumber: decrypt(data.phoneNumber_encrypted, ENCRYPTION_KEY),
        
        // Remove encrypted fields
        email_encrypted: admin.firestore.FieldValue.delete(),
        name_encrypted: admin.firestore.FieldValue.delete(),
        phoneNumber_encrypted: admin.firestore.FieldValue.delete(),
        
        // Remove encryption metadata
        _encrypted: admin.firestore.FieldValue.delete(),
        _encryptedAt: admin.firestore.FieldValue.delete(),
        _encryptionVersion: admin.firestore.FieldValue.delete()
      };
      
      await userDoc.ref.update(updates);
      totalDecrypted++;
    } catch (error) {
      console.error(`   ❌ Failed to decrypt user ${userDoc.id}:`, error.message);
    }
  }
  
  console.log(`✅ User decryption complete: ${totalDecrypted}/${totalUsers} decrypted`);
  return { total: totalUsers, decrypted: totalDecrypted };
}

/**
 * Decrypts comments
 */
async function decryptComments() {
  console.log('\n🔓 Decrypting comments...');
  let totalComments = 0;
  let totalDecrypted = 0;
  
  const comments = await db.collection('comments').get();
  
  for (const commentDoc of comments.docs) {
    totalComments++;
    const data = commentDoc.data();
    
    // Skip if not encrypted
    if (!data._encrypted) {
      console.log(`   ⏭️  Skipping non-encrypted comment: ${commentDoc.id}`);
      continue;
    }
    
    try {
      const updates = {
        // Restore original fields
        text: decrypt(data.text_encrypted, ENCRYPTION_KEY),
        author: decrypt(data.author_encrypted, ENCRYPTION_KEY),
        
        // Remove encrypted fields
        text_encrypted: admin.firestore.FieldValue.delete(),
        author_encrypted: admin.firestore.FieldValue.delete(),
        
        // Remove encryption metadata
        _encrypted: admin.firestore.FieldValue.delete(),
        _encryptedAt: admin.firestore.FieldValue.delete(),
        _encryptionVersion: admin.firestore.FieldValue.delete()
      };
      
      await commentDoc.ref.update(updates);
      totalDecrypted++;
    } catch (error) {
      console.error(`   ❌ Failed to decrypt comment ${commentDoc.id}:`, error.message);
    }
  }
  
  console.log(`✅ Comment decryption complete: ${totalDecrypted}/${totalComments} decrypted`);
  return { total: totalComments, decrypted: totalDecrypted };
}

/**
 * Updates memorial metadata
 */
async function updateMemorialMetadata(stats) {
  console.log('\n📝 Updating memorial metadata...');
  
  await db.collection('_memorial').doc('info').update({
    status: 'decrypted',
    decryptedAt: admin.firestore.FieldValue.serverTimestamp(),
    decryptionStatistics: stats
  });
  
  console.log('✅ Memorial metadata updated');
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   REBUILD RS - DATA DECRYPTION SCRIPT                      ║');
  console.log('║   Restoring encrypted personal data                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Confirm action
  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log('\n❌ Operation cancelled.');
    process.exit(0);
  }
  
  console.log('\n🚀 Starting decryption process...\n');
  
  try {
    // Decrypt data
    const markerStats = await decryptMarkers();
    const userStats = await decryptUsers();
    const commentStats = await decryptComments();
    
    // Update memorial metadata
    await updateMemorialMetadata({
      markers: markerStats,
      users: userStats,
      comments: commentStats
    });
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ DECRYPTION COMPLETE                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Summary:`);
    console.log(`   • Markers decrypted: ${markerStats.decrypted}/${markerStats.total}`);
    console.log(`   • Users decrypted: ${userStats.decrypted}/${userStats.total}`);
    console.log(`   • Comments decrypted: ${commentStats.decrypted}/${commentStats.total}`);
    console.log(`\n⚠️  WARNING: Personal data is now visible again!`);
    console.log(`   Remember to re-encrypt or implement proper access controls.`);
    
  } catch (error) {
    console.error('\n❌ DECRYPTION FAILED:', error);
    console.error('\nThe process may be incomplete. Check your Firebase console.');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
main();


