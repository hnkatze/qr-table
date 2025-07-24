'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

interface UserFormProps {
  user?: {
    id: string
    username: string
    fullName: string
    role: 'admin' | 'cashier' | 'waiter'
    isActive: boolean
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'waiter',
    isActive: user?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match if creating new user or changing password
    if (!user || formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
    }

    // Validate required fields for new user
    if (!user && !formData.password) {
      setError('La contraseña es requerida para crear un usuario')
      return
    }

    setLoading(true)
    try {
      const dataToSubmit = {
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password && { password: formData.password }),
      }
      
      await onSubmit(dataToSubmit)
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="usuario@ejemplo.com"
          required
          disabled={loading || !!user}
        />
        {user && (
          <p className="text-sm text-muted-foreground">
            El nombre de usuario no se puede cambiar
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Juan Pérez"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select
          value={formData.role}
          onValueChange={(value: any) => setFormData({ ...formData, role: value })}
          disabled={loading}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="cashier">Cajero</SelectItem>
            <SelectItem value="waiter">Mesero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {user ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          required={!user}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="••••••••"
          required={!user || !!formData.password}
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isActive" className="text-sm font-normal">
          Usuario activo
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
            user ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  )
}