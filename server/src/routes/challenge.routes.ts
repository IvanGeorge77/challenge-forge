import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createChallenge,
  getChallenges,
  getChallengeDetail,
  updateChallenge,
  deleteChallenge,
  createChallengeSchema,
  updateChallengeSchema,
} from '../services/challenge.service';
import { ChallengeStatus } from '@prisma/client';

const router = Router();

// All routes require auth
router.use(requireAuth as any);

// POST /api/challenges — Create a new challenge
router.post(
  '/',
  validate(createChallengeSchema) as any,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const challenge = await createChallenge(req.user!.id, req.body);
      res.status(201).json(challenge);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/challenges — List user's challenges
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as ChallengeStatus | undefined;
      const challenges = await getChallenges(req.user!.id, status);
      res.json(challenges);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/challenges/:id — Get challenge detail
router.get(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const challenge = await getChallengeDetail(req.params.id, req.user!.id);
      res.json(challenge);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/challenges/:id — Update challenge
router.put(
  '/:id',
  validate(updateChallengeSchema) as any,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const challenge = await updateChallenge(
        req.params.id,
        req.user!.id,
        req.body
      );
      res.json(challenge);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/challenges/:id — Delete challenge
router.delete(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await deleteChallenge(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
