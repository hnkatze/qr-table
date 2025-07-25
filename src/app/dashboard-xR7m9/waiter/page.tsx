"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Edit, Save, X, Loader2, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsMenu } from "@/components/SettingsMenu"
import { DashboardHeader } from "@/components/DashboardHeader"
import { TablesOverview } from "@/components/TablesOverview"
import { WaiterNotifications } from "@/components/WaiterNotifications"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToOrders, updateOrderStatus, getAllProducts, getCategories, updateOrder } from "@/lib/firebase/db"
import type { Order, OrderItem, Product, Category } from "@/lib/firebase/db"
import { where, Timestamp } from "firebase/firestore"

type OrderWithItems = Order & { id: string; items: (OrderItem & { id: string })[] }

export default function WaiterPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [categories, setCategories] = useState<(Category & { id: string })[]>([])
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [showAddProduct, setShowAddProduct] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [tempOrders, setTempOrders] = useState<Record<string, OrderWithItems>>({})
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.restaurantId) return

    // Load products and categories
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(user.restaurantId),
          getCategories(user.restaurantId)
        ])
        setProducts(productsData)
        setCategories(categoriesData)
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()

    // Subscribe to orders
    const unsubscribe = subscribeToOrders(
      user.restaurantId,
      (ordersData) => {
        // Filter orders that can be edited by waiter
        const waiterOrders = ordersData.filter(order => 
          ['received', 'in_kitchen', 'ready', 'served'].includes(order.status)
        )
        setOrders(waiterOrders)
        setLoading(false)
      },
      [where('status', 'in', ['received', 'in_kitchen', 'ready', 'served'])]
    )

    return () => unsubscribe()
  }, [user])

  const startEditingOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setTempOrders(prev => ({ ...prev, [orderId]: JSON.parse(JSON.stringify(order)) }))
      setEditingOrder(orderId)
    }
  }

  const cancelEditingOrder = (orderId: string) => {
    setTempOrders(prev => {
      const newTemp = { ...prev }
      delete newTemp[orderId]
      return newTemp
    })
    setEditingOrder(null)
    setShowAddProduct(null)
  }

  const updateOrderItem = (orderId: string, itemId: string, newQuantity: number) => {
    setTempOrders(prev => {
      const order = prev[orderId]
      if (!order) return prev

      const updatedItems = order.items
        .map((item) => {
          if (item.id === itemId) {
            const newSubtotal = item.productPrice * newQuantity
            return { ...item, quantity: newQuantity, subtotal: newSubtotal }
          }
          return item
        })
        .filter((item) => item.quantity > 0)

      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)

      return {
        ...prev,
        [orderId]: { ...order, items: updatedItems, totalAmount: newTotal }
      }
    })
  }

  const addProductToOrder = (orderId: string, product: Product & { id: string }) => {
    setTempOrders(prev => {
      const order = prev[orderId]
      if (!order) return prev

      const existingItem = order.items.find(item => item.productId === product.id)
      
      let updatedItems
      if (existingItem) {
        updatedItems = order.items.map(item => {
          if (item.productId === product.id) {
            const newQuantity = item.quantity + 1
            return {
              ...item,
              quantity: newQuantity,
              subtotal: item.productPrice * newQuantity
            }
          }
          return item
        })
      } else {
        const newItem: OrderItem & { id: string } = {
          id: `new-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: 1,
          subtotal: product.price
        }
        updatedItems = [...order.items, newItem]
      }

      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)

      return {
        ...prev,
        [orderId]: { ...order, items: updatedItems, totalAmount: newTotal }
      }
    })
  }

  const saveOrderChanges = async (orderId: string) => {
    if (!user || !tempOrders[orderId]) return
    
    setSavingOrder(orderId)
    try {
      const tempOrder = tempOrders[orderId]
      await updateOrder(user.restaurantId, orderId, {
        items: tempOrder.items,
        totalAmount: tempOrder.totalAmount,
        updatedAt: Timestamp.now()
      })
      
      setEditingOrder(null)
      setShowAddProduct(null)
      setTempOrders(prev => {
        const newTemp = { ...prev }
        delete newTemp[orderId]
        return newTemp
      })
    } catch (error) {
      console.error('Error saving order:', error)
    } finally {
      setSavingOrder(null)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!user) return
    try {
      await updateOrderStatus(user.restaurantId, orderId, newStatus, user.id)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const canEditOrder = (status: string) => {
    return status === "received" || status === "in_kitchen"
  }

  const getOrderCardClass = (status: Order['status']) => {
    const classes = {
      received: 'border-blue-400 bg-blue-50/50',
      in_kitchen: 'border-yellow-400 bg-yellow-50/50',
      ready: 'border-green-400 bg-green-50/50',
      served: 'border-purple-400 bg-purple-50/50',
      paid: 'border-gray-400 bg-gray-50/50',
      cancelled: 'border-red-400 bg-red-50/50'
    }
    return classes[status] || 'border-gray-200'
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      received: { label: 'Recibido', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      in_kitchen: { label: 'En Cocina', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      ready: { label: 'Listo', className: 'bg-green-100 text-green-800 border-green-300' },
      served: { label: 'Servido', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      paid: { label: 'Pagado', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' }
    }
    const config = configs[status as keyof typeof configs] || { label: status, className: '' }
    return <Badge className={`border ${config.className}`}>{config.label}</Badge>
  }

  const getAvailableActions = (order: OrderWithItems) => {
    const actions = []
    
    switch (order.status) {
      case 'ready':
        actions.push(
          <Button 
            key="serve" 
            size="sm" 
            onClick={() => handleStatusUpdate(order.id, 'served')}
          >
            Marcar como Servido
          </Button>
        )
        break
      case 'served':
        actions.push(
          <Button 
            key="ready" 
            size="sm" 
            variant="outline"
            onClick={() => handleStatusUpdate(order.id, 'ready')}
          >
            Marcar como Listo
          </Button>
        )
        break
    }
    
    return actions
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        title="Panel de Mesero"
        subtitle="Gestión y modificación de órdenes"
        badges={
          <>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              👤 {user?.fullName || 'Mesero'}
            </Badge>
            <Badge variant="secondary">{orders.filter((o) => canEditOrder(o.status)).length} órdenes editables</Badge>
            {user && <WaiterNotifications restaurantId={user.restaurantId} userId={user.id} />}
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Tables Overview */}
          <TablesOverview restaurantId={user?.restaurantId || ''} />
          
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Asignadas</CardTitle>
              <CardDescription>Puedes modificar órdenes que estén en estado "Recibido" o "En Cocina"</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay órdenes activas</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className={`border-2 transition-all ${getOrderCardClass(order.status)} ${!canEditOrder(order.status) ? "opacity-80" : ""}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {order.orderNumber} - Mesa {order.tableNumber}
                            </CardTitle>
                            <CardDescription>
                              {order.customerName ? `Cliente: ${order.customerName}` : 'Cliente anónimo'}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <div className="text-xl font-bold mt-1">L. {editingOrder === order.id ? tempOrders[order.id]?.totalAmount || order.totalAmount : order.totalAmount}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingOrder === order.id ? (
                          <div className="space-y-3">
                            {(tempOrders[order.id]?.items || []).map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <span className="font-medium">{item.productName}</span>
                                  <div className="text-sm text-gray-600">L. {item.productPrice} c/u</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateOrderItem(order.id, item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateOrderItem(order.id, item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateOrderItem(order.id, item.id, 0)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <span>Productos: {order.items.length}</span>
                              <span>Items totales: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  Ver Productos
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle className="text-base sm:text-lg">{order.orderNumber} - Mesa {order.tableNumber}</DialogTitle>
                                  <DialogDescription className="text-sm">
                                    Detalle de productos del pedido
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 sm:space-y-3 max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1 mr-2">
                                        <div className="font-medium text-sm sm:text-base">{item.productName}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">
                                          {item.quantity} x L. {item.productPrice} = L. {item.subtotal}
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="text-xs sm:text-sm">{item.quantity}</Badge>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 sm:pt-3 font-bold">
                                    <div className="flex justify-between text-sm sm:text-base">
                                      <span>Total:</span>
                                      <span>L. {order.totalAmount}</span>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          {canEditOrder(order.status) && (
                            <>
                              {editingOrder === order.id ? (
                                <>
                                  <Dialog open={showAddProduct === order.id} onOpenChange={(open) => !open && setShowAddProduct(null)}>
                                    <DialogTrigger asChild>
                                      <Button onClick={() => setShowAddProduct(order.id)} variant="outline">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Agregar Producto
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Agregar Productos</DialogTitle>
                                        <DialogDescription>
                                          Selecciona productos del menú para agregar a la orden
                                        </DialogDescription>
                                      </DialogHeader>
                                      
                                      <div className="space-y-4">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {categories.map(category => (
                                              <SelectItem key={category.id} value={category.id}>
                                                {category.icon} {category.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        
                                        <div className="grid gap-3">
                                          {products
                                            .filter(product => product.categoryId === selectedCategory && product.isAvailable)
                                            .map(product => (
                                              <Card key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                                                addProductToOrder(order.id, product)
                                              }}>
                                                <CardContent className="p-4">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      {product.imageUrl && (
                                                        <img 
                                                          src={product.imageUrl} 
                                                          alt={product.name}
                                                          className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                      )}
                                                      <div>
                                                        <h4 className="font-medium">{product.name}</h4>
                                                        <p className="text-sm text-gray-600">{product.description}</p>
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="font-bold">L. {product.price}</div>
                                                      <Button size="sm" variant="ghost">
                                                        <Plus className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button 
                                    onClick={() => saveOrderChanges(order.id)} 
                                    disabled={savingOrder === order.id}
                                  >
                                    {savingOrder === order.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Button onClick={() => cancelEditingOrder(order.id)} variant="outline">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </Button>
                                </>
                              ) : (
                                <Button onClick={() => startEditingOrder(order.id)} variant="outline">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Orden
                                </Button>
                              )}
                            </>
                          )}

                          {getAvailableActions(order)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen del Turno */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Turno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-blue-600">Órdenes Atendidas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    L. {orders.reduce((sum, order) => sum + order.totalAmount, 0)}
                  </div>
                  <div className="text-sm text-green-600">Total en Ventas</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter((o) => canEditOrder(o.status)).length}
                  </div>
                  <div className="text-sm text-orange-600">Órdenes Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}