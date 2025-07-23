import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/reports', async (req: Request, res: Response) => {
  const reports = await prisma.report.findMany();
  res.json(reports);
});

app.listen(3000, () => {
  console.log('Backend server is running on http://localhost:3000');
});
