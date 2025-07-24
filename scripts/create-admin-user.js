// Script to create an initial admin user
// Run with: node scripts/create-admin-user.js

const bcrypt = require('bcryptjs')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } = require('firebase/firestore')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Validate configuration
console.log('🔍 Checking Firebase configuration...')
const missingVars = []
if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY')
if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '))
  console.log('Make sure your .env.local file contains all Firebase configuration')
  process.exit(1)
}

console.log('✅ Firebase configuration found')
console.log('Project ID:', firebaseConfig.projectId)

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createAdminUser() {
  // Default admin credentials
  const adminUser = {
    username: 'admin@restaurant.com',
    password: 'admin123', // Change this in production!
    passwordHash: '',
    role: 'admin',
    restaurantId: 'restaurant_001',
    fullName: 'Administrador',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10)
  adminUser.passwordHash = await bcrypt.hash(adminUser.password, salt)
  
  // Remove plain password
  delete adminUser.password

  try {
    console.log('\n📁 Working with collection: restaurants/' + adminUser.restaurantId + '/users')
    
    // Check if admin user already exists
    const usersRef = collection(db, 'restaurants', adminUser.restaurantId, 'users')
    console.log('🔍 Checking if user already exists...')
    
    const q = query(usersRef, where('username', '==', adminUser.username))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      console.log('\n❌ Admin user already exists!')
      console.log('Username:', adminUser.username)
      return
    }
    
    // Create the admin user in Firestore
    console.log('\n📤 Creating admin user in Firebase...')
    
    const docRef = await addDoc(usersRef, {
      ...adminUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('\n✅ Admin user created successfully!')
    console.log('Document ID:', docRef.id)
    console.log('\n🔐 Login credentials:')
    console.log('URL: http://localhost:3000/dashboard-xR7m9/login')
    console.log('Restaurant ID:', adminUser.restaurantId)
    console.log('Username:', adminUser.username)
    console.log('Password: admin123')
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    console.log('\nMake sure:')
    console.log('1. Your Firebase credentials in .env.local are correct')
    console.log('2. Firestore is enabled in your Firebase project')
    console.log('3. You have internet connection')
  }
}

// Add a delay before exit to see all logs
createAdminUser()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })