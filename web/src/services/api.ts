import axios from "axios";

// Types for auth responses
export interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar?: string;
  date_of_birth?: string;
  gender?: string;
  created_at?: string;
  email_notifications?: boolean;
  student_id?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: string;
}

export interface DashboardStats {
  total_students: number;
  total_classrooms: number;
  total_sessions: number;
  todays_attendance_count: number;
  attendance_percentage: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classroom_id?: string;
  classroom_name: string;
  session_label: string;
  presentCount: number;
  totalCount: number;
}

export interface Classroom {
  id: string;
  name: string;
  course_code: string;
  description?: string;
  teacher_id: string;
  access_code: string;
  student_count: number;
  student_ids: string[];
  schedule?: string;
  created_at: string;
}

export interface ClassroomCreateData {
  name: string;
  course_code: string;
  description?: string;
  schedule?: string;
}

export interface JoinClassroomResponse {
  message: string;
  classroom_id: string;
  classroom_name: string;
}

export interface Announcement {
  id: string;
  classroom_id: string;
  teacher_id: string;
  teacher_name?: string;
  content: string;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  classroom_id: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  status: "active" | "completed";
  present_student_ids: string[];
  records: AttendanceRecord[];
  created_at: string;
  updated_at: string;
}

// Backend port auto-detection
// Tries VITE_API_URL (default :8000) first, falls back to :8001
const PRIMARY_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const FALLBACK_URL = "http://127.0.0.1:8001";

const api = axios.create({
  baseURL: PRIMARY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-detect backend port on startup (runs once)
(async () => {
  try {
    await axios.get(`${PRIMARY_URL}/`, { timeout: 2000 });
    // Primary URL works, keep it
  } catch {
    try {
      await axios.get(`${FALLBACK_URL}/`, { timeout: 2000 });
      api.defaults.baseURL = FALLBACK_URL;
      console.log(
        `[NexAttend] Backend detected on fallback port: ${FALLBACK_URL}`,
      );
    } catch {
      // Neither works — keep primary, errors will surface naturally
      console.warn("[NexAttend] No backend detected on 8000 or 8001");
    }
  }
})();

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nexattend_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call failed:", error);
    // Handle 401 unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("nexattend_token");
      localStorage.removeItem("nexattend_user");
      // Redirect to login page so user can re-authenticate
      window.location.href = "/get-started";
    }
    return Promise.reject(error);
  },
);

// Basic health check function to verify connection
export const healthCheck = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>("/api/v1/dashboard/stats");
  return response.data;
};

export const getAttendanceHistory = async (
  classroomId?: string,
): Promise<AttendanceRecord[]> => {
  const params = classroomId ? { classroom_id: classroomId } : {};
  const response = await api.get<AttendanceRecord[]>(
    "/api/v1/attendance/history",
    { params },
  );
  return response.data;
};

// ── Real-data attendance history (per-classroom, paginated) ───────────────────

export interface AttendanceSessionRecord {
  student_id: string;
  status: string;
  confidence?: number;
  timestamp: string;
}

