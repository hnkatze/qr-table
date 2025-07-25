"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { MapPin, Clock, ShoppingCart, Plus, Minus, AlertCircle, Loader2, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRestaurant, getCategories, getProductsByCategory, createOrder, generateOrderNumber, checkTableHasActiveOrder } from "@/lib/firebase/db"
import type { Restaurant, Category, Product } from "@/lib/firebase/db"
import { Timestamp } from 'firebase/firestore'


interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function MenuPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const restaurantId = params.restaurantId as string
  const tableFromUrl = searchParams.get('table') || ''
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [tableNumber, setTableNumber] = useState(tableFromUrl)
  const [customerName, setCustomerName] = useState('')
  const [isLocationValid, setIsLocationValid] = useState<boolean | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [tableHasActiveOrder, setTableHasActiveOrder] = useState(false)
  const [checkingTable, setCheckingTable] = useState(true)
  
  // Firebase data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<(Category & { id: string })[]>([])
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load restaurant data and categories
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        
        // Load restaurant info
        const restaurantData = await getRestaurant(restaurantId)
        if (!restaurantData) {
          setError('Restaurante no encontrado')
          return
        }
        setRestaurant(restaurantData)
        
        // Load categories
        const categoriesData = await getCategories(restaurantId)
        setCategories(categoriesData)
        
        // Set first category as default
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }
        
        // Check location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              const distance = Math.sqrt(
                Math.pow(latitude - restaurantData.location.lat, 2) + 
                Math.pow(longitude - restaurantData.location.lng, 2)
              )
              setIsLocationValid(distance < 0.005)
            },
            () => {
              setIsLocationValid(false)
            }
          )
        }
        
        // Check if table has active order
        if (tableFromUrl) {
          const hasOrder = await checkTableHasActiveOrder(restaurantId, tableFromUrl)
          setTableHasActiveOrder(hasOrder)
        }
        setCheckingTable(false)
      } catch (err) {
        console.error('Error loading restaurant data:', err)
        setError('Error al cargar los datos del restaurante')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [restaurantId, tableFromUrl])
  
  // Load products when category changes
  useEffect(() => {
    if (!selectedCategory) return
    
    const loadProducts = async () => {
      try {
        setLoadingProducts(true)
        const productsData = await getProductsByCategory(restaurantId, selectedCategory)
        setProducts(productsData)
      } catch (err) {
        console.error('Error loading products:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    
    loadProducts()
  }, [restaurantId, selectedCategory])

  const addToCart = (product: Product & { id: string }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prev.filter((item) => item.productId !== productId)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCreateOrder = async () => {
    if (!tableNumber || cart.length === 0) return
    
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        productPrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        notes: ''
      }))
      
      const orderData = {
        orderNumber: generateOrderNumber(),
        tableNumber,
        customerName: customerName.trim(),
        status: 'received' as const,
        totalAmount: getTotalPrice(),
        notes: '',
        timestamps: {
          receivedAt: Timestamp.now()
        },
        users: {}
      }
      
      const orderId = await createOrder(restaurantId, orderData, orderItems)
      
      // Clear cart and redirect to order status
      setCart([])
      window.location.href = `/order-status/${restaurantId}/${orderId}`
    } catch (err: any) {
      console.error('Error creating order:', err)
      if (err.message && err.message.includes('mesa ya tiene una orden activa')) {
        alert(err.message)
      } else {
        alert('Error al crear el pedido. Por favor intente nuevamente.')
      }
    }
  }

  if (isLocationValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Ubicación No Válida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Para realizar un pedido, debes estar físicamente en el restaurante.</p>
            <p className="text-sm text-gray-500">📍 {restaurant?.address || 'Cargando...'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || checkingTable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (tableHasActiveOrder && tableFromUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Ban className="h-5 w-5" />
              Mesa Ocupada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              La mesa {tableFromUrl} ya tiene una orden en proceso. 
              Por favor espera a que se complete la orden actual antes de realizar un nuevo pedido.
            </p>
            <p className="text-sm text-gray-500">
              Si crees que esto es un error, por favor contacta al personal del restaurante.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (isLocationValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando ubicación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Restaurante */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            {restaurant?.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-20 w-20 object-cover rounded-lg mx-auto mb-4"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{restaurant?.name || 'Cargando...'}</h1>
            {restaurant?.slogan && (
              <p className="text-lg text-gray-700 mt-2 font-medium">{restaurant.slogan}</p>
            )}
            <p className="text-gray-600 mt-2">{restaurant?.description || ''}</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {restaurant?.address || 'Cargando...'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {restaurant?.openingHours || 'Horario no disponible'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Categorías - Horizontal Scrollable */}
        <div className="mb-6">
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all
                    ${selectedCategory === category.id 
                      ? 'bg-orange-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                    }
                  `}
                >
                  <span className="text-lg">{category.icon || '📦'}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Productos de la categoría seleccionada */}
        <div>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Cargando productos...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xl font-bold text-orange-600">L. {product.price}</span>
                          <div className="flex items-center gap-1">
                            {cart.find((item) => item.productId === product.id) ? (
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="outline" onClick={() => removeFromCart(product.id)} className="h-8 w-8 p-0">
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {cart.find((item) => item.productId === product.id)?.quantity || 0}
                                </span>
                                <Button size="sm" onClick={() => addToCart(product)} className="h-8 w-8 p-0">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => addToCart(product)} className="h-8">
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carrito Flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
          <Card className="bg-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-semibold">{getCartItemCount()} productos</span>
                  </div>
                  <div className="text-2xl font-bold">L. {getTotalPrice()}</div>
                </div>
                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="lg">
                      Ordenar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Pedido</DialogTitle>
                      <DialogDescription>Completa la información para enviar tu pedido a la cocina</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="table">Número de Mesa</Label>
                        <Input
                          id="table"
                          placeholder="Ej: 5"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Nombre del Cliente *</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Resumen del Pedido:</h4>
                        {cart.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>L. {item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t mt-2 pt-2 font-bold">Total: L. {getTotalPrice()}</div>
                      </div>
                      <Button
                        className="w-full"
                        disabled={!tableNumber || !customerName.trim()}
                        onClick={handleCreateOrder}
                      >
                        Confirmar Pedido
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
