import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let total = 0;
    const orderItems = [];

    // Validate all items first
    for (const item of items) {
      if (!item.productId || !item.qty || item.qty <= 0) {
        return res.status(400).json({ message: 'Invalid order item' });
      }
    }

    // Use atomic findOneAndUpdate to decrement stock atomically
    // This prevents race conditions when multiple orders come in simultaneously
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { 
          _id: item.productId, 
          stock: { $gte: item.qty }  // Only update if enough stock
        },
        { 
          $inc: { stock: -item.qty }  // Atomic decrement
        },
        { new: true }  // Return updated document
      );

      if (!product) {
        // Check if product exists but has insufficient stock
        const existingProduct = await Product.findById(item.productId);
        if (!existingProduct) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        return res.status(400).json({ message: `Insufficient stock for ${existingProduct.name}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        qty: item.qty,
        price: product.price
      });
      total += product.price * item.qty;
    }

    const order = await Order.create({
      userId: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      items: orderItems,
      total
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Order creation failed' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    // Cap pagination limits
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit)) || 20)); // Max 50 per page

    const orders = await Order.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'fulfilled', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrdersToday = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5, $gt: 0 } });

    res.json({
      totalOrdersToday,
      pendingOrders,
      lowStockCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};