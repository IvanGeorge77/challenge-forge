import prisma from '../utils/prisma';
import { startOfDay, subDays } from 'date-fns';

// ============ STREAK CALCULATION ============

/**
 * Recalculate the current streak for a challenge based on DailyStats.
 * Walks backwards from today (or the latest tracked day) counting consecutive days
 * where streakContributed = true.
 */
export async function recalculateStreak(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) return;

  const today = startOfDay(new Date());

  // Get all daily stats sorted by date descending
  const stats = await prisma.dailyStats.findMany({
    where: { challengeId },
    orderBy: { date: 'desc' },
  });

  let currentStreak = 0;

  for (const stat of stats) {
    if (stat.streakContributed || stat.graceDayUsed) {
      currentStreak++;
    } else {
      break; // Streak broken
    }
  }

  const longestStreak = Math.max(challenge.longestStreak, currentStreak);

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      currentStreak,
      longestStreak,
    },
  });

  return { currentStreak, longestStreak };
}

// ============ GRACE DAY ============

/**
 * Apply a grace day for a specific date on a challenge.
 * The user manually triggers this after seeing the "missed day" prompt.
 */
export async function applyGraceDay(
  challengeId: string,
  userId: string,
  date: Date
) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (challenge.graceDaysUsed >= challenge.graceDaysTotal) {
    throw new Error('No grace days remaining');
  }

  const normalizedDate = startOfDay(date);

  // Check that the day actually had incomplete mandatory tasks
  const stats = await prisma.dailyStats.findUnique({
    where: {
      challengeId_date: {
        challengeId,
        date: normalizedDate,
      },
    },
  });

  if (!stats) {
    throw new Error('No stats found for this date');
  }

  if (stats.streakContributed) {
    throw new Error('This day already contributed to the streak');
  }

  // Apply grace day
  await prisma.dailyStats.update({
    where: {
      challengeId_date: {
        challengeId,
        date: normalizedDate,
      },
    },
    data: {
      graceDayUsed: true,
      streakContributed: true,
    },
  });

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      graceDaysUsed: { increment: 1 },
    },
  });

  // Recalculate streak
  const streak = await recalculateStreak(challengeId);

  return {
    graceDaysUsed: challenge.graceDaysUsed + 1,
    graceDaysTotal: challenge.graceDaysTotal,
    ...streak,
  };
}

// ============ GLOBAL STREAK ============

/**
 * Update the global streak for a user.
 * Global streak continues if at least one mandatory task was completed today
 * across any active challenge.
 */
export async function updateGlobalStreak(userId: string) {
  const today = startOfDay(new Date());

  // Check if any mandatory task was completed today
  const todayCompleted = await prisma.dailyTaskInstance.findFirst({
    where: {
      userId,
      date: today,
      completed: true,
      taskBlueprint: {
        taskType: 'MANDATORY',
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  if (todayCompleted) {
    // Check if yesterday also contributed (continuous streak)
    const yesterday = subDays(today, 1);
    const yesterdayCompleted = await prisma.dailyTaskInstance.findFirst({
      where: {
        userId,
        date: yesterday,
        completed: true,
        taskBlueprint: {
          taskType: 'MANDATORY',
        },
      },
    });

    let newStreak: number;
    if (yesterdayCompleted || user.globalStreak === 0) {
      newStreak = user.globalStreak + 1;
    } else {
      newStreak = 1; // Restart
    }

    const longestGlobal = Math.max(user.longestGlobalStreak, newStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        globalStreak: newStreak,
        longestGlobalStreak: longestGlobal,
      },
    });
  }
}

// ============ MISSED DAY CHECK ============

/**
 * Check if the user missed all mandatory tasks yesterday for any active challenge.
 * Returns list of challenges that had missed days (for grace day prompt).
 */
export async function checkMissedDays(userId: string) {
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  const challenges = await prisma.challenge.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      startDate: { lte: yesterday },
      endDate: { gt: yesterday },
    },
  });

  const missedChallenges: Array<{
    challengeId: string;
    challengeName: string;
    graceDaysRemaining: number;
    date: string;
  }> = [];

  for (const challenge of challenges) {
    const stats = await prisma.dailyStats.findUnique({
      where: {
        challengeId_date: {
          challengeId: challenge.id,
          date: yesterday,
        },
      },
    });

    // If no stats exist for yesterday, or completion was 0%, flag it
    if (!stats || (stats.completionRate === 0 && !stats.graceDayUsed)) {
      missedChallenges.push({
        challengeId: challenge.id,
        challengeName: challenge.name,
        graceDaysRemaining: challenge.graceDaysTotal - challenge.graceDaysUsed,
        date: yesterday.toISOString().split('T')[0],
      });
    }
  }

  return missedChallenges;
}
