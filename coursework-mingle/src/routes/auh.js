cd ~/cloud-computing/cc/coursework-mingle/src/routes
cat > auth.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// register new user
router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ error: 'email already registered' });
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'user registered' });
  } catch (err) {
    res.status(500).json({ error: 'registration failed', details: err.message });
  }
});

// login existing user
router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const valid = await user.comparePassword(req.body.password);
    if (!valid) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const payload = { id: user._id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRY || '1h'
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'login failed', details: err.message });
  }
});

module.exports = router;
EOF

