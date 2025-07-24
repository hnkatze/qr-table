'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { SettingsMenu } from '@/components/SettingsMenu'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurant } from '@/lib/firebase/db'
import { Loader2 } from 'lucide-react'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  badges?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, badges }: DashboardHeaderProps) {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchRestaurant()
    }
  }, [user])

  const fetchRestaurant = async () => {
    if (!user) return
    
    try {
      const data = await getRestaurant(user.restaurantId)
      setRestaurant(data)
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <header className="bg-white border-b p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            {restaurant?.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{restaurant?.name || 'Restaurante'}</h1>
              {restaurant?.slogan && (
                <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1 truncate">{restaurant.slogan}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                {title && <span className="text-xs sm:text-sm text-gray-500">{title}</span>}
                {subtitle && <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">• {subtitle}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="flex flex-wrap items-center gap-2">
              {badges}
            </div>
            <SettingsMenu />
          </div>
        </div>
      </div>
    </header>
  )
}