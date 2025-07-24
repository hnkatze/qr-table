"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, User, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock authentication - en producción usar autenticación real
    if (credentials.username === "admin" && credentials.password === "admin123") {
      window.location.href = "/dashboard-xR7m9/dashboard"
    } else if (credentials.username === "cajero" && credentials.password === "cajero123") {
      window.location.href = "/dashboard-xR7m9/cashier"
    } else if (credentials.username === "mesero" && credentials.password === "mesero123") {
      window.location.href = "/dashboard-xR7m9/waiter"
    } else {
      setError("Credenciales incorrectas")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Panel Administrativo</CardTitle>
          <CardDescription>Acceso restringido para personal autorizado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="pl-10"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="pl-10"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Credenciales de prueba:</p>
            <div className="text-xs space-y-1">
              <p>
                <strong>Admin:</strong> admin / admin123
              </p>
              <p>
                <strong>Cajero:</strong> cajero / cajero123
              </p>
              <p>
                <strong>Mesero:</strong> mesero / mesero123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
