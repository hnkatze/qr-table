# QR Table - Sistema de Menú Digital para Restaurantes

Sistema completo de menú digital y gestión de pedidos para restaurantes usando códigos QR. Los clientes escanean el código QR en su mesa, ven el menú y realizan pedidos directamente desde su dispositivo móvil.

## 🚀 Características Principales

### Para Clientes
- **Menú Digital**: Acceso instantáneo al menú escaneando el QR de la mesa
- **Sin Apps**: No requiere descargar ninguna aplicación
- **Seguimiento en Tiempo Real**: Ver el estado del pedido (recibido, en cocina, listo, servido)
- **Validación por Ubicación**: Solo se puede ordenar estando en el restaurante
- **Llamar al Mesero**: Botón para solicitar atención del personal

### Para el Restaurante
- **Panel Administrativo**: Dashboard completo con métricas y KPIs
- **Gestión de Roles**: Admin, Cajero y Mesero con permisos específicos
- **Órdenes en Tiempo Real**: Actualización instantánea de pedidos
- **Sistema de Notificaciones**: Alertas cuando los clientes solicitan atención
- **Analytics Avanzados**: Métricas de ventas, tiempos de servicio, productos más vendidos

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.2 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (basado en Radix UI)
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth con gestión de sesiones personalizada
- **Imágenes**: Cloudinary para almacenamiento de imágenes
- **QR Codes**: Generación dinámica de códigos QR por mesa

## 📋 Requisitos Previos

- Node.js 18+ 
- NPM o Yarn
- Cuenta de Firebase
- Cuenta de Cloudinary

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/qr-table.git
cd qr-table
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
```

4. **Configurar Firebase**

Crear los índices necesarios en Firestore:
```bash
firebase deploy --only firestore:indexes
```

5. **Ejecutar el proyecto**
```bash
npm run dev
```

## 📱 Uso del Sistema

### Como Cliente
1. Escanear el código QR en la mesa
2. Ver el menú y seleccionar productos
3. Confirmar el pedido con nombre
4. Seguir el estado del pedido en tiempo real

### Como Personal del Restaurante

#### Acceso al Panel
- URL: `/dashboard-xR7m9/login`
- Credenciales de prueba disponibles en el seed

#### Roles y Funcionalidades

**Administrador**
- Dashboard con métricas completas
- Gestión de usuarios, categorías y productos
- Configuración del restaurante
- Generación de códigos QR

**Cajero**
- Vista de órdenes listas para pago
- Procesamiento de pagos
- Vista de mesas activas

**Mesero**
- Gestión y modificación de órdenes
- Notificaciones de llamadas de mesa
- Vista de mesas activas

## 🗄️ Estructura de la Base de Datos

```
restaurants/
  └── {restaurantId}/
      ├── info (datos del restaurante)
      ├── users/ (usuarios del sistema)
      ├── categories/ (categorías de productos)
      ├── products/ (productos del menú)
      ├── orders/ (órdenes de los clientes)
      ├── tables/ (mesas del restaurante)
      └── tableCalls/ (llamadas de atención)
```

## 🚀 Deployment

### Vercel (Recomendado)
```bash
vercel
```

### Docker
```bash
docker build -t qr-table .
docker run -p 3000:3000 qr-table
```

## 📞 Contacto y Soporte

¿Interesado en implementar QR Table en tu restaurante?

- **Email**: henriquezhector1@hotmail.com
- **WhatsApp**: +504 9784-0276

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia privada. Contactar para términos de uso comercial.

---

Desarrollado con ❤️ para digitalizar restaurantes en Honduras y más allá.