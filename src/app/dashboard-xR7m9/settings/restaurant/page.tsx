'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RestaurantForm } from '@/components/forms/RestaurantForm'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2, AlertCircle, Store } from 'lucide-react'
import { getRestaurant, updateRestaurant } from '@/lib/firebase/db'

interface Restaurant {
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

export default function RestaurantSettingsPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard-xR7m9/dashboard')
      return
    }
    fetchRestaurant()
  }, [currentUser, router])

  const fetchRestaurant = async () => {
    if (!currentUser) return
    
    try {
      const data = await getRestaurant(currentUser.restaurantId)
      if (data) {
        setRestaurant({
          name: data.name || '',
          slogan: data.slogan || '',
          logoUrl: data.logoUrl || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          openingHours: data.openingHours || '',
          location: data.location || { lat: 0, lng: 0 }
        })
      } else {
        // Si no hay datos del restaurante, crear objeto vacío
        setRestaurant({
          name: '',
          slogan: '',
          logoUrl: '',
          description: '',
          address: '',
          phone: '',
          openingHours: '',
          location: { lat: 0, lng: 0 }
        })
      }
    } catch (err: any) {
      // En caso de error, también crear objeto vacío para permitir edición
      setRestaurant({
        name: '',
        slogan: '',
        logoUrl: '',
        description: '',
        address: '',
        phone: '',
        openingHours: '',
        location: { lat: 0, lng: 0 }
      })
      console.error('Error loading restaurant:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Restaurant) => {
    if (!currentUser) return
    
    try {
      await updateRestaurant(currentUser.restaurantId, data)
      setSuccess('Información actualizada exitosamente')
      setTimeout(() => setSuccess(''), 3000)
      await fetchRestaurant()
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar información')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard-xR7m9/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Configuración del Restaurante</h1>
          <p className="text-gray-600">Administra la información de tu restaurante</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Store className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Identidad Visual</CardTitle>
          <CardDescription>
            Personaliza el nombre, logo y eslogan de tu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {restaurant && (
            <RestaurantForm
              restaurant={restaurant}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/dashboard-xR7m9/dashboard')}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
          <CardDescription>
            Datos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ID del Restaurante:</span>
            <span className="text-sm font-mono">{currentUser?.restaurantId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Plan:</span>
            <span className="text-sm">Básico</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Estado:</span>
            <span className="text-sm text-green-600">Activo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}