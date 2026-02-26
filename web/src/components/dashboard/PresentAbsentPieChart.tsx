import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface PresentAbsentPieChartProps {
    presentCount: number;
    absentCount: number;
    className?: string;
}

const PresentAbsentPieChart: React.FC<PresentAbsentPieChartProps> = ({
    presentCount,
    absentCount,
    className = ""
}) => {
    const data = [
        { name: 'Present', value: presentCount },
        { name: 'Absent', value: absentCount },
    ];

    const total = presentCount + absentCount;

    // Colors based on theme and common UI patterns for present/absent
    const COLORS = ['#10b981', '#f43f5e']; // emerald-500, rose-500

    // Custom label to show percentage 
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // Don't show labels for tiny slices

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-white dark:bg-[#1e2028] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 ${className}`}
        >
            <div className="flex flex-col items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white w-full text-left">Attendance Breakdown</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 w-full text-left mt-1">Based on today's classes</p>
            </div>

            <div className="h-64 w-full">
                {total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={90}
                                innerRadius={45} // Making it a donut chart looks nicer and more modern
                                fill="#8884d8"
                                dataKey="value"
                                stroke="rgba(0,0,0,0)" // Removes the border around slices
                                paddingAngle={2} // Adds a small gap between slices for a cleaner look
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    color: '#1f2937'
                                }}
                                itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                                formatter={(value: number) => `${value} Students`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                        No attendance data available yet.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PresentAbsentPieChart;
