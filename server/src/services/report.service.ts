import prisma from '../utils/prisma';
import { startOfDay } from 'date-fns';

// ============ LAZY REPORT GENERATION ============

/**
 * Get or generate report for a challenge.
 * Lazy generation: only generates when challenge is past end date and report hasn't been generated.
 */
export async function getOrGenerateReport(challengeId: string, userId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
    include: { report: true },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // If report already exists, return it
  if (challenge.report) {
    return challenge.report;
  }

  const today = startOfDay(new Date());

  // Check if challenge has ended
  if (challenge.endDate > today) {
    throw new Error('Challenge has not ended yet. Report will be available after the end date.');
  }

  // Generate the report
  return generateReport(challengeId);
}

/**
 * Generate a comprehensive challenge report.
 */
async function generateReport(challengeId: string) {
  // Get all daily stats
  const dailyStats = await prisma.dailyStats.findMany({
    where: { challengeId },
    orderBy: { date: 'asc' },
  });

  // Get all task instances
  const instances = await prisma.dailyTaskInstance.findMany({
    where: { challengeId },
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

  // Overall completion rate
  const mandatoryInstances = instances.filter(
    (i) => i.taskBlueprint.taskType === 'MANDATORY'
  );
  const completedMandatory = mandatoryInstances.filter((i) => i.completed);
  const completionRate = mandatoryInstances.length > 0
    ? Math.round((completedMandatory.length / mandatoryInstances.length) * 100)
    : 0;

  // Final score
  const finalScore = instances
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + i.pointsEarned, 0);

  // Longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  for (const stat of dailyStats) {
    if (stat.streakContributed) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Category breakdown
  const categoryMap: Record<string, { total: number; completed: number }> = {};
  for (const inst of instances) {
    const cat = inst.taskBlueprint.category;
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
    categoryMap[cat].total++;
    if (inst.completed) categoryMap[cat].completed++;
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    total: data.total,
    completed: data.completed,
    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }));

  // Best and worst days
  let bestDay = dailyStats.length > 0 ? dailyStats[0] : null;
  let worstDay = dailyStats.length > 0 ? dailyStats[0] : null;

  for (const stat of dailyStats) {
    if (stat.completionRate > (bestDay?.completionRate ?? 0)) bestDay = stat;
    if (stat.completionRate < (worstDay?.completionRate ?? 100)) worstDay = stat;
  }

  // Heatmap data
  const heatmapJson = dailyStats.map((s) => ({
    date: s.date.toISOString().split('T')[0],
    completionRate: s.completionRate,
    score: s.score,
  }));

  // Create report
  const report = await prisma.challengeReport.create({
    data: {
      challengeId,
      completionRate,
      finalScore,
      longestStreak,
      totalTasks: instances.length,
      completedTasks: instances.filter((i) => i.completed).length,
      categoryBreakdown,
      bestDay: bestDay ? {
        date: bestDay.date.toISOString().split('T')[0],
        completionRate: bestDay.completionRate,
        score: bestDay.score,
      } : null,
      worstDay: worstDay ? {
        date: worstDay.date.toISOString().split('T')[0],
        completionRate: worstDay.completionRate,
        score: worstDay.score,
      } : null,
      heatmapJson,
    },
  });

  // Mark challenge as report generated + completed
  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      reportGenerated: true,
      status: 'COMPLETED',
    },
  });

  return report;
}
