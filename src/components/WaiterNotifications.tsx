"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { subscribeToTableCalls, attendTableCall } from "@/lib/firebase/db"
import type { TableCall } from "@/lib/firebase/db"

interface WaiterNotificationsProps {
  restaurantId: string
  userId: string
}

export function WaiterNotifications({ restaurantId, userId }: WaiterNotificationsProps) {
  const [calls, setCalls] = useState<(TableCall & { id: string })[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToTableCalls(restaurantId, (tableCalls) => {
      setCalls(tableCalls)
      
      // Play notification sound for new calls
      if (tableCalls.length > calls.length) {
        playNotificationSound()
      }
    })

    return () => unsubscribe()
  }, [restaurantId])

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const handleAttendCall = async (callId: string) => {
    try {
      await attendTableCall(restaurantId, callId, userId)
      setOpen(false)
    } catch (error) {
      console.error('Error attending call:', error)
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 ${calls.length > 0 ? 'animate-pulse' : ''}`} />
          {calls.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
              {calls.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Llamadas de Mesas</h3>
          
          {calls.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay llamadas pendientes</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {calls.map((call) => (
                <Card key={call.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold">
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
                          <p className="text-sm text-gray-700 mt-1 italic">
                            "{call.message}"
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          Hace {getElapsedTime(call.createdAt)} minutos
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAttendCall(call.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Atender
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}