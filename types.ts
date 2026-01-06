
export enum UserRole {
  Teacher = 'teacher',
  Student = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string; 
}

export interface Student extends User {
  role: UserRole.Student;
  studentId: string;
  faceImage: string; // base64 string of the student's registration photo
}

export interface Teacher extends User {
  role: UserRole.Teacher;
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  fileUrl?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  text: string;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  accessCode: string;
  studentIds: string[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  messages: Message[];
}
