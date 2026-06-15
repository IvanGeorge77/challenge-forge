import { subDays, startOfDay } from 'date-fns';
import prisma from '../utils/prisma';

// ============ PREDICTION ENGINE (Rule-based V1) ============

export interface PredictionResult {
  predictedCompletion: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  currentCompletion: number;
  last7DayAverage: number;
  overallAverage: number;
}

/**
 * Predict challenge completion based on rule-based analysis.
 * 
 * Formula:
 *   Predicted = (0.40 × Current) + (0.35 × Last 7 Days) + (0.25 × Overall)
 * 
 * Risk levels:
 *   > 85% = LOW
 *   60–85% = MEDIUM
 *   < 60% = HIGH
 */
export async function predictChallengeCompletion(
  challengeId: string,
  userId: string
): Promise<PredictionResult> {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, userId },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const today = startOfDay(new Date());
  const last7Start = subDays(today, 7);

  // Get all daily stats
  const allStats = await prisma.dailyStats.findMany({
    where: { challengeId },
    orderBy: { date: 'asc' },
  });

  if (allStats.length === 0) {
    return {
      predictedCompletion: 0,
      riskLevel: 'HIGH',
      trend: 'STABLE',
      currentCompletion: 0,
      last7DayAverage: 0,
      overallAverage: 0,
    };
  }

  // Current completion (latest day)
  const currentCompletion = allStats[allStats.length - 1].completionRate;

  // Last 7 day average
  const last7Stats = allStats.filter(
    (s) => s.date >= last7Start && s.date <= today
  );
  const last7DayAverage = last7Stats.length > 0
    ? last7Stats.reduce((sum, s) => sum + s.completionRate, 0) / last7Stats.length
    : currentCompletion;

  // Overall average
  const overallAverage =
    allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length;

  // Prediction formula
  const predictedCompletion = Math.round(
    0.4 * currentCompletion + 0.35 * last7DayAverage + 0.25 * overallAverage
  );

  // Risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (predictedCompletion > 85) riskLevel = 'LOW';
  else if (predictedCompletion >= 60) riskLevel = 'MEDIUM';
  else riskLevel = 'HIGH';

  // Trend: compare last 7 to overall
  let trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  const diff = last7DayAverage - overallAverage;
  if (diff > 5) trend = 'IMPROVING';
  else if (diff < -5) trend = 'DECLINING';
  else trend = 'STABLE';

  return {
    predictedCompletion,
    riskLevel,
    trend,
    currentCompletion: Math.round(currentCompletion),
    last7DayAverage: Math.round(last7DayAverage),
    overallAverage: Math.round(overallAverage),
  };
}
