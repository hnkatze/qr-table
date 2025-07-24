import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log('Hash verification debug:', {
    passwordLength: password?.length,
    hashLength: hash?.length,
    hashFormat: hash?.substring(0, 7), // Show hash format ($2a$10$)
    isValidHashFormat: hash?.startsWith('$2') && hash?.length === 60
  })
  
  if (!password || !hash) {
    console.error('Missing password or hash')
    return false
  }
  
  try {
    const result = await bcrypt.compare(password, hash)
    return result
  } catch (error) {
    console.error('Error comparing password:', error)
    return false
  }
}

export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}