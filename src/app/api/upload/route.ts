import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import cloudinary, { generateImageName } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const productName = formData.get('productName') as string

      if (!file) {
        return NextResponse.json(
          { error: 'No se proporcionó ningún archivo' },
          { status: 400 }
        )
      }

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WEBP' },
          { status: 400 }
        )
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'El archivo es demasiado grande. Máximo 5MB' },
          { status: 400 }
        )
      }

      // Convertir archivo a buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Subir a Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'qr-table/products',
            public_id: generateImageName(productName || 'product'),
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )

        uploadStream.end(buffer)
      })

      const uploadResult = result as any

      return NextResponse.json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      })
    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Error al subir la imagen' },
        { status: 500 }
      )
    }
  }, ['admin'])
}