-- Datos de prueba para el sistema de restaurante QR

-- Insertar restaurante de ejemplo
INSERT INTO restaurants (id, name, description, address, phone, latitude, longitude) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tacos El Sabroso', 'Los mejores tacos de la ciudad', 'Col. Palmira, Tegucigalpa', '+504 9999-9999', 14.0723, -87.1921);

-- Insertar usuarios
INSERT INTO users (id, restaurant_id, username, password_hash, full_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin', '$2b$10$example_hash_admin', 'Administrador Principal', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'cajero', '$2b$10$example_hash_cashier', 'Juan Pérez', 'cashier'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'mesero', '$2b$10$example_hash_waiter', 'María González', 'waiter');

-- Insertar categorías
INSERT INTO categories (id, restaurant_id, name, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Tacos', '🌮', 1),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Baleadas', '🫓', 2),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Bebidas', '🥤', 3),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Postres', '🍰', 4);

-- Insertar productos
INSERT INTO products (id, restaurant_id, category_id, name, description, price, sort_order) VALUES
-- Tacos
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'Taco de Pollo', 'Delicioso taco con pollo marinado, cebolla, cilantro y salsa verde', 25.00, 1),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'Taco de Carne', 'Taco con carne asada, cebolla morada, cilantro y salsa roja', 30.00, 2),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'Taco de Cerdo', 'Taco con cerdo al pastor, piña, cebolla y salsa verde', 28.00, 3),

-- Baleadas
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Baleada Sencilla', 'Tortilla de harina con frijoles, queso y crema', 20.00, 1),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Baleada Especial', 'Baleada con frijoles, queso, crema, huevo y aguacate', 35.00, 2),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Baleada con Pollo', 'Baleada con pollo desmenuzado, frijoles, queso y crema', 40.00, 3),

-- Bebidas
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'Coca Cola', 'Refresco de cola 355ml', 15.00, 1),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'Jugo Natural', 'Jugo de naranja natural 12oz', 18.00, 2),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'Agua Embotellada', 'Agua purificada 500ml', 10.00, 3),

-- Postres
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', 'Tres Leches', 'Pastel tres leches casero', 25.00, 1),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', 'Flan', 'Flan de vainilla con caramelo', 20.00, 2);

-- Insertar mesas QR
INSERT INTO qr_tables (restaurant_id, table_number, qr_code) VALUES
('550e8400-e29b-41d4-a716-446655440000', '1', 'QR_TABLE_001'),
('550e8400-e29b-41d4-a716-446655440000', '2', 'QR_TABLE_002'),
('550e8400-e29b-41d4-a716-446655440000', '3', 'QR_TABLE_003'),
('550e8400-e29b-41d4-a716-446655440000', '4', 'QR_TABLE_004'),
('550e8400-e29b-41d4-a716-446655440000', '5', 'QR_TABLE_005'),
('550e8400-e29b-41d4-a716-446655440000', '6', 'QR_TABLE_006'),
('550e8400-e29b-41d4-a716-446655440000', '7', 'QR_TABLE_007'),
('550e8400-e29b-41d4-a716-446655440000', '8', 'QR_TABLE_008');

-- Insertar algunas órdenes de ejemplo
INSERT INTO orders (id, restaurant_id, order_number, table_number, customer_name, status, total_amount, received_at, kitchen_at, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', 'ORD-001', '3', 'Ana García', 'in_kitchen', 65.00, CURRENT_TIMESTAMP - INTERVAL '10 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440000', 'ORD-002', '7', 'Carlos López', 'received', 35.00, CURRENT_TIMESTAMP - INTERVAL '3 minutes', NULL, '550e8400-e29b-41d4-a716-446655440003');

-- Insertar items de las órdenes
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
-- Orden 1
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440020', 'Taco de Pollo', 25.00, 2, 50.00),
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440040', 'Coca Cola', 15.00, 1, 15.00),

-- Orden 2
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440030', 'Baleada Sencilla', 20.00, 1, 20.00),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', 'Jugo Natural', 15.00, 1, 15.00);
