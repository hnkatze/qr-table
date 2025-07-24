import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createUserSchema } from '@/lib/validations'
import { createUser, getUsers } from '@/lib/firebase/db'
import { hashPassword } from '@/lib/auth/hash'

// GET /api/users - Listar usuarios
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const users = await getUsers(user.restaurantId)
      
      // Remove password hash from response
      const sanitizedUsers = users.map(({ passwordHash, ...rest }) => rest)
      
      return NextResponse.json({ users: sanitizedUsers })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      )
    }
  }, ['admin'])
}

// POST /api/users - Crear usuario
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json()
      console.log('Received body:', body)
      
      // Validate data
      const validation = createUserSchema.safeParse(body)
      if (!validation.success) {
        console.log('Validation errors:', validation.error.flatten())
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.flatten() },
          { status: 400 }
        )
      }
      
      const data = validation.data
      
      // Check if username already exists
      const existingUsers = await getUsers(user.restaurantId)
      const userExists = existingUsers.some(u => u.username === data.username)
      
      if (userExists) {
        return NextResponse.json(
          { error: 'El nombre de usuario ya existe' },
          { status: 400 }
        )
      }
      
      // Hash password
      const passwordHash = await hashPassword(data.password)
      
      // Create user
      const { password, ...userData } = data
      const docRef = await createUser(user.restaurantId, {
        ...userData,
        passwordHash,
        restaurantId: user.restaurantId,
      })
      
      return NextResponse.json({
        message: 'Usuario creado exitosamente',
        userId: docRef.id,
      }, { status: 201 })
    } catch (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      )
    }
  }, ['admin'])
}