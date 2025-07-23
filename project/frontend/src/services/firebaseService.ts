import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Report, Question, Experience, Answer, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

class FirebaseService {
  // Collections
  private reportsCollection = 'reports';
  private questionsCollection = 'questions';
  private experiencesCollection = 'experiences';
  private usersCollection = 'users';

  // Reports
  async addReport(report: Omit<Report, 'id'>): Promise<string> {
    try {
      const reportData = {
        ...report,
        timestamp: Timestamp.fromDate(new Date(report.timestamp))
      };
      const docRef = await addDoc(collection(db, this.reportsCollection), reportData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding report:', error);
      throw new Error('Failed to add report');
    }
  }

  async getAllReports(): Promise<Report[]> {
    try {
      const q = query(
        collection(db, this.reportsCollection),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Report[];
    } catch (error) {
      console.error('Error getting reports:', error);
      throw new Error('Failed to get reports');
    }
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    try {
      const q = query(
        collection(db, this.reportsCollection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Report[];
    } catch (error) {
      console.error('Error getting user reports:', error);
      throw new Error('Failed to get user reports');
    }
  }

  async updateReportStatus(reportId: string, status: Report['status']): Promise<void> {
    try {
      const reportRef = doc(db, this.reportsCollection, reportId);
      await updateDoc(reportRef, { status });
    } catch (error) {
      console.error('Error updating report status:', error);
      throw new Error('Failed to update report status');
    }
  }

  async getReportsByLocation(city: string, state: string): Promise<Report[]> {
    try {
      const q = query(
        collection(db, this.reportsCollection),
        where('location.city', '==', city),
        where('location.state', '==', state)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Report[];
    } catch (error) {
      console.error('Error getting reports by location:', error);
      throw new Error('Failed to get reports by location');
    }
  }

  // Questions
  async addQuestion(question: Omit<Question, 'id'>): Promise<string> {
    try {
      const questionData = {
        ...question,
        createdAt: Timestamp.fromDate(new Date(question.createdAt)),
        answers: question.answers || []
      };
      const docRef = await addDoc(collection(db, this.questionsCollection), questionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error('Failed to add question');
    }
  }

  async getAllQuestions(): Promise<Question[]> {
    try {
      const q = query(
        collection(db, this.questionsCollection),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        answers: doc.data().answers?.map((answer: any) => ({
          ...answer,
          timestamp: answer.timestamp.toDate()
        })) || []
      })) as Question[];
    } catch (error) {
      console.error('Error getting questions:', error);
      throw new Error('Failed to get questions');
    }
  }

  async addAnswer(questionId: string, answer: Omit<Answer, 'id'>): Promise<void> {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);
      const questionDoc = await getDoc(questionRef);
      
      if (!questionDoc.exists()) {
        throw new Error('Question not found');
      }

      const questionData = questionDoc.data() as Question;
      const newAnswer = {
        ...answer,
        id: uuidv4(),
        timestamp: Timestamp.fromDate(new Date())
      };

      const updatedAnswers = [...(questionData.answers || []), newAnswer];
      await updateDoc(questionRef, { answers: updatedAnswers });
    } catch (error) {
      console.error('Error adding answer:', error);
      throw new Error('Failed to add answer');
    }
  }

  // Experiences
  async addExperience(experience: Omit<Experience, 'id'>): Promise<string> {
    try {
      const experienceData = {
        ...experience,
        timestamp: Timestamp.fromDate(new Date(experience.timestamp)),
        comments: experience.comments || [],
        likes: experience.likes || 0
      };
      const docRef = await addDoc(collection(db, this.experiencesCollection), experienceData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw new Error('Failed to add experience');
    }
  }

  async getAllExperiences(): Promise<Experience[]> {
    try {
      const q = query(
        collection(db, this.experiencesCollection),
        where('status', '==', 'approved'),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          timestamp: comment.timestamp.toDate()
        })) || []
      })) as Experience[];
    } catch (error) {
      console.error('Error getting experiences:', error);
      throw new Error('Failed to get experiences');
    }
  }

  async updateExperienceStatus(experienceId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      const experienceRef = doc(db, this.experiencesCollection, experienceId);
      await updateDoc(experienceRef, { status });
    } catch (error) {
      console.error('Error updating experience status:', error);
      throw new Error('Failed to update experience status');
    }
  }

  async updateExperienceLikes(experienceId: string, likes: number): Promise<void> {
    try {
      const experienceRef = doc(db, this.experiencesCollection, experienceId);
      await updateDoc(experienceRef, { likes });
    } catch (error) {
      console.error('Error updating experience likes:', error);
      throw new Error('Failed to update experience likes');
    }
  }

  // Users
  async addUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const userData = {
        ...user,
        createdAt: Timestamp.fromDate(new Date(user.createdAt))
      };
      const docRef = await addDoc(collection(db, this.usersCollection), userData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('Failed to add user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.usersCollection),
        where('email', '==', email),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.usersCollection));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  // Utility methods
  async getCriticalAreas(): Promise<any[]> {
    try {
      const reports = await this.getAllReports();
      const locationMap = new Map<string, { count: number; reports: Report[] }>();

      reports.forEach(report => {
        const key = `${report.location.city}, ${report.location.state}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, { count: 0, reports: [] });
        }
        const location = locationMap.get(key)!;
        location.count++;
        location.reports.push(report);
      });

      return Array.from(locationMap.entries())
        .filter(([_, data]) => data.count >= 3)
        .map(([location, data]) => ({
          location,
          count: data.count,
          reports: data.reports
        }));
    } catch (error) {
      console.error('Error getting critical areas:', error);
      throw new Error('Failed to get critical areas');
    }
  }
}

export const firebaseService = new FirebaseService();