import React, { useEffect, useState } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    message: string;
    title?: string;
    dismissible?: boolean;
    autoDismiss?: boolean;
    autoDismissDelay?: number; // in milliseconds
    onDismiss?: () => void;
    className?: string;
}

const Alert: React.FC<AlertProps> = ({
    type,
    message,
    title,
    dismissible = true,
    autoDismiss = false,
    autoDismissDelay = 5000,
    onDismiss,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss && autoDismissDelay > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, autoDismissDelay);

            return () => clearTimeout(timer);
        }
    }, [autoDismiss, autoDismissDelay]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            setTimeout(onDismiss, 300); // Wait for fade-out animation
        }
    };

    if (!isVisible) return null;

    // Type-specific styles and icons
    const alertStyles = {
        success: {
            container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
            icon: 'text-green-600 dark:text-green-400',
            title: 'text-green-800 dark:text-green-300',
            message: 'text-green-700 dark:text-green-400',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        error: {
            container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
            icon: 'text-red-600 dark:text-red-400',
            title: 'text-red-800 dark:text-red-300',
            message: 'text-red-700 dark:text-red-400',
            iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
            icon: 'text-yellow-600 dark:text-yellow-400',
            title: 'text-yellow-800 dark:text-yellow-300',
            message: 'text-yellow-700 dark:text-yellow-400',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        },
        info: {
            container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
            icon: 'text-blue-600 dark:text-blue-400',
            title: 'text-blue-800 dark:text-blue-300',
            message: 'text-blue-700 dark:text-blue-400',
            iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    };

    const styles = alertStyles[type];

    return (
        <div
            className={`flex items-start p-4 border rounded-lg shadow-sm animate-slideIn ${styles.container} ${className}`}
            role="alert"
            aria-live="polite"
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                <svg
                    className={`w-5 h-5 ${styles.icon}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d={styles.iconPath}></path>
                </svg>
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
                {title && (
                    <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
                        {title}
                    </h3>
                )}
                <p className={`text-sm ${styles.message}`}>{message}</p>
            </div>

            {/* Dismiss Button */}
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className={`flex-shrink-0 ml-4 inline-flex text-sm ${styles.icon} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500 rounded-lg p-1`}
                    aria-label="Dismiss alert"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Alert;
