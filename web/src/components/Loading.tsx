import React from 'react';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse';

interface LoadingProps {
    size?: LoadingSize;
    variant?: LoadingVariant;
    text?: string;
    centered?: boolean;
    fullScreen?: boolean;
    color?: string;
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    variant = 'spinner',
    text,
    centered = false,
    fullScreen = false,
    color = 'text-blue-600',
    className = '',
}) => {
    // Size classes for different variants
    const sizeClasses = {
        spinner: {
            sm: 'w-4 h-4 border-2',
            md: 'w-8 h-8 border-2',
            lg: 'w-12 h-12 border-3',
            xl: 'w-16 h-16 border-4',
        },
        dots: {
            sm: 'w-1.5 h-1.5',
            md: 'w-2.5 h-2.5',
            lg: 'w-4 h-4',
            xl: 'w-6 h-6',
        },
        pulse: {
            sm: 'w-8 h-8',
            md: 'w-12 h-12',
            lg: 'w-16 h-16',
            xl: 'w-24 h-24',
        },
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    // Spinner variant (rotating circle)
    const SpinnerLoader = () => (
        <div
            className={`${sizeClasses.spinner[size]} border-gray-200 dark:border-gray-700 border-t-current ${color} rounded-full animate-spin`}
            role="status"
            aria-label="Loading"
        />
    );

    // Dots variant (bouncing dots)
    const DotsLoader = () => (
        <div className="flex space-x-2" role="status" aria-label="Loading">
            <div
                className={`${sizeClasses.dots[size]} ${color} rounded-full animate-bounce`}
                style={{ animationDelay: '0ms' }}
            />
            <div
                className={`${sizeClasses.dots[size]} ${color} rounded-full animate-bounce`}
                style={{ animationDelay: '150ms' }}
            />
            <div
                className={`${sizeClasses.dots[size]} ${color} rounded-full animate-bounce`}
                style={{ animationDelay: '300ms' }}
            />
        </div>
    );

    // Pulse variant (expanding circle)
    const PulseLoader = () => (
        <div className="relative" role="status" aria-label="Loading">
            <div
                className={`${sizeClasses.pulse[size]} ${color} rounded-full opacity-75 animate-ping absolute`}
            />
            <div
                className={`${sizeClasses.pulse[size]} ${color} rounded-full opacity-40`}
            />
        </div>
    );

    // Select the loader based on variant
    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return <DotsLoader />;
            case 'pulse':
                return <PulseLoader />;
            case 'spinner':
            default:
                return <SpinnerLoader />;
        }
    };

    // Container classes
    const containerClasses = [
        'flex flex-col items-center justify-center gap-3',
        centered && 'min-h-[200px]',
        fullScreen && 'fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm z-50',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={containerClasses}>
            {renderLoader()}
            {text && (
                <p
                    className={`${textSizeClasses[size]} ${color} font-medium animate-pulse`}
                >
                    {text}
                </p>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Loading;
