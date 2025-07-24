'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Upload, X, Image, MapPin } from 'lucide-react'

interface RestaurantFormProps {
  restaurant: {
    name: string
    slogan?: string
    logoUrl?: string
    description: string
    address: string
    phone: string
    openingHours: string
    location?: {
      lat: number
      lng: number
    }
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function RestaurantForm({ restaurant, onSubmit, onCancel }: RestaurantFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState('')
  const [logoPreview, setLogoPreview] = useState(restaurant.logoUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    slogan: restaurant.slogan || '',
    logoUrl: restaurant.logoUrl || '',
    description: restaurant.description || '',
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    openingHours: restaurant.openingHours || '',
    location: restaurant.location || { lat: 0, lng: 0 },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones básicas
    if (!formData.name || formData.name.length < 3) {
      setError('El nombre del restaurante debe tener al menos 3 caracteres')
      return
    }

    if (!formData.address || formData.address.length < 10) {
      setError('La dirección debe ser más específica')
      return
    }

    if (!formData.phone || !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      setError('El teléfono no es válido')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Error al guardar la información')
      setLoading(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    setError('')

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('productName', 'restaurant-logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al subir el logo')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, logoUrl: data.url }))
      setLogoPreview(data.url)
    } catch (err: any) {
      setError(err.message || 'Error al subir el logo')
    } finally {
      setUploadingLogo(false)
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

      handleLogoUpload(file)
    }
  }

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }))
    setLogoPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
          setLoading(false)
        },
        (error) => {
          setError('No se pudo obtener la ubicación actual')
          setLoading(false)
        }
      )
    } else {
      setError('La geolocalización no está disponible en este navegador')
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Logo del Restaurante</Label>
        
        {!logoPreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading || uploadingLogo}
            />
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Logo del restaurante
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingLogo}
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar logo
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG o WEBP. Máximo 5MB. Recomendado: 200x200px
            </p>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={logoPreview}
              alt="Logo del restaurante"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={() => {
                setLogoPreview('')
                setFormData(prev => ({ ...prev, logoUrl: '' }))
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={removeLogo}
              disabled={loading || uploadingLogo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Restaurante</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Mi Restaurante"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slogan">Eslogan</Label>
        <Input
          id="slogan"
          type="text"
          value={formData.slogan}
          onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
          placeholder="El mejor sabor de la ciudad"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Un eslogan corto que aparecerá en el menú del cliente
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe tu restaurante..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Calle Principal #123, Ciudad"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+504 9999-9999"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingHours">Horario de Atención</Label>
        <Input
          id="openingHours"
          type="text"
          value={formData.openingHours}
          onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
          placeholder="Lun-Vie: 8:00 AM - 10:00 PM, Sáb-Dom: 9:00 AM - 11:00 PM"
          required
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Este horario se mostrará en el menú del cliente
        </p>
      </div>

      <div className="space-y-2">
        <Label>Ubicación GPS</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              step="0.000001"
              value={formData.location.lat}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, lat: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Latitud"
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              step="0.000001"
              value={formData.location.lng}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, lng: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Longitud"
              disabled={loading}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getCurrentLocation}
            disabled={loading}
            title="Obtener ubicación actual"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Ubicación GPS para validar que los clientes estén en el restaurante
        </p>
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
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  )
}