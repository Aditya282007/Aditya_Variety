import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Keep admin user
    const admin = await User.findOne({ phone: '9999999999', role: 'admin' });
    if (!admin) {
      console.error('Admin user not found! Aborting.');
      process.exit(1);
    }
    console.log('Preserving admin:', admin.phone);

    // Delete all other users
    const deletedUsers = await User.deleteMany({ _id: { $ne: admin._id } });
    console.log(`Deleted ${deletedUsers.deletedCount} non-admin users`);

    // Delete all products
    const deletedProducts = await Product.deleteMany({});
    console.log(`Deleted ${deletedProducts.deletedCount} products`);

    // Delete all orders
    const deletedOrders = await Order.deleteMany({});
    console.log(`Deleted ${deletedOrders.deletedCount} orders`);

    console.log('\nDatabase cleared. Admin user preserved.');
    console.log('Run `npm run seed` to repopulate sample data.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearDatabase();