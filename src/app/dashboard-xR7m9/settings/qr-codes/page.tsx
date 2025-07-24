'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2, AlertCircle, QrCode, Download, Plus, Trash2, Eye } from 'lucide-react'
import QRCode from 'qrcode'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface QRTable {
  tableNumber: string
  url: string
  qrCode: string
}

export default function QRCodesPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [tables, setTables] = useState<QRTable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTableNumber, setNewTableNumber] = useState('')
  const [previewQR, setPreviewQR] = useState<QRTable | null>(null)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard-xR7m9/dashboard')
      return
    }
    loadExistingTables()
  }, [currentUser, router])

  // Cargar mesas existentes del localStorage por ahora
  const loadExistingTables = () => {
    const savedTables = localStorage.getItem(`qr_tables_${currentUser?.restaurantId}`)
    if (savedTables) {
      setTables(JSON.parse(savedTables))
    }
  }

  // Guardar mesas en localStorage
  const saveTables = (newTables: QRTable[]) => {
    localStorage.setItem(`qr_tables_${currentUser?.restaurantId}`, JSON.stringify(newTables))
    setTables(newTables)
  }

  const generateQRCode = async (tableNumber: string) => {
    try {
      const baseUrl = window.location.origin
      const url = `${baseUrl}/menu/${currentUser?.restaurantId}?table=${tableNumber}`
      
      // Generar código QR como data URL
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      return { url, qrCode }
    } catch (err) {
      throw new Error('Error al generar código QR')
    }
  }

  const handleAddTable = async () => {
    if (!newTableNumber) {
      setError('Por favor ingresa un número de mesa')
      return
    }

    // Verificar si la mesa ya existe
    if (tables.some(t => t.tableNumber === newTableNumber)) {
      setError('Esta mesa ya tiene un código QR generado')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { url, qrCode } = await generateQRCode(newTableNumber)
      const newTable: QRTable = {
        tableNumber: newTableNumber,
        url,
        qrCode,
      }

      const updatedTables = [...tables, newTable].sort((a, b) => 
        parseInt(a.tableNumber) - parseInt(b.tableNumber)
      )
      
      saveTables(updatedTables)
      setNewTableNumber('')
    } catch (err: any) {
      setError(err.message || 'Error al crear código QR')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = (tableNumber: string) => {
    const updatedTables = tables.filter(t => t.tableNumber !== tableNumber)
    saveTables(updatedTables)
  }

  const downloadQRCode = (table: QRTable) => {
    const link = document.createElement('a')
    link.href = table.qrCode
    link.download = `mesa-${table.tableNumber}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllQRCodes = async () => {
    // Por simplicidad, descargamos uno por uno
    // En producción, podrías crear un ZIP
    tables.forEach((table, index) => {
      setTimeout(() => {
        downloadQRCode(table)
      }, index * 500) // Pequeño delay entre descargas
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard-xR7m9/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Códigos QR de Mesas</h1>
          <p className="text-gray-600">Genera y administra los códigos QR para cada mesa</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario para agregar mesa */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Mesa</CardTitle>
          <CardDescription>
            Genera un código QR para una nueva mesa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tableNumber">Número de Mesa</Label>
              <Input
                id="tableNumber"
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="Ej: 1, 2, 3..."
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTable} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generar QR
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de códigos QR */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Códigos QR Generados</CardTitle>
              <CardDescription>
                {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'} con código QR
              </CardDescription>
            </div>
            {tables.length > 0 && (
              <Button variant="outline" onClick={downloadAllQRCodes}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay códigos QR generados aún
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>URL del QR</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.tableNumber}>
                    <TableCell className="font-medium">
                      Mesa {table.tableNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {table.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPreviewQR(table)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Código QR - Mesa {table.tableNumber}</DialogTitle>
                              <DialogDescription>
                                Escanea este código para acceder al menú
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center space-y-4">
                              <img 
                                src={table.qrCode} 
                                alt={`QR Mesa ${table.tableNumber}`}
                                className="w-64 h-64"
                              />
                              <div className="text-sm text-gray-600 text-center break-all">
                                {table.url}
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => downloadQRCode(table)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar PNG
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadQRCode(table)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteTable(table.tableNumber)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            1. Genera un código QR para cada mesa de tu restaurante
          </p>
          <p className="text-sm text-gray-600">
            2. Descarga e imprime los códigos QR
          </p>
          <p className="text-sm text-gray-600">
            3. Coloca cada código en su mesa correspondiente
          </p>
          <p className="text-sm text-gray-600">
            4. Los clientes pueden escanear el código para ver el menú y hacer pedidos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}