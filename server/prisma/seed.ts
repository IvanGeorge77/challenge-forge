import prisma from '../src/utils/prisma';
import { addDays, subDays, startOfDay } from 'date-fns';

/**
 * Seed script for development/demo purposes.
 * Creates a demo user, challenges, task blueprints, and daily instances.
 * 
 * Run: npm run db:seed
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (in reverse dependency order)
  await prisma.challengeReport.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.dailyTaskInstance.deleteMany();
  await prisma.taskBlueprint.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // Create demo user
  const user = await prisma.user.create({
    data: {
      clerkId: 'demo_user_001',
      email: 'demo@challengeforge.dev',
      name: 'Demo User',
      productivityScore: 142,
      globalStreak: 5,
      longestGlobalStreak: 12,
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`  ✓ Created user: ${user.name} (${user.id})`);

  const today = startOfDay(new Date());

  // ============ Challenge 1: Active 30-day challenge (started 10 days ago) ============
  const challenge1Start = subDays(today, 10);
  const challenge1 = await prisma.challenge.create({
    data: {
      userId: user.id,
      name: '30-Day DSA Challenge',
      description: 'Master data structures and algorithms through daily practice',
      startDate: challenge1Start,
      endDate: addDays(challenge1Start, 30),
      status: 'ACTIVE',
      graceDaysTotal: 2,
      graceDaysUsed: 0,
      currentStreak: 5,
      longestStreak: 7,
    },
  });

  const dsa_tasks = [
    { title: 'Solve 2 LeetCode problems', taskType: 'MANDATORY' as const, difficulty: 'MEDIUM' as const, category: 'LEARNING' as const },
    { title: 'Review yesterday\'s solutions', taskType: 'MANDATORY' as const, difficulty: 'EASY' as const, category: 'LEARNING' as const },
    { title: 'Watch a topic video (30 min)', taskType: 'MANDATORY' as const, difficulty: 'EASY' as const, category: 'LEARNING' as const },
    { title: 'Practice competitive programming', taskType: 'OPTIONAL' as const, difficulty: 'HARD' as const, category: 'LEARNING' as const },
  ];

  const blueprints1 = [];
  for (const task of dsa_tasks) {
    const bp = await prisma.taskBlueprint.create({
      data: {
        challengeId: challenge1.id,
        title: task.title,
        taskType: task.taskType,
        difficulty: task.difficulty,
        category: task.category,
        activeFromDate: challenge1Start,
      },
    });
    blueprints1.push(bp);
  }
  console.log(`  ✓ Created challenge: ${challenge1.name} with ${blueprints1.length} tasks`);

  // Create daily instances for past 10 days + today
  for (let dayOffset = 0; dayOffset <= 10; dayOffset++) {
    const date = subDays(today, 10 - dayOffset);

    for (const bp of blueprints1) {
      // Simulate varying completion patterns
      const rand = Math.random();
      let completed = false;
      if (dayOffset < 10) {
        // Past days: mostly completed with some misses
        completed = bp.taskType === 'MANDATORY' ? rand > 0.15 : rand > 0.6;
      }
      // Today (dayOffset === 10): leave uncompleted

      await prisma.dailyTaskInstance.create({
        data: {
          userId: user.id,
          challengeId: challenge1.id,
          taskBlueprintId: bp.id,
          date,
          completed,
          completedAt: completed ? date : null,
          pointsEarned: completed
            ? (bp.difficulty === 'EASY' ? 1 : bp.difficulty === 'MEDIUM' ? 2 : 3)
            : 0,
        },
      });
    }

    // Create daily stats for past days
    if (dayOffset < 10) {
      const dayInstances = await prisma.dailyTaskInstance.findMany({
        where: { challengeId: challenge1.id, date },
        include: { taskBlueprint: true },
      });

      const mandatory = dayInstances.filter(i => i.taskBlueprint.taskType === 'MANDATORY');
      const mandatoryCompleted = mandatory.filter(i => i.completed).length;
      const completionRate = mandatory.length > 0 ? (mandatoryCompleted / mandatory.length) * 100 : 100;
      const score = dayInstances.filter(i => i.completed).reduce((sum, i) => sum + i.pointsEarned, 0);
      const streakContributed = mandatoryCompleted === mandatory.length && mandatory.length > 0;

      await prisma.dailyStats.create({
        data: {
          challengeId: challenge1.id,
          date,
          completionRate,
          score,
          streakContributed,
        },
      });
    }
  }
  console.log(`  ✓ Created 11 days of daily instances for ${challenge1.name}`);

  // ============ Challenge 2: Active 15-day fitness challenge (started 3 days ago) ============
  const challenge2Start = subDays(today, 3);
  const challenge2 = await prisma.challenge.create({
    data: {
      userId: user.id,
      name: '15-Day Fitness Sprint',
      description: 'Get fit with daily workouts and healthy habits',
      startDate: challenge2Start,
      endDate: addDays(challenge2Start, 15),
      status: 'ACTIVE',
      graceDaysTotal: 1,
      currentStreak: 3,
      longestStreak: 3,
    },
  });

  const fitness_tasks = [
    { title: '30 min workout', taskType: 'MANDATORY' as const, difficulty: 'MEDIUM' as const, category: 'FITNESS' as const },
    { title: 'Drink 3L water', taskType: 'MANDATORY' as const, difficulty: 'EASY' as const, category: 'HEALTH' as const },
    { title: '10 min meditation', taskType: 'OPTIONAL' as const, difficulty: 'EASY' as const, category: 'HEALTH' as const },
  ];

  const blueprints2 = [];
  for (const task of fitness_tasks) {
    const bp = await prisma.taskBlueprint.create({
      data: {
        challengeId: challenge2.id,
        title: task.title,
        taskType: task.taskType,
        difficulty: task.difficulty,
        category: task.category,
        activeFromDate: challenge2Start,
      },
    });
    blueprints2.push(bp);
  }

  // Create past instances (all completed for perfect streak)
  for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
    const date = subDays(today, 3 - dayOffset);

    for (const bp of blueprints2) {
      const completed = dayOffset < 3; // today uncompleted
      await prisma.dailyTaskInstance.create({
        data: {
          userId: user.id,
          challengeId: challenge2.id,
          taskBlueprintId: bp.id,
          date,
          completed,
          completedAt: completed ? date : null,
          pointsEarned: completed ? (bp.difficulty === 'EASY' ? 1 : 2) : 0,
        },
      });
    }

    if (dayOffset < 3) {
      await prisma.dailyStats.create({
        data: {
          challengeId: challenge2.id,
          date,
          completionRate: 100,
          score: 4,
          streakContributed: true,
        },
      });
    }
  }
  console.log(`  ✓ Created challenge: ${challenge2.name} with ${blueprints2.length} tasks`);

  // ============ Challenge 3: Completed 15-day challenge ============
  const challenge3Start = subDays(today, 20);
  const challenge3End = subDays(today, 5);
  const challenge3 = await prisma.challenge.create({
    data: {
      userId: user.id,
      name: 'Reading Habit Builder',
      description: 'Read for at least 30 minutes every day',
      startDate: challenge3Start,
      endDate: challenge3End,
      status: 'COMPLETED',
      graceDaysTotal: 1,
      graceDaysUsed: 1,
      currentStreak: 0,
      longestStreak: 12,
      reportGenerated: false,
    },
  });

  const reading_tasks = [
    { title: 'Read 30 pages', taskType: 'MANDATORY' as const, difficulty: 'MEDIUM' as const, category: 'PERSONAL' as const },
    { title: 'Write book notes', taskType: 'OPTIONAL' as const, difficulty: 'EASY' as const, category: 'LEARNING' as const },
  ];

  const blueprints3 = [];
  for (const task of reading_tasks) {
    const bp = await prisma.taskBlueprint.create({
      data: {
        challengeId: challenge3.id,
        title: task.title,
        taskType: task.taskType,
        difficulty: task.difficulty,
        category: task.category,
        activeFromDate: challenge3Start,
      },
    });
    blueprints3.push(bp);
  }

  // Create 15 days of instances for completed challenge
  for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
    const date = addDays(challenge3Start, dayOffset);
    const completionRate = dayOffset === 5 ? 0 : (80 + Math.random() * 20); // Day 5 was a miss

    for (const bp of blueprints3) {
      const completed = dayOffset !== 5 ? Math.random() > 0.1 : false;
      await prisma.dailyTaskInstance.create({
        data: {
          userId: user.id,
          challengeId: challenge3.id,
          taskBlueprintId: bp.id,
          date,
          completed,
          completedAt: completed ? date : null,
          pointsEarned: completed ? (bp.difficulty === 'EASY' ? 1 : 2) : 0,
        },
      });
    }

    await prisma.dailyStats.create({
      data: {
        challengeId: challenge3.id,
        date,
        completionRate: dayOffset === 5 ? 0 : completionRate,
        score: dayOffset === 5 ? 0 : Math.floor(2 + Math.random() * 2),
        streakContributed: dayOffset !== 5,
        graceDayUsed: dayOffset === 5,
      },
    });
  }
  console.log(`  ✓ Created completed challenge: ${challenge3.name}`);

  console.log('\n✅ Seed complete!');
  console.log(`   Users: 1`);
  console.log(`   Challenges: 3 (2 active, 1 completed)`);
  console.log(`   Task blueprints: ${blueprints1.length + blueprints2.length + blueprints3.length}`);

  const totalInstances = await prisma.dailyTaskInstance.count();
  console.log(`   Daily task instances: ${totalInstances}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
