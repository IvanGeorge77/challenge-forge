import prisma from '../utils/prisma';
import { startOfDay, subDays, eachDayOfInterval } from 'date-fns';

// ============ DAILY STATS ============

/**
 * Compute or update daily stats for a challenge on a specific date.
 * Called after any task completion change.
 */
export async function computeDailyStats(challengeId: string, date: Date) {
  const normalizedDate = startOfDay(date);

  // Get all instances for this challenge + date
  const instances = await prisma.dailyTaskInstance.findMany({
    where: {
      challengeId,
      date: normalizedDate,
    },
    include: {
      taskBlueprint: {
        select: { taskType: true },
      },
    },
  });

  // Calculate mandatory completion rate
  const mandatory = instances.filter((i) => i.taskBlueprint.taskType === 'MANDATORY');
  const mandatoryCompleted = mandatory.filter((i) => i.completed).length;
  const completionRate = mandatory.length > 0
    ? (mandatoryCompleted / mandatory.length) * 100
    : 100;

  // Calculate score (all tasks, including optional)
  const score = instances
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + i.pointsEarned, 0);

  // Streak contributed = 100% mandatory completion
  const streakContributed = mandatoryCompleted === mandatory.length && mandatory.length > 0;

  await prisma.dailyStats.upsert({
    where: {
      challengeId_date: {
        challengeId,
        date: normalizedDate,
      },
    },
    update: {
      completionRate,
      score,
      streakContributed,
    },
    create: {
      challengeId,
      date: normalizedDate,
      completionRate,
      score,
      streakContributed,
    },
  });

  return { completionRate, score, streakContributed };
}

// ============ HEATMAP ============

/**
 * Get heatmap data for a challenge — array of { date, completionRate, score }.
 */
export async function getHeatmapData(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const today = startOfDay(new Date());
  const endDate = challenge.endDate < today ? challenge.endDate : today;

  // Get all daily stats
  const stats = await prisma.dailyStats.findMany({
    where: { challengeId },
    orderBy: { date: 'asc' },
  });

  // Build complete date range with fill for missing days
  const allDays = eachDayOfInterval({
    start: challenge.startDate,
    end: endDate,
  });

  const statsMap = new Map(
    stats.map((s) => [s.date.toISOString().split('T')[0], s])
  );

  return allDays.map((day) => {
    const key = day.toISOString().split('T')[0];
    const stat = statsMap.get(key);
    return {
      date: key,
      completionRate: stat?.completionRate ?? 0,
      score: stat?.score ?? 0,
      streakContributed: stat?.streakContributed ?? false,
      graceDayUsed: stat?.graceDayUsed ?? false,
    };
  });
}

// ============ OVERVIEW STATS ============

/**
 * Get aggregated stats across all challenges for a user.
 */
export async function getOverviewStats(userId: string) {
  const challenges = await prisma.challenge.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  const activeChallenges = challenges.filter((c) => c.status === 'ACTIVE');
  const completedChallenges = challenges.filter((c) => c.status === 'COMPLETED');

  // Total tasks completed
  const totalCompleted = await prisma.dailyTaskInstance.count({
    where: { userId, completed: true },
  });

  // Today's stats
  const today = startOfDay(new Date());
  const todayInstances = await prisma.dailyTaskInstance.findMany({
    where: { userId, date: today },
    include: { taskBlueprint: { select: { taskType: true } } },
  });

  const todayMandatory = todayInstances.filter(
    (i) => i.taskBlueprint.taskType === 'MANDATORY'
  );
  const todayCompleted = todayMandatory.filter((i) => i.completed).length;
  const todayCompletion = todayMandatory.length > 0
    ? Math.round((todayCompleted / todayMandatory.length) * 100)
    : 100;

  // Last 7 days average
  const last7Start = subDays(today, 7);
  const last7Stats = await prisma.dailyStats.findMany({
    where: {
      challengeId: { in: challenges.map((c) => c.id) },
      date: { gte: last7Start, lte: today },
    },
  });

  const last7Avg = last7Stats.length > 0
    ? Math.round(
        last7Stats.reduce((sum, s) => sum + s.completionRate, 0) / last7Stats.length
      )
    : 0;

  // User profile data
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: {
      productivityScore: true,
      globalStreak: true,
      longestGlobalStreak: true,
    },
  });

  return {
    activeChallenges: activeChallenges.length,
    completedChallenges: completedChallenges.length,
    totalChallenges: challenges.length,
    totalTasksCompleted: totalCompleted,
    todayCompletion,
    todayCompletedTasks: todayCompleted,
    todayTotalTasks: todayMandatory.length,
    last7DayAverage: last7Avg,
    productivityScore: user?.productivityScore ?? 0,
    globalStreak: user?.globalStreak ?? 0,
    longestGlobalStreak: user?.longestGlobalStreak ?? 0,
  };
}

// ============ CATEGORY & DIFFICULTY BREAKDOWN ============

export async function getCategoryBreakdown(userId: string) {
  const instances = await prisma.dailyTaskInstance.findMany({
    where: { userId },
    include: {
      taskBlueprint: {
        select: { category: true, taskType: true },
      },
    },
  });

  const categories: Record<string, { total: number; completed: number }> = {};

  for (const inst of instances) {
    const cat = inst.taskBlueprint.category;
    if (!categories[cat]) {
      categories[cat] = { total: 0, completed: 0 };
    }
    categories[cat].total++;
    if (inst.completed) {
      categories[cat].completed++;
    }
  }

  return Object.entries(categories).map(([category, data]) => ({
    category,
    total: data.total,
    completed: data.completed,
    completionRate: data.total > 0
      ? Math.round((data.completed / data.total) * 100)
      : 0,
  }));
}

export async function getDifficultyBreakdown(userId: string) {
  const instances = await prisma.dailyTaskInstance.findMany({
    where: { userId },
    include: {
      taskBlueprint: {
        select: { difficulty: true },
      },
    },
  });

  const difficulties: Record<string, { total: number; completed: number }> = {};

  for (const inst of instances) {
    const diff = inst.taskBlueprint.difficulty;
    if (!difficulties[diff]) {
      difficulties[diff] = { total: 0, completed: 0 };
    }
    difficulties[diff].total++;
    if (inst.completed) {
      difficulties[diff].completed++;
    }
  }

  return Object.entries(difficulties).map(([difficulty, data]) => ({
    difficulty,
    total: data.total,
    completed: data.completed,
    completionRate: data.total > 0
      ? Math.round((data.completed / data.total) * 100)
      : 0,
  }));
}
