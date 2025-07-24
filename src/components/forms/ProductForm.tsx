'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertCircle, Upload, X, Image } from 'lucide-react'

interface ProductFormProps {
  product?: {
    id: string
    categoryId: string
    name: string
    description?: string
    price: number
    imageUrl?: string
    isAvailable: boolean
    sortOrder: number
  }
  categories: Array<{
    id: string
    name: string
  }>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, categories, onSubmit, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    categoryId: product?.categoryId || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    imageUrl: product?.imageUrl || '',
    isAvailable: product?.isAvailable ?? true,
    sortOrder: product?.sortOrder || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.categoryId) {
      setError('Debe seleccionar una categoría')
      return
    }

    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Error al guardar producto')
      setLoading(false)
    }
  }

  const formatPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2)
    }
    return numericValue
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setError('')

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('productName', formData.name || 'product')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al subir la imagen')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, imageUrl: data.url }))
      setImagePreview(data.url)
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. Máximo 5MB')
        return
      }

      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Tipo de archivo no válido. Solo se permiten JPG, PNG y WEBP')
        return
      }

      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          disabled={loading}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Hamburguesa clásica"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ej: Carne de res, lechuga, tomate, queso cheddar..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Precio (L.)</Label>
        <Input
          id="price"
          type="text"
          value={formData.price || ''}
          onChange={(e) => {
            const formatted = formatPrice(e.target.value)
            setFormData({ ...formData, price: parseFloat(formatted) || 0 })
          }}
          placeholder="0.00"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagen del producto</Label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading || uploadingImage}
            />
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arrastra una imagen aquí o
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar imagen
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG o WEBP. Máximo 5MB.
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-lg border"
              onError={() => {
                setImagePreview('')
                setFormData(prev => ({ ...prev, imageUrl: '' }))
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={loading || uploadingImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Orden de visualización</Label>
        <Input
          id="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min="0"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Los productos se mostrarán ordenados por este número dentro de su categoría
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isAvailable" className="text-sm font-normal">
          Producto disponible
        </Label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            product ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  )
}