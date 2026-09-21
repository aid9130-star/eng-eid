import { AccessCode, Lesson, Exam, ExamQuestion, ExamResult, Student, AdminStats } from '../types.ts';

const STORAGE_KEYS = {
  CODES: 'tafawwoq_db_codes',
  LESSONS: 'tafawwoq_db_lessons',
  EXAMS: 'tafawwoq_db_exams',
  QUESTIONS: 'tafawwoq_db_questions',
  STUDENTS: 'tafawwoq_db_students',
  RESULTS: 'tafawwoq_db_results',
  INITIALIZED: 'tafawwoq_db_initialized_v2',
};

// Initial Seed Data for Static / Client-Side Offline Hosting
const initialCodes: AccessCode[] = [
  { id: 1, code: 'TOP-2025-A1', status: 'unused', note: 'دفعة المتفوقين 2025 - الصف الثالث الثانوي', createdAt: new Date().toISOString() },
  { id: 2, code: 'TOP-2025-B2', status: 'unused', note: 'مجموعة النخبة - سنتر التفوق', createdAt: new Date().toISOString() },
  { id: 3, code: 'EMAM-ENG-01', status: 'unused', note: 'مجموعة مستر إمام يوسف', createdAt: new Date().toISOString() },
  { id: 4, code: 'EMAM-ENG-02', status: 'unused', note: 'مجموعة مستر إمام يوسف', createdAt: new Date().toISOString() },
  { id: 5, code: 'VIP-EXAM-77', status: 'unused', note: 'كود طلاب الأونلاين - منصة التفوق', createdAt: new Date().toISOString() },
];

