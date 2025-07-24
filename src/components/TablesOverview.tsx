"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTablesWithActiveOrders } from "@/lib/firebase/db"
import { Clock, Users, DollarSign, Eye } from "lucide-react"
import type { Order } from "@/lib/firebase/db"

interface TablesOverviewProps {
  restaurantId: string
}

export function TablesOverview({ restaurantId }: TablesOverviewProps) {
  const [tableOrders, setTableOrders] = useState<Record<string, Order & { id: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTablesData()
    // Refresh every 30 seconds
    const interval = setInterval(loadTablesData, 30000)
    return () => clearInterval(interval)
  }, [restaurantId])

  const loadTablesData = async () => {
    try {
      const data = await getTablesWithActiveOrders(restaurantId)
      setTableOrders(data)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800',
      in_kitchen: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-purple-100 text-purple-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      received: 'Recibido',
      in_kitchen: 'En Cocina',
      ready: 'Listo',
      served: 'Servido',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getElapsedTime = (timestamp: any) => {
    if (!timestamp) return 0
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000 / 60)
    return diff
  }

  const activeTables = Object.entries(tableOrders)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mesas Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">Cargando mesas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mesas Activas ({activeTables.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeTables.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay mesas con órdenes activas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTables.map(([tableNumber, order]) => (
              <Card key={tableNumber} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Mesa {tableNumber}</h3>
                      <p className="text-sm text-gray-600">{order.orderNumber}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{order.customerName || 'Anónimo'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Tiempo:
                    </span>
                    <span className="font-medium">{getElapsedTime(order.timestamps.receivedAt)} min</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Total:
                    </span>
                    <span className="font-bold text-orange-600">L. {order.totalAmount}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/order-status/${restaurantId}/${order.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Orden
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}