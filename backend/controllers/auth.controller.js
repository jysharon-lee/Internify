const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const { createError } = require('../middleware/error.middleware');

// helpers

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sendAuthResponse(res, user, token, statusCode = 200) {
  // strip sensitive fields
  const { password_hash, ...safeUser } = user;
  res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
}

// controllers 

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw Object.assign(new Error('Validation failed'), { type: 'validation', errors: errors.array(), statusCode: 422 });
    }

    const { email, password, full_name } = req.body;

    // check duplicate email
    const existing = await UserModel.findByEmail(email);
    if (existing) throw createError(409, 'An account with this email already exists.');

    const password_hash = await bcrypt.hash(password, 12);
    const userId = await UserModel.create({ email, password_hash, full_name });

    const user = await UserModel.findById(userId);
    const token = signToken(user);

    sendAuthResponse(res, user, token, 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw Object.assign(new Error('Validation failed'), { type: 'validation', errors: errors.array(), statusCode: 422 });
    }

    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) throw createError(401, 'Invalid email or password.');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw createError(401, 'Invalid email or password.');

    await UserModel.touchLastLogin(user.id);
    const token = signToken(user);

    sendAuthResponse(res, user, token);
  } catch (err) {
    next(err);
  }
};

// returns the currently authenticated user
exports.me = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) throw createError(404, 'User not found.');

    const skills = await UserModel.getSkills(req.user.id);
    res.json({ success: true, user: { ...user, skills } });
  } catch (err) {
    next(err);
  }
};
