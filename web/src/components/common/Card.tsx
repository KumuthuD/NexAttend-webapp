import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    description,
    footer,
    noPadding = false,
}) => {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-sm ${className}`}>
            {(title || description) && (
                <div className="px-6 py-4 border-b border-gray-700/50">
                    {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                    {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
                </div>
            )}

            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
