"use client"

import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Check, Loader2, Clock, Receipt, X, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsMenu } from "@/components/SettingsMenu"
import { DashboardHeader } from "@/components/DashboardHeader"
import { TablesOverview } from "@/components/TablesOverview"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToOrders, updateOrderStatus } from "@/lib/firebase/db"
import type { Order, OrderItem } from "@/lib/firebase/db"

type OrderWithItems = Order & { id: string; items: (OrderItem & { id: string })[] }

export default function CashierPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  
  // Calculate stats
  const todayOrders = orders.filter(order => order.status === 'paid')
  const activeOrders = orders.filter(order => order.status !== 'paid' && order.status !== 'cancelled')
  const totalSales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  useEffect(() => {
    if (!user?.restaurantId) return

    // Subscribe to orders
    const unsubscribe = subscribeToOrders(
      user.restaurantId,
      (ordersData) => {
        // Cashier sees all orders
        setOrders(ordersData)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status'], reason?: string) => {
    if (!user) return
    try {
      await updateOrderStatus(user.restaurantId, orderId, newStatus, user.id, reason)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleCancelOrder = async () => {
    if (!cancellingOrderId || !cancellationReason.trim()) return
    
    await handleStatusUpdate(cancellingOrderId, 'cancelled', cancellationReason)
    setCancelDialogOpen(false)
    setCancellingOrderId(null)
    setCancellationReason("")
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

  const getStatusBadge = (status: Order['status']) => {
    const configs = {
      received: { label: 'Recibido', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      in_kitchen: { label: 'En Cocina', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      ready: { label: 'Listo', className: 'bg-green-100 text-green-800 border-green-300' },
      served: { label: 'Servido', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      paid: { label: 'Pagado', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' }
    }
    const config = configs[status] || { label: status, className: '' }
    return <Badge className={`border ${config.className}`}>{config.label}</Badge>
  }

  const handlePayment = async (order: OrderWithItems) => {
    if (!user) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount < order.totalAmount) {
      alert("El monto debe ser igual o mayor al total de la orden")
      return
    }

    try {
      await updateOrderStatus(user.restaurantId, order.id, 'paid', user.id)
      setSelectedOrder(null)
      setPaymentAmount("")
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error al procesar el pago')
    }
  }

  const getChange = () => {
    if (!selectedOrder || !paymentAmount) return 0
    const amount = parseFloat(paymentAmount)
    return isNaN(amount) ? 0 : Math.max(0, amount - selectedOrder.totalAmount)
  }

  const getElapsedTime = (timestamp: any) => {
    if (!timestamp) return '0'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    return diff
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
        title="Panel de Cajero"
        subtitle="Gestión de pagos y cobros"
        badges={
          <>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              💰 {user?.fullName || 'Cajero'}
            </Badge>
            <Badge variant="secondary">{activeOrders.length} órdenes activas</Badge>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">L. {totalSales}</div>
              <p className="text-xs text-muted-foreground">{todayOrders.length} órdenes cobradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">L. {activeOrders.reduce((sum, o) => sum + o.totalAmount, 0)}</div>
              <p className="text-xs text-muted-foreground">{activeOrders.length} órdenes activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                L. {todayOrders.length > 0 ? Math.round(totalSales / todayOrders.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Por orden</p>
            </CardContent>
          </Card>
        </div>

        {/* Tables Overview */}
        <TablesOverview restaurantId={user?.restaurantId || ''} />

        {/* Tabs for orders */}
        <Tabs defaultValue="active" className="space-y-4 mt-4">
          <TabsList>
            <TabsTrigger value="active">Órdenes Activas ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="paid">Cobradas ({todayOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Órdenes Activas</CardTitle>
                <CardDescription>Todas las órdenes en proceso</CardDescription>
              </CardHeader>
              <CardContent>
                {activeOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay órdenes activas</p>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <Card key={order.id} className={`border-2 transition-all ${getOrderCardClass(order.status)}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {order.orderNumber} - Mesa {order.tableNumber}
                              </CardTitle>
                              <CardDescription>
                                Cliente: {order.customerName || 'Anónimo'} | {getElapsedTime(order.timestamps.receivedAt)} min
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <div className="text-xl font-bold mt-1">L. {order.totalAmount}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600 mb-4">
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
                          
                          <div className="flex gap-2">
                            {order.status === 'received' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.id, 'in_kitchen')}
                              >
                                Enviar a Cocina
                              </Button>
                            )}
                            {order.status === 'in_kitchen' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.id, 'ready')}
                              >
                                Marcar como Listo
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.id, 'served')}
                              >
                                Marcar como Servido
                              </Button>
                            )}
                            {order.status === 'served' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setPaymentAmount(order.totalAmount.toString())
                                    }}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Cobrar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Procesar Pago - {order.orderNumber}</DialogTitle>
                                    <DialogDescription>
                                      Mesa {order.tableNumber} - Total: L. {order.totalAmount}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {/* Order details */}
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                      <h4 className="font-semibold mb-2">Detalle del Pedido:</h4>
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                          <span>{item.quantity}x {item.productName}</span>
                                          <span>L. {item.subtotal}</span>
                                        </div>
                                      ))}
                                      <div className="border-t mt-2 pt-2 font-bold">
                                        <div className="flex justify-between">
                                          <span>Total:</span>
                                          <span>L. {order.totalAmount}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Payment input */}
                                    <div className="space-y-2">
                                      <Label htmlFor="payment">Monto Recibido</Label>
                                      <Input
                                        id="payment"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        min={order.totalAmount}
                                        step="0.01"
                                      />
                                    </div>

                                    {/* Change calculation */}
                                    {parseFloat(paymentAmount) >= order.totalAmount && (
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-lg font-semibold text-green-800">
                                          Cambio: L. {getChange().toFixed(2)}
                                        </p>
                                      </div>
                                    )}

                                    <Button 
                                      className="w-full" 
                                      onClick={() => handlePayment(order)}
                                      disabled={parseFloat(paymentAmount) < order.totalAmount}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Confirmar Pago
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/order-status/${user?.restaurantId}/${order.id}`, '_blank')}
                            >
                              Ver Estado
                            </Button>
                            
                            {order.status === 'received' && (
                              <Button 
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setCancellingOrderId(order.id)
                                  setCancelDialogOpen(true)
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Órdenes Cobradas Hoy</CardTitle>
                <CardDescription>Historial de pagos del día</CardDescription>
              </CardHeader>
              <CardContent>
                {todayOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay órdenes cobradas hoy</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Orden</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Hora Pago</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.tableNumber}</TableCell>
                          <TableCell>{order.customerName || 'Anónimo'}</TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell className="font-bold">L. {order.totalAmount}</TableCell>
                          <TableCell>
                            {order.timestamps.paidAt && 
                              (order.timestamps.paidAt.toDate ? 
                                order.timestamps.paidAt.toDate() : 
                                new Date(order.timestamps.paidAt)
                              ).toLocaleTimeString("es-HN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              Pagado
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Orden</DialogTitle>
            <DialogDescription>
              Por favor, proporciona un motivo para la cancelación de esta orden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de cancelación *</Label>
              <Textarea
                id="reason"
                placeholder="Ej: Cliente canceló el pedido, producto no disponible, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCancelDialogOpen(false)
              setCancellationReason("")
              setCancellingOrderId(null)
            }}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              disabled={!cancellationReason.trim()}
            >
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}