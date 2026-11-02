import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/token.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === 'string' ? v.trim() : ''); // rejects objects like {"$gt":""}

export async function register(req, res, next) {
  try {
    const name = str(req.body.name), email = str(req.body.email).toLowerCase(), password = str(req.body.password);
    if (name.length < 2) throw new AppError('Name must be at least 2 characters.');
    if (!EMAIL_RE.test(email)) throw new AppError('Please enter a valid email address.');
    if (password.length < 8) throw new AppError('Password must be at least 8 characters.');
    if (await User.findOne({ email })) throw new AppError('An account with this email already exists.', 409);
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: signToken(user._id), user });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const email = str(req.body.email).toLowerCase(), password = str(req.body.password);
    if (!email || !password) throw new AppError('Email and password are required.');
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError('Invalid email or password.', 401);
    res.json({ token: signToken(user._id), user });
  } catch (e) { next(e); }
}

export const me = (req, res) => res.json({ user: req.user });
