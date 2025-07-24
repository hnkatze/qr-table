'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { subscribeToOrders, updateOrderStatus } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import type { Order, OrderItem } from '@/lib/firebase/db'

type OrderWithItems = Order & { id: string; items: (OrderItem & { id: string })[] }

export default function AdvanceOrderPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.restaurantId) return

    const unsubscribe = subscribeToOrders(
      user.restaurantId,
      (ordersData) => {
        setOrders(ordersData)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleAdvanceStatus = async (order: OrderWithItems) => {
    if (!user) return

    const statusFlow: Record<string, Order['status']> = {
      'received': 'in_kitchen',
      'in_kitchen': 'ready',
      'ready': 'served',
      'served': 'paid',
      'paid': 'paid',
      'cancelled': 'cancelled'
    }

    const nextStatus = statusFlow[order.status]
    if (nextStatus && nextStatus !== order.status) {
      try {
        await updateOrderStatus(user.restaurantId, order.id, nextStatus, user.id)
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      received: 'bg-blue-500',
      in_kitchen: 'bg-orange-500',
      ready: 'bg-green-500',
      served: 'bg-green-600',
      paid: 'bg-gray-500',
      cancelled: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-400'
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Herramienta de Desarrollo - Avanzar Estados de Órdenes</CardTitle>
            <CardDescription>
              Esta página es solo para desarrollo. Permite avanzar manualmente el estado de las órdenes.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No hay órdenes
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {order.orderNumber} - Mesa {order.tableNumber}
                      </CardTitle>
                      <CardDescription>
                        Cliente: {order.customerName || 'Anónimo'} | Total: L. {order.totalAmount}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">Items:</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm">
                        - {item.quantity}x {item.productName} (L. {item.subtotal})
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAdvanceStatus(order)}
                      disabled={order.status === 'paid' || order.status === 'cancelled'}
                    >
                      Avanzar Estado
                    </Button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Flujo:</span>
                      <span>received → in_kitchen → ready → served → paid</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}