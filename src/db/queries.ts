import { db } from './index.ts';
import { accessCodes, students, lessons, exams, examQuestions, examResults, users } from './schema.ts';
import { eq, desc, and, count, avg, sql, inArray } from 'drizzle-orm';
import crypto from 'crypto';

// --- ACCESS CODES ---
export async function getAccessCodes() {
  try {
    return await db.select().from(accessCodes).orderBy(desc(accessCodes.createdAt));
  } catch (error) {
    console.error('getAccessCodes error:', error);
    throw new Error('فشل جلب الأكواد من قاعدة البيانات', { cause: error });
  }
}

export async function generateAccessCodes(amount: number, note?: string) {
  try {
    const generated: Array<{ code: string; note?: string }> = [];
    for (let i = 0; i < amount; i++) {
      // Generate clean memorable code format: TOP-XXXX-XXXX
      const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `TOP-${Math.floor(100 + Math.random() * 900)}-${randomPart}`;
      generated.push({ code, note: note || 'دفعة أكواد جديدة' });
    }
    return await db.insert(accessCodes).values(generated).returning();
  } catch (error) {
    console.error('generateAccessCodes error:', error);
    throw new Error('فشل توليد الأكواد الجديدة', { cause: error });
  }
}

export async function toggleCodeStatus(id: number, status: 'unused' | 'disabled') {
  try {
    return await db.update(accessCodes)
      .set({ status })
      .where(eq(accessCodes.id, id))
      .returning();
  } catch (error) {
    console.error('toggleCodeStatus error:', error);
    throw new Error('فشل تحديث حالة الكود', { cause: error });
  }
}

export async function deleteAccessCode(id: number) {
  try {
    return await db.delete(accessCodes).where(eq(accessCodes.id, id)).returning();
  } catch (error) {
    console.error('deleteAccessCode error:', error);
    throw new Error('فشل حذف الكود', { cause: error });
  }
}

// --- STUDENT AUTH & REGISTRATION WITH CODE ---
export async function studentLoginOrRegister(name: string, phone: string, code: string) {
  try {
    const trimmedCode = code.trim();
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();

    // 1. Check if student already registered with this phone
    const existingStudent = await db.select().from(students).where(eq(students.phone, trimmedPhone));
    if (existingStudent.length > 0) {
      const student = existingStudent[0];
      // Update last active
      await db.update(students)
        .set({ lastActiveAt: new Date() })
        .where(eq(students.id, student.id));
      return student;
    }

    // 2. New student registration - verify the code
    const codeRecord = await db.select().from(accessCodes).where(eq(accessCodes.code, trimmedCode));
    if (codeRecord.length === 0) {
      throw new Error('كود التفعيل غير صحيح، يرجى التأكد من الكود أو التواصل مع الأستاذ');
    }

    const codeData = codeRecord[0];
    if (codeData.status === 'disabled') {
      throw new Error('تم تعطيل هذا الكود، يرجى مراجعة إدارة المنصة');
    }
    if (codeData.status === 'used') {
      throw new Error(`هذا الكود تم استخدامه مسبقاً من قِبل: ${codeData.usedByStudentName || 'طالب آخر'}`);
    }

    // 3. Mark code as used
    await db.update(accessCodes)
      .set({
        status: 'used',
        usedByStudentName: trimmedName,
        usedByStudentPhone: trimmedPhone,
        usedAt: new Date(),
      })
      .where(eq(accessCodes.id, codeData.id));

    // 4. Create student session
    const sessionToken = crypto.randomBytes(24).toString('hex');
    const createdStudent = await db.insert(students).values({
      name: trimmedName,
      phone: trimmedPhone,
      codeUsed: trimmedCode,
      sessionToken,
    }).returning();

    return createdStudent[0];
  } catch (error: any) {
    console.error('studentLoginOrRegister error:', error);
    throw error;
  }
}

export async function getStudentByToken(token: string) {
  try {
    const res = await db.select().from(students).where(eq(students.sessionToken, token));
    return res[0] || null;
  } catch (error) {
    console.error('getStudentByToken error:', error);
    return null;
  }
}

