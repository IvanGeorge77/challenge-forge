import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTask,
  getTasksForChallenge,
  updateTask,
  deleteTask,
  createTaskSchema,
  updateTaskSchema,
} from '../services/task.service';

const router = Router();

router.use(requireAuth as any);

// POST /api/challenges/:challengeId/tasks — Add task to challenge
router.post(
  '/:challengeId/tasks',
  validate(createTaskSchema) as any,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await createTask(
        req.params.challengeId,
        req.user!.id,
        req.body
      );
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/challenges/:challengeId/tasks — List tasks
router.get(
  '/:challengeId/tasks',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await getTasksForChallenge(
        req.params.challengeId,
        req.user!.id
      );
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/tasks/:id — Update task (mounted under /api/challenges but uses task ID)
router.put(
  '/tasks/:id',
  validate(updateTaskSchema) as any,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await updateTask(req.params.id, req.user!.id, req.body);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/tasks/:id — Delete task
router.delete(
  '/tasks/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await deleteTask(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
