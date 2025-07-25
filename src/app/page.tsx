"use client"
import { QrCode, MapPin, Clock, TrendingUp, Mail, MessageCircle, Shield, Camera } from "lucide-react"
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
              <span className="text-2xl font-bold text-gray-900">QR Table</span>
            </div>
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
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
              <a href="/scan">
                <Camera className="h-5 w-5 mr-2" />
                Escanear QR
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/menu/restaurant_001?table=demo">
                Ver Demo
              </a>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Quieres tener tu propio QR en la mesa?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comunícate con nosotros y hablamos sobre cómo podemos digitalizar tu restaurante
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100"
              asChild
            >
              <a href="mailto:henriquezhector1@hotmail.com">
                <Mail className="h-5 w-5 mr-2" />
                Enviar Email
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-green-500 text-white hover:bg-green-600 border-0"
              asChild
            >
              <a 
                href="https://wa.me/50497840276?text=Hola,%20me%20interesa%20QR%20Table%20para%20mi%20restaurante"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp: +504 9784-0276
              </a>
            </Button>
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
                <span className="text-xl font-bold">QR Table</span>
              </div>
              <p className="text-gray-400">La solución más simple y económica para digitalizar tu restaurante.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/scan" className="hover:text-white transition-colors">
                    Escanear QR
                  </a>
                </li>
                <li>
                  <a href="/qr-simulator" className="hover:text-white transition-colors">
                    Simulador QR
                  </a>
                </li>
                <li>
                  <a href="/menu/restaurant_001?table=demo" className="hover:text-white transition-colors">
                    Ver Demo
                  </a>
                </li>
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
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400">&copy; 2024 QR Table. Todos los derechos reservados.</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white mt-4 sm:mt-0"
                asChild
              >
                <a href="/dashboard-xR7m9" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Panel Admin
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