export async function getAllStudents() {
  try {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  } catch (error) {
    console.error('getAllStudents error:', error);
    throw new Error('فشل جلب قائمة الطلاب', { cause: error });
  }
}

// --- LESSONS ---
export async function getLessons(publishedOnly = true) {
  try {
    if (publishedOnly) {
      return await db.select().from(lessons)
        .where(eq(lessons.isPublished, true))
        .orderBy(desc(lessons.createdAt));
    }
    return await db.select().from(lessons).orderBy(desc(lessons.createdAt));
  } catch (error) {
    console.error('getLessons error:', error);
    throw new Error('فشل جلب الدروس', { cause: error });
  }
}

export async function createLesson(data: {
  title: string;
  description?: string;
  videoUrl: string;
  durationMinutes: number;
  term: string;
  unit: string;
  lessonNumber: number;
  pdfAttachmentUrl?: string;
  isPublished?: boolean;
}) {
  try {
    return await db.insert(lessons).values({
      title: data.title,
      description: data.description || '',
      videoUrl: data.videoUrl,
      durationMinutes: Number(data.durationMinutes) || 30,
      term: data.term || 'الترم الأول',
      unit: data.unit || 'Unit 1',
      lessonNumber: Number(data.lessonNumber) || 1,
      pdfAttachmentUrl: data.pdfAttachmentUrl || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    }).returning();
  } catch (error) {
    console.error('createLesson error:', error);
    throw new Error('فشل إضافة الدرس الجديد', { cause: error });
  }
}

export async function updateLesson(id: number, data: Partial<{
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  term: string;
  unit: string;
  lessonNumber: number;
  pdfAttachmentUrl: string;
  isPublished: boolean;
}>) {
  try {
    return await db.update(lessons).set(data).where(eq(lessons.id, id)).returning();
  } catch (error) {
    console.error('updateLesson error:', error);
    throw new Error('فشل تعديل الدرس', { cause: error });
  }
}

export async function deleteLesson(id: number) {
  try {
    return await db.delete(lessons).where(eq(lessons.id, id)).returning();
  } catch (error) {
    console.error('deleteLesson error:', error);
    throw new Error('فشل حذف الدرس', { cause: error });
  }
}

// --- EXAMS & QUESTIONS ---
export async function getExamsWithStats(studentId?: number) {
  try {
    const allExams = await db.select().from(exams).orderBy(desc(exams.createdAt));
    const result = [];

    for (const exam of allExams) {
      const qCount = await db.select({ count: count() }).from(examQuestions).where(eq(examQuestions.examId, exam.id));
      let userAttempts = 0;
      let bestScore = 0;

      if (studentId) {
        const studentResults = await db.select().from(examResults)
          .where(and(eq(examResults.examId, exam.id), eq(examResults.studentId, studentId)));
        userAttempts = studentResults.length;
        if (userAttempts > 0) {
          bestScore = Math.max(...studentResults.map(r => r.scorePercent));
        }
      }

      result.push({
        ...exam,
        questionsCount: Number(qCount[0]?.count || 0),
        userAttemptsCount: userAttempts,
        bestScore,
      });
    }

    return result;
  } catch (error) {
    console.error('getExamsWithStats error:', error);
    throw new Error('فشل جلب قائمة الاختبارات', { cause: error });
  }
}

export async function getExamDetails(examId: number, includeAnswers = false) {
  try {
    const examData = await db.select().from(exams).where(eq(exams.id, examId));
    if (examData.length === 0) return null;

    const questions = await db.select().from(examQuestions).where(eq(examQuestions.examId, examId));

    return {
      ...examData[0],
      questions: questions.map(q => ({
        id: q.id,
        examId: q.examId,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        points: q.points,
        // Hide correct answer from students
        ...(includeAnswers ? { correctOptionIndex: q.correctOptionIndex, explanation: q.explanation } : {}),
      })),
    };
  } catch (error) {
    console.error('getExamDetails error:', error);
    throw new Error('فشل جلب تفاصيل الاختبار', { cause: error });
  }
}

