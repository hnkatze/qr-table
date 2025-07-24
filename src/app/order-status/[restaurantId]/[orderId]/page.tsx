"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, ChefHat, Utensils, CreditCard, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { subscribeToOrder, getRestaurant } from "@/lib/firebase/db"
import type { Order, OrderItem, Restaurant } from "@/lib/firebase/db"

type OrderWithItems = Order & { id: string; items: (OrderItem & { id: string })[] }

const statusConfig = {
  received: {
    label: "Pedido Recibido",
    icon: CheckCircle,
    color: "bg-blue-500",
    description: "Tu pedido ha sido recibido y está en cola",
  },
  in_kitchen: {
    label: "En Cocina",
    icon: ChefHat,
    color: "bg-orange-500",
    description: "Nuestros chefs están preparando tu pedido",
  },
  ready: {
    label: "Listo para Servir",
    icon: Utensils,
    color: "bg-green-500",
    description: "Tu pedido está listo, el mesero lo llevará pronto",
  },
  served: {
    label: "Servido",
    icon: Utensils,
    color: "bg-green-600",
    description: "¡Disfruta tu comida!",
  },
  paid: {
    label: "Pagado",
    icon: CreditCard,
    color: "bg-gray-500",
    description: "Gracias por tu visita",
  },
  cancelled: {
    label: "Cancelado",
    icon: AlertCircle,
    color: "bg-red-500",
    description: "Tu pedido ha sido cancelado",
  },
}

export default function OrderStatusPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const orderId = params.orderId as string
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cargar información del restaurante
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await getRestaurant(restaurantId)
        setRestaurant(data)
      } catch (err) {
        console.error('Error loading restaurant:', err)
      }
    }
    loadRestaurant()
  }, [restaurantId])

  // Suscribirse a cambios en la orden
  useEffect(() => {
    const unsubscribe = subscribeToOrder(restaurantId, orderId, (orderData) => {
      if (orderData) {
        setOrder(orderData)
        setError(null)
        
        // Si la orden fue pagada, redirigir al home después de 3 segundos
        if (orderData.status === 'paid') {
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
        }
      } else {
        setError('Orden no encontrada')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [restaurantId, orderId])

  const getElapsedTime = (timestamp: any) => {
    if (!timestamp) return 0
    // Convert Firestore timestamp to Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff = Math.floor((currentTime.getTime() - date.getTime()) / 1000 / 60)
    return diff
  }

  const getProgress = () => {
    if (!order) return 0
    const statuses = ["received", "in_kitchen", "ready", "served", "paid"]
    const currentIndex = statuses.indexOf(order.status)
    return ((currentIndex + 1) / statuses.length) * 100
  }

  const canCancel = order?.status === "received"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
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
            <p className="text-gray-600">{error || 'No se pudo cargar la información del pedido'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTimestampValue = (timestamp: any) => {
    if (!timestamp) return null
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="text-center">
            {restaurant?.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-12 w-12 object-cover rounded-lg mx-auto mb-2"
              />
            )}
            <h1 className="text-xl font-bold text-gray-900">{restaurant?.name || 'Cargando...'}</h1>
            <p className="text-gray-600 flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              Mesa {order.tableNumber}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Estado Actual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(statusConfig[order.status].icon, { className: "h-5 w-5" })}
                  {statusConfig[order.status].label}
                </CardTitle>
                <CardDescription>Pedido #{order.orderNumber}</CardDescription>
              </div>
              {order.timestamps.receivedAt && (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {getElapsedTime(order.timestamps.receivedAt)} min
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{statusConfig[order.status].description}</p>
            {order.status !== 'cancelled' && (
              <Progress value={getProgress()} className="mb-4" />
            )}
            {order.status === "in_kitchen" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">⏱️ Tiempo estimado: 15-20 minutos</p>
              </div>
            )}
            {order.status === "paid" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ ¡Gracias por tu visita!</p>
                <p className="text-green-700 text-sm mt-1">Redirigiendo al inicio...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle>Progreso del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(["received", "in_kitchen", "ready", "served", "paid"] as const).map((status, index) => {
                  const timestamp = order.timestamps[`${status}At` as keyof typeof order.timestamps]
                  const isCompleted = timestamp !== null && timestamp !== undefined
                  const isCurrent = order.status === status
                  const config = statusConfig[status]

                  return (
                    <div key={status} className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? config.color : isCurrent ? config.color : "bg-gray-200"
                        }`}
                      >
                        {React.createElement(config.icon, {
                          className: `h-5 w-5 ${isCompleted || isCurrent ? "text-white" : "text-gray-400"}`,
                        })}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                          {config.label}
                        </p>
                        {timestamp && (
                          <p className="text-sm text-gray-500">
                            {getTimestampValue(timestamp)?.toLocaleTimeString("es-HN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalles del Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
            {order.customerName && (
              <CardDescription>Cliente: {order.customerName}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span>L. {item.subtotal}</span>
                </div>
              ))}
              <div className="border-t pt-3 font-bold text-lg">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>L. {order.totalAmount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-3">
          {canCancel && (
            <Button variant="destructive" className="w-full">
              Cancelar Pedido
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = `/menu/${restaurantId}?table=${order.tableNumber}`}
          >
            Hacer Otro Pedido
          </Button>
        </div>
      </div>
    </div>
  )
}