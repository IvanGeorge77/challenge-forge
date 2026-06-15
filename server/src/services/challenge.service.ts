import prisma from '../utils/prisma';
import { ChallengeStatus, Difficulty, TaskType, Category } from '@prisma/client';
import { addDays, startOfDay, differenceInDays } from 'date-fns';

// ============ VALIDATION SCHEMAS ============
import { z } from 'zod';

export const createChallengeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  duration: z.enum(['15', '30', '60', '90']),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  tasks: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(300).optional(),
    taskType: z.nativeEnum(TaskType),
    difficulty: z.nativeEnum(Difficulty).default('EASY'),
    category: z.nativeEnum(Category).default('PERSONAL'),
  })).min(1, 'At least one task is required'),
});

export const updateChallengeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ============ SERVICE FUNCTIONS ============

export async function createChallenge(
  userId: string,
  data: z.infer<typeof createChallengeSchema>
) {
  const duration = parseInt(data.duration);
  const startDate = startOfDay(new Date(data.startDate));
  const endDate = addDays(startDate, duration);

  const challenge = await prisma.challenge.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      startDate,
      endDate,
      taskBlueprints: {
        create: data.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          taskType: task.taskType,
          difficulty: task.difficulty,
          category: task.category,
          activeFromDate: startDate,
        })),
      },
    },
    include: {
      taskBlueprints: true,
    },
  });

  // Generate daily task instances for today if challenge starts today or earlier
  const today = startOfDay(new Date());
  if (startDate <= today && endDate > today) {
    await generateDailyInstancesForDate(challenge.id, userId, today);
  }

  return challenge;
}

export async function getChallenges(
  userId: string,
  status?: ChallengeStatus
) {
  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  return prisma.challenge.findMany({
    where,
    include: {
      taskBlueprints: {
        select: {
          id: true,
          title: true,
          taskType: true,
          difficulty: true,
          category: true,
        },
      },
      _count: {
        select: {
          dailyTaskInstances: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getChallengeDetail(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
    include: {
      taskBlueprints: true,
      dailyStats: {
        orderBy: { date: 'desc' },
        take: 7,
      },
    },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Calculate progress
  const today = startOfDay(new Date());
  const totalDays = differenceInDays(challenge.endDate, challenge.startDate);
  const daysPassed = Math.min(
    differenceInDays(today, challenge.startDate),
    totalDays
  );

  const completedInstances = await prisma.dailyTaskInstance.count({
    where: {
      challengeId,
      completed: true,
    },
  });

  const totalInstances = await prisma.dailyTaskInstance.count({
    where: { challengeId },
  });

  return {
    ...challenge,
    progress: {
      totalDays,
      daysPassed: Math.max(0, daysPassed),
      daysRemaining: Math.max(0, totalDays - daysPassed),
      completedTasks: completedInstances,
      totalTasks: totalInstances,
      completionRate: totalInstances > 0
        ? Math.round((completedInstances / totalInstances) * 100)
        : 0,
    },
  };
}

export async function updateChallenge(
  challengeId: string,
  userId: string,
  data: z.infer<typeof updateChallengeSchema>
) {
  // Verify ownership
  const existing = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!existing) {
    throw new Error('Challenge not found');
  }

  return prisma.challenge.update({
    where: { id: challengeId },
    data,
  });
}

export async function deleteChallenge(challengeId: string, userId: string) {
  const existing = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!existing) {
    throw new Error('Challenge not found');
  }

  return prisma.challenge.delete({
    where: { id: challengeId },
  });
}

// ============ DAILY INSTANCE GENERATION ============

/**
 * Generate daily task instances for a specific date.
 * Only creates instances for task blueprints that are active on that date.
 * Idempotent — skips if instances already exist for the date.
 */
export async function generateDailyInstancesForDate(
  challengeId: string,
  userId: string,
  date: Date
) {
  const normalizedDate = startOfDay(date);

  // Get task blueprints active on this date
  const blueprints = await prisma.taskBlueprint.findMany({
    where: {
      challengeId,
      activeFromDate: { lte: normalizedDate },
    },
  });

  // Check which instances already exist
  const existingInstances = await prisma.dailyTaskInstance.findMany({
    where: {
      challengeId,
      date: normalizedDate,
    },
    select: { taskBlueprintId: true },
  });

  const existingBlueprintIds = new Set(
    existingInstances.map((i) => i.taskBlueprintId)
  );

  // Create missing instances
  const newInstances = blueprints
    .filter((bp) => !existingBlueprintIds.has(bp.id))
    .map((bp) => ({
      userId,
      challengeId,
      taskBlueprintId: bp.id,
      date: normalizedDate,
      completed: false,
      pointsEarned: 0,
    }));

  if (newInstances.length > 0) {
    await prisma.dailyTaskInstance.createMany({
      data: newInstances,
    });
  }

  return newInstances.length;
}

/**
 * Get difficulty point value.
 */
export function getDifficultyPoints(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'EASY': return 1;
    case 'MEDIUM': return 2;
    case 'HARD': return 3;
    default: return 1;
  }
}
