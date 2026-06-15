import prisma from '../utils/prisma';
import { TaskType, Difficulty, Category } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { z } from 'zod';
import { generateDailyInstancesForDate } from './challenge.service';

// ============ VALIDATION ============

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional(),
  taskType: z.nativeEnum(TaskType),
  difficulty: z.nativeEnum(Difficulty).default('EASY'),
  category: z.nativeEnum(Category).default('PERSONAL'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  category: z.nativeEnum(Category).optional(),
});

// ============ SERVICE ============

export async function createTask(
  challengeId: string,
  userId: string,
  data: z.infer<typeof createTaskSchema>
) {
  // Verify challenge ownership
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (challenge.status !== 'ACTIVE') {
    throw new Error('Cannot add tasks to a non-active challenge');
  }

  const today = startOfDay(new Date());

  // activeFromDate = today for tasks added mid-challenge
  // This ensures optional tasks added later don't count as missed before creation
  const activeFromDate = today > challenge.startDate ? today : challenge.startDate;

  const blueprint = await prisma.taskBlueprint.create({
    data: {
      challengeId,
      title: data.title,
      description: data.description,
      taskType: data.taskType,
      difficulty: data.difficulty,
      category: data.category,
      activeFromDate,
    },
  });

  // Generate today's instance if challenge is active
  if (challenge.startDate <= today && challenge.endDate > today) {
    await generateDailyInstancesForDate(challengeId, userId, today);
  }

  return blueprint;
}

export async function getTasksForChallenge(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  return prisma.taskBlueprint.findMany({
    where: { challengeId },
    orderBy: [
      { taskType: 'asc' }, // MANDATORY first
      { createdAt: 'asc' },
    ],
  });
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: z.infer<typeof updateTaskSchema>
) {
  const task = await prisma.taskBlueprint.findFirst({
    where: { id: taskId },
    include: { challenge: { select: { userId: true } } },
  });

  if (!task || task.challenge.userId !== userId) {
    throw new Error('Task not found');
  }

  return prisma.taskBlueprint.update({
    where: { id: taskId },
    data,
  });
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.taskBlueprint.findFirst({
    where: { id: taskId },
    include: { challenge: { select: { userId: true } } },
  });

  if (!task || task.challenge.userId !== userId) {
    throw new Error('Task not found');
  }

  return prisma.taskBlueprint.delete({
    where: { id: taskId },
  });
}
