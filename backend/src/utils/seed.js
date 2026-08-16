import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  await User.deleteMany();
  await Product.deleteMany();

  const admin = await User.create({
    name: 'Admin',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin'
  });

  console.log('Admin created:', admin.phone);

  const categories = ['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Stationery'];

  const products = [
    { name: 'Basmati Rice 1kg', description: 'Premium quality long grain basmati rice', price: 120, stock: 50, category: 'Groceries', imageUrl: '' },
    { name: 'Toor Dal 1kg', description: 'Fresh pigeon peas, rich in protein', price: 140, stock: 30, category: 'Groceries', imageUrl: '' },
    { name: 'Sunflower Oil 1L', description: 'Refined sunflower cooking oil', price: 150, stock: 25, category: 'Groceries', imageUrl: '' },
    { name: 'Wheat Flour 5kg', description: 'Whole wheat atta for soft rotis', price: 220, stock: 40, category: 'Groceries', imageUrl: '' },
    { name: 'Sugar 1kg', description: 'Crystal white sugar', price: 45, stock: 60, category: 'Groceries', imageUrl: '' },
    { name: 'Dish Wash Bar', description: 'Lemon freshness, tough on grease', price: 35, stock: 40, category: 'Household', imageUrl: '' },
    { name: 'Floor Cleaner 1L', description: 'Disinfectant floor cleaner, citrus scent', price: 95, stock: 20, category: 'Household', imageUrl: '' },
    { name: 'Toilet Cleaner 500ml', description: 'Powerful stain removal', price: 85, stock: 15, category: 'Household', imageUrl: '' },
    { name: 'Laundry Detergent 1kg', description: 'High foam, fresh fragrance', price: 180, stock: 35, category: 'Household', imageUrl: '' },
    { name: 'Potato Chips 50g', description: 'Classic salted potato chips', price: 20, stock: 100, category: 'Snacks', imageUrl: '' },
    { name: 'Masala Peanuts 100g', description: 'Spicy roasted peanuts', price: 30, stock: 80, category: 'Snacks', imageUrl: '' },
    { name: 'Banana Chips 100g', description: 'Kerala style crispy banana chips', price: 45, stock: 60, category: 'Snacks', imageUrl: '' },
    { name: 'Chocolate Bar 40g', description: 'Milk chocolate with nuts', price: 50, stock: 70, category: 'Snacks', imageUrl: '' },
    { name: 'Coca Cola 750ml', description: 'Original taste', price: 45, stock: 50, category: 'Beverages', imageUrl: '' },
    { name: 'Orange Juice 1L', description: '100% real fruit juice', price: 120, stock: 25, category: 'Beverages', imageUrl: '' },
    { name: 'Green Tea 25 bags', description: 'Premium green tea bags', price: 180, stock: 15, category: 'Beverages', imageUrl: '' },
    { name: 'Instant Coffee 50g', description: 'Rich aroma instant coffee', price: 150, stock: 20, category: 'Beverages', imageUrl: '' },
    { name: 'Toothpaste 100g', description: 'Cavity protection, fresh breath', price: 95, stock: 40, category: 'Personal Care', imageUrl: '' },
    { name: 'Shampoo 180ml', description: 'Anti-dandruff, nourishing formula', price: 160, stock: 30, category: 'Personal Care', imageUrl: '' },
    { name: 'Body Soap 125g', description: 'Moisturizing, natural ingredients', price: 45, stock: 50, category: 'Personal Care', imageUrl: '' },
    { name: 'Hand Wash 200ml', description: 'Antibacterial, gentle on skin', price: 85, stock: 25, category: 'Personal Care', imageUrl: '' },
    { name: 'Notebook A5 200 pages', description: 'Ruled, soft cover', price: 60, stock: 40, category: 'Stationery', imageUrl: '' },
    { name: 'Ball Pen Pack 10pcs', description: 'Smooth writing, blue ink', price: 50, stock: 60, category: 'Stationery', imageUrl: '' },
    { name: 'Pencil Box', description: 'Geometry box with compass', price: 120, stock: 15, category: 'Stationery', imageUrl: '' },
    { name: 'Sticky Notes 3x3', description: 'Yellow, 100 sheets', price: 35, stock: 50, category: 'Stationery', imageUrl: '' }
  ];

  await Product.insertMany(products);
  console.log(`${products.length} products seeded`);

  console.log('Seeding completed!');
  process.exit(0);
};

seedData().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});