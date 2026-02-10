import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogoIcon,
  HomeIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  UserCircleIcon
} from './icons';

import profileImg from '../assets/team/kumuthu.jpg';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" />, path: '/calendar' },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" />, path: '/notifications' },
    { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-5 h-5" />, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" />, path: '/settings' },
    { id: 'support', label: 'Support', icon: <QuestionMarkCircleIcon className="w-5 h-5" />, path: '/support' },
    { id: 'profile', label: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" />, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0f1117] border-r border-gray-100 dark:border-white/[0.06] text-gray-800 dark:text-white flex flex-col font-sans z-50 transition-colors duration-300">
      <div className="flex-1 flex flex-col overflow-y-auto px-4">

        {/* Logo Section */}
        <div className="flex items-center gap-3 py-7 px-2">
          <div className="w-10 h-10 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-500/20">
            <LogoIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">NexAttend</h1>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 dark:bg-white/[0.06] mb-4 transition-colors duration-300" />

        {/* Section label */}
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-3 transition-colors duration-300">Menu</p>

        {/* Menu */}
        <nav className="space-y-0.5 mb-6">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                  transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  }
                `}
              >
                <span className={active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-violet-500 dark:bg-violet-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto flex items-center gap-3 px-3 py-3 mb-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors duration-200 group border border-transparent hover:border-gray-100 dark:hover:border-white/[0.06]">
          <div className="relative">
            <img
              src={profileImg}
              alt="User"
              className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-white/10"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0f1117] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate transition-colors duration-300">Kumuthu</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-500">Administrator</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
