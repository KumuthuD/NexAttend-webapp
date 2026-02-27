import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award } from 'lucide-react';
import MotivationBadge, { BadgeTier } from './MotivationBadge';

interface MotivationScoreDisplayProps {
    score: number;
    unlockedBadges: string[];
}

// Milestone definitions from documentation
const MILESTONES: { tier: BadgeTier; requiredPoints: number;}[] = [
    { tier: 'Starter', requiredPoints: 0.5},
    { tier: 'Bronze', requiredPoints: 2.5},
    { tier: 'Silver', requiredPoints: 4.0},
    { tier: 'Gold', requiredPoints: 6.0},
    { tier: 'Perfect', requiredPoints: 7.5},
];

const MAX_SCORE = 7.5; // Expected max points per typical semester

const MotivationScoreDisplay: React.FC<MotivationScoreDisplayProps> = ({ score, unlockedBadges }) => {
    // Determine progress and next milestone
    const progressPercentage = Math.min((score / MAX_SCORE) * 100, 100);
    const highestBadge = [...MILESTONES].reverse().find(m => score >= m.requiredPoints);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6 shadow-sm mb-6 transition-colors duration-300"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Award size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">Motivation Score</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Earn points by attending lectures</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 drop-shadow-sm">{score.toFixed(1)}</span>
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ {MAX_SCORE}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Badge Showcase */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Target size={14} className="text-gray-400" />
                    Badge Collection
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {MILESTONES.map((milestone, index) => {
                        // A badge is unlocked if its name is in the array OR if the score is sufficient.
                        // Based on specs, backend handles array push, but we can double check score for robustness.
                        const isUnlocked = unlockedBadges.includes(milestone.tier) || score >= milestone.requiredPoints;

                        return (
                            <div key={milestone.tier} className="flex flex-col items-center gap-2 group">
                                <MotivationBadge
                                    tier={milestone.tier}
                                    unlocked={isUnlocked}
                                    size="lg"
                                />
                                <div className="text-center">
                                    <span className={`block text-xs font-bold ${isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                                        {milestone.tier}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Highest Badge Highlight - Optional but adds UI polish */}
            {highestBadge && (
                <div className="mt-6 p-4 rounded-xl border border-violet-100 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 flex items-center justify-center gap-3">
                    <MotivationBadge tier={highestBadge.tier} unlocked={true} size="sm" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Current Badge: <span className="font-bold text-violet-700 dark:text-violet-400">{highestBadge.tier}</span>
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default MotivationScoreDisplay;
