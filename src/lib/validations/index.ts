import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede tener más de 50 caracteres')
    .regex(/^[a-zA-Z0-9._@-]+$/, 'El nombre de usuario solo puede contener letras, números, puntos, guiones y @'),
  fullName: z.string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(100, 'El nombre completo no puede tener más de 100 caracteres'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede tener más de 100 caracteres')
    .optional(),
  role: z.enum(['admin', 'cashier', 'waiter'], {
    errorMap: () => ({ message: 'Rol inválido' })
  }),
  isActive: z.boolean().default(true),
  restaurantId: z.string().min(1, 'El ID del restaurante es requerido'),
})

export const createUserSchema = userSchema.omit({ password: true }).extend({
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede tener más de 100 caracteres'),
})

export const updateUserSchema = userSchema.partial().omit({ restaurantId: true })

// Category validation schemas
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'El nombre de la categoría debe tener al menos 2 caracteres')
    .max(50, 'El nombre de la categoría no puede tener más de 50 caracteres'),
  icon: z.string()
    .min(1, 'El icono es requerido')
    .max(50, 'El icono no puede tener más de 50 caracteres'),
  sortOrder: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden debe ser mayor o igual a 0')
    .default(0),
  isActive: z.boolean().default(true),
})

export const createCategorySchema = categorySchema
export const updateCategorySchema = categorySchema.partial()

// Product validation schemas
export const productSchema = z.object({
  categoryId: z.string().min(1, 'La categoría es requerida'),
  name: z.string()
    .min(2, 'El nombre del producto debe tener al menos 2 caracteres')
    .max(100, 'El nombre del producto no puede tener más de 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),
  imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden debe ser mayor o igual a 0')
    .default(0),
})

export const createProductSchema = productSchema
export const updateProductSchema = productSchema.partial()

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>