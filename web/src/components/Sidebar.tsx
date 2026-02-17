import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LogoIcon,
  HomeIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
  XMarkIcon
} from './icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();


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
    if (onClose) onClose(); // Close sidebar on mobile after navigation
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0f1117] border-r border-gray-100 dark:border-white/[0.06] 
        text-gray-800 dark:text-white flex flex-col font-sans z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-1 flex flex-col overflow-y-auto px-4">

          {/* Logo Section */}
          <div className="flex items-center justify-between py-7 px-2">
            <div className="flex items-center gap-2">
              <LogoIcon className="w-10 h-10" />
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">NexAttend</h1>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-1 bg-violet-500 rounded-full dark:bg-white/[0.1] mb-4 transition-colors duration-300" />

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
          <div
            onClick={() => handleNavigation('/profile')}
            className="mt-auto flex items-center gap-3 px-3 py-3 mb-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors duration-200 group border border-transparent hover:border-gray-100 dark:hover:border-white/[0.06]"
          >
            <div className="relative">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=e5e7eb&textColor=374151`}
                alt="User"
                className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-gray-800"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0f1117] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate transition-colors duration-300">{user?.name}</p>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
