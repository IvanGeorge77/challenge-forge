import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  getTodayTasks,
  completeTask,
  uncompleteTask,
} from '../services/daily.service';
import { checkMissedDays } from '../services/streak.service';

const router = Router();

router.use(requireAuth as any);

// GET /api/daily — Get all tasks for today (across all challenges)
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await getTodayTasks(req.user!.id);
      const missedDays = await checkMissedDays(req.user!.id);

      res.json({
        tasks,
        missedDays, // For grace day prompt
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/daily/:challengeId — Get today's tasks for a specific challenge
router.get(
  '/:challengeId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await getTodayTasks(req.user!.id, req.params.challengeId);
      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/daily/:instanceId/complete — Mark task as completed
router.put(
  '/:instanceId/complete',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const instance = await completeTask(req.params.instanceId, req.user!.id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/daily/:instanceId/uncomplete — Unmark task
router.put(
  '/:instanceId/uncomplete',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const instance = await uncompleteTask(
        req.params.instanceId,
        req.user!.id
      );
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
