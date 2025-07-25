'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from '@/components/QRScanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertCircle, ArrowLeft, QrCode, Keyboard } from 'lucide-react'

export default function ScanPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isValidQR, setIsValidQR] = useState<boolean | null>(null)

  const handleScan = (data: string) => {
    setScanResult(data)
    setError('')
    
    // Validar si es un QR válido del sistema
    // Formato esperado: https://tudominio.com/menu/restaurant_001?table=5
    try {
      const url = new URL(data)
      const pathParts = url.pathname.split('/')
      
      if (pathParts[1] === 'menu' && pathParts[2]) {
        const restaurantId = pathParts[2]
        const tableNumber = url.searchParams.get('table')
        
        if (restaurantId && tableNumber) {
          setIsValidQR(true)
          // Redirigir automáticamente después de 2 segundos
          setTimeout(() => {
            router.push(data)
          }, 2000)
        } else {
          setIsValidQR(false)
          setError('Código QR incompleto. Falta información de mesa.')
        }
      } else {
        setIsValidQR(false)
        setError('Este no es un código QR válido del restaurante.')
      }
    } catch (e) {
      setIsValidQR(false)
      setError('Código QR inválido. Por favor, escanea el código de tu mesa.')
    }
  }

  const handleError = (error: string) => {
    setError(error)
    setScanResult('')
    setIsValidQR(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
          
          <h1 className="text-2xl font-bold text-center mb-2">Escanear Mesa</h1>
          <p className="text-center text-gray-600">
            Escanea el código QR de tu mesa para ver el menú
          </p>
        </div>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Escanear QR</TabsTrigger>
            <TabsTrigger value="manual">Código Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan">
            <QRScanner onScan={handleScan} onError={handleError} />
          </TabsContent>
          
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Ingresar Código
                </CardTitle>
                <CardDescription>
                  Ingresa el código de mesa que aparece junto al QR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const restaurantId = formData.get('restaurantId') as string
                    const tableNumber = formData.get('tableNumber') as string
                    
                    if (restaurantId && tableNumber) {
                      const url = `/menu/${restaurantId}?table=${tableNumber}`
                      router.push(url)
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="restaurantId">Código del Restaurante</Label>
                    <Input
                      id="restaurantId"
                      name="restaurantId"
                      placeholder="Ej: restaurant_001"
                      defaultValue="restaurant_001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tableNumber">Número de Mesa</Label>
                    <Input
                      id="tableNumber"
                      name="tableNumber"
                      placeholder="Ej: 5"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Acceder al Menú
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scanResult && isValidQR === true && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">¡Código válido!</AlertTitle>
            <AlertDescription className="text-green-700">
              Redirigiendo al menú...
            </AlertDescription>
          </Alert>
        )}

        {scanResult && isValidQR === false && (
          <Card className="mt-4 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Código QR no reconocido</CardTitle>
              <CardDescription>
                Por favor, asegúrate de escanear el código QR de la mesa del restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Código escaneado:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                {scanResult}
              </code>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Los códigos QR válidos te llevarán directamente al menú del restaurante
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}