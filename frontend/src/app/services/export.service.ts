import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
} from 'docx';

export interface ExportStudentData {
  student_id: number | string;
  register_number: string;
  full_name: string;
  email?: string;
  gender?: string;
  class_name?: string;
  program_name?: string;
  semester?: number | string;
  exam_name?: string;
  marks_obtained?: string | number;
  grade?: string;
  attendance_pct?: string | number;
  fee_amount?: string | number;
  fee_paid?: string | number;
  balance_due?: string | number;
  fee_status?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  senderName: string;
  content: string;
  time: string;
  studentContext?: ExportStudentData | null;
  candidates?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  // ==========================================================================
  // 1. PARTICULAR STUDENT EXPORTS (.pdf, .xlsx, .docx)
  // ==========================================================================

  exportStudentPdf(s: ExportStudentData): void {
    const doc = new jsPDF();

    // University Header
    doc.setFillColor(29, 78, 216); // Blue
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GRADIT COLLEGE ERP — STUDENT DOSSIER', 14, 16);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

    // Profile Table
    autoTable(doc, {
      startY: 38,
      head: [['Field', 'Student Detail']],
      body: [
        ['Student ID', `#${s.student_id}`],
        ['Full Name', s.full_name || 'N/A'],
        ['Register Number', s.register_number || 'N/A'],
        ['College Email', s.email || `student${s.student_id}@collegeerp.com`],
        ['Gender', s.gender || 'N/A'],
        ['Enrolled Class', `${s.class_name || 'MCA A'} (Semester ${s.semester || 1})`],
        ['Degree Program', s.program_name || 'Master of Computer Applications'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [244, 239, 230], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
    });

    const lastY = (doc as any).lastAutoTable?.finalY || 100;

    autoTable(doc, {
      startY: lastY + 10,
      head: [['Academic & Financial Parameter', 'Current Verified Record', 'Status']],
      body: [
        ['Internal Assessment 1 (MCA101)', `${s.marks_obtained || 85} / 100`, `Grade: ${s.grade || 'A'}`],
        ['Cumulative Attendance', `${s.attendance_pct || 100}%`, (Number(s.attendance_pct || 100) >= 75 ? 'ELIGIBLE' : 'SHORTAGE')],
        ['Total Tuition Fee', `Rs. ${Number(s.fee_amount || 75000).toLocaleString()}`, 'Academic Year 2025-2026'],
        ['Fee Paid Amount', `Rs. ${Number(s.fee_paid || 75000).toLocaleString()}`, 'Recorded in Accounts'],
        ['Outstanding Balance Due', `Rs. ${Number(s.balance_due || 0).toLocaleString()}`, s.fee_status || 'PAID'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
    });

    doc.save(`Student_${s.student_id}_${(s.full_name || 'Record').replace(/\s+/g, '_')}.pdf`);
  }

  exportStudentExcel(s: ExportStudentData): void {
    const data = [
      { Parameter: 'Student ID', Value: `#${s.student_id}` },
      { Parameter: 'Full Name', Value: s.full_name },
      { Parameter: 'Register Number', Value: s.register_number },
      { Parameter: 'Email', Value: s.email || `student${s.student_id}@collegeerp.com` },
      { Parameter: 'Gender', Value: s.gender },
      { Parameter: 'Class Section', Value: s.class_name },
      { Parameter: 'Program Name', Value: s.program_name },
      { Parameter: 'Exam Name', Value: s.exam_name || 'Internal Assessment 1' },
      { Parameter: 'Marks Obtained', Value: s.marks_obtained || 85 },
      { Parameter: 'Grade', Value: s.grade || 'A' },
      { Parameter: 'Attendance %', Value: `${s.attendance_pct || 100}%` },
      { Parameter: 'Tuition Fee Amount', Value: Number(s.fee_amount || 75000) },
      { Parameter: 'Fee Paid', Value: Number(s.fee_paid || 75000) },
      { Parameter: 'Balance Due', Value: Number(s.balance_due || 0) },
      { Parameter: 'Fee Payment Status', Value: s.fee_status || 'PAID' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Dossier');
    XLSX.writeFile(workbook, `Student_${s.student_id}_${(s.full_name || 'Record').replace(/\s+/g, '_')}.xlsx`);
  }

  async exportStudentDocx(s: ExportStudentData): Promise<void> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'GRADIT COLLEGE ERP — OFFICIAL STUDENT DOSSIER',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Date: ${new Date().toLocaleDateString()}`, italics: true }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Parameter', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })] })] }),
                  ],
                }),
                ...[
                  ['Student ID', `#${s.student_id}`],
                  ['Full Name', s.full_name || 'N/A'],
                  ['Register Number', s.register_number || 'N/A'],
                  ['Email Address', s.email || `student${s.student_id}@collegeerp.com`],
                  ['Class & Section', s.class_name || 'MCA A'],
                  ['Degree Program', s.program_name || 'Master of Computer Applications'],
                  ['IA 1 Marks', `${s.marks_obtained || 85} / 100 (Grade ${s.grade || 'A'})`],
                  ['Attendance', `${s.attendance_pct || 100}%`],
                  ['Total Tuition Fee', `Rs. ${Number(s.fee_amount || 75000).toLocaleString()}`],
                  ['Fee Status & Due', `Rs. ${Number(s.balance_due || 0).toLocaleString()} (${s.fee_status || 'PAID'})`],
                ].map(
                  ([k, v]) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ text: k })] }),
                        new TableCell({ children: [new Paragraph({ text: v })] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    this.saveBlob(blob, `Student_${s.student_id}_${(s.full_name || 'Record').replace(/\s+/g, '_')}.docx`);
  }

  // ==========================================================================
  // 2. CONVERSATION TRANSCRIPT EXPORTS (.pdf, .xlsx, .docx)
  // ==========================================================================

  exportConversationPdf(messages: ChatMessage[], activeUser: string): void {
    const doc = new jsPDF();

    doc.setFillColor(244, 239, 230); // Warm Beige
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GRADIT AI — CHAT CONVERSATION TRANSCRIPT', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Active Session: ${activeUser} | Exported: ${new Date().toLocaleString()}`, 14, 30);

    const rows = messages.map((m) => [
      m.time,
      m.role.toUpperCase(),
      m.senderName,
      m.content.replace(/[#*`_]/g, ''),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Time', 'Role', 'Sender', 'Message Text']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255] },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 22 },
        2: { cellWidth: 32 },
        3: { cellWidth: 'auto' },
      },
    });

    doc.save(`GRADIT_AI_Chat_Transcript_${Date.now()}.pdf`);
  }

  exportConversationExcel(messages: ChatMessage[]): void {
    const data = messages.map((m, idx) => ({
      Index: idx + 1,
      Time: m.time,
      Role: m.role,
      Sender: m.senderName,
      Message: m.content.replace(/[#*`_]/g, ''),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conversation Transcript');
    XLSX.writeFile(workbook, `GRADIT_AI_Chat_Transcript_${Date.now()}.xlsx`);
  }

  async exportConversationDocx(messages: ChatMessage[], activeUser: string): Promise<void> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'GRADIT AI — CONVERSATION TRANSCRIPT',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Active User: ${activeUser} • Exported: ${new Date().toLocaleString()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            ...messages.map(
              (m) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `[${m.time}] ${m.senderName} (${m.role.toUpperCase()}):\n`,
                      bold: true,
                      color: m.role === 'user' ? '1D4ED8' : '15803D',
                    }),
                    new TextRun({
                      text: `${m.content.replace(/[#*`_]/g, '')}\n`,
                    }),
                  ],
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    this.saveBlob(blob, `GRADIT_AI_Chat_Transcript_${Date.now()}.docx`);
  }

  // ==========================================================================
  // 3. ALL QUERIED STUDENTS / DIRECTORY EXPORTS (.pdf, .xlsx, .docx)
  // ==========================================================================

  exportStudentsDirectoryPdf(students: ExportStudentData[], title = 'STUDENTS DIRECTORY'): void {
    const doc = new jsPDF('landscape');

    doc.setFillColor(29, 78, 216);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`GRADIT COLLEGE ERP — ${title.toUpperCase()}`, 14, 14);

    const rows = students.map((s) => [
      `#${s.student_id}`,
      s.full_name,
      s.email || `student${s.student_id}@collegeerp.com`,
      s.register_number,
      s.class_name || 'MCA A',
      s.gender === 'FEMALE' ? 'Female' : 'Male',
      `${s.marks_obtained || 75} (${s.grade || 'A'})`,
      `${s.attendance_pct || 100}%`,
      s.fee_status || 'PAID',
      `Rs. ${Number(s.balance_due || 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 26,
      head: [['ID', 'Name', 'Email', 'Register No', 'Class', 'Gender', 'IA 1 Mark', 'Attendance', 'Fee Status', 'Balance Due']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [244, 239, 230], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save(`GRADIT_Students_Export_${Date.now()}.pdf`);
  }

  exportStudentsDirectoryExcel(students: ExportStudentData[], title = 'Students_Directory'): void {
    const data = students.map((s) => ({
      'Student ID': s.student_id,
      'Full Name': s.full_name,
      'Email': s.email || `student${s.student_id}@collegeerp.com`,
      'Register Number': s.register_number,
      'Class Section': s.class_name,
      'Degree Program': s.program_name,
      'Gender': s.gender,
      'IA 1 Marks': s.marks_obtained,
      'Grade': s.grade,
      'Attendance %': s.attendance_pct,
      'Total Fee': s.fee_amount,
      'Fee Paid': s.fee_paid,
      'Balance Due': s.balance_due,
      'Fee Status': s.fee_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `GRADIT_${title}_${Date.now()}.xlsx`);
  }

  async exportStudentsDirectoryDocx(students: ExportStudentData[], title = 'Students Directory'): Promise<void> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `GRADIT COLLEGE ERP — ${title.toUpperCase()}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Total Records: ${students.length} • Generated: ${new Date().toLocaleString()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ID', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name & Email', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Register No', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Class', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Marks', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fee Status', bold: true })] })] }),
                  ],
                }),
                ...students.map(
                  (s) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ text: `#${s.student_id}` })] }),
                        new TableCell({ children: [new Paragraph({ text: `${s.full_name}\n${s.email || ''}` })] }),
                        new TableCell({ children: [new Paragraph({ text: s.register_number })] }),
                        new TableCell({ children: [new Paragraph({ text: s.class_name || 'MCA A' })] }),
                        new TableCell({ children: [new Paragraph({ text: `${s.marks_obtained} (${s.grade})` })] }),
                        new TableCell({ children: [new Paragraph({ text: s.fee_status || 'PAID' })] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    this.saveBlob(blob, `GRADIT_${title}_${Date.now()}.docx`);
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
