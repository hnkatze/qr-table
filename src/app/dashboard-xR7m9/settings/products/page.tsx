'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductForm } from '@/components/forms/ProductForm'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface Product {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  sortOrder: number
}

interface Category {
  id: string
  name: string
}

export default function ProductsSettingsPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard-xR7m9/dashboard')
      return
    }
    fetchData()
  }, [currentUser, router])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])
      
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar datos')
      }
      
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      
      setProducts(productsData.products)
      setCategories(categoriesData.categories)
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setShowDialog(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowDialog(true)
  }

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar producto')
      }
      
      await fetchData()
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar producto')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedProduct 
        ? `/api/products/${selectedProduct.id}`
        : '/api/products'
      
      const response = await fetch(url, {
        method: selectedProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar producto')
      }
      
      await fetchData()
      setShowDialog(false)
      setSelectedProduct(null)
    } catch (err: any) {
      throw err
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sin categoría'
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
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-600">Administra los productos del menú</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
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
          <CardTitle>Productos del Menú</CardTitle>
          <CardDescription>
            Lista de todos los productos disponibles en el menú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>L. {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                      {product.isAvailable ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(product.id)}
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
              {selectedProduct ? 'Editar Producto' : 'Crear Producto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Modifica los datos del producto' 
                : 'Completa el formulario para crear un nuevo producto'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct || undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowDialog(false)
              setSelectedProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
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