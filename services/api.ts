import { Exam, Question, QuestionType, StudentAnswer, ExamResult, Answer, User, UserRole, ProctoringEvent, QuestionStatus, StudentRiskProfile, LearningPath, MarketplaceQuestionBank, Sale } from '../types';
import * as mockData from '../data/mock';
import { generateFullExamWithAI, predictStudentPerformance } from './ai';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const renderAnswer = (answer: Answer): string => {
    if (answer === undefined || answer === null) return "Not Answered";
    if (Array.isArray(answer)) return answer.join(', ');
    if (typeof answer === 'object') return JSON.stringify(answer);
    return String(answer);
};

// --- API Methods ---

// Category Management API
export const getStructuredCategories = async (): Promise<Record<string, Record<string, string[]>>> => {
    await sleep(100);
    return JSON.parse(JSON.stringify(mockData.mockStructuredCategories));
};

export const updateCategoryStructure = async (newStructure: Record<string, Record<string, string[]>>): Promise<{ success: boolean }> => {
    await sleep(400);
    // Fix: Mutate the object in place to avoid read-only assignment error.
    Object.keys(mockData.mockStructuredCategories).forEach(key => delete (mockData.mockStructuredCategories as any)[key]);
    Object.assign(mockData.mockStructuredCategories, JSON.parse(JSON.stringify(newStructure)));
    return { success: true };
};

export const addTopLevelCategory = async (name: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (mockData.mockStructuredCategories[name]) throw new Error("Top-level category already exists.");
    mockData.mockStructuredCategories[name] = {};
    return { success: true };
};

export const deleteTopLevelCategory = async (name: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[name]) throw new Error("Top-level category not found.");
    const specializedCats = Object.keys(mockData.mockStructuredCategories[name]);
    mockData.mockQuestionBank.forEach(q => {
        if (specializedCats.includes(q.category)) {
            q.category = '';
            q.subCategory = '';
        }
    });
    delete mockData.mockStructuredCategories[name];
    return { success: true };
};

export const addSpecializedCategory = async (topLevelName: string, specializedName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[topLevelName]) throw new Error("Top-level category not found.");
    if (mockData.mockStructuredCategories[topLevelName][specializedName]) throw new Error("Specialized category already exists.");
    mockData.mockStructuredCategories[topLevelName][specializedName] = [];
    return { success: true };
};

export const deleteSpecializedCategory = async (topLevelName: string, specializedName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[topLevelName]?.[specializedName]) throw new Error("Specialized category not found.");
    mockData.mockQuestionBank.forEach(q => {
        if (q.category === specializedName) {
            q.category = '';
            q.subCategory = '';
        }
    });
    delete mockData.mockStructuredCategories[topLevelName][specializedName];
    return { success: true };
};

export const addFieldOfStudy = async (topLevelName: string, specializedName: string, fieldName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[topLevelName]?.[specializedName]) throw new Error("Specialized category not found.");
    if (mockData.mockStructuredCategories[topLevelName][specializedName].includes(fieldName)) throw new Error("Field of study already exists.");
    mockData.mockStructuredCategories[topLevelName][specializedName].push(fieldName);
    return { success: true };
};

export const deleteFieldOfStudy = async (topLevelName: string, specializedName: string, fieldName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[topLevelName]?.[specializedName]) throw new Error("Specialized category not found.");
    mockData.mockStructuredCategories[topLevelName][specializedName] = mockData.mockStructuredCategories[topLevelName][specializedName].filter(f => f !== fieldName);
    mockData.mockQuestionBank.forEach(q => {
        if (q.category === specializedName && q.subCategory === fieldName) {
            q.subCategory = '';
        }
    });
    return { success: true };
};

export const updateTopLevelCategory = async (oldName: string, newName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    if (!mockData.mockStructuredCategories[oldName]) throw new Error("Top-level category not found.");
    if (mockData.mockStructuredCategories[newName] && oldName !== newName) throw new Error("A top-level category with this name already exists.");
    
    const categoryData = mockData.mockStructuredCategories[oldName];
    delete mockData.mockStructuredCategories[oldName];
    mockData.mockStructuredCategories[newName] = categoryData;
    
    return { success: true };
};

