import { Report, Question, Experience, User, Answer, Comment } from '../types';

// Storage keys
const STORAGE_KEYS = {
  REPORTS: 'cyberguard_reports',
  QUESTIONS: 'cyberguard_questions', 
  EXPERIENCES: 'cyberguard_experiences',
  USERS: 'cyberguard_users',
  CURRENT_USER: 'cyberguard_current_user',
  AUTH_TOKEN: 'cyberguard_auth_token'
} as const;

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper functions for localStorage operations
const getFromStorage = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue as T[];
    const parsed = JSON.parse(data);
    console.log(`Retrieved ${parsed.length} items from ${key}`);
    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue as T[];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved ${data.length} items to ${key}`);
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

class LocalStorageService {
  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Initialize default admin users if none exist
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultUsers: User[] = [
        {
          id: 'admin_default',
          username: 'Admin',
          email: 'admin@gmail.com',
          password: 'Admin@6202',
          isAdmin: true,
          createdAt: new Date()
        },
        {
          id: 'cybercrime_default',
          username: 'Cybercrime Officer',
          email: 'cybercrime@gmail.com',
          password: 'Cyber@6202',
          isAdmin: true,
          createdAt: new Date()
        }
      ];
      this.saveUsers(defaultUsers);
    }
  }

  // Users
  getUsers(): User[] {
    return getFromStorage<User>(STORAGE_KEYS.USERS, []);
  }

  saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  addUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: generateId('user'),
      createdAt: new Date()
    };
    users.push(newUser);
    this.saveUsers(users);
    console.log('User added:', newUser);
    return newUser;
  }

  findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  // Reports
  getReports(): Report[] {
    return getFromStorage<Report>(STORAGE_KEYS.REPORTS, []);
  }

  saveReports(reports: Report[]): void {
    saveToStorage(STORAGE_KEYS.REPORTS, reports);
  }

  addReport(reportData: Omit<Report, 'id' | 'timestamp' | 'status'>): Report {
    const reports = this.getReports();
    const newReport: Report = {
      ...reportData,
      id: generateId('report'),
      timestamp: new Date(),
      status: 'pending'
    };
    reports.push(newReport);
    this.saveReports(reports);
    console.log('Report added:', newReport);
    return newReport;
  }

  updateReportStatus(reportId: string, status: Report['status']): boolean {
    const reports = this.getReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      this.saveReports(reports);
      console.log(`Report ${reportId} status updated to ${status}`);
      return true;
    }
    return false;
  }

  getReportsByUser(userId: string): Report[] {
    const reports = this.getReports();
    return reports.filter(report => report.userId === userId);
  }

  // Questions
  getQuestions(): Question[] {
    return getFromStorage<Question>(STORAGE_KEYS.QUESTIONS, []);
  }

  saveQuestions(questions: Question[]): void {
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
  }

  addQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...questionData,
      id: generateId('question'),
      createdAt: new Date(),
      answers: [],
      status: 'approved' // Auto-approve for now
    };
    questions.push(newQuestion);
    this.saveQuestions(questions);
    console.log('Question added:', newQuestion);
    return newQuestion;
  }

  addAnswerToQuestion(questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>): boolean {
    const questions = this.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      const newAnswer: Answer = {
        ...answerData,
        id: generateId('answer'),
        timestamp: new Date(),
        likes: 0
      };
      
      questions[questionIndex].answers.push(newAnswer);
      this.saveQuestions(questions);
      console.log('Answer added to question:', questionId, newAnswer);
      return true;
    }
    return false;
  }

  updateQuestionStatus(questionId: string, status: Question['status']): boolean {
    const questions = this.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      questions[questionIndex].status = status;
      this.saveQuestions(questions);
      console.log(`Question ${questionId} status updated to ${status}`);
      return true;
    }
    return false;
  }

  // Experiences
  getExperiences(): Experience[] {
    return getFromStorage<Experience>(STORAGE_KEYS.EXPERIENCES, []);
  }

  saveExperiences(experiences: Experience[]): void {
    saveToStorage(STORAGE_KEYS.EXPERIENCES, experiences);
  }

  addExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Experience {
    const experiences = this.getExperiences();
    const now = new Date();
    const newExperience: Experience = {
      ...experienceData,
      id: generateId('experience'),
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      status: 'approved', // Auto-approve for now
      comments: [],
      likes: 0
    };
    experiences.push(newExperience);
    this.saveExperiences(experiences);
    console.log('Experience added:', newExperience);
    return newExperience;
  }

  updateExperienceStatus(experienceId: string, status: Experience['status']): boolean {
    const experiences = this.getExperiences();
    const experienceIndex = experiences.findIndex(e => e.id === experienceId);
    if (experienceIndex !== -1) {
      experiences[experienceIndex].status = status;
      experiences[experienceIndex].updatedAt = new Date();
      this.saveExperiences(experiences);
      console.log(`Experience ${experienceId} status updated to ${status}`);
      return true;
    }
    return false;
  }

  addCommentToExperience(experienceId: string, commentData: Omit<Comment, 'id' | 'timestamp' | 'likes'>): boolean {
    const experiences = this.getExperiences();
    const experienceIndex = experiences.findIndex(e => e.id === experienceId);
    
    if (experienceIndex !== -1) {
      const newComment: Comment = {
        ...commentData,
        id: generateId('comment'),
        timestamp: new Date(),
        likes: 0
      };
      
      experiences[experienceIndex].comments.push(newComment);
      experiences[experienceIndex].updatedAt = new Date();
      this.saveExperiences(experiences);
      console.log('Comment added to experience:', experienceId, newComment);
      return true;
    }
    return false;
  }

  likeExperience(experienceId: string): boolean {
    const experiences = this.getExperiences();
    const experienceIndex = experiences.findIndex(e => e.id === experienceId);
    if (experienceIndex !== -1) {
      experiences[experienceIndex].likes += 1;
      experiences[experienceIndex].updatedAt = new Date();
      this.saveExperiences(experiences);
      console.log(`Experience ${experienceId} liked, total likes: ${experiences[experienceIndex].likes}`);
      return true;
    }
    return false;
  }

  // Authentication helpers
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      console.log('Current user set:', user.username);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log('Current user cleared');
  }

  setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Utility methods
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All data cleared from localStorage');
    this.initializeDefaultData();
  }

  exportData(): string {
    const data = {
      reports: this.getReports(),
      questions: this.getQuestions(),
      experiences: this.getExperiences(),
      users: this.getUsers(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.reports) this.saveReports(data.reports);
      if (data.questions) this.saveQuestions(data.questions);
      if (data.experiences) this.saveExperiences(data.experiences);
      if (data.users) this.saveUsers(data.users);
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Analytics helpers
  getReportStats(): {
    total: number;
    pending: number;
    reported: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const reports = this.getReports();
    const stats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      reported: reports.filter(r => r.status === 'reported').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    reports.forEach(report => {
      stats.byType[report.bullyingType] = (stats.byType[report.bullyingType] || 0) + 1;
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
    });

    return stats;
  }

  getCriticalAreas(): Array<{
    location: string;
    count: number;
    reports: Report[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const reports = this.getReports();
    const locationMap = new Map<string, Report[]>();

    reports.forEach(report => {
      const locationKey = `${report.location.city}, ${report.location.state}`;
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, []);
      }
      locationMap.get(locationKey)!.push(report);
    });

    return Array.from(locationMap.entries())
      .filter(([_, reports]) => reports.length >= 3)
      .map(([location, reports]) => ({
        location,
        count: reports.length,
        reports,
        severity: reports.length >= 10 ? 'critical' as const :
                 reports.length >= 7 ? 'high' as const :
                 reports.length >= 5 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();