export async function createExam(examData: {
  title: string;
  description?: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  term: string;
  unit: string;
  passingScorePercent: number;
  isPublished?: boolean;
}, questionsData: Array<{
  questionText: string;
  type: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points: number;
}>) {
  try {
    const insertedExam = await db.insert(exams).values({
      title: examData.title,
      description: examData.description || '',
      timeLimitMinutes: Number(examData.timeLimitMinutes) || 20,
      maxAttempts: Number(examData.maxAttempts) || 1,
      term: examData.term || 'الترم الأول',
      unit: examData.unit || 'Unit 1',
      passingScorePercent: Number(examData.passingScorePercent) || 60,
      isPublished: examData.isPublished !== undefined ? examData.isPublished : true,
    }).returning();

    const examId = insertedExam[0].id;

    if (questionsData && questionsData.length > 0) {
      for (const q of questionsData) {
        await db.insert(examQuestions).values({
          examId,
          questionText: q.questionText,
          type: (q.type as 'multiple_choice' | 'true_false') || 'multiple_choice',
          options: q.options,
          correctOptionIndex: Number(q.correctOptionIndex) || 0,
          explanation: q.explanation || '',
          points: Number(q.points) || 1,
        });
      }
    }

    return insertedExam[0];
  } catch (error) {
    console.error('createExam error:', error);
    throw new Error('فشل إنشاء الاختبار', { cause: error });
  }
}

export async function deleteExam(examId: number) {
  try {
    return await db.delete(exams).where(eq(exams.id, examId)).returning();
  } catch (error) {
    console.error('deleteExam error:', error);
    throw new Error('فشل حذف الاختبار', { cause: error });
  }
}

// --- EXAM SUBMISSION & GRADING ---
export async function submitExamAnswers(data: {
  studentId: number;
  examId: number;
  timeSpentSeconds: number;
  answers: Record<string, number>;
}) {
  try {
    // 1. Fetch exam and questions with correct answers
    const examData = await db.select().from(exams).where(eq(exams.id, data.examId));
    if (examData.length === 0) throw new Error('الاختبار غير موجود');
    const exam = examData[0];

    const studentData = await db.select().from(students).where(eq(students.id, data.studentId));
    if (studentData.length === 0) throw new Error('بيانات الطالب غير موجودة');
    const student = studentData[0];

    // Check attempts
    const existingAttempts = await db.select().from(examResults)
      .where(and(eq(examResults.examId, exam.id), eq(examResults.studentId, student.id)));
    
    if (exam.maxAttempts > 0 && existingAttempts.length >= exam.maxAttempts) {
      throw new Error(`لقد استنفدت جميع محاولاتك لهذا الاختبار (${exam.maxAttempts} محاولة)`);
    }

    const questions = await db.select().from(examQuestions).where(eq(examQuestions.examId, exam.id));
    
    let totalScore = 0;
    let totalPossible = 0;
    const gradedBreakdown: Array<{
      questionId: number;
      questionText: string;
      options: string[];
      chosenIndex: number;
      correctIndex: number;
      isCorrect: boolean;
      explanation?: string | null;
      points: number;
    }> = [];

    for (const q of questions) {
      totalPossible += q.points;
      const studentChosenIndex = data.answers[String(q.id)];
      const isCorrect = studentChosenIndex !== undefined && Number(studentChosenIndex) === q.correctOptionIndex;

      if (isCorrect) {
        totalScore += q.points;
      }

      gradedBreakdown.push({
        questionId: q.id,
        questionText: q.questionText,
        options: q.options as string[],
        chosenIndex: studentChosenIndex !== undefined ? Number(studentChosenIndex) : -1,
        correctIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
        points: q.points,
      });
    }

    const scorePercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const passed = scorePercent >= exam.passingScorePercent;

    const insertedResult = await db.insert(examResults).values({
      studentId: student.id,
      examId: exam.id,
      studentName: student.name,
      studentPhone: student.phone,
      score: totalScore,
      totalPossiblePoints: totalPossible,
      scorePercent,
      timeSpentSeconds: data.timeSpentSeconds,
      answers: data.answers,
      attemptNumber: existingAttempts.length + 1,
      passed,
    }).returning();

    return {
      result: insertedResult[0],
      gradedBreakdown,
      examTitle: exam.title,
    };
  } catch (error) {
    console.error('submitExamAnswers error:', error);
    throw error;
  }
}

