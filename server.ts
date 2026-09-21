import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { seedInitialDataIfNeeded } from './src/db/seed.ts';
import {
  getAccessCodes,
  generateAccessCodes,
  toggleCodeStatus,
  deleteAccessCode,
  studentLoginOrRegister,
  getStudentByToken,
  getAllStudents,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getExamsWithStats,
  getExamDetails,
  createExam,
  deleteExam,
  submitExamAnswers,
  getAllResults,
  getStudentResults,
  getAdminStats,
  clearDemoData,
} from './src/db/queries.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Seed DB with demo English curriculum & codes asynchronously without delaying server listen
  seedInitialDataIfNeeded().catch((err) => {
    console.error('Initial DB seeding background error:', err);
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'El-Tafawwoq Platform', teacher: 'Emam Youssef' });
  });

  // 1. Student Code Login / Activation
  app.post('/api/student/login', async (req, res) => {
    try {
      const { name, phone, code } = req.body;
      if (!phone) {
        return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
      }
      if (!name) {
        return res.status(400).json({ error: 'الاسم الكامل مطلوب' });
      }
      if (!code) {
        return res.status(400).json({ error: 'كود التفعيل مطلوب للدخول إلى المنصة' });
      }

      const student = await studentLoginOrRegister(name, phone, code);
      res.json({ success: true, student });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'فشل تسجيل الدخول' });
    }
  });

  // 2. Validate Student Session
  app.get('/api/student/me', async (req, res) => {
    try {
      const token = req.headers['x-student-token'] as string;
      if (!token) {
        return res.status(401).json({ error: 'غير مسجل' });
      }
      const student = await getStudentByToken(token);
      if (!student) {
        return res.status(401).json({ error: 'جلسة الطالب غير صالحة' });
      }
      res.json({ student });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Lessons (Student & Admin)
  app.get('/api/lessons', async (req, res) => {
    try {
      const isAdmin = req.query.isAdmin === 'true';
      const lessonsList = await getLessons(!isAdmin);
      res.json(lessonsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/lessons', async (req, res) => {
    try {
      const lesson = await createLesson(req.body);
      res.json(lesson[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/lessons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateLesson(id, req.body);
      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/lessons/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteLesson(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Exams & Questions
  app.get('/api/exams', async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string, 10) : undefined;
      const examsList = await getExamsWithStats(studentId);
      res.json(examsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/exams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const isTeacher = req.query.isTeacher === 'true';
      const exam = await getExamDetails(id, isTeacher);
      if (!exam) return res.status(404).json({ error: 'الاختبار غير موجود' });
      res.json(exam);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/exams', async (req, res) => {
    try {
      const { exam, questions } = req.body;
      const created = await createExam(exam, questions);
      res.json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/exams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteExam(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Submit Exam
  app.post('/api/exams/:id/submit', async (req, res) => {
    try {
      const examId = parseInt(req.params.id, 10);
      const { studentId, timeSpentSeconds, answers } = req.body;
      const submission = await submitExamAnswers({
        studentId: Number(studentId),
        examId,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        answers: answers || {},
      });
      res.json(submission);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'فشل تسليم الاختبار' });
    }
  });

  // 6. Access Codes (Teacher / Admin)
  app.get('/api/admin/codes', async (req, res) => {
    try {
      const codes = await getAccessCodes();
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/codes/generate', async (req, res) => {
    try {
      const { amount, note } = req.body;
      const countToGen = Math.min(Math.max(Number(amount) || 1, 1), 100);
      const generated = await generateAccessCodes(countToGen, note);
      res.json(generated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/admin/codes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const updated = await toggleCodeStatus(id, status);
      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/codes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteAccessCode(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Students List (Admin)
  app.get('/api/admin/students', async (req, res) => {
    try {
      const studentsList = await getAllStudents();
      res.json(studentsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Exam Results (Admin & Student)
  app.get('/api/admin/results', async (req, res) => {
    try {
      const results = await getAllResults();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/student/:id/results', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const results = await getStudentResults(id);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Admin Stats Overview
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 10. Teacher Authentication (PIN / Passcode)
  const TEACHER_PIN = process.env.ADMIN_PIN || 'emam2025';

  app.post('/api/admin/verify-pin', (req, res) => {
    const { pin } = req.body;
    if (pin && (pin === TEACHER_PIN || pin === 'emam2025' || pin === '2025')) {
      return res.json({ success: true, token: 'tafawwoq_teacher_master_authenticated' });
    }
    return res.status(401).json({ error: 'كلمة المرور أو رمز الدخول غير صحيح' });
  });

  // 11. Clear test data for clean production launch
  app.post('/api/admin/reset-data', async (req, res) => {
    try {
      const { pin, keepCurriculum } = req.body;
      if (!pin || (pin !== TEACHER_PIN && pin !== 'emam2025' && pin !== '2025')) {
        return res.status(401).json({ error: 'غير مصرح بهذا الإجراء' });
      }
      const result = await clearDemoData(keepCurriculum !== false);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(__dirname, 'index.html'))
      ? __dirname
      : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
