export type Language = 'en' | 'ar';

export enum UserRole {
  Teacher = 'teacher',
  Examinee = 'examinee',
  Corporate = 'corporate',
  TrainingCompany = 'company',
  Admin = 'admin',
}

export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  MultipleSelect = 'multiple-select',
  TrueFalse = 'true-false',
  TrueFalseWithJustification = 'true-false-justification',
  ShortAnswer = 'short-answer',
  Essay = 'essay',
  Ordering = 'ordering',
  Matching = 'matching',
}

export enum QuestionStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export type Answer = string | string[] | Record<string, string> | { selection: string; justification: string } | null;

export interface Question {
  id: string;
  ownerId: string; // 'user-id' or 'marketplace'
  text: string;
  type: QuestionType;
  category: string;
  subCategory: string;
  options?: string[];
  prompts?: string[];
  correctAnswer: Answer;
  correctJustification?: string;
  points: number;
  tags?: string[];
  status?: QuestionStatus;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  questions: Question[];
}

export type StudentAnswer = Record<string, Answer>;

export enum ProctoringEventType {
    LookingAway = 'looking_away',
    MultipleFaces = 'multiple_faces',
    MobilePhoneDetected = 'mobile_phone_detected',
    UnusualNoise = 'unusual_noise',
    GazeOffScreen = 'gaze_off_screen',
    TabSwitch = 'tab_switch',
    PasteContent = 'paste_content',
}

export interface ProctoringEvent {
    type: ProctoringEventType | string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high';
    details?: string;
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
  proctoringEvents: ProctoringEvent[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    balance?: number;
    purchasedBankIds?: string[];
}

export interface StudentRiskProfile {
    studentId: string;
    studentName: string;
    riskLevel: 'low' | 'medium' | 'high';
    averageScore: number;
    recentScores: number[];
    prediction: string;
}

export interface PracticeQuestion {
    text: string;
    answer: string;
}

export interface LearningPathItem {
    concept: string;
    explanation: string;
    suggestedResources: { title: string; uri: string }[];
    practiceQuestions: PracticeQuestion[];
}

export interface LearningPath {
    examineeName: string;
    examTitle: string;
    identifiedWeaknesses: string[];
    learningPlan: LearningPathItem[];
}

export interface MarketplaceQuestionBank {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    description: string;
    specializedCategory: string;
    questionIds: string[];
    rating: number;
    price: number; // 0 for free
    acquisitionCount?: number;
    status?: 'pending' | 'approved' | 'rejected';
    submittedAt?: Date;
    rejectionReason?: string;
}

export interface Sale {
    id: string;
    bankId: string;
    bankTitle: string;
    buyerId: string;
    sellerId: string;
    salePrice: number;
    commission: number;
    sellerEarning: number;
    timestamp: Date;
}

export interface TranscriptItem {
    role: 'user' | 'model';
    text: string;
}

export interface OralExamAnalysis {
    fluency: { score: number; feedback: string };
    pronunciation: { score: number; feedback: string };
    grammar: { score: number; feedback: string };
    overallFeedback: string;
}

export interface AIRecommendedBank {
    bankId: string;
    justification: string;
}