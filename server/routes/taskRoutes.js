import { Router } from 'express';
import protect from '../middleware/auth.js';
import * as c from '../controllers/taskController.js';

const router = Router();
router.use(protect);
router.get('/stats', c.getStats); // must be before /:id
router.route('/').post(c.createTask).get(c.getTasks);
router.route('/:id').get(c.getTask).put(c.updateTask).delete(c.deleteTask);
router.patch('/:id/status', c.updateStatus);
export default router;
