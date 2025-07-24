import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/api/middleware'
import { createCategorySchema } from '@/lib/validations'
import { createCategory, getAllCategories } from '@/lib/firebase/db'

// GET /api/categories - Listar todas las categorías
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const categories = await getAllCategories(user.restaurantId)
      
      return NextResponse.json({ categories })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Error al obtener categorías' },
        { status: 500 }
      )
    }
  })
}

// POST /api/categories - Crear categoría
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    return withValidation(request, createCategorySchema, async (req, data) => {
      try {
        // Check if category name already exists
        const existingCategories = await getAllCategories(user.restaurantId)
        const categoryExists = existingCategories.some(
          c => c.name.toLowerCase() === data.name.toLowerCase()
        )
        
        if (categoryExists) {
          return NextResponse.json(
            { error: 'Ya existe una categoría con ese nombre' },
            { status: 400 }
          )
        }
        
        // Get next sort order
        const maxSortOrder = Math.max(
          0,
          ...existingCategories.map(c => c.sortOrder || 0)
        )
        
        const docRef = await createCategory(user.restaurantId, {
          ...data,
          sortOrder: data.sortOrder ?? maxSortOrder + 1,
        })
        
        return NextResponse.json({
          message: 'Categoría creada exitosamente',
          categoryId: docRef.id,
        }, { status: 201 })
      } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
          { error: 'Error al crear categoría' },
          { status: 500 }
        )
      }
    })
  }, ['admin'])
}