// --- RESULTS & STATS ---
export async function getAllResults() {
  try {
    const results = await db.select({
      id: examResults.id,
      studentId: examResults.studentId,
      examId: examResults.examId,
      studentName: examResults.studentName,
      studentPhone: examResults.studentPhone,
      score: examResults.score,
      totalPossiblePoints: examResults.totalPossiblePoints,
      scorePercent: examResults.scorePercent,
      timeSpentSeconds: examResults.timeSpentSeconds,
      attemptNumber: examResults.attemptNumber,
      passed: examResults.passed,
      createdAt: examResults.createdAt,
      examTitle: exams.title,
    })
    .from(examResults)
    .leftJoin(exams, eq(examResults.examId, exams.id))
    .orderBy(desc(examResults.createdAt));

    return results;
  } catch (error) {
    console.error('getAllResults error:', error);
    throw new Error('فشل جلب نتائج الاختبارات', { cause: error });
  }
}

export async function getStudentResults(studentId: number) {
  try {
    const results = await db.select({
      id: examResults.id,
      examId: examResults.examId,
      score: examResults.score,
      totalPossiblePoints: examResults.totalPossiblePoints,
      scorePercent: examResults.scorePercent,
      timeSpentSeconds: examResults.timeSpentSeconds,
      attemptNumber: examResults.attemptNumber,
      passed: examResults.passed,
      createdAt: examResults.createdAt,
      examTitle: exams.title,
    })
    .from(examResults)
    .leftJoin(exams, eq(examResults.examId, exams.id))
    .where(eq(examResults.studentId, studentId))
    .orderBy(desc(examResults.createdAt));

    return results;
  } catch (error) {
    console.error('getStudentResults error:', error);
    throw new Error('فشل جلب نتائج الطالب', { cause: error });
  }
}

export async function getAdminStats() {
  try {
    const [stCount] = await db.select({ count: count() }).from(students);
    const [cTotal] = await db.select({ count: count() }).from(accessCodes);
    const [cUsed] = await db.select({ count: count() }).from(accessCodes).where(eq(accessCodes.status, 'used'));
    const [cUnused] = await db.select({ count: count() }).from(accessCodes).where(eq(accessCodes.status, 'unused'));
    const [lCount] = await db.select({ count: count() }).from(lessons);
    const [eCount] = await db.select({ count: count() }).from(exams);
    const [resCount] = await db.select({ count: count() }).from(examResults);
    const [avgScore] = await db.select({ avg: avg(examResults.scorePercent) }).from(examResults);

    return {
      totalStudents: Number(stCount?.count || 0),
      totalCodes: Number(cTotal?.count || 0),
      usedCodes: Number(cUsed?.count || 0),
      unusedCodes: Number(cUnused?.count || 0),
      totalLessons: Number(lCount?.count || 0),
      totalExams: Number(eCount?.count || 0),
      totalSubmissions: Number(resCount?.count || 0),
      averageScorePercent: Math.round(Number(avgScore?.avg || 0)),
    };
  } catch (error) {
    console.error('getAdminStats error:', error);
    throw new Error('فشل جلب إحصائيات الإدارة', { cause: error });
  }
}

// Reset or clear test submissions for real official deployment
export async function clearDemoData(keepCurriculum: boolean = true) {
  try {
    // Delete exam results
    await db.delete(examResults);
    // Delete students
    await db.delete(students);
    // Reset all access codes to unused and unassigned
    await db.update(accessCodes).set({
      status: 'unused',
      usedByStudentName: null,
      usedByStudentPhone: null,
      usedAt: null,
    });

    if (!keepCurriculum) {
      await db.delete(examQuestions);
      await db.delete(exams);
      await db.delete(lessons);
    }
    return { success: true, message: 'تم تجهيز وتصفير سجلات الطلاب لبدء العمل الفعلي' };
  } catch (error) {
    console.error('clearDemoData error:', error);
    throw new Error('فشل تنظيف البيانات', { cause: error });
  }
}
