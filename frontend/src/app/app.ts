import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErpApiService, UserProfile } from './services/erp-api.service';
import { ExportService, ExportStudentData, ChatMessage } from './services/export.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export interface DisambiguationCandidate {
  student_id: number | string;
  full_name: string;
  class_name: string;
  email: string;
  register_number: string;
  student_data?: ExportStudentData;
}

export interface PortalRoleOption {
  id: string;
  name: string;
  role: 'admin' | 'faculty' | 'student';
  badge: string;
  description: string;
  avatar: string;
  department: string;
  year?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('chatScrollContainer') chatScrollContainer!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  // Active Identity
  activeUser: UserProfile = {
    userId: 'ADM_SUPER',
    regNo: 'ADMIN001',
    name: 'Super Administrator',
    email: 'admin@collegeerp.com',
    role: 'admin',
    category: 'Administrators',
    department: 'Central Administration',
    year: 'Master Access',
    avatar: '🛡️',
  };

  // Clean Portal Role Options
  portalRoles: PortalRoleOption[] = [
    {
      id: 'ADM_SUPER',
      name: 'Super Administrator (All Access)',
      role: 'admin',
      badge: 'ADMIN',
      description: 'Master access to all 200 student records across all sections',
      avatar: '🛡️',
      department: 'University Administration',
      year: 'Root Admin',
    },
    {
      id: 'ADM_EXAM',
      name: 'Examination Cell Controller',
      role: 'admin',
      badge: 'EXAM CELL',
      description: 'IA 1 marks, grades, and academic evaluations controller',
      avatar: '📋',
      department: 'Exam Affairs & Marks',
      year: 'Exam Controller',
    },
    {
      id: 'ADM_FINANCE',
      name: 'Finance & Accounts Officer',
      role: 'admin',
      badge: 'FINANCE',
      description: 'Tuition fees, dues, and payment audits manager',
      avatar: '💳',
      department: 'Accounts & Fee Collection',
      year: 'Finance Officer',
    },
    {
      id: '201',
      name: 'Prof. Anita Sharma (Class Teacher — MCA A)',
      role: 'faculty',
      badge: 'FACULTY',
      description: 'Assistant Professor • Class Teacher for MCA A (IDs 1–50)',
      avatar: '👩‍🏫',
      department: 'Computer Applications',
      year: 'MCA A',
    },
    {
      id: '202',
      name: 'Prof. Kumar S (Class Teacher — MCA B)',
      role: 'faculty',
      badge: 'FACULTY',
      description: 'Assistant Professor • Class Teacher for MCA B (IDs 51–100)',
      avatar: '👨‍🏫',
      department: 'Computer Applications',
      year: 'MCA B',
    },
    {
      id: '203',
      name: 'Prof. Priya R (Class Teacher — MCA Gen AI A)',
      role: 'faculty',
      badge: 'FACULTY',
      description: 'Assistant Professor • Class Teacher for MCA Gen AI A (IDs 101–150)',
      avatar: '👩‍🏫',
      department: 'Artificial Intelligence',
      year: 'MCA Gen AI A',
    },
    {
      id: '205',
      name: 'Prof. Meena V (Class Teacher — MCA Gen AI B)',
      role: 'faculty',
      badge: 'FACULTY',
      description: 'Assistant Professor • Class Teacher for MCA Gen AI B (IDs 151–200)',
      avatar: '👩‍🏫',
      department: 'Artificial Intelligence',
      year: 'MCA Gen AI B',
    },
    {
      id: '1',
      name: 'Student Self-Service Portal (Aadhya A)',
      role: 'student',
      badge: 'STUDENT',
      description: 'Student Portal • Enrolled in MCA A',
      avatar: '🎓',
      department: 'Master of Computer Applications',
      year: 'MCA A',
    },
  ];

  selectedRoleId = 'ADM_SUPER';

  // Scoped Section Filter
  activeClassScope = 'all';

  // Chat State
  messages: ChatMessage[] = [];
  currentInput = '';
  isSending = false;
  discoveredStudents: Map<string, ExportStudentData> = new Map();
  disambiguationCandidates: DisambiguationCandidate[] = [];

  // Admin Directory State
  allAdminStudents: ExportStudentData[] = [];
  filteredAdminStudents: ExportStudentData[] = [];
  adminSearchQuery = '';
  adminActiveFilter = 'all';
  adminCurrentPage = 1;
  adminRowsPerPage = 15;

  // Modals & Popovers
  isAdminPortalOpen = false;
  isSettingsOpen = false;
  isExportMenuOpen = false;
  isStudentDetailModalOpen = false;
  selectedStudentForModal: ExportStudentData | null = null;

