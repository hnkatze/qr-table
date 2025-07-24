'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

const CATEGORY_ICONS = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Coffee', emoji: '☕' },
  { name: 'Utensils', emoji: '🍽️' },
  { name: 'Wine', emoji: '🍷' },
  { name: 'Beef', emoji: '🥩' },
  { name: 'Fish', emoji: '🐟' },
  { name: 'IceCream', emoji: '🍦' },
  { name: 'Cookie', emoji: '🍪' },
  { name: 'Hamburger', emoji: '🍔' },
  { name: 'Taco', emoji: '🌮' },
  { name: 'Salad', emoji: '🥗' },
  { name: 'Soup', emoji: '🍲' },
  { name: 'Bread', emoji: '🥖' },
  { name: 'Cake', emoji: '🍰' },
  { name: 'Beer', emoji: '🍺' },
  { name: 'Juice', emoji: '🥤' },
]

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    icon: string
    sortOrder: number
    isActive: boolean
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: category?.name || '',
    icon: category?.icon || 'Utensils',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Error al guardar categoría')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Bebidas, Platos principales, Postres"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Icono</Label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_ICONS.map(({ name, emoji }) => (
            <button
              key={name}
              type="button"
              onClick={() => setFormData({ ...formData, icon: emoji })}
              disabled={loading}
              className={`p-3 rounded-lg border-2 transition-colors text-2xl ${
                formData.icon === emoji
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={name}
            >
              {emoji}
            </button>
          ))}
        </div>
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
          Las categorías se mostrarán ordenadas por este número (menor a mayor)
        </p>
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
          Categoría activa
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
            category ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  )
}