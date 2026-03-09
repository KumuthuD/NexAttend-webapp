import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DAILY_DATA = [
    { label: 'Mon 17', attendance: 88 },
    { label: 'Tue 18', attendance: 92 },
    { label: 'Wed 19', attendance: 79 },
    { label: 'Thu 20', attendance: 95 },
    { label: 'Fri 21', attendance: 85 },
    { label: 'Mon 24', attendance: 90 },
    { label: 'Tue 25', attendance: 93 },
];

const WEEKLY_DATA = [
    { label: 'Week 1', attendance: 82 },
    { label: 'Week 2', attendance: 87 },
    { label: 'Week 3', attendance: 79 },
    { label: 'Week 4', attendance: 91 },
    { label: 'Week 5', attendance: 88 },
    { label: 'Week 6', attendance: 94 },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#1a1d2e] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-white/[0.08]">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    {payload[0].value}% attended
                </p>
            </div>
        );
    }
    return null;
};

// ─── View Toggle ──────────────────────────────────────────────────────────────

type TrendView = 'Daily' | 'Weekly';
const VIEWS: TrendView[] = ['Daily', 'Weekly'];

// ─── Component ────────────────────────────────────────────────────────────────

interface AttendanceTrendChartProps {
    /** Optional: classroom name shown in the subtitle */
    classroom?: string;
    /** When provided, overrides the built-in mock data */
    data?: { label: string; attendance: number }[];
}

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ classroom, data: externalData }) => {
    const [view, setView] = useState<TrendView>('Daily');

    const data = externalData || (view === 'Daily' ? DAILY_DATA : WEEKLY_DATA);

    return (
        <div className="w-full">
            {/* Card sub-header: subtitle + toggle */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {classroom && classroom !== 'All Classrooms' ? classroom : 'All Classrooms'} · Attendance %
                </p>

                {/* Daily / Weekly toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/[0.05] rounded-lg p-0.5">
                    {VIEWS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 ${
                                view === v
                                    ? 'bg-white dark:bg-[#1a1d2e] text-violet-600 dark:text-violet-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                        opacity={0.25}
                    />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        dy={8}
                    />
                    <YAxis
                        domain={[60, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="attendance"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#attendanceGradient)"
                        dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceTrendChart;
