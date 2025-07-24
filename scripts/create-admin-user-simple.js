// Simple script to create admin user - alternative approach
// Run with: node scripts/create-admin-user-simple.js

const bcrypt = require('bcryptjs')

async function generateAdminData() {
  const password = 'admin123'
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)
  
  const adminUser = {
    username: 'admin@restaurant.com',
    passwordHash: passwordHash,
    role: 'admin',
    restaurantId: 'restaurant_001',
    fullName: 'Administrador',
    isActive: true
  }

  console.log('\n📋 Admin User Data for Firestore:')
  console.log('================================\n')
  console.log('Collection Path: restaurants/restaurant_001/users\n')
  console.log('Document data to add:')
  console.log(JSON.stringify(adminUser, null, 2))
  
  console.log('\n\n⚠️  IMPORTANT: The password field MUST be named "passwordHash" in Firestore!')
  console.log('\n📝 Steps to add manually:')
  console.log('1. Go to Firebase Console: https://console.firebase.google.com')
  console.log('2. Select your project: nitri-539b5')
  console.log('3. Go to Firestore Database')
  console.log('4. Create collection: restaurants')
  console.log('5. Create document with ID: restaurant_001')
  console.log('6. Inside that document, create subcollection: users')
  console.log('7. Add a document with the data above')
  
  console.log('\n\n🔐 Login Credentials:')
  console.log('====================')
  console.log('URL: http://localhost:3000/dashboard-xR7m9/login')
  console.log('Restaurant ID: restaurant_001')
  console.log('Username: admin@restaurant.com')
  console.log('Password: admin123')
  console.log('\n⚠️  IMPORTANT: Change the password after first login!')
}

generateAdminData().catch(console.error)