import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import { db } from './config'

// Types
export interface Restaurant {
  name: string
  slogan?: string
  logoUrl?: string
  description: string
  address: string
  phone: string
  openingHours: string
  location: {
    lat: number
    lng: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface User {
  username: string
  passwordHash: string
  fullName: string
  role: 'admin' | 'cashier' | 'waiter'
  isActive: boolean
  restaurantId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Category {
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
  createdAt: Timestamp
}

export interface Product {
  categoryId: string
  name: string
  description: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Order {
  orderNumber: string
  tableNumber: string
  customerName?: string
  status: 'received' | 'in_kitchen' | 'ready' | 'served' | 'paid' | 'cancelled'
  totalAmount: number
  notes?: string
  cancellationReason?: string
  timestamps: {
    receivedAt: Timestamp
    kitchenAt?: Timestamp
    readyAt?: Timestamp
    servedAt?: Timestamp
    paidAt?: Timestamp
    cancelledAt?: Timestamp
  }
  users: {
    createdBy?: string
    updatedBy?: string
    cashierId?: string
    waiterId?: string
    cancelledBy?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface OrderItem {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
  notes?: string
}

export interface Table {
  tableNumber: string
  qrCode: string
  isActive: boolean
  createdAt: Timestamp
}

export interface TableCall {
  tableNumber: string
  orderId: string
  orderNumber: string
  reason: 'waiter' | 'bill' | 'other'
  status: 'pending' | 'attended'
  message?: string
  createdAt: Timestamp
  attendedAt?: Timestamp
  attendedBy?: string
}

// Helper functions
const getRestaurantRef = (restaurantId: string) => doc(db, 'restaurants', restaurantId)

// Restaurant operations
export const getRestaurant = async (restaurantId: string): Promise<Restaurant | null> => {
  const docRef = doc(db, 'restaurants', restaurantId, 'info', 'data')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as Restaurant) : null
}

export const updateRestaurant = async (restaurantId: string, data: Partial<Restaurant>) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'info', 'data')
  // Use setDoc with merge: true to create if doesn't exist or update if exists
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// User operations
export const getUsers = async (restaurantId: string, constraints: QueryConstraint[] = []) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'users')
  const q = query(colRef, ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User & { id: string }))
}

export const getUserByUsername = async (restaurantId: string, username: string) => {
  const users = await getUsers(restaurantId, [where('username', '==', username)])
  return users.length > 0 ? users[0] : null
}

export const createUser = async (restaurantId: string, userData: Omit<User, 'createdAt' | 'updatedAt'>) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'users')
  return await addDoc(colRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const getUser = async (restaurantId: string, userId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'users', userId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User & { id: string } : null
}

export const updateUser = async (restaurantId: string, userId: string, data: Partial<User>) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'users', userId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteUser = async (restaurantId: string, userId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'users', userId)
  await deleteDoc(docRef)
}

// Category operations
export const getCategories = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'categories')
  const q = query(colRef, where('isActive', '==', true), orderBy('sortOrder'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category & { id: string }))
}

export const getAllCategories = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'categories')
  const q = query(colRef, orderBy('sortOrder'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category & { id: string }))
}

export const getCategory = async (restaurantId: string, categoryId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'categories', categoryId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Category & { id: string } : null
}

export const createCategory = async (restaurantId: string, categoryData: Omit<Category, 'createdAt'>) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'categories')
  return await addDoc(colRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
  })
}

export const updateCategory = async (restaurantId: string, categoryId: string, data: Partial<Category>) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'categories', categoryId)
  await updateDoc(docRef, data)
}

export const deleteCategory = async (restaurantId: string, categoryId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'categories', categoryId)
  await deleteDoc(docRef)
}

// Product operations
export const getProductsByCategory = async (restaurantId: string, categoryId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'products')
  const q = query(
    colRef,
    where('categoryId', '==', categoryId),
    where('isAvailable', '==', true),
    orderBy('sortOrder')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product & { id: string }))
}

export const getAllProducts = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'products')
  const q = query(colRef, where('isAvailable', '==', true), orderBy('sortOrder'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product & { id: string }))
}

export const getAllProductsAdmin = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'products')
  const q = query(colRef, orderBy('sortOrder'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product & { id: string }))
}

export const getProduct = async (restaurantId: string, productId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'products', productId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Product & { id: string } : null
}

export const createProduct = async (restaurantId: string, productData: Omit<Product, 'createdAt' | 'updatedAt'>) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'products')
  return await addDoc(colRef, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateProduct = async (restaurantId: string, productId: string, data: Partial<Product>) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'products', productId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteProduct = async (restaurantId: string, productId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'products', productId)
  await deleteDoc(docRef)
}

