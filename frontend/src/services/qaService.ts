import { apiService } from './api';
import { Question, Answer } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const qaService = {
  async getAllQuestions(): Promise<Question[]> {
    try {
      const questions = await apiService.getQuestions();
      return questions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  },

  async addQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>): Promise<Question> {
    try {
      const result = await apiService.createQuestion(questionData);
      return {
        id: result.id,
        createdAt: new Date(),
        answers: [],
        status: 'pending',
        ...questionData
      };
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error('Failed to add question');
    }
  },

  async addAnswer(questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>): Promise<Answer> {
    try {
      await apiService.addAnswer(questionId, answerData);
      
      const newAnswer: Answer = {
        id: uuidv4(),
        timestamp: new Date(),
        likes: 0,
        ...answerData
      };

      return newAnswer;
    } catch (error) {
      console.error('Error adding answer:', error);
      throw new Error('Failed to add answer');
    }
  }
};