export const updateSpecializedCategory = async (topLevelName: string, oldName: string, newName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    const topLevel = mockData.mockStructuredCategories[topLevelName];
    if (!topLevel?.[oldName]) throw new Error("Specialized category not found.");
    if (topLevel[newName] && oldName !== newName) throw new Error("A specialized category with this name already exists in this group.");
    
    const fieldData = topLevel[oldName];
    delete topLevel[oldName];
    topLevel[newName] = fieldData;

    mockData.mockQuestionBank.forEach(q => {
        if (q.category === oldName) {
            q.category = newName;
        }
    });

    return { success: true };
};

export const updateFieldOfStudy = async (topLevelName: string, specializedName: string, oldName: string, newName: string): Promise<{ success: boolean }> => {
    await sleep(300);
    const specialized = mockData.mockStructuredCategories[topLevelName]?.[specializedName];
    if (!specialized || !specialized.includes(oldName)) throw new Error("Field of study not found.");
    if (specialized.includes(newName) && oldName !== newName) throw new Error("A field of study with this name already exists in this group.");
    
    const index = specialized.indexOf(oldName);
    if (index > -1) {
        specialized[index] = newName;
    }

    mockData.mockQuestionBank.forEach(q => {
        if (q.category === specializedName && q.subCategory === oldName) {
            q.subCategory = newName;
        }
    });
    
    return { success: true };
};


// Question Bank API
export const getQuestionBank = async (filters: { ownerId?: string; searchTerm?: string; category?: string; subCategory?: string; questionType?: QuestionType; status?: QuestionStatus }): Promise<Question[]> => {
    await sleep(300);
    let questions = [...mockData.mockQuestionBank];
    
    if (filters.ownerId) {
        const owners = filters.ownerId.split(',');
        questions = questions.filter(q => owners.includes(q.ownerId));
    }
    if (filters.searchTerm) {
        questions = questions.filter(q => q.text.toLowerCase().includes(filters.searchTerm!.toLowerCase()));
    }
    if (filters.category) {
        questions = questions.filter(q => q.category === filters.category);
    }
    if (filters.subCategory) {
        questions = questions.filter(q => q.subCategory === filters.subCategory);
    }
    if (filters.questionType) {
        questions = questions.filter(q => q.type === filters.questionType);
    }
    if (filters.status) {
        questions = questions.filter(q => q.status === filters.status);
    }
    return [...questions].reverse(); // Show newest first
};

export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
    await sleep(200);
    return mockData.mockQuestionBank.filter(q => questionIds.includes(q.id));
};

export const getMarketplaceBanks = async (filters: { specializedCategory?: string }): Promise<MarketplaceQuestionBank[]> => {
    await sleep(300);
    let banks = [...mockData.mockMarketplaceBanks].filter(b => b.status === 'approved');

    if (filters.specializedCategory) {
        banks = banks.filter(b => b.specializedCategory === filters.specializedCategory);
    }

    return banks;
};

export const getMarketplaceBankById = async (bankId: string): Promise<MarketplaceQuestionBank | undefined> => {
    await sleep(200);
    return mockData.mockMarketplaceBanks.find(b => b.id === bankId);
};

export const getMySubmissions = async (authorId: string): Promise<MarketplaceQuestionBank[]> => {
    await sleep(300);
    return [...mockData.mockMarketplaceBanks]
        .filter(b => b.authorId === authorId)
        .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));
};

export const getPendingMarketplaceBanks = async (): Promise<MarketplaceQuestionBank[]> => {
    await sleep(400);
    return [...mockData.mockMarketplaceBanks].filter(b => b.status === 'pending');
};

export const reviewQuestion = async (questionId: string, newStatus: QuestionStatus.Approved | QuestionStatus.Rejected, reason?: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const questionIndex = mockData.mockQuestionBank.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        mockData.mockQuestionBank[questionIndex].status = newStatus;
        return { success: true };
    }
    throw new Error("Question not found for review.");
};

