import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const TOKEN_NAME = 'qr-table-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Convert string secret to Uint8Array for jose
const getJwtSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET)
}

export interface SessionUser {
  id: string
  username: string
  role: 'admin' | 'cashier' | 'waiter'
  restaurantId: string
  fullName: string
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey())
  
  const cookieStore = await cookies()
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  }
  
  cookieStore.set(TOKEN_NAME, token, cookieOptions)
  
  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)
  
  if (!token) {
    return null
  }
  
  try {
    const { payload } = await jwtVerify(token.value, getJwtSecretKey())
    return payload as SessionUser
  } catch (error) {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())
    
    // Extract user data from payload
    const userData: SessionUser = {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as 'admin' | 'cashier' | 'waiter',
      restaurantId: payload.restaurantId as string,
      fullName: payload.fullName as string,
    }
    
    // Check if all required fields are present
    if (!userData.id || !userData.username || !userData.role || !userData.restaurantId || !userData.fullName) {
      return null
    }
    
    return userData
  } catch (error) {
    return null
  }
}