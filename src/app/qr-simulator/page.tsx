'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { QrCode, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import QRCode from 'qrcode'

export default function QRSimulatorPage() {
  const [restaurantId, setRestaurantId] = useState('restaurant_001')
  const [tableNumber, setTableNumber] = useState('1')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const menuUrl = `${baseUrl}/menu/${restaurantId}?table=${tableNumber}`

  const generateQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error('Error generating QR:', err)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generar QR inicial
  if (!qrDataUrl && restaurantId && tableNumber) {
    generateQR()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Simulador de Códigos QR</h1>
          <p className="text-gray-600">
            Genera códigos QR de prueba para diferentes mesas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Configura los parámetros del código QR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurantId">ID del Restaurante</Label>
                <Input
                  id="restaurantId"
                  value={restaurantId}
                  onChange={(e) => {
                    setRestaurantId(e.target.value)
                    setQrDataUrl('')
                  }}
                  placeholder="restaurant_001"
                />
              </div>
              <div>
                <Label htmlFor="tableNumber">Número de Mesa</Label>
                <Input
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value)
                    setQrDataUrl('')
                  }}
                  placeholder="1"
                />
              </div>
              <Button 
                onClick={generateQR} 
                className="w-full"
                disabled={!restaurantId || !tableNumber}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generar QR
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código QR Generado</CardTitle>
              <CardDescription>
                Mesa {tableNumber} - {restaurantId}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {qrDataUrl ? (
                <>
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code para mesa ${tableNumber}`}
                    className="mx-auto mb-4"
                  />
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar URL
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir
                        </a>
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 break-all bg-gray-100 p-2 rounded">
                      {menuUrl}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12">
                  <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Configura los parámetros y genera el código QR
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. Configura el ID del restaurante y número de mesa</p>
            <p>2. Haz clic en "Generar QR" para crear el código</p>
            <p>3. Puedes escanear el código con tu móvil o usar el botón "Abrir" para probar</p>
            <p>4. El código QR contiene la URL completa del menú con los parámetros de mesa</p>
            <p className="pt-2 text-orange-600">
              💡 Tip: Abre la página "/scan" en tu móvil para probar el escáner de QR
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}