// Order operations
export const getOrders = async (restaurantId: string, constraints: QueryConstraint[] = []) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'orders')
  const q = query(colRef, ...constraints, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  
  const orders = await Promise.all(
    snapshot.docs.map(async (doc) => {
      // Get order items
      const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', doc.id, 'items')
      const itemsSnapshot = await getDocs(itemsColRef)
      const items = itemsSnapshot.docs.map(itemDoc => ({ 
        id: itemDoc.id, 
        ...itemDoc.data() 
      } as OrderItem & { id: string }))
      
      return {
        id: doc.id,
        ...doc.data(),
        items
      } as Order & { id: string; items: (OrderItem & { id: string })[] }
    })
  )
  
  return orders
}

export const subscribeToOrders = (
  restaurantId: string,
  callback: (orders: (Order & { id: string; items: (OrderItem & { id: string })[] })[]) => void,
  constraints: QueryConstraint[] = []
) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'orders')
  const q = query(colRef, ...constraints, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, async (snapshot) => {
    console.log('Orders snapshot received:', snapshot.docs.length, 'orders')
    const orders = await Promise.all(
      snapshot.docs.map(async (doc) => {
        console.log('Processing order:', doc.id, doc.data())
        // Get order items
        const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', doc.id, 'items')
        const itemsSnapshot = await getDocs(itemsColRef)
        const items = itemsSnapshot.docs.map(itemDoc => ({ 
          id: itemDoc.id, 
          ...itemDoc.data() 
        } as OrderItem & { id: string }))
        
        return {
          id: doc.id,
          ...doc.data(),
          items
        } as Order & { id: string; items: (OrderItem & { id: string })[] }
      })
    )
    
    callback(orders)
  }, (error) => {
    console.error('Error in subscribeToOrders:', error)
  })
}

export const updateOrderStatus = async (
  restaurantId: string,
  orderId: string,
  newStatus: Order['status'],
  userId?: string,
  cancellationReason?: string
) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)
  const updateData: any = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  }
  
  // Add timestamp based on status
  switch (newStatus) {
    case 'in_kitchen':
      updateData['timestamps.inKitchenAt'] = serverTimestamp()
      if (userId) updateData['users.chef'] = userId
      break
    case 'ready':
      updateData['timestamps.readyAt'] = serverTimestamp()
      break
    case 'served':
      updateData['timestamps.servedAt'] = serverTimestamp()
      if (userId) updateData['users.waiter'] = userId
      break
    case 'paid':
      updateData['timestamps.paidAt'] = serverTimestamp()
      if (userId) updateData['users.cashier'] = userId
      break
    case 'cancelled':
      updateData['timestamps.cancelledAt'] = serverTimestamp()
      if (userId) updateData['users.cancelledBy'] = userId
      if (cancellationReason) updateData['cancellationReason'] = cancellationReason
      break
  }
  
  await updateDoc(docRef, updateData)
}

export const updateOrder = async (
  restaurantId: string,
  orderId: string,
  updateData: {
    items?: (OrderItem & { id: string })[],
    totalAmount?: number,
    updatedAt?: any
  }
) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)
  
  // If items are being updated, we need to update the subcollection
  if (updateData.items) {
    const items = updateData.items
    
    // Delete all existing items
    const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', orderId, 'items')
    const existingItems = await getDocs(itemsColRef)
    const deletePromises = existingItems.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    // Add new items
    const addPromises = items.map(item => {
      const { id, ...itemData } = item
      if (id.startsWith('new-')) {
        // New item, create without id
        return addDoc(itemsColRef, {
          ...itemData,
          createdAt: serverTimestamp()
        })
      } else {
        // Existing item, use the same id
        return setDoc(doc(itemsColRef, id), {
          ...itemData,
          createdAt: itemData.createdAt || serverTimestamp()
        })
      }
    })
    await Promise.all(addPromises)
    
    // Remove items from updateData since we handled them separately
    const { items: _, ...restUpdateData } = updateData
    await updateDoc(docRef, {
      ...restUpdateData,
      updatedAt: serverTimestamp()
    })
  } else {
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  }
}

export const getOrder = async (restaurantId: string, orderId: string) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }
  
  // Get order items
  const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', orderId, 'items')
  const itemsSnapshot = await getDocs(itemsColRef)
  const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderItem & { id: string }))
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    items
  } as Order & { id: string; items: (OrderItem & { id: string })[] }
}

