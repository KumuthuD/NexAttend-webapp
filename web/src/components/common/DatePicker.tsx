import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
    className = '',
    label,
    error,
    helperText,
    id,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                    <Calendar className="h-5 w-5" />
                </div>
                <input
                    type="date"
                    ref={ref}
                    id={inputId}
                    className={`
                        block w-full rounded-lg 
                        bg-white dark:bg-gray-800 
                        border border-gray-300 dark:border-gray-700 
                        text-gray-900 dark:text-white 
                        placeholder-gray-500 dark:placeholder-gray-400 
                        focus:border-indigo-500 focus:ring-indigo-500 
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        transition-colors sm:text-sm
                        pl-10 pr-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            {!error && helperText && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
