1. Configuración de Firebase (Sin Auth)

    Dependencias a instalar:

    npm install firebase

    Estructura de archivos:

    - src/lib/firebase/config.ts - Configuración de Firebase
    - src/lib/firebase/db.ts - Funciones de Firestore
    - src/lib/auth/index.ts - Sistema de autenticación manual con Firestore 
    - src/contexts/AuthContext.tsx - Contexto de autenticación personalizado
    Sistema de autenticación manual:

    - Usuarios almacenados en Firestore con passwords hasheados (bcrypt)    
    - JWT o sessionStorage para mantener sesión
    - Middleware personalizado para proteger rutas

    2. Cambio de Ruta del Panel Admin

    Nueva ruta propuesta:

    De: /admin-panel-secure-2024
    A: /dashboard-xR7m9 (sufijo aleatorio pero más corto)

    Archivos a renombrar:

    src/app/admin-panel-secure-2024/ → src/app/dashboard-xR7m9/
      ├── cashier/
      ├── dashboard/
      ├── waiter/
      └── setup/ (nuevo)

    3. Optimización del Menú (Client-Side)

    Estrategia de carga por categorías:

    // Cargar categorías primero (ligero)
    const categories = await getCategories(restaurantId)

    // Cargar productos por categoría cuando se seleccione
    const products = await getProductsByCategory(restaurantId, categoryId)  

    Beneficios:

    - Carga inicial más rápida
    - Menos datos transferidos
    - Caché por categoría
    - Mejor experiencia en conexiones lentas

    4. Integración de Cloudinary

    Configuración:

    npm install next-cloudinary

    Componentes:

    - src/components/upload/ProductImageUpload.tsx
    - Variables de entorno en .env.local

    5. Setup Inicial del Restaurante

    Flujo simplificado:

    1. Crear manualmente el admin en Firestore
    2. Admin hace login en /dashboard-xR7m9/login
    3. Si no hay datos del restaurante → redirigir a /dashboard-xR7m9/setup 
    4. Formulario de configuración inicial

    Datos iniciales del admin (manual en Firestore):

    {
      username: "admin@restaurant.com",
      password: "hasheado_con_bcrypt",
      role: "admin",
      restaurantId: "restaurant_001",
      isActive: true
    }

    6. Estructura de Firestore Optimizada

    restaurants/
      └── {restaurantId}/
          ├── info (documento con datos básicos)
          ├── users/ (incluye admin creado manualmente)
          ├── categories/ (carga inicial)
          ├── products/ (carga por categoría)
          ├── tables/
          └── orders/

    Índices recomendados:

    - products: índice compuesto (restaurantId, categoryId, isAvailable)    
    - orders: índice compuesto (restaurantId, status, createdAt)

    7. Simulación de QR para Desarrollo

    URL pattern:

    /menu/{restaurantId}?table={tableNumber}

    Página de simulación:

    - /dev/qr - Lista de mesas disponibles
    - Genera links directos para testing

    8. Componentes a Crear/Modificar

    Nuevos:

    1. src/lib/auth/hash.ts - Funciones de hashing
    2. src/lib/auth/session.ts - Manejo de sesiones
    3. src/middleware.ts - Protección de rutas
    4. src/app/dashboard-xR7m9/login/page.tsx
    5. src/app/dashboard-xR7m9/setup/page.tsx

    Modificados:

    1. Menú: Implementar carga por categorías
    2. Rutas admin: Cambiar todas las referencias
    3. Componentes: Quitar Firebase Auth, usar sistema manual

    9. Variables de Entorno

    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=

    # Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
    NEXT_PUBLIC_CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    # Auth
    JWT_SECRET=

    Orden de Implementación:

    1. Cambiar rutas admin - Renombrar carpeta y actualizar referencias     
    2. Firebase Setup - Configuración básica sin Auth
    3. Sistema de auth manual - Login con Firestore
    4. Optimizar menú - Carga por categorías
    5. Setup inicial - Configuración del restaurante
    6. Cloudinary - Upload de imágenes
    7. QR Simulator - Para desarrollo

    Este plan simplifica la autenticación, optimiza la carga del menú y mantiene la seguridad con
    una ruta menos obvia.

● Update Todos
  - ☐ Cambiar rutas admin de admin-panel-secure-2024 a dashboard-xR7m9     
   -  ☐ Instalar y configurar Firebase
   - ☐ Crear sistema de autenticación manual con Firestore
   - ☐ Optimizar menú para carga por categorías
   - ☐ Crear página de setup inicial del restaurante
   - ☐ Integrar Cloudinary para upload de imágenes
  - ☐ Crear simulador de QR para desarrollo