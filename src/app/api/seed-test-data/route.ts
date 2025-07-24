import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createCategory, createProduct } from '@/lib/firebase/db'

const TEST_IMAGE_URL = 'https://res.cloudinary.com/djluqrprg/image/upload/v1753233963/qr-table/products/products/chai-caliente-1753233965497.png'

const categoriesData = [
  { name: 'Bebidas Calientes', icon: '☕', sortOrder: 1, isActive: true },
  { name: 'Bebidas Frías', icon: '🥤', sortOrder: 2, isActive: true },
  { name: 'Postres', icon: '🍰', sortOrder: 3, isActive: true },
  { name: 'Snacks', icon: '🥪', sortOrder: 4, isActive: true },
]

const productTemplates: Record<string, Array<{name: string, description: string, price: number}>> = {
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

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Only allow admin users to seed data
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Solo administradores pueden ejecutar este comando' },
          { status: 403 }
        )
      }

      const categoryMap: Record<string, string> = {}
      const results = {
        categories: [] as any[],
        products: [] as any[]
      }

      // Create categories
      for (const categoryData of categoriesData) {
        const categoryRef = await createCategory(user.restaurantId, categoryData)
        categoryMap[categoryData.name] = categoryRef.id
        results.categories.push({
          id: categoryRef.id,
          name: categoryData.name,
          icon: categoryData.icon
        })
      }

      // Create products for each category
      for (const [categoryName, products] of Object.entries(productTemplates)) {
        const categoryId = categoryMap[categoryName]
        
        for (let i = 0; i < products.length; i++) {
          const product = products[i]
          const productRef = await createProduct(user.restaurantId, {
            categoryId,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: TEST_IMAGE_URL,
            isAvailable: true,
            sortOrder: i + 1
          })
          
          results.products.push({
            id: productRef.id,
            name: product.name,
            category: categoryName,
            price: product.price
          })
        }
      }

      return NextResponse.json({
        message: 'Datos de prueba creados exitosamente',
        summary: {
          categoriesCreated: results.categories.length,
          productsCreated: results.products.length
        },
        data: results
      })
    } catch (error) {
      console.error('Error seeding test data:', error)
      return NextResponse.json(
        { error: 'Error al crear datos de prueba' },
        { status: 500 }
      )
    }
  }, ['admin'])
}