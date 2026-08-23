import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
    console.log('Testing bcrypt...');
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash generated:', hash);
    const match = await bcrypt.compare(password, hash);
    console.log('Match:', match);
    res.json({ success: true, match });
  } catch (error) {
    console.error('Bcrypt test error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Test crypto endpoint
router.post('/test-crypto', async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    res.json({ success: true, token });
  } catch (error) {
    console.error('Crypto test error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;