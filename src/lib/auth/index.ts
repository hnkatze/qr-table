import { getUserByUsername } from '@/lib/firebase/db'
import { verifyPassword } from './hash'
import { createSession, getSession, deleteSession, SessionUser } from './session'

export interface LoginCredentials {
  username: string
  password: string
  restaurantId: string
}

export async function login(credentials: LoginCredentials): Promise<SessionUser | null> {
  const { username, password, restaurantId } = credentials
  
  // Get user from Firestore
  const user = await getUserByUsername(restaurantId, username)
  
  if (!user || !user.isActive) {
    return null
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash)
  
  if (!isValidPassword) {
    return null
  }
  
  // Create session
  const sessionUser: SessionUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    restaurantId: user.restaurantId,
    fullName: user.fullName,
  }
  
  try {
    await createSession(sessionUser)
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
  
  return sessionUser
}

export async function logout(): Promise<void> {
  await deleteSession()
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return await getSession()
}

export function hasRole(user: SessionUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, ['admin'])
}

export function isCashier(user: SessionUser | null): boolean {
  return hasRole(user, ['cashier', 'admin'])
}

export function isWaiter(user: SessionUser | null): boolean {
  return hasRole(user, ['waiter', 'admin'])
}

export function isStaff(user: SessionUser | null): boolean {
  return hasRole(user, ['admin', 'cashier', 'waiter'])
}