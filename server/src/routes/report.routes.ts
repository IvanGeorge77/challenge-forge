import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getOrGenerateReport } from '../services/report.service';

const router = Router();

router.use(requireAuth as any);

// GET /api/challenges/:id/report — Get or generate challenge report
router.get(
  '/:id/report',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const report = await getOrGenerateReport(req.params.id, req.user!.id);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
