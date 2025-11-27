export interface Student {
  id: string;
  enrollmentNo: string; // Unique identifier
  name: string;
  marks: Record<string, number>; // key is subject name, value is score
}

export interface SubjectStats {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
}

export interface StudentResult {
  student: Student;
  total: number;
  percentage: number;
  status: 'Pass' | 'Fail';
}

export interface AnalysisData {
  results: StudentResult[];
  subjectStats: SubjectStats[];
  topPerformers: StudentResult[];
  classAverage: number;
  passPercentage: number;
  maxMarks: number;
}

export enum AppPhase {
  SETUP = 'SETUP',
  ENTRY = 'ENTRY',
  RESULTS = 'RESULTS'
}