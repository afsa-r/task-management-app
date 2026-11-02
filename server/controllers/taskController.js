import Task, { STATUSES, PRIORITIES } from '../models/Task.js';
import AppError from '../utils/AppError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whitelist + validate fields. `user` is never read from the body.
function pick(body) {
  const out = {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) throw new AppError('Task title is required.');
  if (title.length > 120) throw new AppError('Title must be 120 characters or fewer.');
  out.title = title;
  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > 1000) throw new AppError('Description must be text up to 1000 characters.');
    out.description = body.description.trim();
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw new AppError(`Status must be one of: ${STATUSES.join(', ')}.`);
    out.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) throw new AppError(`Priority must be one of: ${PRIORITIES.join(', ')}.`);
    out.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') out.dueDate = null;
    else {
      const d = new Date(body.dueDate);
      if (isNaN(d)) throw new AppError('Due date is not a valid date.');
      out.dueDate = d;
    }
  }
  return out;
}

const findOwned = async (req) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError('Task not found.', 404);
  return task;
};

export async function createTask(req, res, next) {
  try { res.status(201).json({ task: await Task.create({ ...pick(req.body), user: req.user._id }) }); }
  catch (e) { next(e); }
}

export async function getTasks(req, res, next) {
  try {
    const { search, status, priority, overdue, sort = 'createdAt', order = 'desc' } = req.query;
    const q = { user: req.user._id };
    if (typeof search === 'string' && search.trim()) q.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (STATUSES.includes(status)) q.status = status;
    if (PRIORITIES.includes(priority)) q.priority = priority;
    if (overdue === 'true') { q.dueDate = { $lt: new Date() }; q.status = { $ne: 'Completed' }; }
    const sortField = ['dueDate', 'createdAt'].includes(sort) ? sort : 'createdAt';
    res.json({ tasks: await Task.find(q).sort({ [sortField]: order === 'asc' ? 1 : -1 }) });
  } catch (e) { next(e); }
}

export async function getTask(req, res, next) {
  try { res.json({ task: await findOwned(req) }); } catch (e) { next(e); }
}

export async function updateTask(req, res, next) {
  try {
    const task = await findOwned(req);
    Object.assign(task, { description: '', dueDate: null, ...pick(req.body) });
    await task.save();
    res.json({ task });
  } catch (e) { next(e); }
}

export async function updateStatus(req, res, next) {
  try {
    if (!STATUSES.includes(req.body.status)) throw new AppError(`Status must be one of: ${STATUSES.join(', ')}.`);
    const task = await findOwned(req);
    task.status = req.body.status;
    await task.save();
    res.json({ task });
  } catch (e) { next(e); }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) throw new AppError('Task not found.', 404);
    res.json({ message: 'Task deleted.' });
  } catch (e) { next(e); }
}

// Dashboard numbers are computed from the database on every request.
export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const count = (extra = {}) => Task.countDocuments({ user: req.user._id, ...extra });
    const [total, pending, inProgress, completed, overdue, openHigh, recent] = await Promise.all([
      count(), count({ status: 'Pending' }), count({ status: 'In Progress' }), count({ status: 'Completed' }),
      count({ status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      count({ status: { $ne: 'Completed' }, priority: 'High' }),
      Task.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({
      stats: { total, pending, inProgress, completed, overdue, openHighPriority: openHigh,
        completionRate: total ? Math.round((completed / total) * 100) : 0 },
      recent,
    });
  } catch (e) { next(e); }
}