const initialLessons: Lesson[] = [
  {
    id: 1,
    title: 'Unit 1: Past Simple vs Past Continuous & Used To',
    description: 'شرح تفصيلي شامل لزمني الماضي البسيط والماضي المستمر وقاعدة Used To مع حل أهم أفكار امتحانات الثانوية العامة.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    durationMinutes: 45,
    term: 'الترم الأول',
    unit: 'Unit 1: Cultural Identity',
    lessonNumber: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Unit 1: Essential Vocabulary & Collocations',
    description: 'أهم الكلمات والتعبيرات والمترادفات والمتضادات للوحدة الأولى وطريقة حفظها وتطبيقها على أسئلة الامتحانات.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    durationMinutes: 38,
    term: 'الترم الأول',
    unit: 'Unit 1: Cultural Identity',
    lessonNumber: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Unit 2: Present Perfect vs Present Perfect Continuous',
    description: 'الفرق الدقيق بين زمن المضارع التام والمضارع التام المستمر مع الكلمات الدالة مثل since و for و yet و already.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    durationMinutes: 50,
    term: 'الترم الأول',
    unit: 'Unit 2: Her Story',
    lessonNumber: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Skills Workshop: Mastering the Paragraph & Essay Writing',
    description: 'كيفية كتابة مقال نموذجي متناسق: الجملة الافتتاحية (Topic Sentence)، وجمل الدعم، والروابط الانتقالية، والخاتمة.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    durationMinutes: 30,
    term: 'الترم الأول',
    unit: 'Writing & Skills',
    lessonNumber: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
];

const initialExams: Exam[] = [
  {
    id: 1,
    title: 'اختبار شامل على Unit 1 (Grammar & Vocabulary)',
    description: 'اختبار تقييم شامل ومعتمد للأستاذ إمام يوسف لقياس مدى استيعاب جرامر الوحدة الأولى والكلمات الأساسية. الوقت محدد بـ 20 دقيقة.',
    timeLimitMinutes: 20,
    maxAttempts: 2,
    term: 'الترم الأول',
    unit: 'Unit 1: Cultural Identity',
    passingScorePercent: 60,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
];

const initialQuestions: ExamQuestion[] = [
  {
    id: 1,
    examId: 1,
    questionText: 'While I _______ my English homework, the electricity went out.',
    type: 'multiple_choice',
    options: ['was doing', 'did', 'have done', 'had done'],
    correctOptionIndex: 0,
    explanation: 'بعد While نستخدم الماضي المستمر (was/were + v-ing) عندما يقطع الحدث المستمر حدث مفاجئ في الماضي البسيط.',
    points: 2,
  },
  {
    id: 2,
    examId: 1,
    questionText: 'When he was young, he _______ play tennis every Friday, but now he prefers football.',
    type: 'multiple_choice',
    options: ['uses to', 'used to', 'is used to', 'got used to'],
    correctOptionIndex: 1,
    explanation: 'تُستخدم used to + المصدر للتعبير عن عادة كانت تحدث في الماضي وتوقفت في الحاضر.',
    points: 2,
  },
  {
    id: 3,
    examId: 1,
    questionText: 'A good citizen should always _______ pride in his cultural heritage.',
    type: 'multiple_choice',
    options: ['make', 'take', 'do', 'bring'],
    correctOptionIndex: 1,
    explanation: 'التعبير الصحيح في اللغة الإنجليزية هو (take pride in) أي يفتخر بـ.',
    points: 2,
  },
  {
    id: 4,
    examId: 1,
    questionText: 'She has been working in the company _______ 2018.',
    type: 'multiple_choice',
    options: ['for', 'since', 'ago', 'in'],
    correctOptionIndex: 1,
    explanation: 'نستخدم since عندما نحدد نقطة بداية زمنية محددة مثل سنة أو يوم أو شهر مع المضارع التام.',
    points: 2,
  },
  {
    id: 5,
    examId: 1,
    questionText: 'Yesterday at 7 PM, my brother and I were studying English.',
    type: 'true_false',
    options: ['صحيحة لغوياً (True)', 'خاطئة لغوياً (False)'],
    correctOptionIndex: 0,
    explanation: 'صحيحة لأن تحديد وقت دقيق في الماضي (Yesterday at 7 PM) يتطلب استخدام الماضي المستمر.',
    points: 2,
  },
];

export class MockStorageDatabase {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  public static init(): void {
    if (typeof window === 'undefined') return;
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.setItem(STORAGE_KEYS.CODES, initialCodes);
      this.setItem(STORAGE_KEYS.LESSONS, initialLessons);
      this.setItem(STORAGE_KEYS.EXAMS, initialExams);
      this.setItem(STORAGE_KEYS.QUESTIONS, initialQuestions);
      this.setItem(STORAGE_KEYS.STUDENTS, []);
      this.setItem(STORAGE_KEYS.RESULTS, []);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // --- ACCESS CODES ---
  public static getCodes(): AccessCode[] {
    this.init();
    return this.getItem<AccessCode[]>(STORAGE_KEYS.CODES, initialCodes);
  }

  public static generateCodes(amount: number, note?: string): AccessCode[] {
    const currentCodes = this.getCodes();
    const newCodes: AccessCode[] = [];
    const maxId = currentCodes.reduce((max, c) => Math.max(max, c.id), 0);

    for (let i = 0; i < amount; i++) {
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codeStr = `TOP-${Math.floor(100 + Math.random() * 900)}-${randomHex}`;
      newCodes.push({
        id: maxId + i + 1,
        code: codeStr,
        status: 'unused',
        note: note || 'دفعة أكواد جديدة',
        createdAt: new Date().toISOString(),
      });
    }

    const updated = [...newCodes, ...currentCodes];
    this.setItem(STORAGE_KEYS.CODES, updated);
    return newCodes;
  }

  public static toggleCodeStatus(id: number, status: 'unused' | 'disabled'): AccessCode[] {
    const codes = this.getCodes();
    const target = codes.find((c) => c.id === id);
    if (target) {
      target.status = status;
      this.setItem(STORAGE_KEYS.CODES, codes);
      return [target];
    }
    return [];
  }

  public static deleteCode(id: number): boolean {
    const codes = this.getCodes();
    const filtered = codes.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CODES, filtered);
    return true;
  }

  // --- STUDENTS AUTH & REGISTRATION ---
  public static studentLogin(name: string, phone: string, code: string): Student {
    this.init();
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    const studentsList = this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const existing = studentsList.find((s) => s.phone === trimmedPhone);
    if (existing) {
      existing.lastActiveAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.STUDENTS, studentsList);
      return existing;
    }

    // Check code
    const codes = this.getCodes();
    const codeObj = codes.find((c) => c.code.toUpperCase() === trimmedCode);
    if (!codeObj) {
      throw new Error('كود التفعيل المدخل غير صحيح! تأكد من كتابة الكود بدقة');
    }
    if (codeObj.status === 'disabled') {
      throw new Error('هذا الكود معطّل حالياً من قِبل الأستاذ، تواصل مع الدعم الفني');
    }
    if (codeObj.status === 'used') {
      throw new Error(`هذا الكود تم استخدامه مسبقاً بواسطة الطالب: ${codeObj.usedByStudentName || 'طالب آخر'}`);
    }

    // Mark code as used
    codeObj.status = 'used';
    codeObj.usedByStudentName = trimmedName;
    codeObj.usedByStudentPhone = trimmedPhone;
    codeObj.usedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.CODES, codes);

    // Create student
    const newStudent: Student = {
      id: studentsList.length + 1,
      name: trimmedName,
      phone: trimmedPhone,
      codeUsed: trimmedCode,
      sessionToken: `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      grade: 'الصف الثالث الثانوي',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    studentsList.push(newStudent);
    this.setItem(STORAGE_KEYS.STUDENTS, studentsList);
    return newStudent;
  }

  public static getStudentByToken(token: string): Student | null {
    const studentsList = this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    return studentsList.find((s) => s.sessionToken === token) || null;
  }

  public static getAllStudents(): Student[] {
    return this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  }

  // --- LESSONS ---
  public static getLessons(publishedOnly = true): Lesson[] {
    this.init();
    const lessonsList = this.getItem<Lesson[]>(STORAGE_KEYS.LESSONS, initialLessons);
    if (publishedOnly) {
      return lessonsList.filter((l) => l.isPublished);
    }
    return lessonsList;
  }

  public static createLesson(data: Partial<Lesson>): Lesson {
    const lessonsList = this.getItem<Lesson[]>(STORAGE_KEYS.LESSONS, initialLessons);
    const newLesson: Lesson = {
      id: lessonsList.length > 0 ? Math.max(...lessonsList.map((l) => l.id)) + 1 : 1,
      title: data.title || 'درس جديد',
      description: data.description || '',
      videoUrl: data.videoUrl || '',
      durationMinutes: Number(data.durationMinutes) || 30,
      term: data.term || 'الترم الأول',
      unit: data.unit || 'Unit 1',
      lessonNumber: Number(data.lessonNumber) || 1,
      pdfAttachmentUrl: data.pdfAttachmentUrl || null,
      isPublished: data.isPublished !== false,
      createdAt: new Date().toISOString(),
    };
    lessonsList.unshift(newLesson);
    this.setItem(STORAGE_KEYS.LESSONS, lessonsList);
    return newLesson;
  }

  public static updateLesson(id: number, data: Partial<Lesson>): Lesson[] {
    const lessonsList = this.getItem<Lesson[]>(STORAGE_KEYS.LESSONS, initialLessons);
    const lesson = lessonsList.find((l) => l.id === id);
    if (lesson) {
      Object.assign(lesson, data);
      this.setItem(STORAGE_KEYS.LESSONS, lessonsList);
      return [lesson];
    }
    return [];
  }

  public static deleteLesson(id: number): boolean {
    const lessonsList = this.getItem<Lesson[]>(STORAGE_KEYS.LESSONS, initialLessons);
    const filtered = lessonsList.filter((l) => l.id !== id);
    this.setItem(STORAGE_KEYS.LESSONS, filtered);
    return true;
  }

  // --- EXAMS & QUESTIONS ---
  public static getExamsWithStats(studentId?: number): Exam[] {
    this.init();
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const questionsList = this.getItem<ExamQuestion[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);
    const resultsList = this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);

    return examsList.map((exam) => {
      const examQuestions = questionsList.filter((q) => q.examId === exam.id);
      const totalPoints = examQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

      let userAttemptsCount = 0;
      let bestScore: number | undefined = undefined;

      if (studentId) {
        const studentResults = resultsList.filter((r) => r.examId === exam.id && r.studentId === studentId);
        userAttemptsCount = studentResults.length;
        if (studentResults.length > 0) {
          bestScore = Math.max(...studentResults.map((r) => r.scorePercent));
        }
      }

      return {
        ...exam,
        questionsCount: examQuestions.length,
        totalPoints,
        userAttemptsCount,
        bestScore,
      };
    });
  }

  public static getExamDetails(examId: number, isTeacher = false): any {
    this.init();
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const questionsList = this.getItem<ExamQuestion[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);

    const exam = examsList.find((e) => e.id === examId);
    if (!exam) return null;

    const questions = questionsList
      .filter((q) => q.examId === examId)
      .map((q) => {
        if (!isTeacher) {
          // Hide correct answers and explanation during student exam taking
          const { correctOptionIndex, explanation, ...studentQuestion } = q;
          return studentQuestion;
        }
        return q;
      });

    return {
      ...exam,
      questions,
    };
  }

  public static createExam(examData: Partial<Exam>, questions: Array<Partial<ExamQuestion>>): any {
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const questionsList = this.getItem<ExamQuestion[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);

    const newExamId = examsList.length > 0 ? Math.max(...examsList.map((e) => e.id)) + 1 : 1;
    const newExam: Exam = {
      id: newExamId,
      title: examData.title || 'اختبار جديد',
      description: examData.description || '',
      timeLimitMinutes: Number(examData.timeLimitMinutes) || 20,
      maxAttempts: Number(examData.maxAttempts) || 1,
      term: examData.term || 'الترم الأول',
      unit: examData.unit || 'Unit 1',
      passingScorePercent: Number(examData.passingScorePercent) || 60,
      isPublished: examData.isPublished !== false,
      createdAt: new Date().toISOString(),
    };

    examsList.unshift(newExam);
    this.setItem(STORAGE_KEYS.EXAMS, examsList);

    let maxQuestionId = questionsList.length > 0 ? Math.max(...questionsList.map((q) => q.id)) : 0;
    const addedQuestions: ExamQuestion[] = questions.map((q, idx) => ({
      id: maxQuestionId + idx + 1,
      examId: newExamId,
      questionText: q.questionText || '',
      type: (q.type as any) || 'multiple_choice',
      options: q.options || [],
      correctOptionIndex: Number(q.correctOptionIndex) || 0,
      explanation: q.explanation || '',
      points: Number(q.points) || 1,
    }));

    questionsList.push(...addedQuestions);
    this.setItem(STORAGE_KEYS.QUESTIONS, questionsList);

    return { exam: newExam, questions: addedQuestions };
  }

  public static deleteExam(examId: number): boolean {
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const questionsList = this.getItem<ExamQuestion[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);
    const resultsList = this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);

    this.setItem(STORAGE_KEYS.EXAMS, examsList.filter((e) => e.id !== examId));
    this.setItem(STORAGE_KEYS.QUESTIONS, questionsList.filter((q) => q.examId !== examId));
    this.setItem(STORAGE_KEYS.RESULTS, resultsList.filter((r) => r.examId !== examId));
    return true;
  }

  // --- SUBMISSIONS & RESULTS ---
  public static submitExam(payload: {
    studentId: number;
    examId: number;
    timeSpentSeconds: number;
    answers: Record<string, number>;
  }): any {
    this.init();
    const studentsList = this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const questionsList = this.getItem<ExamQuestion[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);
    const resultsList = this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);

    const student = studentsList.find((s) => s.id === payload.studentId);
    if (!student) throw new Error('الطالب غير مسجل');

    const exam = examsList.find((e) => e.id === payload.examId);
    if (!exam) throw new Error('الاختبار غير موجود');

    const questions = questionsList.filter((q) => q.examId === payload.examId);
    if (questions.length === 0) throw new Error('لا توجد أسئلة لهذا الاختبار');

    // Calculate score
    let studentScore = 0;
    let totalPossible = 0;
    const detailedCorrections: any[] = [];

    for (const q of questions) {
      const qPoints = q.points || 1;
      totalPossible += qPoints;
      const studentAnswerIndex = payload.answers[q.id.toString()];
      const isCorrect = studentAnswerIndex !== undefined && studentAnswerIndex === q.correctOptionIndex;

      if (isCorrect) {
        studentScore += qPoints;
      }

      detailedCorrections.push({
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        chosenOptionIndex: studentAnswerIndex,
        isCorrect,
        explanation: q.explanation,
        points: qPoints,
      });
    }

    const scorePercent = totalPossible > 0 ? Math.round((studentScore / totalPossible) * 100) : 0;
    const passed = scorePercent >= exam.passingScorePercent;

    const previousAttempts = resultsList.filter(
      (r) => r.examId === payload.examId && r.studentId === payload.studentId
    );

    const submission: ExamResult = {
      id: resultsList.length + 1,
      studentId: payload.studentId,
      examId: payload.examId,
      studentName: student.name,
      studentPhone: student.phone,
      score: studentScore,
      totalPossiblePoints: totalPossible,
      scorePercent,
      timeSpentSeconds: payload.timeSpentSeconds,
      answers: payload.answers,
      attemptNumber: previousAttempts.length + 1,
      passed,
      createdAt: new Date().toISOString(),
      examTitle: exam.title,
    };

    resultsList.unshift(submission);
    this.setItem(STORAGE_KEYS.RESULTS, resultsList);

    return {
      submission,
      detailedCorrections,
    };
  }

  public static getAllResults(): ExamResult[] {
    this.init();
    return this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);
  }

  public static getStudentResults(studentId: number): ExamResult[] {
    this.init();
    const resultsList = this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);
    return resultsList.filter((r) => r.studentId === studentId);
  }

  // --- STATS ---
  public static getAdminStats(): AdminStats {
    this.init();
    const studentsList = this.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const codesList = this.getCodes();
    const lessonsList = this.getLessons(false);
    const examsList = this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
    const resultsList = this.getItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);

    const usedCodes = codesList.filter((c) => c.status === 'used').length;
    const unusedCodes = codesList.filter((c) => c.status === 'unused').length;
    const avgScore =
      resultsList.length > 0
        ? Math.round(resultsList.reduce((sum, r) => sum + r.scorePercent, 0) / resultsList.length)
        : 0;

    return {
      totalStudents: studentsList.length,
      totalCodes: codesList.length,
      usedCodes,
      unusedCodes,
      totalLessons: lessonsList.length,
      totalExams: examsList.length,
      totalSubmissions: resultsList.length,
      averageScorePercent: avgScore,
    };
  }

  // --- RESET DEMO DATA ---
  public static resetDemoData(keepCurriculum = true): any {
    const codes = this.getCodes().map((c) => ({
      ...c,
      status: 'unused' as const,
      usedByStudentName: null,
      usedByStudentPhone: null,
      usedAt: null,
    }));
    this.setItem(STORAGE_KEYS.CODES, codes);
    this.setItem(STORAGE_KEYS.STUDENTS, []);
    this.setItem(STORAGE_KEYS.RESULTS, []);

    if (!keepCurriculum) {
      this.setItem(STORAGE_KEYS.LESSONS, initialLessons);
      this.setItem(STORAGE_KEYS.EXAMS, initialExams);
      this.setItem(STORAGE_KEYS.QUESTIONS, initialQuestions);
    }

    return { success: true, message: 'تم تصفير بيانات الطلاب والاختبارات بنجاح' };
  }
}