  // Backend Health
  backendUrl = 'http://localhost:5000';
  backendOnline = false;
  totalStudentsCount = 200;

  constructor(
    private erpApi: ErpApiService,
    private exportService: ExportService
  ) {}

  async ngOnInit(): Promise<void> {
    this.backendUrl = this.erpApi.getBackendUrl();
    await this.checkHealth();
    await this.preloadAdminStudents();

    // Default active user is Super Administrator
    this.onRoleChange('ADM_SUPER');

    // Periodic health check
    setInterval(() => this.checkHealth(), 15000);
  }

  async checkHealth(): Promise<void> {
    try {
      const data = await this.erpApi.getHealth();
      this.backendOnline = data.status === 'healthy';
      this.totalStudentsCount = data.database?.totalStudents || 200;
    } catch (e) {
      this.backendOnline = false;
    }
  }

  async preloadAdminStudents(): Promise<void> {
    try {
      const res = await this.erpApi.getAdminStudents('', 'all', 1, 200);
      if (res && res.students && res.students.length > 0) {
        this.allAdminStudents = res.students;
        this.applyAdminFilterAndPagination();
      }
    } catch (err) {
      console.warn('Could not preload admin students directory:', err);
    }
  }

  onRoleSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onRoleChange(target.value);
  }

  onRoleChange(roleId: string): void {
    this.selectedRoleId = roleId;
    const found = this.portalRoles.find((r) => r.id === roleId);
    if (found) {
      this.activeUser = {
        userId: found.id,
        regNo: found.role === 'admin' ? 'ADMIN001' : found.role === 'faculty' ? `FAC${found.id}` : 'RA2532242020001',
        name: found.name.split(' (')[0],
        email: `${found.role}@collegeerp.com`,
        role: found.role,
        category: found.badge,
        department: found.department,
        year: found.year || 'General',
        avatar: found.avatar,
      };
      this.disambiguationCandidates = [];
    }
  }

  onClassScopeChange(scope: string): void {
    this.activeClassScope = scope;
    this.disambiguationCandidates = [];
  }

  // ==========================================================================
  // CHAT & INTERACTIVE CANDIDATE DISAMBIGUATION
  // ==========================================================================

  async sendMessage(customText?: string): Promise<void> {
    const text = (customText || this.currentInput).trim();
    if (!text || this.isSending) return;

    this.currentInput = '';
    this.disambiguationCandidates = [];

    // Push User message
    const userMsg: ChatMessage = {
      role: 'user',
      senderName: this.activeUser.name,
      content: text,
      time: this.getCurrentTime(),
    };
    this.messages.push(userMsg);
    this.scrollToBottom();

    this.isSending = true;

    try {
      const payload = {
        message: text,
        userId: this.activeUser.userId,
        role: this.activeUser.role,
        name: this.activeUser.name,
        activeClassScope: this.activeClassScope !== 'all' ? this.activeClassScope : undefined,
        history: this.messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await this.erpApi.sendChatMessage(payload);

      let replyContent = res.reply || 'No response received from assistant.';

      // Extract candidates only if the query is an ambiguous multi-student search
      const extractedCandidates = this.extractCandidates(text, replyContent);
      this.disambiguationCandidates = extractedCandidates;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        senderName: 'GRADIT AI Assistant',
        content: replyContent,
        time: this.getCurrentTime(),
        studentContext: this.extractStudentContext(replyContent),
      };

      this.messages.push(assistantMsg);

      if (assistantMsg.studentContext) {
        this.discoveredStudents.set(String(assistantMsg.studentContext.student_id), assistantMsg.studentContext);
      }
    } catch (err: any) {
      this.messages.push({
        role: 'assistant',
        senderName: 'GRADIT AI Assistant',
        content: `⚠️ **Connection Error**: Unable to reach backend server at \`${this.backendUrl}\`.\n\nPlease ensure your backend is running (\`npm run backend:dev\`).`,
        time: this.getCurrentTime(),
      });
    } finally {
      this.isSending = false;
      this.scrollToBottom();
    }
  }

  /**
   * Rule-Engine for candidate disambiguation:
   * - If query contains exact Student ID (e.g. ID: 5, ID 5, #5, student 5), exact Register No (RA25...),
   *   or exact email, suppression rule applies: NEVER return candidates list.
   * - Only return candidates when a general first name is queried (e.g. "Arjun", "Chandru").
   */
  extractCandidates(query: string, reply: string): DisambiguationCandidate[] {
    const isExactQuery =
      /(?:id[:\s#]+|student\s+|#)(\d+)/i.test(query) ||
      /\bRA\d{10,15}\b/i.test(query) ||
      /student\d{3}@/i.test(query);

    if (isExactQuery) {
      return [];
    }

    const candidates: DisambiguationCandidate[] = [];
    const seenIds = new Set<number>();
    const lowerQuery = query.toLowerCase();

    for (const student of this.allAdminStudents) {
      const fName = student.full_name?.split(' ')[0]?.toLowerCase();
      if (fName && fName.length >= 3 && lowerQuery.includes(fName)) {
        const matches = this.allAdminStudents.filter(
          (s) => s.full_name?.split(' ')[0]?.toLowerCase() === fName
        );
        if (matches.length > 1) {
          for (const m of matches) {
            const sid = Number(m.student_id);
            if (!seenIds.has(sid)) {
              seenIds.add(sid);
              candidates.push({
                student_id: m.student_id,
                full_name: m.full_name,
                class_name: m.class_name || 'MCA A',
                email: m.email || `student${m.student_id}@collegeerp.com`,
                register_number: m.register_number,
                student_data: m,
              });
            }
          }
          return candidates;
        }
      }
    }

    return candidates;
  }

  // 1-Click Interactive Actions from Candidate Card
  selectCandidateAndChat(candidate: DisambiguationCandidate): void {
    this.disambiguationCandidates = [];
    this.sendMessage(
      `Show full academic details, IA 1 marks, attendance, and fee status for student ${candidate.full_name} (ID: ${candidate.student_id}, ${candidate.class_name}).`
    );
  }

  viewCandidateDossier(candidate: DisambiguationCandidate): void {
    const student =
      candidate.student_data ||
      this.allAdminStudents.find((s) => Number(s.student_id) === Number(candidate.student_id));
    if (student) {
      this.viewStudentModal(student);
    }
  }

  exportCandidateDirect(format: 'pdf' | 'xlsx' | 'docx', candidate: DisambiguationCandidate): void {
    const student =
      candidate.student_data ||
      this.allAdminStudents.find((s) => Number(s.student_id) === Number(candidate.student_id));
    if (student) {
      this.exportCurrentStudent(format, student);
    }
  }

  extractStudentContext(content: string): ExportStudentData | null {
    const idMatch = content.match(/(?:Student ID|ID #|ID:)\s*(\d+)/i);
    if (idMatch && idMatch[1]) {
      const studentId = parseInt(idMatch[1], 10);
      const student = this.allAdminStudents.find((s) => Number(s.student_id) === studentId);
      if (student) return student;
    }
    return null;
  }

  renderMarkdown(content: string): string {
    const rawHtml = marked.parse(content) as string;
    return DOMPurify.sanitize(rawHtml);
  }

  clearChat(): void {
    this.messages = [];
    this.disambiguationCandidates = [];
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop =
          this.chatScrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ==========================================================================
  // ADMIN PORTAL DIRECTORY & PAGINATION
  // ==========================================================================

  async openAdminPortal(): Promise<void> {
    this.isAdminPortalOpen = true;
    if (this.allAdminStudents.length === 0) {
      await this.preloadAdminStudents();
    } else {
      this.applyAdminFilterAndPagination();
    }
  }

  closeAdminPortal(): void {
    this.isAdminPortalOpen = false;
  }

  onAdminSearchChange(): void {
    this.adminCurrentPage = 1;
    this.applyAdminFilterAndPagination();
  }

  setAdminFilter(filter: string): void {
    this.adminActiveFilter = filter;
    this.adminCurrentPage = 1;
    this.applyAdminFilterAndPagination();
  }

  onAdminRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.adminRowsPerPage = parseInt(select.value, 10);
    this.adminCurrentPage = 1;
    this.applyAdminFilterAndPagination();
  }

  applyAdminFilterAndPagination(): void {
    const query = this.adminSearchQuery.toLowerCase().trim();
    const filter = this.adminActiveFilter.trim();

    let list = this.allAdminStudents;

    if (filter !== 'all') {
      list = list.filter((s) => s.class_name?.trim().toLowerCase() === filter.toLowerCase());
    }

    if (query) {
      list = list.filter((s) => {
        const idMatch = String(s.student_id).includes(query);
        const nameMatch = s.full_name?.toLowerCase().includes(query);
        const emailMatch = s.email?.toLowerCase().includes(query);
        const regMatch = s.register_number?.toLowerCase().includes(query);
        return idMatch || nameMatch || emailMatch || regMatch;
      });
    }

    this.filteredAdminStudents = list;

    const totalPages = this.getAdminTotalPages();
    if (this.adminCurrentPage > totalPages) this.adminCurrentPage = totalPages || 1;
    if (this.adminCurrentPage < 1) this.adminCurrentPage = 1;
  }

  getPaginatedStudents(): ExportStudentData[] {
    const start = (this.adminCurrentPage - 1) * this.adminRowsPerPage;
    return this.filteredAdminStudents.slice(start, start + this.adminRowsPerPage);
  }

  getAdminTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAdminStudents.length / this.adminRowsPerPage));
  }

  goToAdminPage(page: number): void {
    const total = this.getAdminTotalPages();
    if (page >= 1 && page <= total) {
      this.adminCurrentPage = page;
    }
  }

  chatAboutStudent(s: ExportStudentData): void {
    this.closeAdminPortal();
    this.sendMessage(
      `Show full academic details, IA 1 marks, attendance, and fee status for student ${s.full_name} (ID: ${s.student_id}, Email: ${s.email || 'N/A'}) in ${s.class_name || 'MCA A'}.`
    );
  }

  viewStudentModal(s: ExportStudentData): void {
    this.selectedStudentForModal = s;
    this.isStudentDetailModalOpen = true;
  }

  closeStudentModal(): void {
    this.isStudentDetailModalOpen = false;
    this.selectedStudentForModal = null;
  }

  // ==========================================================================
  // 3-FORMAT EXPORTS (.pdf, .xlsx, .docx)
  // ==========================================================================

  toggleExportMenu(): void {
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  exportCurrentStudent(format: 'pdf' | 'xlsx' | 'docx', student?: ExportStudentData): void {
    const target = student || this.selectedStudentForModal || this.getActiveStudentAsData();
    if (!target) return;

    if (format === 'pdf') {
      this.exportService.exportStudentPdf(target);
    } else if (format === 'xlsx') {
      this.exportService.exportStudentExcel(target);
    } else if (format === 'docx') {
      this.exportService.exportStudentDocx(target);
    }
    this.isExportMenuOpen = false;
  }

  exportConversation(format: 'pdf' | 'xlsx' | 'docx'): void {
    if (this.messages.length === 0) return;

    if (format === 'pdf') {
      this.exportService.exportConversationPdf(this.messages, this.activeUser.name);
    } else if (format === 'xlsx') {
      this.exportService.exportConversationExcel(this.messages);
    } else if (format === 'docx') {
      this.exportService.exportConversationDocx(this.messages, this.activeUser.name);
    }
    this.isExportMenuOpen = false;
  }

  exportDirectory(format: 'pdf' | 'xlsx' | 'docx', source: 'filtered' | 'queried' = 'filtered'): void {
    const students =
      source === 'queried'
        ? Array.from(this.discoveredStudents.values())
        : this.filteredAdminStudents.length > 0
        ? this.filteredAdminStudents
        : this.allAdminStudents;

    if (students.length === 0) return;

    const title = source === 'queried' ? 'Queried Students Session Report' : `Students Directory (${this.adminActiveFilter})`;

    if (format === 'pdf') {
      this.exportService.exportStudentsDirectoryPdf(students, title);
    } else if (format === 'xlsx') {
      this.exportService.exportStudentsDirectoryExcel(students, title);
    } else if (format === 'docx') {
      this.exportService.exportStudentsDirectoryDocx(students, title);
    }
    this.isExportMenuOpen = false;
  }

  getActiveStudentAsData(): ExportStudentData {
    return {
      student_id: this.activeUser.userId,
      register_number: this.activeUser.regNo || `RA253224202000${this.activeUser.userId}`,
      full_name: this.activeUser.name,
      email: this.activeUser.email || `student${this.activeUser.userId}@collegeerp.com`,
      gender: 'MALE',
      class_name: this.activeUser.year || 'MCA A',
      program_name: this.activeUser.department || 'Master of Computer Applications',
      semester: 1,
      exam_name: 'Internal Assessment 1',
      marks_obtained: '85.00',
      grade: 'A',
      attendance_pct: '100.0',
      fee_amount: '75000.00',
      fee_paid: '75000.00',
      balance_due: '0.00',
      fee_status: 'PAID',
    };
  }

  openSettings(): void {
    this.isSettingsOpen = true;
  }

  closeSettings(): void {
    this.isSettingsOpen = false;
  }

  saveSettings(): void {
    this.erpApi.setBackendUrl(this.backendUrl);
    this.isSettingsOpen = false;
    this.checkHealth();
    this.preloadAdminStudents();
  }
}
