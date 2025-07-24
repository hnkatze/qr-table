"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/Overview"
import { RecentSales } from "@/components/RecentSales"
import { TablesOverview } from "@/components/TablesOverview"
import { TableCalls } from "@/components/TableCalls"
import { DashboardHeader } from "@/components/DashboardHeader"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToOrders, getUsers, getAllProductsAdmin, getCategories } from "@/lib/firebase/db"
import { DollarSign, Users, Package, ShoppingCart, TrendingUp, Loader2, Clock, Star, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Order, OrderItem } from "@/lib/firebase/db"

type OrderWithItems = Order & { id: string; items: (OrderItem & { id: string })[] }

export default function AdminDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('7') // days
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    activeOrders: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    salesGrowth: 0,
    avgServiceTime: 0,
    topProduct: { name: '', count: 0 },
    avgTicket: 0,
    completionRate: 0
  })

  useEffect(() => {
    if (!user?.restaurantId) return

    let isMounted = true

    const loadData = async () => {
      try {
        // Load users count
        const users = await getUsers(user.restaurantId)
        
        // Load products count
        const products = await getAllProductsAdmin(user.restaurantId)
        
        // Load categories count
        const categories = await getCategories(user.restaurantId)

        if (isMounted) {
          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            totalProducts: products.length,
            totalCategories: categories.length
          }))
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
        if (!isMounted) return

        setOrders(ordersData)
        
        // Calculate stats
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const filterDate = new Date(today)
        filterDate.setDate(filterDate.getDate() - parseInt(dateFilter))
        
        let todaySales = 0
        let yesterdaySales = 0
        let totalSales = 0
        let activeOrders = 0
        let totalServiceTime = 0
        let completedOrders = 0
        const productCount: Record<string, number> = {}
        
        // Filter orders by date range
        const filteredOrders = ordersData.filter(order => {
          const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
          return orderDate >= filterDate
        })
        
        filteredOrders.forEach(order => {
          const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
          
          // Only count paid orders for sales
          if (order.status === 'paid') {
            totalSales += order.totalAmount
            completedOrders++
            
            // Calculate service time (from received to paid)
            if (order.timestamps.receivedAt && order.timestamps.paidAt) {
              const received = order.timestamps.receivedAt.toDate ? order.timestamps.receivedAt.toDate() : new Date(order.timestamps.receivedAt)
              const paid = order.timestamps.paidAt.toDate ? order.timestamps.paidAt.toDate() : new Date(order.timestamps.paidAt)
              const serviceTime = (paid.getTime() - received.getTime()) / (1000 * 60) // minutes
              totalServiceTime += serviceTime
            }
            
            // Check if order is from today
            if (orderDate >= today) {
              todaySales += order.totalAmount
            } else if (orderDate >= yesterday && orderDate < today) {
              yesterdaySales += order.totalAmount
            }
            
            // Count products
            order.items.forEach(item => {
              productCount[item.productName] = (productCount[item.productName] || 0) + item.quantity
            })
          }
          
          // Count active orders
          if (['received', 'in_kitchen', 'ready', 'served'].includes(order.status)) {
            activeOrders++
          }
        })
        
        // Find top product
        let topProduct = { name: 'Sin datos', count: 0 }
        Object.entries(productCount).forEach(([name, count]) => {
          if (count > topProduct.count) {
            topProduct = { name, count }
          }
        })
        
        // Calculate averages
        const avgServiceTime = completedOrders > 0 ? Math.round(totalServiceTime / completedOrders) : 0
        const avgTicket = completedOrders > 0 ? Math.round(totalSales / completedOrders) : 0
        const completionRate = filteredOrders.length > 0 
          ? Math.round((completedOrders / filteredOrders.length) * 100) 
          : 0
        
        // Calculate growth
        const growth = yesterdaySales > 0 
          ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
          : 0

        setStats(prev => ({
          ...prev,
          totalSales,
          todaySales,
          activeOrders,
          totalOrders: filteredOrders.length,
          salesGrowth: growth,
          avgServiceTime,
          topProduct,
          avgTicket,
          completionRate
        }))
        
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user, dateFilter])

  // Get recent orders for the recent sales component
  const recentOrders = orders
    .filter(order => order.status === 'paid')
    .sort((a, b) => {
      const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5)

  // Prepare data for the chart
  const chartData = () => {
    const days = parseInt(dateFilter)
    const data = Array(Math.min(days, 30)).fill(0).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (Math.min(days, 30) - 1 - i))
      return {
        name: days <= 7 
          ? date.toLocaleDateString('es', { weekday: 'short' }) 
          : date.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        total: 0
      }
    })

    orders.forEach(order => {
      if (order.status === 'paid') {
        const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        const daysDiff = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff >= 0 && daysDiff < Math.min(days, 30)) {
          data[Math.min(days, 30) - 1 - daysDiff].total += order.totalAmount
        }
      }
    })

    return data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Dashboard Administrativo"
        subtitle="Vista general del rendimiento del restaurante"
        badges={
          <>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              📊 {user?.fullName}
            </Badge>
            <Badge variant="secondary">{stats.activeOrders} órdenes activas</Badge>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Filter */}
        <div className="flex justify-end mb-6">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="15">Últimos 15 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="60">Últimos 60 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">L. {stats.todaySales}</div>
              <p className="text-xs text-muted-foreground">
                {stats.salesGrowth > 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}% desde ayer
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                De {stats.totalOrders} órdenes totales
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                En {stats.totalCategories} categorías
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Personal activo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgServiceTime} min</div>
              <p className="text-xs text-muted-foreground">
                De pedido a pago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producto Estrella</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{stats.topProduct.name}</div>
              <p className="text-xs text-muted-foreground">
                {stats.topProduct.count} vendidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">L. {stats.avgTicket}</div>
              <p className="text-xs text-muted-foreground">
                Por orden completada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Órdenes completadas vs totales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables Overview and Calls */}
        <div className="grid gap-4 mt-4 lg:grid-cols-2">
          <TablesOverview restaurantId={user.restaurantId} />
          <TableCalls restaurantId={user.restaurantId} />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Resumen de Ventas</CardTitle>
              <CardDescription>
                Ventas de los últimos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview data={chartData()} />
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>
                Últimas {recentOrders.length} transacciones completadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales orders={recentOrders} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}