export interface AttendanceSessionDetail {
  _id: string;
  classroom_id: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  status: "active" | "completed";
  present_student_ids: string[];
  records: AttendanceSessionRecord[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedHistoryResponse {
  items: AttendanceSessionDetail[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface StudentDashboardStats {
  attendance_percentage: number;
  total_classes: number;
  present_count: number;
  absent_count: number;
}

/**
 * Fetch paginated attendance history for a specific classroom.
 * Backend: GET /api/v1/attendance/classroom/{classroom_id}/history
 */
export const getClassroomAttendanceHistory = async (
  classroomId: string,
  page = 1,
  limit = 50,
): Promise<PaginatedHistoryResponse> => {
  const response = await api.get<PaginatedHistoryResponse>(
    `/api/v1/attendance/classroom/${classroomId}/history`,
    { params: { page, limit } },
  );
  return response.data;
};

/**
 * Export attendance history to CSV.
 */
export const exportAttendanceCSV = async (params: {
  classroom_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}): Promise<void> => {
  const response = await api.get("/api/v1/export/attendance/csv", {
    params,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  // Extract filename from Content-Disposition if available
  let fileName = "attendance_export.csv";
  const contentDisposition = response.headers["content-disposition"];
  if (contentDisposition && contentDisposition.includes("filename=")) {
    const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
    if (matches && matches[1]) {
      fileName = matches[1];
    }
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Fetch attendance history across ALL of the teacher's classrooms.
 * 1) Fetches teacher's classrooms
 * 2) For each classroom, fetches attendance sessions
 * 3) Merges, enriches with classroom name + student counts, sorts by date (newest first)
 */
export const getTeacherAttendanceHistory = async (): Promise<
  AttendanceRecord[]
> => {
  // Step 1 — get teacher's classrooms
  const classrooms = await getClassrooms();

  // Step 2 — fetch history for each classroom in parallel
  const historyPromises = classrooms.map(async (cls) => {
    try {
      const history = await getClassroomAttendanceHistory(cls.id, 1, 50);
      return history.items.map((session) => ({
        id: session._id,
        date: session.session_date,
        classroom_id: cls.id,
        classroom_name: cls.name,
        session_label: `Session`,
        presentCount: session.present_student_ids.length,
        totalCount: cls.student_count || session.present_student_ids.length,
      }));
    } catch {
      return [] as AttendanceRecord[];
    }
  });

  const results = await Promise.all(historyPromises);

  // Step 3 — merge and sort by date (newest first)
  const merged = results.flat();
  merged.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return merged;
};

// ── Student Attendance functions ──────────────────────────────────────────────

export const getStudentDashboardStats = async (studentId: string): Promise<StudentDashboardStats> => {
  const response = await api.get<StudentDashboardStats>(`/api/v1/dashboard/student-stats/${studentId}`);
  return response.data;
};

// Removed duplicate getStudentAttendanceHistory

// Auth API functions
export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/v1/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const loginWithGoogle = async (
  token: string,
  role: string = "teacher",
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/v1/auth/google", {
    token,
    role,
  });
  return response.data;
};

export const registerUser = async (
  data: RegisterData,
  images?: File[],
): Promise<UserData> => {
  const formData = new FormData();
  formData.append("full_name", data.full_name);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("role", data.role);

  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await api.post<UserData>("/api/v1/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Student Registration with Face Data
export const registerStudent = async (studentData: FormData) => {
  try {
    const response = await api.post("/students/register", studentData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Student registration failed:", error);
    throw error;
  }
};

export const updateProfile = async (data: {
  full_name?: string;
  avatar?: string;
  date_of_birth?: string;
  gender?: string;
  email_notifications?: boolean;
}): Promise<UserData> => {
  const response = await api.put<UserData>("/api/v1/users/me", data);
  return response.data;
};

export const uploadAvatar = async (file: File): Promise<UserData> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<UserData>(
    "/api/v1/users/me/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const updatePassword = async (data: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    "/api/v1/users/me/password",
    data,
  );
  return response.data;
};

export const deleteAccount = async (password: string): Promise<void> => {
  await api.delete("/api/v1/users/me", { data: { password } });
};

export const getClassrooms = async (): Promise<Classroom[]> => {
  const response = await api.get<Classroom[]>("/api/v1/classrooms");
  return response.data;
};

export const getClassroom = async (classroomId: string): Promise<Classroom> => {
  const response = await api.get<Classroom>(
    `/api/v1/classrooms/${classroomId}`,
  );
  return response.data;
};

export const createClassroom = async (
  data: ClassroomCreateData,
): Promise<Classroom> => {
  const response = await api.post<Classroom>("/api/v1/classrooms/", data);
  return response.data;
};

export const deleteClassroom = async (
  classroomId: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/v1/classrooms/${classroomId}`,
  );
  return response.data;
};

export const joinClassroom = async (
  accessCode: string,
): Promise<JoinClassroomResponse> => {
  const response = await api.post<JoinClassroomResponse>(
    "/api/v1/classrooms/join",
    {
      access_code: accessCode,
    },
  );
  return response.data;
};

export const leaveClassroom = async (
  classroomId: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/api/v1/classrooms/${classroomId}/leave`,
  );
  return response.data;
};

export const getClassroomAnnouncements = async (
  classroomId: string,
): Promise<Announcement[]> => {
  const response = await api.get<any[]>(
    `/api/v1/classrooms/${classroomId}/announcements`,
  );
  return response.data.map((ann) => ({ ...ann, id: ann._id || ann.id }));
};

export const createAnnouncement = async (
  classroomId: string,
  content: string,
): Promise<Announcement> => {
  const response = await api.post<any>(
    `/api/v1/classrooms/${classroomId}/announcements`,
    { content },
  );
  return { ...response.data, id: response.data._id || response.data.id };
};

export const deleteAnnouncement = async (
  classroomId: string,
  announcementId: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/v1/classrooms/${classroomId}/announcements/${announcementId}`,
  );
  return response.data;
};

export const startAttendanceSession = async (
  classroomId: string,
): Promise<AttendanceSession> => {
  const response = await api.post<AttendanceSession>(
    "/api/v1/attendance/start",
    {
      classroom_id: classroomId,
    },
  );
  return response.data;
};

export const closeAttendanceSession = async (
  sessionId: string,
): Promise<AttendanceSession> => {
  const response = await api.post<AttendanceSession>(
    `/api/v1/attendance/close/${sessionId}`,
  );
  return response.data;
};

export const getAttendanceSession = async (
  sessionId: string,
): Promise<AttendanceSession> => {
  const response = await api.get<AttendanceSession>(
    `/api/v1/attendance/session/${sessionId}`,
  );
  return response.data;
};

export interface DailyAttendanceStats {
  date: string;
  total_sessions: number;
  total_present: number;
  attendance_percentage: number;
}

export interface AnalyticsOverview {
  total_students: number;
  total_active_sessions: number;
  average_attendance_rate: number;
  average_confidence_score: number;
  weekly_trend: DailyAttendanceStats[];
}

export interface StudentRanking {
  id: string;
  name: string;
  score: number;
}

export interface AnalyticsSummaryResponse {
  total_students: number;
  total_classrooms: number;
  total_sessions_completed: number;
  overall_attendance_rate: number;
  average_confidence: number;
  total_flagged_records: number;
  report_period: string;
  most_attended_class?: string;
  lowest_attendance_class?: string;
  top_students: StudentRanking[];
}

// ... existing code ...

export const getDashboardAnalytics = async (params?: {
  classroom_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AnalyticsOverview> => {
  const response = await api.get<AnalyticsOverview>(
    "/api/v1/analytics/dashboard",
    { params }
  );
  return response.data;
};

export const getAnalyticsSummary = async (params?: {
  classroom_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AnalyticsSummaryResponse> => {
  const response = await api.get<AnalyticsSummaryResponse>(
    "/api/v1/analytics/summary",
    { params },
  );
  return response.data;
};

// --- Motivation Scoring (Day 24 - Thiviru) ---

export interface ClassroomProgress {
  motivation_score: number;
  unlocked_badges: string[];
}

export interface StudentMotivationResponse {
  classroom_progress: Record<string, ClassroomProgress>;
}

/**
 * Fetches a student's classroom_progress from the backend.
 * Returns a dictionary keyed by classroom_id, each containing
 * { motivation_score, unlocked_badges }.
 */
export const getStudentMotivationData = async (
  studentId: string,
): Promise<Record<string, ClassroomProgress>> => {
  const response = await api.get<StudentMotivationResponse>(
    `/api/v1/students/${studentId}`,
  );
  return response.data.classroom_progress || {};
};

export interface StudentAttendanceHistoryResponse {
  student_id: string;
  student_name: string;
  total_sessions: number;
  present_count: number;
  attendance_percentage: number;
  history: any[];
}

export const getStudentAttendanceHistory = async (
  studentId: string,
): Promise<StudentAttendanceHistoryResponse> => {
  const response = await api.get<StudentAttendanceHistoryResponse>(
    `/api/v1/students/${studentId}/attendance`
  );
  return response.data;
};

// --- Flagged Attendance Records (Day 26 - Thiviru) ---

export interface FlaggedRecord {
  id: string;
  student_name: string;
  student_id: string;
  classroom_name: string;
  session_date: string;
  confidence: number;
  status: "pending" | "approved" | "rejected";
  flagged_reason: string;
  image_url?: string;
}

/**
 * Fetches all flagged attendance records.
 * Falls back to mock data when the backend endpoint is not available.
 */
export const getFlaggedRecords = async (classroomId?: string, sessionId?: string): Promise<FlaggedRecord[]> => {
  const params: Record<string, string> = {};
  if (classroomId) params.classroom_id = classroomId;
  if (sessionId) params.session_id = sessionId;
  const response = await api.get<FlaggedRecord[]>("/api/v1/attendance/flagged", { params });
  return response.data;
};

/**
 * Approve or reject a flagged attendance record.
 */
export const updateFlaggedRecord = async (
  recordId: string,
  action: "approve" | "reject",
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `/api/v1/attendance/flagged/${recordId}`,
    { action },
  );
  return response.data;
};

// --- Calendar Events ---

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  location?: string;
  type: "class" | "meeting" | "deadline";
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventCreate {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  type: string;
  color?: string;
}

export interface CalendarEventUpdate {
  title?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  type?: string;
  color?: string;
}

export const getEvents = async (
  month?: number,
  year?: number,
): Promise<CalendarEvent[]> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const response = await api.get<any[]>("/api/v1/events", { params });
  return response.data.map((e: any) => ({ ...e, id: e._id || e.id }));
};

export const createCalendarEvent = async (
  data: CalendarEventCreate,
): Promise<CalendarEvent> => {
  const response = await api.post<any>("/api/v1/events", data);
  return { ...response.data, id: response.data._id || response.data.id };
};

export const updateCalendarEvent = async (
  eventId: string,
  data: CalendarEventUpdate,
): Promise<CalendarEvent> => {
  const response = await api.put<any>(`/api/v1/events/${eventId}`, data);
  return { ...response.data, id: response.data._id || response.data.id };
};

export const deleteCalendarEvent = async (
  eventId: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/v1/events/${eventId}`,
  );
  return response.data;
};

// --- Notifications ---

export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  const response = await api.get<AppNotification[]>("/api/v1/notifications");
  return response.data;
};

export const markNotificationRead = async (
  id: string,
): Promise<AppNotification> => {
  const response = await api.put<AppNotification>(
    `/api/v1/notifications/${id}/read`,
  );
  return response.data;
};

export const markAllNotificationsRead = async (): Promise<{
  message: string;
}> => {
  const response = await api.put<{ message: string }>(
    "/api/v1/notifications/read-all",
  );
  return response.data;
};

export const deleteNotification = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/v1/notifications/${id}`,
  );
  return response.data;
};

export const clearAllNotifications = async (): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    "/api/v1/notifications",
  );
  return response.data;
};

export default api;
