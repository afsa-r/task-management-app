import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export default async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new AppError('Authentication required. Please log in.', 401);
    let payload;
    try {
      payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch (e) {
      throw new AppError(e.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.', 401);
    }
    const user = await User.findById(payload.id);
    if (!user) throw new AppError('The account for this token no longer exists.', 401);
    req.user = user; // ownership always comes from here, never from the request body
    next();
  } catch (err) { next(err); }
}
