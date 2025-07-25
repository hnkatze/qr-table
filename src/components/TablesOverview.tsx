"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mesa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right w-[80px]">Tiempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTables
                  .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
                  .map(([tableNumber, order]) => (
                  <TableRow key={tableNumber}>
                    <TableCell className="font-medium">Mesa {tableNumber}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">L. {order.totalAmount}</TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {getElapsedTime(order.timestamps.receivedAt)} min
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}