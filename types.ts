export enum UserRole {
  Teacher = 'teacher',
  Examinee = 'examinee',
  TrainingCompany = 'company',
  Corporate = 'corporate',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export enum QuestionType {
  MultipleChoice = 'multiple-choice', // Single answer
  MultipleSelect = 'multiple-select', // Multiple answers
  TrueFalse = 'true-false',
  TrueFalseWithJustification = 'true-false-justification',
  Essay = 'essay', // Long text answer
  ShortAnswer = 'short-answer', // Short text answer
  Ordering = 'ordering',
  Matching = 'matching',
}

// Fix: Add and export QuestionStatus enum.
export enum QuestionStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}


export type Answer = string | string[] | Record<string, string> | { selection: string; justification: string };

export interface Question {
  id: string;
  ownerId: string; // ID of the user who owns it, or 'marketplace'
  text: string;
  type: QuestionType;
  category: string;
  subCategory: string;
  options?: string[]; // Used for MC, MS, Ordering, Matching (as match options)
  prompts?: string[]; // Used for Matching (as match prompts)
  correctAnswer: string | string[]; // string for MC, TF, Essay, ShortAnswer. string[] for MS, Ordering, Matching.
  correctJustification?: string; // For TF with justification
  points: number;
  tags?: string[];
  // Fix: Add optional status property to track review status.
  status?: QuestionStatus;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  questionCount: number;
}

export interface StudentAnswer {
  [questionId: string]: Answer;
}

export interface ProctoringEvent {
    type: 'tab_switch' | 'paste_content';
    timestamp: number; // Milliseconds since exam start
    details?: string; // e.g., question ID where paste occurred
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examineeId: string;
  examineeName: string;
  score: number;
  totalPoints: number;
  answers: StudentAnswer;
  submittedAt: Date;
  proctoringEvents?: ProctoringEvent[];
}

export interface StudentRiskProfile {
  examineeId: string;
  examineeName: string;
  riskLevel: 'low' | 'medium' | 'high';
  justification: string;
  hasGeneratedLearningPath?: boolean;
  lastResultId?: string;
}

export interface PracticeQuestion {
  text: string;
  answer: string;
}

export interface LearningPlanItem {
  concept: string;
  explanation: string;
  suggestedResources?: { title: string; uri: string }[];
  practiceQuestions: PracticeQuestion[];
}

export interface LearningPath {
  identifiedWeaknesses: string[];
  learningPlan: LearningPlanItem[];
}