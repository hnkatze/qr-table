import { 
  createCategory, 
  createProduct,
  getRestaurant
} from '../src/lib/firebase/db'

// Restaurant ID - update this with your actual restaurant ID
const RESTAURANT_ID = 'your-restaurant-id-here'

// Test image URL
const TEST_IMAGE_URL = 'https://res.cloudinary.com/djluqrprg/image/upload/v1753233963/qr-table/products/products/chai-caliente-1753233965497.png'

// Categories to create
const categoriesData = [
  { name: 'Bebidas Calientes', icon: '☕', sortOrder: 1 },
  { name: 'Bebidas Frías', icon: '🥤', sortOrder: 2 },
  { name: 'Postres', icon: '🍰', sortOrder: 3 },
  { name: 'Snacks', icon: '🥪', sortOrder: 4 },
]

// Products template (we'll create 4 products per category)
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
}

async function seedTestData() {
  try {
    console.log('🌱 Starting seed process...')
    
    // First, verify the restaurant exists
    const restaurant = await getRestaurant(RESTAURANT_ID)
    if (!restaurant) {
      console.error('❌ Restaurant not found! Please update RESTAURANT_ID in the script.')
      return
    }
    
    console.log(`✅ Found restaurant: ${restaurant.name}`)
    
    // Create categories and store their IDs
    const categoryMap: Record<string, string> = {}
    
    console.log('\n📁 Creating categories...')
    for (const categoryData of categoriesData) {
      const categoryRef = await createCategory(RESTAURANT_ID, {
        ...categoryData,
        isActive: true
      })
      categoryMap[categoryData.name] = categoryRef.id
      console.log(`✅ Created category: ${categoryData.name} (ID: ${categoryRef.id})`)
    }
    
    // Create products for each category
    console.log('\n📦 Creating products...')
    let productCount = 0
    
    for (const [categoryName, products] of Object.entries(productTemplates)) {
      const categoryId = categoryMap[categoryName]
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        await createProduct(RESTAURANT_ID, {
          categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: TEST_IMAGE_URL,
          isAvailable: true,
          sortOrder: i + 1
        })
        productCount++
        console.log(`✅ Created product: ${product.name} in ${categoryName}`)
      }
    }
    
    console.log('\n🎉 Seed completed successfully!')
    console.log(`📊 Summary: ${categoriesData.length} categories and ${productCount} products created`)
    
    // Print category IDs for reference
    console.log('\n📋 Category IDs for reference:')
    Object.entries(categoryMap).forEach(([name, id]) => {
      console.log(`   ${name}: ${id}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  }
}

// Run the seed function
seedTestData()