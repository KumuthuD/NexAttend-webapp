
import { Student, Teacher, Classroom, UserRole } from './types';

// Using picsum for placeholder student photos. In a real app, these would be user-uploaded base64 strings.
// Note: Direct image URLs are used here for simplicity. The AI service would need base64 data.
// We will simulate fetching and converting these to base64 in the app.

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', role: UserRole.Student, studentId: 'S001', avatar: 'https://i.pravatar.cc/150?u=s1', faceImage: 'https://picsum.photos/seed/s1/200/200' },
  { id: 's2', name: 'Bob Williams', email: 'bob@example.com', role: UserRole.Student, studentId: 'S002', avatar: 'https://i.pravatar.cc/150?u=s2', faceImage: 'https://picsum.photos/seed/s2/200/200' },
  { id: 's3', name: 'Charlie Brown', email: 'charlie@example.com', role: UserRole.Student, studentId: 'S003', avatar: 'https://i.pravatar.cc/150?u=s3', faceImage: 'https://picsum.photos/seed/s3/200/200' },
  { id: 's4', name: 'Diana Miller', email: 'diana@example.com', role: UserRole.Student, studentId: 'S004', avatar: 'https://i.pravatar.cc/150?u=s4', faceImage: 'https://picsum.photos/seed/s4/200/200' },
];

export const MOCK_TEACHER: Teacher = {
  id: 't1',
  name: 'Dr. Evelyn Reed',
  email: 'evelyn.reed@example.com',
  role: UserRole.Teacher,
  avatar: 'https://i.pravatar.cc/150?u=t1',
};

export const MOCK_CLASSROOMS: Classroom[] = [
  {
    id: 'c1',
    name: 'Advanced Quantum Physics',
    subject: 'Physics',
    teacherId: 't1',
    accessCode: 'PHY-Q7',
    studentIds: ['s1', 's2', 's3'],
    attendance: [
        { studentId: 's1', date: '2024-07-20', status: 'present' },
        { studentId: 's2', date: '2024-07-20', status: 'present' },
        { studentId: 's3', date: '2024-07-20', status: 'absent' },
        { studentId: 's1', date: '2024-07-21', status: 'present' },
        { studentId: 's2', date: '2024-07-21', status: 'late' },
        { studentId: 's3', date: '2024-07-21', status: 'present' },
    ],
    assignments: [
        { id: 'a1', title: 'Chapter 3 Problem Set', dueDate: '2024-08-01' },
    ],
    messages: [
        {id: 'm1', userId: 't1', userName: 'Dr. Evelyn Reed', timestamp: '2024-07-21T10:00:00Z', text: 'Welcome to class! Please review the syllabus.'}
    ]
  },
  {
    id: 'c2',
    name: 'Introduction to AI',
    subject: 'Computer Science',
    teacherId: 't1',
    accessCode: 'CS-A1',
    studentIds: ['s2', 's4'],
    attendance: [],
    assignments: [],
    messages: [],
  }
];