export const reviewSubmittedBank = async (bankId: string, newStatus: 'approved' | 'rejected'): Promise<{ success: boolean }> => {
    await sleep(400);
    const bankIndex = mockData.mockMarketplaceBanks.findIndex(b => b.id === bankId);
    if (bankIndex !== -1) {
        const bank = mockData.mockMarketplaceBanks[bankIndex];
        bank.status = newStatus;
        
        const relevantStatus = newStatus === 'approved' ? QuestionStatus.Approved : QuestionStatus.Rejected;
        mockData.mockQuestionBank.forEach(q => {
            if (bank.questionIds.includes(q.id)) {
                q.status = relevantStatus;
            }
        });

        if (newStatus === 'approved' && bank.rating === 0) {
            bank.rating = parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1));
        }
        
        return { success: true };
    }
    throw new Error("Submitted bank not found for review.");
};

export const submitBankForReview = async (bankData: { authorId: string; title: string; description: string; price: number; questionIds: string[]; specializedCategory: string; }): Promise<{ success: boolean }> => {
    await sleep(800);
    const author = mockData.mockUsers.find(u => u.id === bankData.authorId);
    if (!author) throw new Error("Author not found.");

    const newBank: MarketplaceQuestionBank = {
        id: `mkb-new-${Date.now()}`,
        authorId: bankData.authorId,
        authorName: author.name,
        title: bankData.title,
        description: bankData.description,
        specializedCategory: bankData.specializedCategory,
        questionIds: bankData.questionIds,
        rating: 0,
        price: bankData.price,
        status: 'pending',
        submittedAt: new Date(),
    };
    mockData.mockMarketplaceBanks.unshift(newBank);

    return { success: true };
};

export const submitBankFromCSV = async (data: { authorId: string; title: string; description: string; price: number; specializedCategory: string; questions: Omit<Question, 'id' | 'ownerId' | 'status'>[] }): Promise<{ success: boolean }> => {
    await sleep(1000);
    const author = mockData.mockUsers.find(u => u.id === data.authorId);
    if (!author) throw new Error("Author not found.");

    const newQuestions: Question[] = data.questions.map((q, i) => ({
      ...(q as Omit<Question, 'id'>),
      id: `qb-csv-sub-${Date.now()}-${i}`,
      ownerId: data.authorId,
      status: QuestionStatus.Pending,
      category: data.specializedCategory, // Override CSV category to match bank category
    }));
    
    mockData.mockQuestionBank.push(...newQuestions);
    const newQuestionIds = newQuestions.map(q => q.id);

    const newBank: MarketplaceQuestionBank = {
        id: `mkb-csv-${Date.now()}`,
        authorId: data.authorId,
        authorName: author.name,
        title: data.title,
        description: data.description,
        specializedCategory: data.specializedCategory,
        questionIds: newQuestionIds,
        rating: 0,
        price: data.price,
        status: 'pending',
        submittedAt: new Date(),
    };
    mockData.mockMarketplaceBanks.unshift(newBank);

    return { success: true };
};


export const acquireMarketplaceBank = async (userId: string, bankId: string): Promise<{ success: boolean }> => {
    await sleep(600);
    const bank = mockData.mockMarketplaceBanks.find(b => b.id === bankId);
    if (!bank) {
        throw new Error("Marketplace bank not found.");
    }
    
    const questionsToCopy = mockData.mockQuestionBank.filter(q => bank.questionIds.includes(q.id));

    if (questionsToCopy.length === 0) {
        return { success: true }; // Nothing to copy
    }

    const newQuestions: Question[] = questionsToCopy.map(q => ({
        ...q,
        id: `qb-${userId}-${Date.now()}-${Math.random()}`,
        ownerId: userId,
        status: QuestionStatus.Approved,
    }));

    mockData.mockQuestionBank.push(...newQuestions);

    if (!mockData.mockAcquiredBanks[userId]) {
        mockData.mockAcquiredBanks[userId] = [];
    }
    if (!mockData.mockAcquiredBanks[userId].includes(bankId)) {
        mockData.mockAcquiredBanks[userId].push(bankId);
    }

    return { success: true };
};

