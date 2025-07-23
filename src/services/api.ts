@@ .. @@
-import { localStorageService } from './localStorageService';
import { prismaService } from './prismaService';
+import { prismaService } from './prismaService';

 // Mock API service that uses localStorage through localStorageService
 class ApiService {
@@ .. @@
   constructor() {
-    this.token = localStorageService.getAuthToken();
+    this.token = localStorage.getItem('cyberguard_auth_token');
   }

   setToken(token: string) {
     this.token = token;
-    localStorageService.setAuthToken(token);
+    localStorage.setItem('cyberguard_auth_token', token);
   }

   clearToken() {
     this.token = null;
-    localStorageService.clearCurrentUser();
+    localStorage.removeItem('cyberguard_auth_token');
+    localStorage.removeItem('cyberguard_current_user');
   }

   // Auth
   async login(email: string, password: string): Promise<{ user: User; token: string }> {
-    const user = localStorageService.findUserByEmail(email);
-    
-    if (!user || user.password !== password) {
-      throw new Error('Invalid credentials');
-    }
-    const token = `token-${user.id}-${Date.now()}`;
-    this.setToken(token);
-    localStorageService.setCurrentUser(user);
-    
-    const { password: _, ...userWithoutPassword } = user;
-    return { user: userWithoutPassword as User, token };
    const result = await prismaService.login(email, password);
    this.setToken(result.token);
    localStorage.setItem('cyberguard_current_user', JSON.stringify(result.user));
    return result;
+    const result = await prismaService.login(email, password);
+    this.setToken(result.token);
+    localStorage.setItem('cyberguard_current_user', JSON.stringify(result.user));
+    return result;
   }

   async signup(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
-    const existingUser = localStorageService.findUserByEmail(email);
-    
-    if (existingUser) {
-      throw new Error('Email already exists');
-    }
-    const newUser = localStorageService.addUser({
-      username,
-      email,
-      password,
-      isAdmin: false
-    });
-    const token = `token-${newUser.id}-${Date.now()}`;
-    this.setToken(token);
-    localStorageService.setCurrentUser(newUser);
-    const { password: _, ...userWithoutPassword } = newUser;
-    return { user: userWithoutPassword as User, token };
    const result = await prismaService.signup(username, email, password);
    this.setToken(result.token);
    localStorage.setItem('cyberguard_current_user', JSON.stringify(result.user));
    return result;
+    const result = await prismaService.signup(username, email, password);
+    this.setToken(result.token);
+    localStorage.setItem('cyberguard_current_user', JSON.stringify(result.user));
+    return result;
   }

   // Reports
   async createReport(reportData: Omit<Report, 'id' | 'status' | 'timestamp'>): Promise<{ id: string }> {
-    const report = localStorageService.addReport(reportData);
-    return { id: report.id };
+    return await prismaService.createReport(reportData);
   }

   async getReports(): Promise<Report[]> {
-    return localStorageService.getReports()
-      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
+    return await prismaService.getReports();
   }

   async getUserReports(): Promise<Report[]> {
-    const currentUser = localStorageService.getCurrentUser();
+    const currentUser = this.getCurrentUser();
     if (!currentUser) return [];
     
-    return localStorageService.getReportsByUser(currentUser.id)
-      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
+    return await prismaService.getUserReports(currentUser.id);
   }

   async updateReportStatus(id: string, status: Report['status']): Promise<void> {
-    localStorageService.updateReportStatus(id, status);
+    await prismaService.updateReportStatus(id, status);
   }

   async getCriticalAreas(): Promise<any[]> {
-    return localStorageService.getCriticalAreas();
+    return await prismaService.getCriticalAreas();
   }

   // Questions
   async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Promise<{ id: string }> {
-    const question = localStorageService.addQuestion(questionData);
-    return { id: question.id };
+    return await prismaService.createQuestion(questionData);
   }

   async getQuestions(): Promise<Question[]> {
-    return localStorageService.getQuestions()
-      .filter(q => q.status === 'approved')
-      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
+    return await prismaService.getQuestions();
   }

   async addAnswer(questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>): Promise<void> {
-    localStorageService.addAnswerToQuestion(questionId, answerData);
+    await prismaService.addAnswer(questionId, answerData);
   }

   // Experiences
   async createExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
-    const experience = localStorageService.addExperience(experienceData);
-    return { id: experience.id };
+    return await prismaService.createExperience(experienceData);
   }

   async getExperiences(): Promise<Experience[]> {
-    return localStorageService.getExperiences()
-      .filter(e => e.status === 'approved')
-      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
+    return await prismaService.getExperiences();
   }

   async updateExperienceStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
-    localStorageService.updateExperienceStatus(id, status);
+    await prismaService.updateExperienceStatus(id, status);
   }

   // Analytics
   async getReportStats(): Promise<any> {
-    return localStorageService.getReportStats();
+    return await prismaService.getReportStats();
+  }
+
+  // Helper method to get current user
+  private getCurrentUser(): User | null {
+    try {
+      const userData = localStorage.getItem('cyberguard_current_user');
+      return userData ? JSON.parse(userData) : null;
+    } catch (error) {
+      console.error('Error getting current user:', error);
+      return null;
+    }
   }
 }