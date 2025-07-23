import { apiService } from './api';
import { Experience } from '../types';
import { v4 as uuidv4 } from 'uuid';

class ExperienceService {
  async createExperience(userId: string, username: string, data: any): Promise<Experience> {
    const experience = {
      userId,
      username: data.isAnonymous ? 'Anonymous' : username,
      title: data.title,
      content: data.content,
      tags: data.tags,
      isAnonymous: data.isAnonymous
    };

    const result = await apiService.createExperience(experience);
    
    return {
      id: result.id,
      userId,
      username: data.isAnonymous ? 'Anonymous' : username,
      title: data.title,
      content: data.content,
      timestamp: new Date(),
      tags: data.tags,
      isAnonymous: data.isAnonymous,
      status: 'approved',
      comments: [],
      likes: 0
    };
  }

  async getExperiences(): Promise<Experience[]> {
    const experiences = await apiService.getExperiences();
    return experiences.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUserExperiences(userId: string): Promise<Experience[]> {
    const experiences = await apiService.getExperiences();
    return experiences.filter(e => e.userId === userId);
  }

  async likeExperience(experienceId: string): Promise<void> {
    // This would need to be implemented in the API
    console.log('Like experience:', experienceId);
  }

  async addComment(experienceId: string, userId: string, username: string, data: any): Promise<void> {
    // This would need to be implemented in the API
    console.log('Add comment:', experienceId, data);
  }
}

export const experienceService = new ExperienceService();