export const purchaseBank = async (userId: string, bankId: string): Promise<{ success: boolean }> => {
    await sleep(1000);
    const bank = mockData.mockMarketplaceBanks.find(b => b.id === bankId);
    if (!bank) {
        throw new Error("Marketplace bank not found.");
    }
    // Logic from acquireMarketplaceBank can be reused.
    // In a real app, this would involve payment processing.
    // For this mock, we just add it to acquired banks.

    if (!mockData.mockAcquiredBanks[userId]) {
        mockData.mockAcquiredBanks[userId] = [];
    }
    if (mockData.mockAcquiredBanks[userId].includes(bankId)) {
        // Already owned
        return { success: true };
    }
    
    mockData.mockAcquiredBanks[userId].push(bankId);

    const questionsToCopy = mockData.mockQuestionBank.filter(q => bank.questionIds.includes(q.id));
    const newQuestions: Question[] = questionsToCopy.map(q => ({
        ...q,
        id: `qb-${userId}-${Date.now()}-${Math.random()}`,
        ownerId: userId,
        status: QuestionStatus.Approved,
    }));
    mockData.mockQuestionBank.push(...newQuestions);

    return { success: true };
};

export const getAcquiredBankIds = async (userId: string): Promise<string[]> => {
    await sleep(200);
    return mockData.mockAcquiredBanks[userId] || [];
};

export const rateMarketplaceBank = async (userId: string, bankId: string, rating: number): Promise<{ success: boolean; newAverageRating: number }> => {
    await sleep(500);
    const bank = mockData.mockMarketplaceBanks.find(b => b.id === bankId);
    if (!bank) throw new Error("Bank not found.");
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
    
    if (!mockData.mockBankRatings[bankId]) {
        mockData.mockBankRatings[bankId] = {};
    }
    mockData.mockBankRatings[bankId][userId] = rating;

    const allRatingsForBank = Object.values(mockData.mockBankRatings[bankId]);
    const newAverage = allRatingsForBank.reduce((sum, r) => sum + r, 0) / allRatingsForBank.length;
    
    bank.rating = parseFloat(newAverage.toFixed(1));

    return { success: true, newAverageRating: bank.rating };
};

export const addQuestionToBank = async (questionData: Omit<Question, 'id'>): Promise<Question> => {
    await sleep(400);
    const newQuestion: Question = {
        ...questionData,
        id: `qb-${Date.now()}`,
    };
    mockData.mockQuestionBank.push(newQuestion);
    return newQuestion;
};

export const batchUploadQuestions = async (questionsData: Omit<Question, 'id'>[]): Promise<{ success: boolean }> => {
    await sleep(800);
    const newQuestions: Question[] = questionsData.map((q, i) => ({
      ...q,
      id: `qb-upload-${Date.now()}-${i}`,
    }));
    mockData.mockQuestionBank.push(...newQuestions);
    return { success: true };
};

export const updateQuestionInBank = async (updatedQuestion: Question): Promise<Question> => {
    await sleep(400);
    const index = mockData.mockQuestionBank.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) {
        throw new Error("Question not found in bank");
    }
    mockData.mockQuestionBank[index] = updatedQuestion;
    return updatedQuestion;
};

export const deleteQuestionFromBank = async (questionId: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const initialLength = mockData.mockQuestionBank.length;
    // Fix: Mutate the array in place to avoid read-only assignment error.
    let i = 0;
    while (i < mockData.mockQuestionBank.length) {
        if (mockData.mockQuestionBank[i].id === questionId) {
            mockData.mockQuestionBank.splice(i, 1);
        } else {
            i++;
        }
    }
    if (mockData.mockQuestionBank.length === initialLength) {
        throw new Error("Question not found to delete");
    }
    return { success: true };
};


