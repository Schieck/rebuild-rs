# Memorial Scripts

Scripts to transform Rebuild RS into a read-only memorial with encrypted personal data.

## Quick Start

### 1. Setup

```bash
npm install
```

Get your Firebase service account key:
- Firebase Console → Project Settings → Service Accounts
- Generate New Private Key → Save as `serviceAccountKey.json` in **project root**

### 2. Generate Encryption Key

```bash
npm run generate-key
```

Copy the key and create `.env` in **project root**:

```bash
MEMORIAL_ENCRYPTION_KEY=your_64_character_hex_key_here
```

**⚠️ Store this key safely! Without it, data cannot be decrypted.**

### 3. Backup Database

```bash
cd ..
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
```

### 4. Encrypt Data

```bash
npm run encrypt
```

Encrypts: contacts, documents, coordinates, descriptions, user emails/names, comments  
Preserves: needs, status, timestamps, counts, roles  
Deletes: audit logs (userReads, userUpdates)

### 5. Deploy Read-Only Rules

```bash
cd ..
firebase deploy --only firestore:rules,storage
```

The Firestore rules in `src/config/firestore.rules` should be:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Scripts

- `npm run generate-key` - Generate encryption key
- `npm run encrypt` - Encrypt all personal data
- `npm run decrypt` - Decrypt data (emergency only)

## What Gets Encrypted

**Personal Data (Tier 1):**
- Contact names/phone numbers
- Document/ID numbers
- GPS coordinates
- Request descriptions
- User emails/names/phones
- Comments

**Preserved Public Data (Tier 2):**
- Needs categories (food, water, shelter)
- Status (pending, completed)
- Timestamps
- Household counts
- City data
- Roles

## Security

- **Algorithm:** AES-256-CBC
- **Format:** `iv:encryptedData` (hex)
- **Key:** 256-bit (64 hex chars)

## Verification

After deployment:
- ✅ Can view map and statistics
- ❌ Cannot create new requests
- ❌ Cannot modify data
- Check `_memorial/info` document in Firebase Console

## Recovery

Only decrypt if legally required:

```bash
npm run decrypt
```

**Warning:** This permanently restores personal data.

## Troubleshooting

**Invalid encryption key:**
- Must be exactly 64 hex characters
- Place `.env` in project root (not memorial-scripts/)

**Firebase Admin error:**
- Verify `serviceAccountKey.json` is in project root
- Check service account has Firestore permissions

**Deploy error:**
- Ensure `firebase.json` includes firestore and storage rules configuration
- Run from project root, not memorial-scripts/

## File Structure

```
rebuild-rs/
├── .env                           ← Your encryption key
├── serviceAccountKey.json         ← Firebase admin key
├── storage.rules                  ← Read-only storage rules
├── firebase.json                  ← Includes rules config
├── src/config/firestore.rules     ← Update to read-only
└── memorial-scripts/
    ├── crypto-utils.js            ← Encryption utilities
    ├── encrypt-firebase-data.js   ← Main script
    ├── decrypt-firebase-data.js   ← Recovery script
    ├── generate-key.js            ← Key generator
    └── package.json               ← Dependencies
```

## Support

All scripts skip already-encrypted data, so re-running is safe.

Store your encryption key in multiple secure locations:
- Password manager
- Physical paper in safe
- Encrypted USB drive

**If you lose the key, encrypted data cannot be recovered.**
