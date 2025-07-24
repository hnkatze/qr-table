import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';

// Firebase configuration - paste your actual values here temporarily
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// IMPORTANT: Update this with your restaurant ID
// Get it from: JSON.parse(localStorage.getItem('user')).restaurantId
const RESTAURANT_ID = 'restaurant_001'; // <-- UPDATE THIS!

const TEST_IMAGE_URL = 'https://res.cloudinary.com/djluqrprg/image/upload/v1753233963/qr-table/products/products/chai-caliente-1753233965497.png';

const categoriesData = [
  { name: 'Bebidas Calientes', icon: '☕', sortOrder: 1, isActive: true },
  { name: 'Bebidas Frías', icon: '🥤', sortOrder: 2, isActive: true },
  { name: 'Postres', icon: '🍰', sortOrder: 3, isActive: true },
  { name: 'Snacks', icon: '🥪', sortOrder: 4, isActive: true },
];

const productTemplates = {
  'Bebidas Calientes': [
    { name: 'Café Americano', description: 'Café negro clásico', price: 35 },
    { name: 'Cappuccino', description: 'Espresso con leche espumosa', price: 45 },
    { name: 'Latte', description: 'Café con leche cremoso', price: 50 },
    { name: 'Chocolate Caliente', description: 'Chocolate cremoso con malvaviscos', price: 55 },
  ],
  'Bebidas Frías': [
    { name: 'Frappé de Café', description: 'Café helado con crema', price: 60 },
    { name: 'Limonada Natural', description: 'Limonada fresca del día', price: 35 },
    { name: 'Té Helado', description: 'Té negro con hielo y limón', price: 40 },
    { name: 'Smoothie de Frutas', description: 'Mezcla de frutas tropicales', price: 65 },
  ],
  'Postres': [
    { name: 'Cheesecake', description: 'Tarta de queso con frutos rojos', price: 85 },
    { name: 'Brownie', description: 'Brownie de chocolate con helado', price: 75 },
    { name: 'Tiramisú', description: 'Postre italiano clásico', price: 90 },
    { name: 'Flan de Caramelo', description: 'Flan casero tradicional', price: 65 },
  ],
  'Snacks': [
    { name: 'Sandwich Club', description: 'Triple con pollo, tocino y vegetales', price: 95 },
    { name: 'Wrap de Pollo', description: 'Tortilla con pollo grillado', price: 85 },
    { name: 'Ensalada César', description: 'Lechuga, crutones, parmesano', price: 80 },
    { name: 'Nachos con Queso', description: 'Nachos con queso fundido y jalapeños', price: 70 },
  ],
};

async function seedData() {
  console.log('🌱 Starting seed process...');
  
  // Check if restaurant exists
  const restaurantRef = doc(db, 'restaurants', RESTAURANT_ID);
  const restaurantSnap = await getDoc(restaurantRef);
  
  if (!restaurantSnap.exists()) {
    console.error('❌ Restaurant not found! Please update RESTAURANT_ID in the script.');
    console.error('   Current ID:', RESTAURANT_ID);
    process.exit(1);
  }
  
  console.log('✅ Found restaurant:', restaurantSnap.data().name);
  
  const categoryMap = {};
  
  // Create categories
  console.log('\n📁 Creating categories...');
  for (const categoryData of categoriesData) {
    const docRef = await addDoc(collection(db, 'restaurants', RESTAURANT_ID, 'categories'), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    categoryMap[categoryData.name] = docRef.id;
    console.log(`✅ Created category: ${categoryData.name} (ID: ${docRef.id})`);
  }
  
  // Create products
  console.log('\n📦 Creating products...');
  let productCount = 0;
  
  for (const [categoryName, products] of Object.entries(productTemplates)) {
    const categoryId = categoryMap[categoryName];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      await addDoc(collection(db, 'restaurants', RESTAURANT_ID, 'products'), {
        categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: TEST_IMAGE_URL,
        isAvailable: true,
        sortOrder: i + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      productCount++;
      console.log(`✅ Created product: ${product.name} in ${categoryName}`);
    }
  }
  
  console.log('\n🎉 Seed completed successfully!');
  console.log(`📊 Summary: ${categoriesData.length} categories and ${productCount} products created`);
  
  console.log('\n📋 Category IDs for reference:');
  Object.entries(categoryMap).forEach(([name, id]) => {
    console.log(`   ${name}: ${id}`);
  });
  
  process.exit(0);
}

// Run the script
seedData().catch(console.error);