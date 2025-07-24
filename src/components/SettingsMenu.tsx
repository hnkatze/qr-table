'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  LogOut, 
  Users, 
  FolderTree, 
  Package,
  Store,
  User,
  ChevronDown,
  QrCode
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsMenu() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      router.push('/dashboard-xR7m9/login')
    } catch (error) {
      console.error('Error during logout:', error)
      setLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configuración</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.role === 'admin' && 'Administrador'}
              {user.role === 'cashier' && 'Cajero'}
              {user.role === 'waiter' && 'Mesero'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.role === 'admin' && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/restaurant')}>
                <Store className="mr-2 h-4 w-4" />
                <span>Restaurante</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/users')}>
                <Users className="mr-2 h-4 w-4" />
                <span>Usuarios</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/categories')}>
                <FolderTree className="mr-2 h-4 w-4" />
                <span>Categorías</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/products')}>
                <Package className="mr-2 h-4 w-4" />
                <span>Productos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/qr-codes')}>
                <QrCode className="mr-2 h-4 w-4" />
                <span>Códigos QR</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation('/dashboard-xR7m9/settings/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={loading}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}