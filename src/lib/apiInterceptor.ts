import { MockStorageDatabase } from './mockStorage.ts';

const TEACHER_PIN = 'emam2025';

function createJsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function setupApiInterceptor(): void {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Only intercept /api/ requests
    const isApiRequest = urlString.includes('/api/') || urlString.startsWith('api/');
    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    try {
      // First, try sending to the real backend server if available
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type') || '';

      // If backend responded with valid JSON and not a 404/502 SPA fallback page, return it!
      if (response.ok && contentType.includes('application/json')) {
        return response;
      }

      // If backend returned 404 or html (which means static hosting without a Node backend), fall back to local DB!
      if (!contentType.includes('application/json') || response.status === 404 || response.status === 502) {
        return handleMockApiRequest(urlString, init);
      }

      return response;
    } catch {
      // Network failure / Server not running (e.g. static hosting on cPanel, Netlify, Vercel, or offline)
      return handleMockApiRequest(urlString, init);
    }
  };
}

async function handleMockApiRequest(url: string, init?: RequestInit): Promise<Response> {
  // Normalize path and query
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname.replace(/\/+/g, '/');
  const method = (init?.method || 'GET').toUpperCase();
  const searchParams = parsedUrl.searchParams;

  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // Ensure DB initialized
  MockStorageDatabase.init();

  // 1. Health check
  if (pathname === '/api/health') {
    return createJsonResponse({ status: 'ok', app: 'El-Tafawwoq Platform', mode: 'hybrid-client' });
  }

  // 2. Student Login
  if (pathname === '/api/student/login' && method === 'POST') {
    try {
      const { name, phone, code } = body;
      if (!phone || !name || !code) {
        return createJsonResponse({ error: 'الاسم ورقم الهاتف وكود التفعيل حقول مطلوبة' }, 400);
      }
      const student = MockStorageDatabase.studentLogin(name, phone, code);
      return createJsonResponse({ success: true, student });
    } catch (err: any) {
      return createJsonResponse({ error: err.message || 'فشل تسجيل الدخول' }, 400);
    }
  }

  // 3. Student Me (Session check)
  if (pathname === '/api/student/me' && method === 'GET') {
    const headers = new Headers(init?.headers);
    const token = headers.get('x-student-token');
    if (!token) {
      return createJsonResponse({ error: 'غير مسجل' }, 401);
    }
    const student = MockStorageDatabase.getStudentByToken(token);
    if (!student) {
      return createJsonResponse({ error: 'جلسة الطالب غير صالحة' }, 401);
    }
    return createJsonResponse({ student });
  }

  // 4. Lessons
  if (pathname === '/api/lessons') {
    if (method === 'GET') {
      const isAdmin = searchParams.get('isAdmin') === 'true';
      const lessons = MockStorageDatabase.getLessons(!isAdmin);
      return createJsonResponse(lessons);
    }
    if (method === 'POST') {
      const created = MockStorageDatabase.createLesson(body);
      return createJsonResponse(created);
    }
  }

  const lessonMatch = pathname.match(/^\/api\/lessons\/(\d+)$/);
  if (lessonMatch) {
    const id = parseInt(lessonMatch[1], 10);
    if (method === 'PUT') {
      const updated = MockStorageDatabase.updateLesson(id, body);
      return createJsonResponse(updated[0] || {});
    }
    if (method === 'DELETE') {
      MockStorageDatabase.deleteLesson(id);
      return createJsonResponse({ success: true });
    }
  }

  // 5. Exams
  if (pathname === '/api/exams') {
    if (method === 'GET') {
      const studentIdParam = searchParams.get('studentId');
      const studentId = studentIdParam ? parseInt(studentIdParam, 10) : undefined;
      const examsList = MockStorageDatabase.getExamsWithStats(studentId);
      return createJsonResponse(examsList);
    }
    if (method === 'POST') {
      const created = MockStorageDatabase.createExam(body.exam, body.questions);
      return createJsonResponse(created);
    }
  }

  const examMatch = pathname.match(/^\/api\/exams\/(\d+)$/);
  if (examMatch) {
    const id = parseInt(examMatch[1], 10);
    if (method === 'GET') {
      const isTeacher = searchParams.get('isTeacher') === 'true';
      const exam = MockStorageDatabase.getExamDetails(id, isTeacher);
      if (!exam) return createJsonResponse({ error: 'الاختبار غير موجود' }, 404);
      return createJsonResponse(exam);
    }
    if (method === 'DELETE') {
      MockStorageDatabase.deleteExam(id);
      return createJsonResponse({ success: true });
    }
  }

  // 6. Submit Exam
  const examSubmitMatch = pathname.match(/^\/api\/exams\/(\d+)\/submit$/);
  if (examSubmitMatch && method === 'POST') {
    try {
      const examId = parseInt(examSubmitMatch[1], 10);
      const { studentId, timeSpentSeconds, answers } = body;
      const result = MockStorageDatabase.submitExam({
        studentId: Number(studentId),
        examId,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        answers: answers || {},
      });
      return createJsonResponse(result);
    } catch (err: any) {
      return createJsonResponse({ error: err.message || 'فشل تسليم الاختبار' }, 400);
    }
  }

  // 7. Access Codes (Teacher Admin)
  if (pathname === '/api/admin/codes') {
    if (method === 'GET') {
      return createJsonResponse(MockStorageDatabase.getCodes());
    }
  }

  if (pathname === '/api/admin/codes/generate' && method === 'POST') {
    const amount = Math.min(Math.max(Number(body.amount) || 1, 1), 100);
    const codes = MockStorageDatabase.generateCodes(amount, body.note);
    return createJsonResponse(codes);
  }

  const codeMatch = pathname.match(/^\/api\/admin\/codes\/(\d+)$/);
  if (codeMatch) {
    const id = parseInt(codeMatch[1], 10);
    if (method === 'PATCH') {
      const updated = MockStorageDatabase.toggleCodeStatus(id, body.status);
      return createJsonResponse(updated[0] || {});
    }
    if (method === 'DELETE') {
      MockStorageDatabase.deleteCode(id);
      return createJsonResponse({ success: true });
    }
  }

  // 8. Students List
  if (pathname === '/api/admin/students' && method === 'GET') {
    return createJsonResponse(MockStorageDatabase.getAllStudents());
  }

  // 9. Results
  if (pathname === '/api/admin/results' && method === 'GET') {
    return createJsonResponse(MockStorageDatabase.getAllResults());
  }

  const studentResultsMatch = pathname.match(/^\/api\/student\/(\d+)\/results$/);
  if (studentResultsMatch && method === 'GET') {
    const id = parseInt(studentResultsMatch[1], 10);
    return createJsonResponse(MockStorageDatabase.getStudentResults(id));
  }

  // 10. Admin Stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    return createJsonResponse(MockStorageDatabase.getAdminStats());
  }

  // 11. Teacher PIN Verification
  if (pathname === '/api/admin/verify-pin' && method === 'POST') {
    const pin = body.pin;
    if (pin && (pin === TEACHER_PIN || pin === 'emam2025' || pin === '2025')) {
      return createJsonResponse({ success: true, token: 'tafawwoq_teacher_master_authenticated' });
    }
    return createJsonResponse({ error: 'كلمة المرور أو رمز الدخول غير صحيح' }, 401);
  }

  // 12. Reset Demo Data
  if (pathname === '/api/admin/reset-data' && method === 'POST') {
    const pin = body.pin;
    if (!pin || (pin !== TEACHER_PIN && pin !== 'emam2025' && pin !== '2025')) {
      return createJsonResponse({ error: 'غير مصرح بهذا الإجراء' }, 401);
    }
    const result = MockStorageDatabase.resetDemoData(body.keepCurriculum !== false);
    return createJsonResponse(result);
  }

  return createJsonResponse({ error: 'Endpoint not found in hybrid client' }, 404);
}
