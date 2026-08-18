import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateCsrfToken, setCsrfCookie, clearCsrfCookie } from '../middleware/csrf.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

/**
 * Validate and sanitize input to prevent NoSQL injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  // Remove any MongoDB operator keys
  return input.replace(/^\$/, '');
}

export const register = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Input validation - prevent NoSQL injection
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ message: 'Phone is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedPhone = sanitizeInput(phone.trim());
    
    // Additional phone validation
    if (!/^\d{10}$/.test(sanitizedPhone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ phone: sanitizedPhone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const user = await User.create({ 
      name: sanitizedName, 
      phone: sanitizedPhone, 
      password, 
      role: 'customer' 
    });

    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      
      // Issue CSRF token for subsequent requests
      const csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken);

      // Don't return JWT in response body (security)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Input validation
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ message: 'Phone is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const sanitizedPhone = sanitizeInput(phone.trim());
    
    if (!/^\d{10}$/.test(sanitizedPhone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    const user = await User.findOne({ phone: sanitizedPhone });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      
      // Issue CSRF token for subsequent requests
      const csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken);

      // Don't return JWT in response body (security)
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0)
  });
  clearCsrfCookie(res);
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    phone: req.user.phone,
    role: req.user.role
  });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate and sanitize inputs
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string') {
        return res.status(400).json({ message: 'Name must be a string' });
      }
      user.name = sanitizeInput(req.body.name.trim());
    }
    if (req.body.phone !== undefined) {
      if (typeof req.body.phone !== 'string') {
        return res.status(400).json({ message: 'Phone must be a string' });
      }
      const sanitizedPhone = sanitizeInput(req.body.phone.trim());
      if (!/^\d{10}$/.test(sanitizedPhone)) {
        return res.status(400).json({ message: 'Phone must be a 10-digit number' });
      }
      user.phone = sanitizedPhone;
    }
    if (req.body.password !== undefined) {
      if (typeof req.body.password !== 'string') {
        return res.status(400).json({ message: 'Password must be a string' });
      }
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};