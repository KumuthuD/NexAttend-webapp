
import React, { useState, useMemo } from 'react';
import { Classroom, Student, Teacher, User, UserRole, AttendanceRecord } from '../types';
import Analytics from './Analytics';
import AttendanceTaker from './AttendanceTaker';

interface ClassroomViewProps {
  classroom: Classroom;
  students: Student[];
  currentUser: User;
  onBack: () => void;
  updateClassroom: (updatedClassroom: Classroom) => void;
}

const ClassroomView: React.FC<ClassroomViewProps> = ({ classroom, students, currentUser, onBack, updateClassroom }) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  
  const classroomStudents = useMemo(() => {
    return students.filter(s => classroom.studentIds.includes(s.id));
  }, [students, classroom.studentIds]);

  const handleAttendanceUpdate = (presentStudentIds: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newAttendance: AttendanceRecord[] = classroomStudents.map(student => ({
      studentId: student.id,
      date: today,
      status: presentStudentIds.includes(student.id) ? 'present' : 'absent',
    }));
    
    // Remove any existing records for today to avoid duplicates
    const otherDaysAttendance = classroom.attendance.filter(a => a.date !== today);
    const updatedClassroom = {
      ...classroom,
      attendance: [...otherDaysAttendance, ...newAttendance],
    };
    updateClassroom(updatedClassroom);
  };

  const getAttendanceForDate = (date: string) => {
    return classroom.attendance.filter(a => a.date === date);
  }

  const uniqueDates = [...new Set(classroom.attendance.map(a => a.date))].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  const TabButton: React.FC<{tabName: string; label: string}> = ({tabName, label}) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       {isTakingAttendance && currentUser.role === UserRole.Teacher && (
        <AttendanceTaker 
            students={classroomStudents} 
            onClose={() => setIsTakingAttendance(false)} 
            onAttendanceUpdate={handleAttendanceUpdate} 
        />
       )}
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-4 text-violet-400 hover:text-violet-300">&larr; Back to Dashboard</button>
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
          <p className="text-lg text-gray-400">{classroom.subject}</p>
          {currentUser.role === UserRole.Teacher && <p className="text-sm text-gray-500 mt-2">Access Code: <span className="font-mono bg-gray-700 text-pink-400 px-2 py-1 rounded">{classroom.accessCode}</span></p>}
        </div>

        <div className="flex space-x-2 border-b border-gray-700 mb-6">
            <TabButton tabName="attendance" label="Attendance" />
            <TabButton tabName="assignments" label="Assignments" />
            <TabButton tabName="communication" label="Communication" />
            {currentUser.role === UserRole.Teacher && <TabButton tabName="analytics" label="Analytics" />}
        </div>

        <div>
          {activeTab === 'attendance' && (
            <div>
              {currentUser.role === UserRole.Teacher && (
                <button onClick={() => setIsTakingAttendance(true)} className="mb-6 w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
                    Take Today's Attendance
                </button>
              )}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
                {uniqueDates.length > 0 ? uniqueDates.map(date => (
                  <div key={date} className="mb-4 p-4 bg-gray-900 rounded-lg">
                    <h3 className="font-semibold text-violet-300">{new Date(date).toDateString()}</h3>
                    <ul className="mt-2 space-y-2">
                        {getAttendanceForDate(date).map(record => {
                            const student = classroomStudents.find(s => s.id === record.studentId);
                            if (!student) return null;
                             if (currentUser.role === UserRole.Student && currentUser.id !== student.id) return null;
                            
                            return (
                                <li key={record.studentId} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                    <div className="flex items-center gap-3">
                                        <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full" />
                                        <span>{student.name}</span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                        record.status === 'present' ? 'bg-green-500/20 text-green-400' : 
                                        record.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' : 
                                        'bg-red-500/20 text-red-400'}`
                                    }>{record.status.toUpperCase()}</span>
                                </li>
                            );
                        })}
                    </ul>
                  </div>  
                )) : <p className="text-gray-400">No attendance records yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Assignments & Notes</h2>
              <p className="text-gray-400">Feature coming soon.</p>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Communication Hub</h2>
              <p className="text-gray-400">Feature coming soon.</p>
            </div>
          )}
          
          {activeTab === 'analytics' && currentUser.role === UserRole.Teacher && (
             <Analytics classroom={classroom} students={classroomStudents} />
          )}

        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
