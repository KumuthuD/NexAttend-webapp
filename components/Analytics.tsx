
import React, { useMemo } from 'react';
import { Classroom, Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  classroom: Classroom;
  students: Student[];
}

const Analytics: React.FC<AnalyticsProps> = ({ classroom, students }) => {

  const attendanceData = useMemo(() => {
    const dataByMonth: { [key: string]: { name: string, present: number, absent: number } } = {};
    classroom.attendance.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!dataByMonth[month]) {
        dataByMonth[month] = { name: month, present: 0, absent: 0 };
      }
      if (record.status === 'present' || record.status === 'late') {
        dataByMonth[month].present++;
      } else {
        dataByMonth[month].absent++;
      }
    });
    return Object.values(dataByMonth);
  }, [classroom.attendance]);
  
  const studentAttendanceCount = useMemo(() => {
    const counts: { [studentId: string]: number } = {};
    students.forEach(s => counts[s.id] = 0);
    classroom.attendance.forEach(record => {
      if(record.status === 'present' || record.status === 'late') {
          if(counts[record.studentId] !== undefined) {
              counts[record.studentId]++;
          }
      }
    });
    return Object.entries(counts)
        .map(([studentId, count]) => ({ studentId, name: students.find(s=>s.id === studentId)?.name || 'Unknown', count }))
        .sort((a, b) => b.count - a.count);
  }, [classroom.attendance, students]);

  const totalPossibleAttendances = useMemo(() => {
      const uniqueDates = new Set(classroom.attendance.map(a => a.date));
      return uniqueDates.size * students.length;
  }, [classroom.attendance, students]);

  const overallAttendanceRate = useMemo(() => {
      const totalPresents = classroom.attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      return totalPossibleAttendances > 0 ? ((totalPresents / totalPossibleAttendances) * 100).toFixed(1) : '0.0';
  }, [classroom.attendance, totalPossibleAttendances]);

  const mostAttended = studentAttendanceCount.slice(0, 3);
  const leastAttended = [...studentAttendanceCount].reverse().slice(0, 3);

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300">Overall Attendance</h3>
            <p className="text-4xl font-bold text-violet-400">{overallAttendanceRate}%</p>
         </div>
         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300">Total Students</h3>
            <p className="text-4xl font-bold text-violet-400">{students.length}</p>
         </div>
         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-300">Sessions Logged</h3>
            <p className="text-4xl font-bold text-violet-400">{new Set(classroom.attendance.map(a => a.date)).size}</p>
         </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-violet-300 mb-4">Monthly Attendance Trends</h3>
        {attendanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              <Legend />
              <Bar dataKey="present" fill="#8b5cf6" name="Present" />
              <Bar dataKey="absent" fill="#ec4899" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400 text-center py-10">No attendance data to display.</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-violet-300 mb-4">Most Attended Students</h3>
            <ul className="space-y-2">
                {mostAttended.map(s => <li key={s.studentId} className="flex justify-between items-center text-gray-300"><span className="font-medium">{s.name}</span><span className="text-green-400 font-bold">{s.count} sessions</span></li>)}
            </ul>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-violet-300 mb-4">Least Attended Students</h3>
            <ul className="space-y-2">
                {leastAttended.map(s => <li key={s.studentId} className="flex justify-between items-center text-gray-300"><span className="font-medium">{s.name}</span><span className="text-red-400 font-bold">{s.count} sessions</span></li>)}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
