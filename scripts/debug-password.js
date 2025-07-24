// Debug script to test password hashing and verification
// Run with: node scripts/debug-password.js

const bcrypt = require('bcryptjs')

async function debugPassword() {
  const plainPassword = 'admin123'
  
  console.log('🔍 Password Debug Tool')
  console.log('=====================\n')
  
  // Generate a new hash
  const salt = await bcrypt.genSalt(10)
  const newHash = await bcrypt.hash(plainPassword, salt)
  
  console.log('Plain password:', plainPassword)
  console.log('New hash generated:', newHash)
  console.log('Hash length:', newHash.length)
  
  // Test verification with the new hash
  const verifyNew = await bcrypt.compare(plainPassword, newHash)
  console.log('\nVerifying with new hash:', verifyNew)
  
  // Test with some example hashes
  console.log('\n\n📋 Testing with different hash formats:')
  
  // If you have a hash from Firestore, paste it here to test
  const hashFromFirestore = '$2b$10$9lAyTc5ItlsOgVoPCo5sleRk0z2svZ/i/8cCUlL/kVlM2u'  // Replace this
  
  console.log('\nPaste your hash from Firestore in the script to test it.')
  console.log('Look for the "passwordHash" field in your Firestore document.')
  
  // Example of what a bcrypt hash should look like
  console.log('\n✅ A valid bcrypt hash should look like:')
  console.log('$2a$10$[22 character salt][31 character hash]')
  console.log('Total length: 60 characters')
  console.log('\nExample:', newHash)
}

debugPassword().catch(console.error)