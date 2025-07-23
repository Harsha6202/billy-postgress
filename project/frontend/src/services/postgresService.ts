import pool from '../config/postgresConfig';
import { Report, Question, Experience, Answer, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

class PostgresService {
  // Reports
  async addReport(report: Omit<Report, 'id'>): Promise<string> {
    const query = `INSERT INTO reports (userId, location, description, timestamp, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [report.userId, report.location, report.description, new Date(report.timestamp), report.status];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  async getAllReports(): Promise<Report[]> {
    const query = `SELECT * FROM reports ORDER BY timestamp DESC`;
    const result = await pool.query(query);
    return result.rows.map((row: Report) => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    const query = `SELECT * FROM reports WHERE userId = $1 ORDER BY timestamp DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row: Report) => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  async updateReportStatus(reportId: string, status: Report['status']): Promise<void> {
    const query = `UPDATE reports SET status = $1 WHERE id = $2`;
    await pool.query(query, [status, reportId]);
  }

  async getReportsByLocation(city: string, state: string): Promise<Report[]> {
    const query = `SELECT * FROM reports WHERE location->>'city' = $1 AND location->>'state' = $2`;
    const result = await pool.query(query, [city, state]);
    return result.rows.map((row: Report) => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  // Questions
  async addQuestion(question: Omit<Question, 'id'>): Promise<string> {
    const query = `INSERT INTO questions (title, description, createdAt, answers) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [question.title, question.description, new Date(question.createdAt), JSON.stringify(question.answers || [])];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  async getAllQuestions(): Promise<Question[]> {
    const query = `SELECT * FROM questions ORDER BY createdAt DESC`;
    const result = await pool.query(query);
    return result.rows.map((row: Question) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      answers: (row.answers ? JSON.parse(row.answers) : []) as Answer[]
    }));
  }

  async addAnswer(questionId: string, answer: Omit<Answer, 'id'>): Promise<void> {
    const query = `UPDATE questions SET answers = jsonb_set(answers, '{-1}', $1::jsonb, true) WHERE id = $2`;
    const newAnswer = {
      ...answer,
      id: uuidv4(),
      timestamp: new Date()
    };
    await pool.query(query, [JSON.stringify(newAnswer), questionId]);
  }

  // Experiences
  async addExperience(experience: Omit<Experience, 'id'>): Promise<string> {
    const query = `INSERT INTO experiences (title, description, timestamp, comments, likes) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [experience.title, experience.description, new Date(experience.timestamp), JSON.stringify(experience.comments || []), experience.likes || 0];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  async getAllExperiences(): Promise<Experience[]> {
    const query = `SELECT * FROM experiences WHERE status = 'approved' ORDER BY timestamp DESC`;
    const result = await pool.query(query);
    return result.rows.map((row: Experience) => ({
      ...row,
      timestamp: new Date(row.timestamp),
      comments: (row.comments ? JSON.parse(row.comments) : []) as Comment[]
    }));
  }

  async updateExperienceStatus(experienceId: string, status: 'approved' | 'rejected'): Promise<void> {
    const query = `UPDATE experiences SET status = $1 WHERE id = $2`;
    await pool.query(query, [status, experienceId]);
  }

  async updateExperienceLikes(experienceId: string, likes: number): Promise<void> {
    const query = `UPDATE experiences SET likes = $1 WHERE id = $2`;
    await pool.query(query, [likes, experienceId]);
  }

  // Users
  async addUser(user: Omit<User, 'id'>): Promise<string> {
    const query = `INSERT INTO users (name, email, createdAt) VALUES ($1, $2, $3) RETURNING id`;
    const values = [user.name, user.email, new Date(user.createdAt)];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;
    return {
      ...result.rows[0],
      createdAt: new Date(result.rows[0].createdAt)
    };
  }

  async getAllUsers(): Promise<User[]> {
    const query = `SELECT * FROM users`;
    const result = await pool.query(query);
    return result.rows.map((row: User) => ({
      ...row,
      createdAt: new Date(row.createdAt)
    }));
  }
}

export const postgresService = new PostgresService();
