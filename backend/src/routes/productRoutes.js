import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Configure Cloudinary - validate credentials first
function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary credentials missing:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
    throw new Error('Cloudinary credentials not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  
  console.log('Cloudinary configured successfully');
}

// Configure Cloudinary immediately
configureCloudinary();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'variety-store/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage });

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Upload failed' });
  }
  next();
}

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/low-stock', protect, authorize('admin'), getLowStockProducts);
router.get('/:id', getProductById);

router.post('/', protect, authorize('admin'), upload.single('image'), handleMulterError, createProduct);
router.put('/:id', protect, authorize('admin'), upload.single('image'), handleMulterError, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;