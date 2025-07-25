'use client'

import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, X, QrCode } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string>('')

  const handleScan = (results: any[]) => {
    if (results && results.length > 0) {
      const result = results[0].rawValue
      if (result && result !== lastScan) {
        setLastScan(result)
        onScan(result)
        setIsScanning(false)
      }
    }
  }

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    if (onError) {
      onError(error?.message || 'Error al escanear el código QR')
    }
  }

  if (!isScanning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Escanear Código QR
          </CardTitle>
          <CardDescription>
            Escanea el código QR de la mesa para acceder al menú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsScanning(true)}
            className="w-full"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Abrir Cámara
          </Button>
          {lastScan && (
            <Alert className="mt-4">
              <AlertDescription>
                Último código escaneado: <code className="text-sm">{lastScan}</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escaneando...
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsScanning(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Coloca el código QR dentro del recuadro
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-square max-w-md mx-auto">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment'
            }}
            formats={['qr_code']}
            components={{
              onOff: false,
              torch: false,
              zoom: false,
              finder: true,
            }}
            styles={{
              container: {
                width: '100%',
                height: '100%'
              },
              video: {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}