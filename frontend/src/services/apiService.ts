import { Report, Question, Experience, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;
  private static instance: ApiService;

  private constructor() {
    this.token = localStorage.getItem("token"); // Load token on init if it exists
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return response.json();
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(response);
  }

  async signup(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ username, email, password })
    });
    return this.handleResponse(response);
  }

  async createReport(reportData: Omit<Report, 'id' | 'status' | 'timestamp'>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    return this.handleResponse(response);
  }

  async getReports(): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserReports(userId: string): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/reports/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async getCriticalAreas(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/critical-areas`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    return this.handleResponse(response);
  }

  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async addAnswer(questionId: string, answerData: Omit<any, 'id' | 'timestamp' | 'likes'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answerData)
    });
    return this.handleResponse(response);
  }

  async createExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/experiences`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(experienceData)
    });
    return this.handleResponse(response);
  }

  async getExperiences(): Promise<Experience[]> {
    const response = await fetch(`${API_BASE_URL}/experiences`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateExperienceStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/experiences/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async getReportStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = ApiService.getInstance();
