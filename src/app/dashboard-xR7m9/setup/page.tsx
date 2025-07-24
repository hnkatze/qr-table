"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Store, MapPin, Clock, Phone } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    openingHours: "",
    location: {
      lat: 0,
      lng: 0
    },
    currency: "L.",
    timezone: "America/Tegucigalpa"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // TODO: Implementar guardado en Firebase
      // const restaurantId = await createRestaurant(formData)
      
      // Por ahora, simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirigir al dashboard
      router.push("/dashboard-xR7m9/dashboard")
    } catch (err) {
      console.error("Error creating restaurant:", err)
      setError("Error al crear el restaurante. Por favor intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("No se pudo obtener la ubicación. Por favor ingrese las coordenadas manualmente.")
        }
      )
    } else {
      setError("La geolocalización no está soportada en este navegador.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Configuración Inicial del Restaurante</CardTitle>
            <CardDescription>
              Complete la información de su restaurante para comenzar a usar el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información Básica
                </h3>
                
                <div>
                  <Label htmlFor="name">Nombre del Restaurante</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Restaurante El Sabor"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descripción de su restaurante"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+504 9999-9999"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </h3>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Dirección completa del restaurante"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitud</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.location.lat}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, lat: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="14.0650"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitud</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.location.lng}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, lng: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="-87.1715"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Obtener mi ubicación actual
                </Button>
              </div>

              {/* Horarios */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios
                </h3>

                <div>
                  <Label htmlFor="hours">Horario de Atención</Label>
                  <Input
                    id="hours"
                    value={formData.openingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                    placeholder="Ej: Lunes a Sábado 10:00 AM - 10:00 PM"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar y Continuar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard-xR7m9/dashboard")}
                  disabled={loading}
                >
                  Omitir por ahora
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}