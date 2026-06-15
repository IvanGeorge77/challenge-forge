import prisma from '../utils/prisma';
import { startOfDay } from 'date-fns';
import { generateDailyInstancesForDate, getDifficultyPoints } from './challenge.service';
import { computeDailyStats } from './stats.service';

// ============ SERVICE ============

/**
 * Get all tasks for today across all active challenges (or a specific one).
 * Lazily generates daily instances if they don't exist yet.
 */
export async function getTodayTasks(userId: string, challengeId?: string) {
  const today = startOfDay(new Date());

  // Get active challenges
  const where: any = { userId, status: 'ACTIVE' };
  if (challengeId) {
    where.id = challengeId;
  }

  const challenges = await prisma.challenge.findMany({
    where,
    include: {
      taskBlueprints: true,
    },
  });

  // Filter to challenges that span today
  const activeChallenges = challenges.filter(
    (c) => c.startDate <= today && c.endDate > today
  );

  // Ensure daily instances exist for today
  for (const challenge of activeChallenges) {
    await generateDailyInstancesForDate(challenge.id, userId, today);
  }

  // Fetch today's instances with blueprint details
  const instances = await prisma.dailyTaskInstance.findMany({
    where: {
      userId,
      date: today,
      ...(challengeId ? { challengeId } : {}),
    },
    include: {
      taskBlueprint: {
        select: {
          title: true,
          description: true,
          taskType: true,
          difficulty: true,
          category: true,
        },
      },
      challenge: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { challengeId: 'asc' },
    ],
  });

  // Group by challenge
  const grouped: Record<string, {
    challengeId: string;
    challengeName: string;
    tasks: typeof instances;
    mandatoryCompleted: number;
    mandatoryTotal: number;
    completionRate: number;
  }> = {};

  for (const instance of instances) {
    const cId = instance.challengeId;
    if (!grouped[cId]) {
      grouped[cId] = {
        challengeId: cId,
        challengeName: instance.challenge.name,
        tasks: [],
        mandatoryCompleted: 0,
        mandatoryTotal: 0,
        completionRate: 0,
      };
    }
    grouped[cId].tasks.push(instance);

    if (instance.taskBlueprint.taskType === 'MANDATORY') {
      grouped[cId].mandatoryTotal++;
      if (instance.completed) {
        grouped[cId].mandatoryCompleted++;
      }
    }
  }

  // Calculate completion rates
  for (const group of Object.values(grouped)) {
    group.completionRate = group.mandatoryTotal > 0
      ? Math.round((group.mandatoryCompleted / group.mandatoryTotal) * 100)
      : 100;
  }

  return Object.values(grouped);
}

/**
 * Mark a task instance as completed.
 */
export async function completeTask(instanceId: string, userId: string) {
  const instance = await prisma.dailyTaskInstance.findFirst({
    where: { id: instanceId, userId },
    include: {
      taskBlueprint: true,
    },
  });

  if (!instance) {
    throw new Error('Task instance not found');
  }

  if (instance.completed) {
    return instance; // Already completed
  }

  const points = getDifficultyPoints(instance.taskBlueprint.difficulty);

  const updated = await prisma.dailyTaskInstance.update({
    where: { id: instanceId },
    data: {
      completed: true,
      completedAt: new Date(),
      pointsEarned: points,
    },
    include: {
      taskBlueprint: {
        select: {
          title: true,
          taskType: true,
          difficulty: true,
          category: true,
        },
      },
    },
  });

  // Recalculate daily stats
  await computeDailyStats(instance.challengeId, instance.date);

  return updated;
}

/**
 * Unmark a task instance as completed.
 */
export async function uncompleteTask(instanceId: string, userId: string) {
  const instance = await prisma.dailyTaskInstance.findFirst({
    where: { id: instanceId, userId },
  });

  if (!instance) {
    throw new Error('Task instance not found');
  }

  if (!instance.completed) {
    return instance; // Already not completed
  }

  const updated = await prisma.dailyTaskInstance.update({
    where: { id: instanceId },
    data: {
      completed: false,
      completedAt: null,
      pointsEarned: 0,
    },
    include: {
      taskBlueprint: {
        select: {
          title: true,
          taskType: true,
          difficulty: true,
          category: true,
        },
      },
    },
  });

  // Recalculate daily stats
  await computeDailyStats(instance.challengeId, instance.date);

  return updated;
}
