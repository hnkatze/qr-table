"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, ExternalLink } from "lucide-react"

export default function QRSimulatorPage() {
  const [restaurantId, setRestaurantId] = useState("restaurant_001")
  const [tables, setTables] = useState([
    { number: "1", name: "Mesa 1" },
    { number: "2", name: "Mesa 2" },
    { number: "3", name: "Mesa 3" },
    { number: "4", name: "Mesa 4" },
    { number: "5", name: "Mesa 5" },
    { number: "6", name: "Mesa 6" },
    { number: "7", name: "Mesa 7" },
    { number: "8", name: "Mesa 8" },
    { number: "9", name: "Mesa 9" },
    { number: "10", name: "Mesa 10" },
  ])

  const generateMenuUrl = (tableNumber: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/menu/${restaurantId}?table=${tableNumber}`
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulador de QR - Desarrollo</h1>
          <p className="text-gray-600">
            Simula escanear códigos QR de diferentes mesas para probar el sistema
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Configura el ID del restaurante para generar los enlaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="restaurantId">ID del Restaurante</Label>
                <Input
                  id="restaurantId"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="restaurant_001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => {
            const menuUrl = generateMenuUrl(table.number)
            return (
              <Card key={table.number} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <CardDescription>Mesa #{table.number}</CardDescription>
                    </div>
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600 break-all font-mono">
                        {menuUrl}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => openInNewTab(menuUrl)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Menú
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Cómo usar este simulador</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Configura el ID del restaurante (por defecto: restaurant_001)</li>
              <li>Haz clic en "Abrir Menú" en cualquier mesa para simular el escaneo del QR</li>
              <li>Se abrirá una nueva pestaña con el menú del restaurante</li>
              <li>Puedes abrir múltiples mesas para simular diferentes clientes</li>
              <li>Cada mesa mantiene su propio carrito de compras independiente</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}