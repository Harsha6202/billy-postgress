import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Report, Question, Experience, Answer, User, Comment } from '../types';

const prisma = new PrismaClient();

class PrismaService {
  // Auth Methods
  async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  async signup(username: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isAdmin: false
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  // Reports
  async createReport(reportData: Omit<Report, 'id' | 'timestamp' | 'status'>): Promise<{ id: string }> {
    const report = await prisma.report.create({
      data: {
        ...reportData,
        location: reportData.location as any,
        perpetratorInfo: reportData.perpetratorInfo as any,
        timestamp: new Date(),
        status: 'pending'
      }
    });
    return { id: report.id };
  }

  async getReports(): Promise<Report[]> {
    const reports = await prisma.report.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    return reports.map(report => ({
      ...report,
      location: report.location as any,
      perpetratorInfo: report.perpetratorInfo as any
    }));
  }

  async getUserReports(userId: string): Promise<Report[]> {
    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    return reports.map(report => ({
      ...report,
      location: report.location as any,
      perpetratorInfo: report.perpetratorInfo as any
    }));
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<void> {
    await prisma.report.update({
      where: { id },
      data: { status }
    });
  }

  // Questions
  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status' | 'updatedAt'>): Promise<{ id: string }> {
    const question = await prisma.question.create({
      data: {
        ...questionData,
        status: 'approved' // Auto-approve for now
      }
    });
    return { id: question.id };
  }

  async getQuestions(): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: {
        answers: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return questions.map(question => ({
      ...question,
      answers: question.answers as Answer[]
    }));
  }

  async addAnswer(questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>): Promise<void> {
    await prisma.answer.create({
      data: {
        ...answerData,
        questionId,
        timestamp: new Date(),
        likes: 0
      }
    });
  }

  // Experiences
  async createExperience(experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const experience = await prisma.experience.create({
      data: {
        ...experienceData,
        timestamp: new Date(),
        status: 'approved', // Auto-approve for now
        likes: 0
      }
    });
    return { id: experience.id };
  }

  async getExperiences(): Promise<Experience[]> {
    const experiences = await prisma.experience.findMany({
      where: { status: 'approved' },
      orderBy: { timestamp: 'desc' },
      include: {
        comments: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return experiences.map(experience => ({
      ...experience,
      comments: experience.comments as Comment[],
      author: {
        username: experience.isAnonymous ? 'Anonymous' : experience.userId,
        avatarUrl: undefined
      }
    }));
  }

  async updateExperienceStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    await prisma.experience.update({
      where: { id },
      data: { status }
    });
  }

  // Analytics
  async getReportStats(): Promise<any> {
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({ where: { status: 'pending' } });
    const reportedReports = await prisma.report.count({ where: { status: 'reported' } });
    const resolvedReports = await prisma.report.count({ where: { status: 'resolved' } });

    const reportsByType = await prisma.report.groupBy({
      by: ['bullyingType'],
      _count: { bullyingType: true }
    });

    const reportsBySeverity = await prisma.report.groupBy({
      by: ['severity'],
      _count: { severity: true }
    });

    return {
      total: totalReports,
      pending: pendingReports,
      reported: reportedReports,
      resolved: resolvedReports,
      byType: reportsByType.reduce((acc, item) => {
        acc[item.bullyingType] = item._count.bullyingType;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: reportsBySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count.severity;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getCriticalAreas(): Promise<any[]> {
    const reports = await this.getReports();
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

  // Initialize default users
  async initializeDefaultUsers(): Promise<void> {
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          username: 'Admin',
          email: 'admin@gmail.com',
          password: bcrypt.hashSync('Admin@6202', 10),
          isAdmin: true
        }
      });
    }

    const cybercrimeExists = await prisma.user.findUnique({
      where: { email: 'cybercrime@gmail.com' }
    });

    if (!cybercrimeExists) {
      await prisma.user.create({
        data: {
          username: 'Cybercrime Officer',
          email: 'cybercrime@gmail.com',
          password: bcrypt.hashSync('Cyber@6202', 10),
          isAdmin: true
        }
      });
    }
  }
}

export const prismaService = new PrismaService();