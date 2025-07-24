"use client"
import { QrCode, MapPin, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">MenuQR</span>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard-xR7m9">Panel Admin</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Moderniza tu Restaurante con
            <span className="text-orange-600"> Códigos QR</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Permite que tus clientes vean el menú y ordenen directamente desde su mesa. Sin apps, sin complicaciones,
            solo escanear y ordenar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Comenzar Gratis
            </Button>
            <Button size="lg" variant="outline">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para digitalizar tu restaurante
            </h2>
            <p className="text-lg text-gray-600">
              Una solución completa y económica para restaurantes de comida rápida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <QrCode className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Menú Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Los clientes escanean el QR en la mesa y ven tu menú actualizado al instante
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Seguridad por Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Solo se puede ordenar desde el restaurante, evitando pedidos falsos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Seguimiento en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Los clientes ven el estado de su orden y el tiempo estimado de entrega</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Analytics y KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Métricas detalladas de ventas, tiempos de servicio y rendimiento del equipo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Precios Accesibles para Todos</h2>
            <p className="text-lg text-gray-600">Sin costos ocultos, sin comisiones por transacción</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Básico</CardTitle>
                <CardDescription>Perfecto para empezar</CardDescription>
                <div className="text-3xl font-bold">
                  L. 500<span className="text-lg font-normal">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Hasta 50 productos</li>
                  <li>✓ 1 usuario cajero</li>
                  <li>✓ QR ilimitados</li>
                  <li>✓ Reportes básicos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle>Profesional</CardTitle>
                <CardDescription>Más popular</CardDescription>
                <div className="text-3xl font-bold">
                  L. 800<span className="text-lg font-normal">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Productos ilimitados</li>
                  <li>✓ 3 usuarios (cajero + meseros)</li>
                  <li>✓ Analytics avanzados</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empresarial</CardTitle>
                <CardDescription>Para múltiples sucursales</CardDescription>
                <div className="text-3xl font-bold">
                  L. 1,200<span className="text-lg font-normal">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Todo lo anterior</li>
                  <li>✓ Usuarios ilimitados</li>
                  <li>✓ Múltiples sucursales</li>
                  <li>✓ API personalizada</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <QrCode className="h-6 w-6" />
                <span className="text-xl font-bold">MenuQR</span>
              </div>
              <p className="text-gray-400">La solución más simple y económica para digitalizar tu restaurante.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Características</li>
                <li>Precios</li>
                <li>Demo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>WhatsApp</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Términos</li>
                <li>Privacidad</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MenuQR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
