import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../utils/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    clerkId: string;
    email: string;
    name: string | null;
  };
}

/**
 * Middleware that requires Clerk authentication and upserts the user in our DB.
 * Attaches the DB user to req.user for downstream handlers.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      res.status(401).json({ error: 'Unauthorized — please sign in' });
      return;
    }

    // Look up or create user in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      // First login — create user record
      // Clerk session claims may include email; fallback to placeholder
      const sessionClaims = auth.sessionClaims as Record<string, any> | undefined;
      const email = sessionClaims?.email as string || `${auth.userId}@clerk.user`;
      const name = sessionClaims?.name as string || null;

      user = await prisma.user.create({
        data: {
          clerkId: auth.userId,
          email,
          name,
        },
      });
    }

    req.user = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}
