import React from 'react';
import { Star, Shield, Award, Trophy, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export type BadgeTier = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Perfect';

interface MotivationBadgeProps {
    tier: BadgeTier;
    unlocked?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

interface BadgeConfig {
    icon: React.ElementType;
    colors: { unlocked: string; locked: string; };
    shadow: string;
    glow?: boolean;
    animate?: boolean;
}

const BADGE_CONFIG: Record<BadgeTier, BadgeConfig> = {
    Starter: {
        icon: Star,
        colors: {
            unlocked: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
            locked: 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800'
        },
        shadow: 'shadow-slate-200 dark:shadow-slate-900/50',
    },
    Bronze: {
        icon: Shield,
        colors: {
            unlocked: 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50',
            locked: 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800'
        },
        shadow: 'shadow-amber-200/50 dark:shadow-amber-900/30',
    },
    Silver: {
        icon: Award,
        colors: {
            unlocked: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
            locked: 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800'
        },
        shadow: 'shadow-slate-300/50 dark:shadow-slate-900/50',
    },
    Gold: {
        icon: Trophy,
        colors: {
            unlocked: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600/50',
            locked: 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800'
        },
        shadow: 'shadow-yellow-200 dark:shadow-yellow-900/40',
        glow: true
    },
    Perfect: {
        icon: Crown,
        colors: {
            unlocked: 'text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-500/50',
            locked: 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800'
        },
        shadow: 'shadow-cyan-200 dark:shadow-cyan-900/40',
        glow: true,
        animate: true
    }
};

const SIZES = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-12 h-12 p-2.5',
    lg: 'w-16 h-16 p-3.5'
};

const MotivationBadge: React.FC<MotivationBadgeProps> = ({
    tier,
    unlocked = false,
    size = 'md'
}) => {
    const config = BADGE_CONFIG[tier];
    const Icon = config.icon;
    const sizeClass = SIZES[size];

    const colors = unlocked ? config.colors.unlocked : config.colors.locked;
    const shadowClass = unlocked ? config.shadow : 'shadow-none';

    // Add glow effect for higher tiers if unlocked
    const glowClass = (unlocked && config.glow) ? 'drop-shadow-md' : '';

    return (
        <motion.div
            className={`
                flex items-center justify-center rounded-full border
                ${sizeClass} ${colors} ${shadowClass} transition-all duration-300
                ${!unlocked ? 'opacity-50 grayscale' : ''}
            `}
            whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
            animate={(unlocked && config.animate) ? {
                y: [0, -4, 0],
                transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            } : {}}
            title={`${tier} Badge ${unlocked ? '(Unlocked)' : '(Locked)'}`}
        >
            <Icon className={`w-full h-full ${glowClass}`} />
        </motion.div>
    );
};

export default MotivationBadge;
