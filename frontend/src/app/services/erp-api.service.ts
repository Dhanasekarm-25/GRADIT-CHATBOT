import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { ExportStudentData } from './export.service';

export interface UserProfile {
  userId: string;
  regNo?: string;
  name: string;
  email?: string;
  role: 'student' | 'faculty' | 'admin';
  category: string;
  department: string;
  year?: string;
  avatar: string;
  marks?: string;
  attendance?: string;
  feesDue?: string;
  feeStatus?: string;
}

export interface AdminStudentsResponse {
  success: boolean;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  students: ExportStudentData[];
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  userContext: any;
  toolsUsed?: any[];
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErpApiService {
  private backendUrl = localStorage.getItem('gradit_backend_url') || 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getBackendUrl(): string {
    return this.backendUrl;
  }

  setBackendUrl(url: string): void {
    this.backendUrl = url.trim().replace(/\/$/, '');
    localStorage.setItem('gradit_backend_url', this.backendUrl);
  }

  async getHealth(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.backendUrl}/api/health`));
  }

  async getUsers(): Promise<{ users: UserProfile[]; counts: any }> {
    return firstValueFrom(this.http.get<{ users: UserProfile[]; counts: any }>(`${this.backendUrl}/api/users`));
  }

  async getAdminStudents(
    search = '',
    classFilter = 'all',
    page = 1,
    limit = 200
  ): Promise<AdminStudentsResponse> {
    const params = new URLSearchParams({
      search,
      class: classFilter,
      page: String(page),
      limit: String(limit),
    });
    return firstValueFrom(
      this.http.get<AdminStudentsResponse>(`${this.backendUrl}/api/admin/students?${params.toString()}`)
    );
  }

  async sendChatMessage(payload: {
    message: string;
    userId: string;
    role: string;
    name?: string;
    activeClassScope?: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<ChatResponse> {
    return firstValueFrom(
      this.http.post<ChatResponse>(`${this.backendUrl}/api/chat`, payload)
    );
  }
}
