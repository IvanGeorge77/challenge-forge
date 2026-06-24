import type {
  Challenge,
  DailyTaskGroup,
  OverviewStats,
  HeatmapEntry,
  CategoryBreakdown,
  DifficultyBreakdown,
  PredictionResult,
  ChallengeReport,
  User,
  CreateChallengeForm,
  CreateTaskForm
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get auth token
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ========== CHALLENGES ==========
  async getChallenges(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<Challenge[]>(`/challenges${query}`);
  }

  async getChallenge(id: string) {
    return this.request<Challenge>(`/challenges/${id}`);
  }

  async createChallenge(data: CreateChallengeForm) {
    return this.request<Challenge>('/challenges', { method: 'POST', body: data });
  }

  async updateChallenge(id: string, data: Partial<CreateChallengeForm>) {
    return this.request<Challenge>(`/challenges/${id}`, { method: 'PUT', body: data });
  }

  async deleteChallenge(id: string) {
    return this.request<void>(`/challenges/${id}`, { method: 'DELETE' });
  }

  // ========== TASKS ==========
  async getTasks(challengeId: string) {
    return this.request<any[]>(`/challenges/${challengeId}/tasks`);
  }

  async createTask(challengeId: string, data: CreateTaskForm) {
    return this.request<any>(`/challenges/${challengeId}/tasks`, {
      method: 'POST',
      body: data,
    });
  }

  async updateTask(taskId: string, data: Partial<CreateTaskForm>) {
    return this.request<any>(`/challenges/tasks/${taskId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteTask(taskId: string) {
    return this.request<void>(`/challenges/tasks/${taskId}`, { method: 'DELETE' });
  }

  // ========== DAILY ==========
  async getDailyTasks(challengeId?: string) {
    const path = challengeId ? `/daily/${challengeId}` : '/daily';
    return this.request<{ tasks: DailyTaskGroup[], missedDays: any[] }>(path);
  }

  async completeTask(instanceId: string) {
    return this.request<void>(`/daily/${instanceId}/complete`, { method: 'PUT' });
  }

  async uncompleteTask(instanceId: string) {
    return this.request<void>(`/daily/${instanceId}/uncomplete`, { method: 'PUT' });
  }

  // ========== STATS ==========
  async getOverviewStats() {
    return this.request<OverviewStats>('/stats/overview');
  }

  async getHeatmapData(challengeId: string) {
    return this.request<HeatmapEntry[]>(`/stats/challenge/${challengeId}/heatmap`);
  }

  async getCategoryBreakdown() {
    return this.request<CategoryBreakdown[]>('/stats/categories');
  }

  async getDifficultyBreakdown() {
    return this.request<DifficultyBreakdown[]>('/stats/difficulties');
  }

  async applyGraceDay(challengeId: string, date: string) {
    return this.request<void>(`/stats/challenge/${challengeId}/grace-day`, {
      method: 'POST',
      body: { date },
    });
  }

  async getPrediction(challengeId: string) {
    return this.request<PredictionResult>(`/stats/challenge/${challengeId}/prediction`);
  }

  // ========== REPORTS ==========
  async getReport(challengeId: string) {
    return this.request<ChallengeReport>(`/challenges/${challengeId}/report`);
  }

  // ========== USER ==========
  async getProfile() {
    return this.request<User>('/user/profile');
  }

  async updateProfile(data: { name?: string; timezone?: string }) {
    return this.request<User>('/user/profile', { method: 'PUT', body: data });
  }
}

export const api = new ApiClient(API_BASE);
export default api;
