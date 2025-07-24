'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

interface ProfileFormProps {
  user: {
    username: string
    fullName: string
    role: string
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function ProfileForm({ user, onSubmit, onCancel }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validar nombre completo
    if (!formData.fullName || formData.fullName.length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres')
      return
    }

    // Si está cambiando la contraseña, validar
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Debes ingresar tu contraseña actual para cambiarla')
        return
      }

      if (!formData.newPassword || formData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    setLoading(true)
    try {
      const dataToSubmit: any = {
        fullName: formData.fullName,
      }

      // Solo incluir contraseña si se está cambiando
      if (formData.newPassword) {
        dataToSubmit.currentPassword = formData.currentPassword
        dataToSubmit.newPassword = formData.newPassword
      }

      await onSubmit(dataToSubmit)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil')
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      cashier: 'Cajero',
      waiter: 'Mesero',
    }
    return roles[role] || role
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          type="text"
          value={user.username}
          disabled
          className="bg-gray-50"
        />
        <p className="text-sm text-muted-foreground">
          El nombre de usuario no se puede cambiar
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Input
          id="role"
          type="text"
          value={getRoleLabel(user.role)}
          disabled
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Tu nombre completo"
          required
          disabled={loading}
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-4">Cambiar Contraseña</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          Deja los campos de contraseña en blanco si no deseas cambiarla
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