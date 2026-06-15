import prisma from '../utils/prisma';
import { Difficulty } from '@prisma/client';

// ============ POINT VALUES ============

const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

// ============ BONUS POINTS ============

const BONUSES = {
  CHALLENGE_COMPLETE: 25,
  STREAK_7_DAY: 15,
  PERFECT_WEEK: 10,
  STREAK_30_DAY: 50,
};

// ============ SERVICE ============

/**
 * Calculate points for a difficulty level.
 */
export function getPoints(difficulty: Difficulty): number {
  return DIFFICULTY_POINTS[difficulty];
}

/**
 * Check and apply milestone bonuses for a challenge.
 * Called after streak recalculation.
 */
export async function checkAndApplyBonuses(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) return 0;

  let bonusPoints = 0;

  // 7-day streak bonus
  if (challenge.currentStreak === 7) {
    bonusPoints += BONUSES.STREAK_7_DAY;
  }

  // 30-day streak bonus
  if (challenge.currentStreak === 30) {
    bonusPoints += BONUSES.STREAK_30_DAY;
  }

  // Perfect week: check last 7 daily stats
  const last7Stats = await prisma.dailyStats.findMany({
    where: { challengeId },
    orderBy: { date: 'desc' },
    take: 7,
  });

  if (
    last7Stats.length === 7 &&
    last7Stats.every((s) => s.completionRate === 100)
  ) {
    bonusPoints += BONUSES.PERFECT_WEEK;
  }

  // Challenge completion bonus
  if (challenge.status === 'COMPLETED') {
    bonusPoints += BONUSES.CHALLENGE_COMPLETE;
  }

  // Apply bonus to user productivity score
  if (bonusPoints > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        productivityScore: { increment: bonusPoints },
      },
    });
  }

  return bonusPoints;
}

/**
 * Recalculate the total productivity score for a user from scratch.
 */
export async function recalculateProductivityScore(userId: string) {
  // Sum all points earned from completed tasks
  const taskPoints = await prisma.dailyTaskInstance.aggregate({
    where: { userId, completed: true },
    _sum: { pointsEarned: true },
  });

  const totalTaskPoints = taskPoints._sum.pointsEarned ?? 0;

  // Count milestones
  const challenges = await prisma.challenge.findMany({
    where: { userId },
    select: {
      longestStreak: true,
      status: true,
    },
  });

  let bonusTotal = 0;

  for (const c of challenges) {
    if (c.status === 'COMPLETED') bonusTotal += BONUSES.CHALLENGE_COMPLETE;
    if (c.longestStreak >= 7) bonusTotal += BONUSES.STREAK_7_DAY;
    if (c.longestStreak >= 30) bonusTotal += BONUSES.STREAK_30_DAY;
  }

  const totalScore = totalTaskPoints + bonusTotal;

  await prisma.user.update({
    where: { id: userId },
    data: { productivityScore: totalScore },
  });

  return totalScore;
}
