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
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {restaurant?.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-16 w-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{restaurant?.name || 'Restaurante'}</h1>
              {restaurant?.slogan && (
                <p className="text-gray-600 mt-1">{restaurant.slogan}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {title && <span className="text-sm text-gray-500">{title}</span>}
                {subtitle && <span className="text-sm text-gray-500">• {subtitle}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {badges}
            <SettingsMenu />
          </div>
        </div>
      </div>
    </header>
  )
}