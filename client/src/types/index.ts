export interface User {
  id: string;
  email: string;
  name: string | null;
  productivityScore: number;
  globalStreak: number;
  longestGlobalStreak: number;
  timezone: string;
  createdAt: string;
  completedChallenges: number;
  activeChallenges: number;
  totalTasksCompleted: number;
}

export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type TaskType = 'MANDATORY' | 'OPTIONAL';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Category = 'LEARNING' | 'FITNESS' | 'HEALTH' | 'CAREER' | 'PERSONAL' | 'FINANCE' | 'CUSTOM';

export interface Challenge {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  graceDaysTotal: number;
  graceDaysUsed: number;
  currentStreak: number;
  longestStreak: number;
  reportGenerated: boolean;
  createdAt: string;
  taskBlueprints: TaskBlueprint[];
  progress?: ChallengeProgress;
  dailyStats?: DailyStatsEntry[];
}

export interface ChallengeProgress {
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface TaskBlueprint {
  id: string;
  challengeId: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  difficulty: Difficulty;
  category: Category;
  activeFromDate: string;
  createdAt: string;
}

export interface DailyTaskInstance {
  id: string;
  userId: string;
  challengeId: string;
  taskBlueprintId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
  pointsEarned: number;
  taskBlueprint: {
    title: string;
    description?: string;
    taskType: TaskType;
    difficulty: Difficulty;
    category: Category;
  };
  challenge: {
    id: string;
    name: string;
  };
}

export interface DailyTaskGroup {
  challengeId: string;
  challengeName: string;
  tasks: DailyTaskInstance[];
  mandatoryCompleted: number;
  mandatoryTotal: number;
  completionRate: number;
}

export interface DailyStatsEntry {
  id: string;
  challengeId: string;
  date: string;
  completionRate: number;
  score: number;
  streakContributed: boolean;
  graceDayUsed: boolean;
}

export interface HeatmapEntry {
  date: string;
  completionRate: number;
  score: number;
  streakContributed: boolean;
  graceDayUsed: boolean;
}

export interface OverviewStats {
  activeChallenges: number;
  completedChallenges: number;
  totalChallenges: number;
  totalTasksCompleted: number;
  todayCompletion: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
  last7DayAverage: number;
  productivityScore: number;
  globalStreak: number;
  longestGlobalStreak: number;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  completed: number;
  completionRate: number;
}

export interface DifficultyBreakdown {
  difficulty: Difficulty;
  total: number;
  completed: number;
  completionRate: number;
}

export interface MissedDay {
  challengeId: string;
  challengeName: string;
  graceDaysRemaining: number;
  date: string;
}

export interface PredictionResult {
  predictedCompletion: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  currentCompletion: number;
  last7DayAverage: number;
  overallAverage: number;
}

export interface ChallengeReport {
  id: string;
  challengeId: string;
  completionRate: number;
  finalScore: number;
  longestStreak: number;
  totalTasks: number;
  completedTasks: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    completed: number;
    rate: number;
  }>;
  bestDay: { date: string; completionRate: number; score: number } | null;
  worstDay: { date: string; completionRate: number; score: number } | null;
  heatmapJson: HeatmapEntry[];
  generatedAt: string;
}

// Form types
export interface CreateChallengeForm {
  name: string;
  description?: string;
  duration: '15' | '30' | '60' | '90';
  startDate: string;
  tasks: CreateTaskForm[];
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  taskType: TaskType;
  difficulty: Difficulty;
  category: Category;
}