export const subscribeToOrder = (
  restaurantId: string, 
  orderId: string, 
  callback: (order: Order & { id: string; items: (OrderItem & { id: string })[] } | null) => void
) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId)
  
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      callback(null)
      return
    }
    
    // Get order items
    const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', orderId, 'items')
    const itemsSnapshot = await getDocs(itemsColRef)
    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderItem & { id: string }))
    
    callback({
      id: docSnap.id,
      ...docSnap.data(),
      items
    } as Order & { id: string; items: (OrderItem & { id: string })[] })
  })
}

export const checkTableHasActiveOrder = async (restaurantId: string, tableNumber: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'orders')
  const q = query(
    colRef,
    where('tableNumber', '==', tableNumber),
    where('status', 'in', ['received', 'in_kitchen', 'ready', 'served'])
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.length > 0
}

export const createOrder = async (
  restaurantId: string, 
  orderData: Omit<Order, 'createdAt' | 'updatedAt'>,
  orderItems: OrderItem[]
) => {
  // Check if table already has an active order
  const hasActiveOrder = await checkTableHasActiveOrder(restaurantId, orderData.tableNumber)
  if (hasActiveOrder) {
    throw new Error('Esta mesa ya tiene una orden activa. Por favor espera a que se complete la orden actual.')
  }

  const orderColRef = collection(db, 'restaurants', restaurantId, 'orders')
  
  // Si el estado es 'received', agregamos el timestamp correspondiente
  if (orderData.status === 'received') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderData.timestamps.receivedAt = serverTimestamp() as any
  }
  
  // Create the order document
  const orderDoc = await addDoc(orderColRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Create order items subcollection
  const itemsColRef = collection(db, 'restaurants', restaurantId, 'orders', orderDoc.id, 'items')
  
  // Add all order items
  const itemPromises = orderItems.map(item => 
    addDoc(itemsColRef, {
      ...item,
      createdAt: serverTimestamp()
    })
  )
  
  await Promise.all(itemPromises)
  
  return orderDoc.id
}

export const getActiveOrders = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'orders')
  const q = query(
    colRef,
    where('status', 'in', ['received', 'in_kitchen', 'ready', 'served']),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order & { id: string }))
}

// Table operations
export const getTables = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'tables')
  const q = query(colRef, where('isActive', '==', true), orderBy('tableNumber'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table & { id: string }))
}

export const getTablesWithActiveOrders = async (restaurantId: string) => {
  // Get all active orders
  const ordersRef = collection(db, 'restaurants', restaurantId, 'orders')
  const ordersQuery = query(
    ordersRef,
    where('status', 'in', ['received', 'in_kitchen', 'ready', 'served'])
  )
  const ordersSnapshot = await getDocs(ordersQuery)
  
  // Group orders by table
  const tableOrders: Record<string, Order & { id: string }> = {}
  ordersSnapshot.docs.forEach(doc => {
    const order = { id: doc.id, ...doc.data() } as Order & { id: string }
    tableOrders[order.tableNumber] = order
  })
  
  return tableOrders
}

// Table calls operations
export const createTableCall = async (
  restaurantId: string,
  callData: Omit<TableCall, 'createdAt' | 'status'>
) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'tableCalls')
  const dataToSave: any = {
    tableNumber: callData.tableNumber,
    orderId: callData.orderId,
    orderNumber: callData.orderNumber,
    reason: callData.reason,
    status: 'pending',
    createdAt: serverTimestamp()
  }
  
  // Only add message if it's defined and not empty
  if (callData.message && callData.message.trim()) {
    dataToSave.message = callData.message
  }
  
  return await addDoc(colRef, dataToSave)
}

export const getActiveTableCalls = async (restaurantId: string) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'tableCalls')
  const q = query(colRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TableCall & { id: string }))
}

export const attendTableCall = async (
  restaurantId: string,
  callId: string,
  userId: string
) => {
  const docRef = doc(db, 'restaurants', restaurantId, 'tableCalls', callId)
  await updateDoc(docRef, {
    status: 'attended',
    attendedAt: serverTimestamp(),
    attendedBy: userId
  })
}

export const subscribeToTableCalls = (
  restaurantId: string,
  callback: (calls: (TableCall & { id: string })[]) => void
) => {
  const colRef = collection(db, 'restaurants', restaurantId, 'tableCalls')
  const q = query(colRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const calls = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as TableCall & { id: string }))
    callback(calls)
  })
}

// Generate order number
export const generateOrderNumber = (): string => {
  const date = new Date()
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '')
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '')
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `ORD-${dateStr}-${timeStr}-${random}`
}