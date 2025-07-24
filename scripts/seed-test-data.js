// This is a JavaScript version that can be run directly
// First, you need to get your restaurant ID from Firebase console or from your app

const RESTAURANT_ID = 'YOUR_RESTAURANT_ID_HERE'; // <-- UPDATE THIS!

// Run this in your browser console while on your app (where Firebase is already initialized)
// Or use this as a guide to create the data manually

const categoriesData = [
  { name: 'Bebidas Calientes', icon: '☕', sortOrder: 1, isActive: true },
  { name: 'Bebidas Frías', icon: '🥤', sortOrder: 2, isActive: true },
  { name: 'Postres', icon: '🍰', sortOrder: 3, isActive: true },
  { name: 'Snacks', icon: '🥪', sortOrder: 4, isActive: true },
];

const productsByCategory = {
  'Bebidas Calientes': [
    { name: 'Café Americano', description: 'Café negro clásico', price: 35 },
    { name: 'Cappuccino', description: 'Espresso con leche espumosa', price: 45 },
    { name: 'Latte', description: 'Café con leche cremoso', price: 50 },
    { name: 'Chocolate Caliente', description: 'Chocolate cremoso con malvaviscos', price: 55 },
  ],
  'Bebidas Frías': [
    { name: 'Frappé de Café', description: 'Café helado con crema', price: 60 },
    { name: 'Limonada Natural', description: 'Limonada fresca del día', price: 35 },
    { name: 'Té Helado', description: 'Té negro con hielo y limón', price: 40 },
    { name: 'Smoothie de Frutas', description: 'Mezcla de frutas tropicales', price: 65 },
  ],
  'Postres': [
    { name: 'Cheesecake', description: 'Tarta de queso con frutos rojos', price: 85 },
    { name: 'Brownie', description: 'Brownie de chocolate con helado', price: 75 },
    { name: 'Tiramisú', description: 'Postre italiano clásico', price: 90 },
    { name: 'Flan de Caramelo', description: 'Flan casero tradicional', price: 65 },
  ],
  'Snacks': [
    { name: 'Sandwich Club', description: 'Triple con pollo, tocino y vegetales', price: 95 },
    { name: 'Wrap de Pollo', description: 'Tortilla con pollo grillado', price: 85 },
    { name: 'Ensalada César', description: 'Lechuga, crutones, parmesano', price: 80 },
    { name: 'Nachos con Queso', description: 'Nachos con queso fundido y jalapeños', price: 70 },
  ],
};

// Sample Firebase commands to run in console:
console.log('📋 Copy these commands to create categories:');
console.log('');
categoriesData.forEach(cat => {
  console.log(`// Create category: ${cat.name}`);
  console.log(`await createCategory('${RESTAURANT_ID}', ${JSON.stringify(cat, null, 2)});`);
  console.log('');
});

console.log('\n📋 After creating categories, get their IDs and use them to create products:');
console.log('// First, get the category IDs from Firebase console or by querying');
console.log('// Then create products like this:');

const TEST_IMAGE = 'https://res.cloudinary.com/djluqrprg/image/upload/v1753233963/qr-table/products/products/chai-caliente-1753233965497.png';

Object.entries(productsByCategory).forEach(([categoryName, products]) => {
  console.log(`\n// Products for ${categoryName} (replace CATEGORY_ID_HERE with actual ID)`);
  products.forEach((product, index) => {
    const productData = {
      categoryId: 'CATEGORY_ID_HERE',
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: TEST_IMAGE,
      isAvailable: true,
      sortOrder: index + 1
    };
    console.log(`await createProduct('${RESTAURANT_ID}', ${JSON.stringify(productData, null, 2)});`);
  });
});