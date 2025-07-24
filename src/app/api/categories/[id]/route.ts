import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/api/middleware'
import { updateCategorySchema } from '@/lib/validations'
import { getCategory, updateCategory, deleteCategory, getProductsByCategory } from '@/lib/firebase/db'

// GET /api/categories/[id] - Obtener categoría específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const category = await getCategory(user.restaurantId, id)
      
      if (!category) {
        return NextResponse.json(
          { error: 'Categoría no encontrada' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ category })
    } catch (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { error: 'Error al obtener categoría' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/categories/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    return withValidation(request, updateCategorySchema, async (req, data) => {
      try {
        const category = await getCategory(user.restaurantId, id)
        
        if (!category) {
          return NextResponse.json(
            { error: 'Categoría no encontrada' },
            { status: 404 }
          )
        }
        
        await updateCategory(user.restaurantId, id, data)
        
        return NextResponse.json({
          message: 'Categoría actualizada exitosamente',
        })
      } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
          { error: 'Error al actualizar categoría' },
          { status: 500 }
        )
      }
    })
  }, ['admin'])
}

// DELETE /api/categories/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const category = await getCategory(user.restaurantId, id)
      
      if (!category) {
        return NextResponse.json(
          { error: 'Categoría no encontrada' },
          { status: 404 }
        )
      }
      
      // Check if category has products
      const products = await getProductsByCategory(user.restaurantId, id)
      
      if (products.length > 0) {
        return NextResponse.json(
          { error: 'No se puede eliminar una categoría que tiene productos' },
          { status: 400 }
        )
      }
      
      await deleteCategory(user.restaurantId, id)
      
      return NextResponse.json({
        message: 'Categoría eliminada exitosamente',
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: 'Error al eliminar categoría' },
        { status: 500 }
      )
    }
  }, ['admin'])
}