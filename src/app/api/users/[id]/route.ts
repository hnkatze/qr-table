import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/api/middleware'
import { updateUserSchema } from '@/lib/validations'
import { getUser, updateUser, deleteUser } from '@/lib/firebase/db'
import { hashPassword } from '@/lib/auth/hash'

// GET /api/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const userData = await getUser(user.restaurantId, id)
      
      if (!userData) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      
      // Remove password hash from response
      const { passwordHash, ...sanitizedUser } = userData
      
      return NextResponse.json({ user: sanitizedUser })
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Error al obtener usuario' },
        { status: 500 }
      )
    }
  }, ['admin'])
}

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    return withValidation(request, updateUserSchema, async (req, data) => {
      try {
        const userData = await getUser(user.restaurantId, id)
        
        if (!userData) {
          return NextResponse.json(
            { error: 'Usuario no encontrado' },
            { status: 404 }
          )
        }
        
        // Prepare update data
        const updateData: any = { ...data }
        
        // Hash password if provided
        if (data.password) {
          updateData.passwordHash = await hashPassword(data.password)
          delete updateData.password
        }
        
        await updateUser(user.restaurantId, id, updateData)
        
        return NextResponse.json({
          message: 'Usuario actualizado exitosamente',
        })
      } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
          { error: 'Error al actualizar usuario' },
          { status: 500 }
        )
      }
    })
  }, ['admin'])
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return withAuth(request, async (req, user) => {
    try {
      const userData = await getUser(user.restaurantId, id)
      
      if (!userData) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      
      // Prevent deleting own account
      if (userData.id === user.id) {
        return NextResponse.json(
          { error: 'No puede eliminar su propia cuenta' },
          { status: 400 }
        )
      }
      
      await deleteUser(user.restaurantId, id)
      
      return NextResponse.json({
        message: 'Usuario eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      )
    }
  }, ['admin'])
}