// Exam API
export const createTeacherExam = async (exam: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await sleep(500);
    const newExam: Exam = {
        ...exam,
        id: `exam-${Date.now()}`,
        questionCount: exam.questions.length
    };
    // Fix: Mutate the array in place to avoid read-only assignment error.
    mockData.mockExams.unshift(newExam);
    return newExam;
};

export const createCorporateExam = async (exam: Omit<Exam, 'id' | 'questionCount'>): Promise<Exam> => {
    await sleep(500);
    const newExam: Exam = {
        ...exam,
        id: `corp-${Date.now()}`,
        questionCount: exam.questions.length
    };
    // Fix: Mutate the array in place to avoid read-only assignment error.
    mockData.mockCorporateExams.unshift(newExam);
    return newExam;
}

export const createAIExamVariant = async (sourceExam: Omit<Exam, 'questions'>): Promise<Exam> => {
    await sleep(1500); // Simulate longer generation time
    const { title, difficulty, questionCount } = sourceExam;

    const generatedContent = await generateFullExamWithAI({
        topic: title,
        difficulty: difficulty,
        count: questionCount
    });

    const newExam: Exam = {
        ...generatedContent,
        title: `${title} (AI Variant)`,
        id: `exam-variant-${Date.now()}`,
        questionCount: generatedContent.questions.length
    };
    
    if (sourceExam.id.startsWith('corp-')) {
        mockData.mockCorporateExams.unshift(newExam);
    } else {
        mockData.mockExams.unshift(newExam);
    }

    return newExam;
};


export const getTeacherExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  return mockData.mockExams.map(({ questions, ...rest }) => rest);
};

export const getExamineeExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  const allExams = [...mockData.mockExams, ...mockData.mockCorporateExams];
  return allExams.map(({ questions, ...rest }) => rest);
};

export const getCorporateExams = async (): Promise<Omit<Exam, 'questions'>[]> => {
  await sleep(500);
  return mockData.mockCorporateExams.map(({ questions, ...rest }) => rest);
};


export const getExamDetails = async (id: string): Promise<Exam | undefined> => {
  await sleep(500);
  const allExams = [...mockData.mockExams, ...mockData.mockCorporateExams];
  return allExams.find(exam => exam.id === id);
};

export const submitExam = async (examId: string, answers: StudentAnswer, proctoringEvents: ProctoringEvent[]): Promise<ExamResult> => {
    await sleep(1000);
    const allExams = [...mockData.mockExams, ...mockData.mockCorporateExams];
    const exam = allExams.find(e => e.id === examId);
    if (!exam) {
        throw new Error("Exam not found");
    }

    let score = 0;
    const totalPoints = exam.questions.reduce((total, q) => total + q.points, 0);

    exam.questions.forEach(question => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;
        let isCorrect = false;

        switch (question.type) {
            case QuestionType.Essay:
                isCorrect = false; // Essays must be graded manually or by AI, default to 0 points on submission.
                break;
            
            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
            case QuestionType.TrueFalse:
                if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
                    isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
                }
                break;

            case QuestionType.MultipleSelect:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    const sortedUserAnswer = [...userAnswer].sort();
                    const sortedCorrectAnswer = [...correctAnswer].sort();
                    isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
                }
                break;
            
            case QuestionType.Ordering:
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                    isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
                }
                break;
            
            case QuestionType.TrueFalseWithJustification:
                if (userAnswer && typeof userAnswer === 'object' && 'selection' in userAnswer) {
                    isCorrect = (userAnswer as {selection: string}).selection.toLowerCase() === (correctAnswer as string).toLowerCase();
                }
                break;

            case QuestionType.Matching:
                 if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer) && question.prompts && Array.isArray(correctAnswer)) {
                    const userAnswersMap = userAnswer as Record<string, string>;
                    if (Object.keys(userAnswersMap).length !== question.prompts.length) {
                        isCorrect = false;
                        break;
                    }
                    isCorrect = question.prompts.every((prompt, index) => userAnswersMap[prompt] === correctAnswer[index]);
                }
                break;
        }

        if (isCorrect) {
            score += question.points;
        }
    });
    
    const mockExaminee = mockData.mockUsers.find(u => u.role === UserRole.Examinee) || {id: 'temp-user', name: 'Guest Student'};

    const newResult: ExamResult = {
        id: `res-${Date.now()}`,
        examId,
        examTitle: exam.title,
        examineeId: mockExaminee.id,
        examineeName: mockExaminee.name,
        score,
        totalPoints,
        answers,
        submittedAt: new Date(),
        proctoringEvents,
    };
    
    mockData.mockExamResults.push(newResult);
    return newResult;
};

