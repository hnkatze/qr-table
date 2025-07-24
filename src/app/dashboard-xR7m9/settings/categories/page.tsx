'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
}

export default function CategoriesSettingsPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard-xR7m9/dashboard')
      return
    }
    fetchCategories()
  }, [currentUser, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategories(data.categories)
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setShowDialog(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowDialog(true)
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar categoría')
      }
      
      await fetchCategories()
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar categoría')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedCategory 
        ? `/api/categories/${selectedCategory.id}`
        : '/api/categories'
      
      const response = await fetch(url, {
        method: selectedCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar categoría')
      }
      
      await fetchCategories()
      setShowDialog(false)
      setSelectedCategory(null)
    } catch (err: any) {
      throw err
    }
  }

  const getIcon = (iconEmoji: string) => {
    // Si es un emoji, lo mostramos directamente
    // Si no, mostramos un emoji por defecto
    return <span className="text-xl">{iconEmoji || '🍽️'}</span>
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
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-gray-600">Administra las categorías del menú</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categorías del Menú</CardTitle>
          <CardDescription>
            Lista de todas las categorías disponibles en el menú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Icono</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{getIcon(category.icon)}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoría' : 'Crear Categoría'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Modifica los datos de la categoría' 
                : 'Completa el formulario para crear una nueva categoría'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowDialog(false)
              setSelectedCategory(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? 
              Solo puedes eliminar categorías que no tengan productos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}