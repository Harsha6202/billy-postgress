import { Report, Question, Experience, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token"); // Load token on init if it exists
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
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (response.ok) {
      return response.json();
    }

    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
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
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getUserReports(userId: string): Promise<Report[]> {
    const res = await fetch(`${API_BASE_URL}/reports/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(await res.text());
  }

  async getCriticalAreas(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/critical-areas`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getQuestions(): Promise<Question[]> {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async addAnswer(questionId: string, answerData: Omit<any, 'id' | 'timestamp' | 'likes'>): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/questions/${questionId}/answers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answerData)
    });
    if (!res.ok) throw new Error(await res.text());
  }

  async createExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/experiences`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(experienceData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getExperiences(): Promise<Experience[]> {
    const res = await fetch(`${API_BASE_URL}/experiences`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async updateExperienceStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/experiences/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(await res.text());
  }

  async getReportStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reports/stats`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

export const apiService = new ApiService();
