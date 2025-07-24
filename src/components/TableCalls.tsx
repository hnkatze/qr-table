"use client"

import { useState, useEffect } from "react"
import { Bell, CreditCard, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getActiveTableCalls, subscribeToTableCalls } from "@/lib/firebase/db"
import type { TableCall } from "@/lib/firebase/db"

interface TableCallsProps {
  restaurantId: string
}

export function TableCalls({ restaurantId }: TableCallsProps) {
  const [calls, setCalls] = useState<(TableCall & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial calls
    loadCalls()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTableCalls(restaurantId, (tableCalls) => {
      setCalls(tableCalls)
    })

    return () => unsubscribe()
  }, [restaurantId])

  const loadCalls = async () => {
    try {
      const data = await getActiveTableCalls(restaurantId)
      setCalls(data)
    } catch (error) {
      console.error('Error loading table calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCallIcon = (reason: TableCall['reason']) => {
    switch (reason) {
      case 'waiter':
        return <Bell className="h-4 w-4" />
      case 'bill':
        return <CreditCard className="h-4 w-4" />
      case 'other':
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getCallTitle = (reason: TableCall['reason']) => {
    switch (reason) {
      case 'waiter':
        return 'Solicita atención'
      case 'bill':
        return 'Solicita la cuenta'
      case 'other':
        return 'Otra solicitud'
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Llamadas de Mesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">Cargando llamadas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className={`h-5 w-5 ${calls.length > 0 ? 'animate-pulse text-orange-500' : ''}`} />
          Llamadas de Mesas ({calls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay llamadas pendientes</p>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <Card key={call.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-lg">
                        {getCallIcon(call.reason)}
                        <span>Mesa {call.tableNumber}</span>
                        <Badge variant="secondary" className="text-xs">
                          {call.orderNumber}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getCallTitle(call.reason)}
                      </p>
                      {call.message && (
                        <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded italic">
                          "{call.message}"
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />
                        Hace {getElapsedTime(call.createdAt)} minutos
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      <Bell className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}