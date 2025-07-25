import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  role: z.enum(['admin', 'cashier', 'waiter'] as const).describe('Rol inválido'),
  isActive: z.boolean().default(true),
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  restaurantId: z.string().min(1, 'El ID del restaurante es requerido'),
})

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  icon: z.string().min(1, 'El ícono es requerido'),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

export const createProductSchema = z.object({
  categoryId: z.string().min(1, 'La categoría es requerida'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

export const updateProductSchema = createProductSchema.partial()

export const createOrderSchema = z.object({
  tableNumber: z.string().min(1, 'El número de mesa es requerido'),
  customerName: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    productPrice: z.number(),
    quantity: z.number().int().positive(),
    subtotal: z.number(),
    notes: z.string().optional(),
  })).min(1, 'Debe agregar al menos un producto'),
  totalAmount: z.number().positive(),
  notes: z.string().optional(),
})