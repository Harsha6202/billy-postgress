import { Report, Question, Experience, Answer, User } from '../types';
import { localStorageService } from './localStorageService';

// Mock API service that uses localStorage through localStorageService
class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorageService.getAuthToken();
  }

  setToken(token: string) {
    this.token = token;
    localStorageService.setAuthToken(token);
  }

  clearToken() {
    this.token = null;
    localStorageService.clearCurrentUser();
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = localStorageService.findUserByEmail(email);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = `token-${user.id}-${Date.now()}`;
    this.setToken(token);
    localStorageService.setCurrentUser(user);
    
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  async signup(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const existingUser = localStorageService.findUserByEmail(email);
    
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = localStorageService.addUser({
      username,
      email,
      password,
      isAdmin: false
    });

    const token = `token-${newUser.id}-${Date.now()}`;
    this.setToken(token);
    localStorageService.setCurrentUser(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword as User, token };
  }

  // Reports
  async createReport(reportData: Omit<Report, 'id' | 'status' | 'timestamp'>): Promise<{ id: string }> {
    const report = localStorageService.addReport(reportData);
    return { id: report.id };
  }

  async getReports(): Promise<Report[]> {
    return localStorageService.getReports()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUserReports(): Promise<Report[]> {
    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser) return [];
    
    return localStorageService.getReportsByUser(currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<void> {
    localStorageService.updateReportStatus(id, status);
  }

  async getCriticalAreas(): Promise<any[]> {
    return localStorageService.getCriticalAreas();
  }

  // Questions
  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Promise<{ id: string }> {
    const question = localStorageService.addQuestion(questionData);
    return { id: question.id };
  }

  async getQuestions(): Promise<Question[]> {
    return localStorageService.getQuestions()
      .filter(q => q.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addAnswer(questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>): Promise<void> {
    localStorageService.addAnswerToQuestion(questionId, answerData);
  }

  // Experiences
  async createExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const experience = localStorageService.addExperience(experienceData);
    return { id: experience.id };
  }

  async getExperiences(): Promise<Experience[]> {
    return localStorageService.getExperiences()
      .filter(e => e.status === 'approved')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async updateExperienceStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    localStorageService.updateExperienceStatus(id, status);
  }

  // Analytics
  async getReportStats(): Promise<any> {
    return localStorageService.getReportStats();
  }
}

export const apiService = new ApiService();