// Admin API
export const getAllExamsForAdmin = async (): Promise<(Omit<Exam, 'questions'> & { createdBy: UserRole })[]> => {
    await sleep(500);
    const teacherExams = mockData.mockExams.map(({ questions, ...rest }) => ({ ...rest, createdBy: UserRole.Teacher }));
    const corporateExams = mockData.mockCorporateExams.map(({ questions, ...rest }) => ({ ...rest, createdBy: UserRole.Corporate }));
    
    const allExams = [...teacherExams, ...corporateExams];
    return allExams.sort((a, b) => (b.id > a.id) ? 1 : -1);
};

export const deleteExamAsAdmin = async (examId: string): Promise<{ success: boolean }> => {
    await sleep(400);
    const initialTeacherLength = mockData.mockExams.length;
    const initialCorporateLength = mockData.mockCorporateExams.length;

    // Fix: Mutate arrays in place to avoid read-only assignment error.
    let i = 0;
    while (i < mockData.mockExams.length) {
        if (mockData.mockExams[i].id === examId) {
            mockData.mockExams.splice(i, 1);
        } else {
            i++;
        }
    }
    i = 0;
    while (i < mockData.mockCorporateExams.length) {
        if (mockData.mockCorporateExams[i].id === examId) {
            mockData.mockCorporateExams.splice(i, 1);
        } else {
            i++;
        }
    }

    if (mockData.mockExams.length < initialTeacherLength || mockData.mockCorporateExams.length < initialCorporateLength) {
        return { success: true };
    }
    
    throw new Error("Exam not found to delete");
};

export const getPlatformAnalytics = async (): Promise<{ totalUsers: number, totalExams: number, totalQuestions: number }> => {
    await sleep(400);
    return {
        totalUsers: mockData.mockUsers.length,
        totalExams: mockData.mockExams.length + mockData.mockCorporateExams.length,
        totalQuestions: mockData.mockQuestionBank.length,
    }
}

