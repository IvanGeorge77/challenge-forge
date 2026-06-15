import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  getHeatmapData,
  getOverviewStats,
  getCategoryBreakdown,
  getDifficultyBreakdown,
} from '../services/stats.service';
import { applyGraceDay } from '../services/streak.service';
import { predictChallengeCompletion } from '../services/prediction.service';

const router = Router();

router.use(requireAuth as any);

// GET /api/stats/overview — Aggregated stats across all challenges
router.get(
  '/overview',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await getOverviewStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stats/categories — Category breakdown
router.get(
  '/categories',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const breakdown = await getCategoryBreakdown(req.user!.id);
      res.json(breakdown);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stats/difficulties — Difficulty breakdown
router.get(
  '/difficulties',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const breakdown = await getDifficultyBreakdown(req.user!.id);
      res.json(breakdown);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stats/challenge/:id/heatmap — Heatmap data for a challenge
router.get(
  '/challenge/:id/heatmap',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const heatmap = await getHeatmapData(req.params.id, req.user!.id);
      res.json(heatmap);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/stats/challenge/:id/grace-day — Apply grace day
router.post(
  '/challenge/:id/grace-day',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { date } = req.body;
      if (!date) {
        res.status(400).json({ error: 'Date is required' });
        return;
      }

      const result = await applyGraceDay(
        req.params.id,
        req.user!.id,
        new Date(date)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/stats/challenge/:id/prediction — Prediction for challenge
router.get(
  '/challenge/:id/prediction',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const prediction = await predictChallengeCompletion(
        req.params.id,
        req.user!.id
      );
      res.json(prediction);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
