import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Test bcrypt endpoint
router.post('/test-bcrypt', async (req, res) => {
  try {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hash);
    res.json({ success: true, match });
  } catch (error) {
    console.error('Bcrypt test error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;