export const getAllUsers = async(): Promise<User[]> => {
    await sleep(600);
    return [...mockData.mockUsers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Results API
export const getResultsForExam = async(examId: string): Promise<ExamResult[]> => {
    await sleep(500);
    return mockData.mockExamResults.filter(r => r.examId === examId).sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const getExamineeResults = async(examineeId: string): Promise<ExamResult[]> => {
    await sleep(500);
    return mockData.mockExamResults.filter(r => r.examineeId.startsWith('user-')).sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

export const getExamResultDetails = async(resultId: string): Promise<{ result: ExamResult, exam: Exam } | null> => {
    await sleep(600);
    const result = mockData.mockExamResults.find(r => r.id === resultId);
    if (!result) {
        return null;
    }
    const allExams = [...mockData.mockExams, ...mockData.mockCorporateExams];
    const exam = allExams.find(e => e.id === result.examId);
    if (!exam) {
        return null;
    }
    return { result, exam };
};

// Dashboard Stats
export const getTeacherDashboardStats = async (): Promise<{ totalExams: number; averageScore: number; atRiskStudents: number; }> => {
    await sleep(500);
    const teacherExamIds = new Set(mockData.mockExams.map(e => e.id));
    const relevantResults = mockData.mockExamResults.filter(r => teacherExamIds.has(r.examId));
    
    const totalPercentage = relevantResults.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0);
    const averageScore = relevantResults.length > 0 ? totalPercentage / relevantResults.length : 0;
    
    const atRisk = await predictStudentPerformance(mockData.mockExamResults);
    
    return {
        totalExams: mockData.mockExams.length,
        averageScore: Math.round(averageScore),
        atRiskStudents: atRisk.length,
    };
};

export const getCorporateDashboardStats = async (): Promise<{ totalAssessments: number; averagePassRate: number; candidatesAssessed: number; }> => {
    await sleep(500);
    const corporateExamIds = new Set(mockData.mockCorporateExams.map(e => e.id));
    const relevantResults = mockData.mockExamResults.filter(r => corporateExamIds.has(r.examId));

    const passingResults = relevantResults.filter(r => (r.score / r.totalPoints) * 100 >= 70);
    const averagePassRate = relevantResults.length > 0 ? (passingResults.length / relevantResults.length) * 100 : 0;

    const uniqueCandidates = new Set(relevantResults.map(r => r.examineeId));

    return {
        totalAssessments: mockData.mockCorporateExams.length,
        averagePassRate: Math.round(averagePassRate),
        candidatesAssessed: uniqueCandidates.size,
    };
};

export const getTrainingCompanyDashboardStats = async (): Promise<{ totalCourses: number; averageCompletion: number; activeTrainees: number; }> => {
    await sleep(500);
    
    const allExamIds = new Set([...mockData.mockExams.map(e => e.id), ...mockData.mockCorporateExams.map(e => e.id)]);
    const relevantResults = mockData.mockExamResults.filter(r => allExamIds.has(r.examId));
    const uniqueTrainees = new Set(relevantResults.map(r => r.examineeId));

    return {
        totalCourses: 5, // Mocked value
        averageCompletion: 82, // Mocked value
        activeTrainees: uniqueTrainees.size,
    };
};

export const getRecentActivity = async (userRole: UserRole): Promise<{ id: string, description: string, relativeTime: string }[]> => {
    await sleep(300);

    let relevantResults: ExamResult[] = [];

    if (userRole === UserRole.Teacher) {
        const teacherExamIds = new Set(mockData.mockExams.map(e => e.id));
        relevantResults = mockData.mockExamResults.filter(r => teacherExamIds.has(r.examId));
    } else if (userRole === UserRole.Corporate) {
        const corporateExamIds = new Set(mockData.mockCorporateExams.map(e => e.id));
        relevantResults = mockData.mockExamResults.filter(r => corporateExamIds.has(r.examId));
    } else if (userRole === UserRole.TrainingCompany) {
        const allExamIds = new Set([...mockData.mockExams.map(e => e.id), ...mockData.mockCorporateExams.map(e => e.id)]);
        relevantResults = mockData.mockExamResults.filter(r => allExamIds.has(r.examId));
    }

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} years ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} months ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} hours ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutes ago`;
        return `${Math.floor(seconds)} seconds ago`;
    };

    return relevantResults
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
        .slice(0, 5) // Get latest 5
        .map(result => ({
            id: result.id,
            description: `${result.examineeName} completed "${result.examTitle}"`,
            relativeTime: timeAgo(result.submittedAt)
        }));
};

// Author/Monetization APIs
export const getAuthorStats = async (authorId: string): Promise<{ totalEarnings: number; totalSales: number; balance: number }> => {
    await sleep(300);
    const authorSales = mockData.mockSales.filter(s => s.sellerId === authorId);
    const totalEarnings = authorSales.reduce((sum, sale) => sum + sale.sellerEarning, 0);
    const totalSales = authorSales.length;
    const author = mockData.mockUsers.find(u => u.id === authorId);

    return {
        totalEarnings,
        totalSales,
        balance: author?.balance || 0,
    };
};

export const getSalesHistory = async (authorId: string): Promise<Sale[]> => {
    await sleep(300);
    return mockData.mockSales
        .filter(s => s.sellerId === authorId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
