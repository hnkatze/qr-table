import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface OrderWithItems {
  id: string
  orderNumber: string
  customerName?: string
  totalAmount: number
  createdAt: any
}

interface RecentSalesProps {
  orders: OrderWithItems[]
}

export function RecentSales({ orders }: RecentSalesProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No hay ventas recientes
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        // const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt as any)
        const initials = order.customerName 
          ? order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()
          : '??'
          
        return (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {order.customerName || 'Cliente Anónimo'}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.orderNumber}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +L. {order.totalAmount}
            </div>
          </div>
        )
      })}
    </div>
  )
}