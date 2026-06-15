import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

router.use(requireAuth as any);

// GET /api/user/profile — Get current user profile
router.get(
  '/profile',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          productivityScore: true,
          globalStreak: true,
          longestGlobalStreak: true,
          timezone: true,
          createdAt: true,
          _count: {
            select: {
              challenges: true,
              dailyTaskInstances: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Count completed challenges
      const completedChallenges = await prisma.challenge.count({
        where: { userId: req.user!.id, status: 'COMPLETED' },
      });

      const activeChallenges = await prisma.challenge.count({
        where: { userId: req.user!.id, status: 'ACTIVE' },
      });

      const totalTasksCompleted = await prisma.dailyTaskInstance.count({
        where: { userId: req.user!.id, completed: true },
      });

      res.json({
        ...user,
        completedChallenges,
        activeChallenges,
        totalTasksCompleted,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/user/profile — Update profile
router.put(
  '/profile',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, timezone } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name !== undefined && { name }),
          ...(timezone !== undefined && { timezone }),
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
