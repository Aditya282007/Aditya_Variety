import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Cap pagination limits
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit)) || 20)); // Max 50 per page

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file?.path || '';
    const cloudinaryId = req.file?.filename || '';

    // Validate inputs
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (price === undefined || price < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    if (stock === undefined || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Category is required' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      stock,
      category,
      imageUrl,
      cloudinaryId
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate and sanitize inputs
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Name must be a string' });
      }
      product.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string' });
      }
      product.description = description.trim();
    }
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ message: 'Price must be positive' });
      }
      product.price = price;
    }
    if (stock !== undefined) {
      if (stock < 0 || !Number.isInteger(stock)) {
        return res.status(400).json({ message: 'Stock must be a non-negative integer' });
      }
      product.stock = stock;
    }
    if (category !== undefined) {
      if (typeof category !== 'string') {
        return res.status(400).json({ message: 'Category must be a string' });
      }
      product.category = category;
    }

    if (req.file) {
      product.imageUrl = req.file.path;
      product.cloudinaryId = req.file.filename;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 5, $gt: 0 } }).sort({ stock: 1 });
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Failed to fetch low stock products' });
  }
};