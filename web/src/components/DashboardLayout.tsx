import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon } from './icons';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0f1117] transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Header for Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/[0.06] z-40 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <span className="ml-3 font-bold text-lg text-gray-900 dark:text-white">NexAttend</span>
            </div>

            <main className="flex-1 lg:ml-64 p-4 lg:p-10 relative mt-16 lg:mt-0 w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
