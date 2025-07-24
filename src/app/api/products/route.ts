import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/api/middleware'
import { createProductSchema } from '@/lib/validations'
import { createProduct, getAllProductsAdmin } from '@/lib/firebase/db'
import { isCloudinaryUrl } from '@/lib/cloudinary'

// GET /api/products - Listar todos los productos
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const products = await getAllProductsAdmin(user.restaurantId)
      
      return NextResponse.json({ products })
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Error al obtener productos' },
        { status: 500 }
      )
    }
  })
}

// POST /api/products - Crear producto
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    return withValidation(request, createProductSchema, async (req, data) => {
      try {
        // Validate image URL if provided
        if (data.imageUrl && !isCloudinaryUrl(data.imageUrl)) {
          return NextResponse.json(
            { error: 'La imagen debe ser subida a través del sistema' },
            { status: 400 }
          )
        }
        
        // Check if product name already exists in the same category
        const existingProducts = await getAllProductsAdmin(user.restaurantId)
        const productExists = existingProducts.some(
          p => p.categoryId === data.categoryId && 
               p.name.toLowerCase() === data.name.toLowerCase()
        )
        
        if (productExists) {
          return NextResponse.json(
            { error: 'Ya existe un producto con ese nombre en la categoría' },
            { status: 400 }
          )
        }
        
        // Get next sort order for the category
        const categoryProducts = existingProducts.filter(p => p.categoryId === data.categoryId)
        const maxSortOrder = Math.max(
          0,
          ...categoryProducts.map(p => p.sortOrder || 0)
        )
        
        const docRef = await createProduct(user.restaurantId, {
          ...data,
          sortOrder: data.sortOrder ?? maxSortOrder + 1,
        })
        
        return NextResponse.json({
          message: 'Producto creado exitosamente',
          productId: docRef.id,
        }, { status: 201 })
      } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
          { error: 'Error al crear producto' },
          { status: 500 }
        )
      }
    })
  }, ['admin'])
}