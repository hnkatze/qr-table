import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/api/middleware'
import { createProductSchema } from '@/lib/validations'
import { getProduct, updateProduct, deleteProduct } from '@/lib/firebase/db'
import { isCloudinaryUrl } from '@/lib/cloudinary'

// Temporal mientras se reinicia el servidor
const updateProductSchema = createProductSchema.partial()

// GET /api/products/[id] - Obtener producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const product = await getProduct(user.restaurantId, id)
      
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ product })
    } catch (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json(
        { error: 'Error al obtener producto' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    return withValidation(request, updateProductSchema, async (req, data) => {
      try {
        // Validate image URL if provided
        if (data.imageUrl && !isCloudinaryUrl(data.imageUrl)) {
          return NextResponse.json(
            { error: 'La imagen debe ser subida a través del sistema' },
            { status: 400 }
          )
        }
        
        const product = await getProduct(user.restaurantId, id)
        
        if (!product) {
          return NextResponse.json(
            { error: 'Producto no encontrado' },
            { status: 404 }
          )
        }
        
        await updateProduct(user.restaurantId, id, data)
        
        return NextResponse.json({
          message: 'Producto actualizado exitosamente',
        })
      } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
          { error: 'Error al actualizar producto' },
          { status: 500 }
        )
      }
    })
  }, ['admin'])
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const product = await getProduct(user.restaurantId, id)
      
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }
      
      await deleteProduct(user.restaurantId, id)
      
      return NextResponse.json({
        message: 'Producto eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Error al eliminar producto' },
        { status: 500 }
      )
    }
  }, ['admin'])
}