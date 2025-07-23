import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report, Question, Experience, Answer } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  reports: Report[];
  questions: Question[];
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  addReport: (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>) => Promise<void>;
  addAnswer: (questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>) => Promise<void>;
  addExperience: (experience: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExperienceStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Effect to refresh data when auth state changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setReports([]);
      setQuestions([]);
      setExperiences([]);
      setLoading(false);
    }
  }, [user]);

  const refreshData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setReports([]);
      setQuestions([]);
      setExperiences([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing data from DB...');
      
      const [reportsData, questionsData, experiencesData] = await Promise.all([
        apiService.getReports(),
        apiService.getQuestions(),
        apiService.getExperiences()
      ]);
      
      console.log('Data loaded:', {
        reports: reportsData.length,
        questions: questionsData.length,
        experiences: experiencesData.length
      });
      
      setReports(reportsData);
      setQuestions(questionsData);
      setExperiences(experiencesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      console.error('Error refreshing data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData: Omit<Report, 'id' | 'timestamp' | 'status'>) => {
    try {
      setError(null);
      console.log('Adding report:', reportData);
      
      const result = await apiService.createReport(reportData);
      console.log('Report created with ID:', result.id);
      
      // Refresh data to get the updated list
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add report';
      console.error('Error adding report:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const addQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'answers' | 'status'>) => {
    try {
      setError(null);
      console.log('Adding question:', questionData);
      
      const result = await apiService.createQuestion(questionData);
      console.log('Question created with ID:', result.id);
      
      // Refresh data to get the updated list
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add question';
      console.error('Error adding question:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const addAnswer = async (questionId: string, answerData: Omit<Answer, 'id' | 'timestamp' | 'likes'>) => {
    try {
      setError(null);
      console.log('Adding answer to question:', questionId, answerData);
      
      await apiService.addAnswer(questionId, answerData);
      console.log('Answer added successfully');
      
      // Refresh data to get the updated list
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add answer';
      console.error('Error adding answer:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const addExperience = async (experienceData: Omit<Experience, 'id' | 'timestamp' | 'status' | 'comments' | 'likes' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      console.log('Adding experience:', experienceData);
      
      const result = await apiService.createExperience(experienceData);
      console.log('Experience created with ID:', result.id);
      
      // Refresh data to get the updated list
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add experience';
      console.error('Error adding experience:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const updateExperienceStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setError(null);
      console.log('Updating experience status:', id, status);
      
      await apiService.updateExperienceStatus(id, status);
      console.log('Experience status updated successfully');
      
      // Refresh data to get the updated list
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update experience status';
      console.error('Error updating experience status:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // No localStorage: no cross-tab sync needed

  const value: DataContextType = {
    reports,
    questions,
    experiences,
    loading,
    error,
    addReport,
    addQuestion,
    addAnswer,
    addExperience,
    updateExperienceStatus,
    refreshData,
    clearError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};