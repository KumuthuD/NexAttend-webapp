import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// ─── Mock Data per period ─────────────────────────────────────────────────────

const WEEK_DATA = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 90 },
    { name: 'Wed', attendance: 78 },
    { name: 'Thu', attendance: 92 },
    { name: 'Fri', attendance: 88 },
];

const MONTH_DATA = [
    { name: 'Wk 1', attendance: 82 },
    { name: 'Wk 2', attendance: 87 },
    { name: 'Wk 3', attendance: 91 },
    { name: 'Wk 4', attendance: 84 },
];

const SEMESTER_DATA = [
    { name: 'Jan', attendance: 88 },
    { name: 'Feb', attendance: 83 },
    { name: 'Mar', attendance: 90 },
    { name: 'Apr', attendance: 76 },
    { name: 'May', attendance: 93 },
    { name: 'Jun', attendance: 87 },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#1a1d2e] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-white/[0.08]">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-1">{label}</p>
                <p className="text-violet-600 dark:text-violet-400 font-bold text-sm">
                    {payload[0].value}% attended
                </p>
            </div>
        );
    }
    return null;
};

// ─── Component ─────────────────────────────────────────────────────────────────

export interface AttendanceBarChartProps {
    period?: 'Week' | 'Month' | 'Semester';
    classroom?: string;
    /** When provided, overrides the built-in mock data */
    data?: { name: string; attendance: number }[];
}

const AttendanceBarChart: React.FC<AttendanceBarChartProps> = ({
    period = 'Week',
    classroom,
    data: externalData,
}) => {
    const dataMap = {
        Week: WEEK_DATA,
        Month: MONTH_DATA,
        Semester: SEMESTER_DATA,
    };
    const titleMap = {
        Week: 'Weekly Attendance Overview',
        Month: 'Monthly Attendance Overview',
        Semester: 'Semester Attendance Overview',
    };

    const data = externalData || dataMap[period];
    const title = titleMap[period];

    return (
        <div className="w-full">
            {/* Sub-header */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                {classroom && classroom !== 'All Classrooms' ? classroom : 'All Classrooms'} · {title}
            </p>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                        opacity={0.25}
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={8}
                    />
                    <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                    <Bar
                        dataKey="attendance"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceBarChart;
