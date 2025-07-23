import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Middleware
interface AuthRequest extends express.Request {
  user?: {
    id: string;
    isAdmin: boolean;
  };
}

const authenticateToken = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; isAdmin: boolean };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: 'Could not create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected Routes
app.use('/api', authenticateToken);

// Reports
app.post('/api/reports', async (req: AuthRequest, res) => {
  try {
    const report = await prisma.report.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: 'Could not create report' });
  }
});

app.get('/api/reports', async (req: AuthRequest, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: req.user!.isAdmin ? undefined : { userId: req.user!.id },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

// Experiences
app.post('/api/experiences', async (req: AuthRequest, res) => {
  try {
    const experience = await prisma.experience.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });
    res.json(experience);
  } catch (error) {
    res.status(400).json({ error: 'Could not create experience' });
  }
});

app.get('/api/experiences', async (_req, res) => {
  try {
    const experiences = await prisma.experience.findMany();
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch experiences' });
  }
});

// Questions
app.post('/api/questions', async (req: AuthRequest, res) => {
  try {
    const question = await prisma.question.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: 'Could not create question' });
  }
});

app.get('/api/questions', async (_req, res) => {
  try {
    const questions = await prisma.question.findMany();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch questions' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
