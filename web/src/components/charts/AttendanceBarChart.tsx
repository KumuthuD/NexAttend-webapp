import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const mockData = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 90 },
    { name: 'Wed', attendance: 78 },
    { name: 'Thu', attendance: 92 },
    { name: 'Fri', attendance: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                <p className="text-violet-600 dark:text-violet-400 font-bold">
                    Attendance: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

const AttendanceBarChart: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/[0.06] transition-colors duration-300 w-full h-[300px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Attendance Overview</h3>
            <div className="w-full h-full -ml-4">
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                        data={mockData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar 
                            dataKey="attendance" 
                            fill="#8b5cf6" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AttendanceBarChart;
