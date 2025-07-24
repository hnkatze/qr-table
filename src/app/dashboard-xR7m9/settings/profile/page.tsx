'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfileForm } from '@/components/forms/ProfileForm'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2, AlertCircle, User, CheckCircle } from 'lucide-react'
import { verifyPassword, hashPassword } from '@/lib/auth/hash'
import { getUser, updateUser } from '@/lib/firebase/db'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user: currentUser, checkAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleBack = () => {
    if (currentUser?.role === 'admin') {
      router.push('/dashboard-xR7m9/dashboard')
    } else if (currentUser?.role === 'cashier') {
      router.push('/dashboard-xR7m9/cashier')
    } else if (currentUser?.role === 'waiter') {
      router.push('/dashboard-xR7m9/waiter')
    } else {
      router.push('/dashboard-xR7m9/login')
    }
  }

  const handleSubmit = async (data: any) => {
    if (!currentUser) return
    
    setError('')
    setSuccess('')
    
    try {
      // Obtener el usuario actual con su passwordHash
      const userData = await getUser(currentUser.restaurantId, currentUser.id)
      if (!userData) {
        throw new Error('Usuario no encontrado')
      }

      const updateData: any = {
        fullName: data.fullName,
      }

      // Si está cambiando la contraseña
      if (data.currentPassword && data.newPassword) {
        // Verificar contraseña actual
        const isValidPassword = await verifyPassword(data.currentPassword, userData.passwordHash)
        if (!isValidPassword) {
          throw new Error('La contraseña actual es incorrecta')
        }

        // Hashear nueva contraseña
        updateData.passwordHash = await hashPassword(data.newPassword)
      }

      // Actualizar usuario
      await updateUser(currentUser.restaurantId, currentUser.id, updateData)
      
      // Refrescar datos de sesión
      await checkAuth()
      
      setSuccess('Perfil actualizado exitosamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar perfil')
    }
  }

  if (!currentUser) {
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
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-gray-600">Administra tu información personal</p>
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
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información personal y contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              user={{
                username: currentUser.username,
                fullName: currentUser.fullName,
                role: currentUser.role,
              }}
              onSubmit={handleSubmit}
              onCancel={handleBack}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu cuenta en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ID de Usuario:</span>
              <span className="text-sm font-mono">{currentUser.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Restaurante:</span>
              <span className="text-sm font-mono">{currentUser.restaurantId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rol:</span>
              <span className="text-sm">
                {currentUser.role === 'admin' && 'Administrador'}
                {currentUser.role === 'cashier' && 'Cajero'}
                {currentUser.role === 'waiter' && 'Mesero'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tu actividad en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-600">
              <p>Último acceso: Hoy</p>
              <p>Sesión activa desde: {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}