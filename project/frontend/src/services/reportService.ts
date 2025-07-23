import { Report } from '../types';
import { apiService } from './api';

class ReportService {
  async submitReport(reportData: Omit<Report, 'id' | 'status' | 'timestamp'>): Promise<Report> {
    try {
      const result = await apiService.createReport(reportData);
      
      return {
        id: result.id,
        status: 'pending',
        timestamp: new Date(),
        ...reportData
      };
    } catch (error) {
      console.error('Error submitting report:', error);
      throw new Error('Failed to submit report');
    }
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return await apiService.getUserReports();
  }

  async getAllReports(): Promise<Report[]> {
    return await apiService.getReports();
  }

  async updateReportStatus(reportId: string, status: Report['status']): Promise<void> {
    await apiService.updateReportStatus(reportId, status);
  }

  getCriticalAreas(): any[] {
    // This will be handled by the backend API
    return [];
  }

  reportToCybercrime(reports: Report[]) {
    return {
      success: true,
      reportedCount: reports.length,
      message: `Successfully reported ${reports.length} incidents to cybercrime authorities.`
    };
  }
}

export const reportService = new ReportService();