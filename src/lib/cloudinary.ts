import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Validar si una URL es de Cloudinary
export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'res.cloudinary.com' && 
           urlObj.pathname.includes(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)
  } catch {
    return false
  }
}

// Generar nombre único para las imágenes
export function generateImageName(productName: string): string {
  const timestamp = Date.now()
  const sanitized = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30)
  
  return `products/${sanitized}-${timestamp}`
}