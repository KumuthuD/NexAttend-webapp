import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogoIcon,
  HomeIcon,
  CalendarIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
  SparklesIcon
} from './icons';

import profileImg from '../assets/team/kumuthu.jpg';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' },
    { id: 'features', label: 'Features', icon: <SparklesIcon className="w-5 h-5" />, path: '/features' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" />, path: '/calendar' },
    { id: 'contact', label: 'Contact', icon: <EnvelopeIcon className="w-5 h-5" />, path: '/contact' },
    { id: 'about', label: 'About Us', icon: <InformationCircleIcon className="w-5 h-5" />, path: '/about' },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" />, path: '/notifications' },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" />, path: '/settings' },
    { id: 'support', label: 'Support', icon: <QuestionMarkCircleIcon className="w-5 h-5" />, path: '/support' },
    { id: 'analytics', label: 'Analitics', icon: <ChartBarIcon className="w-5 h-5" />, path: '/analytics' },
    { id: 'profile', label: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" />, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#52C1E5] to-[#7B7FED] text-white flex flex-col font-sans shadow-xl z-50">

      <div className="flex-1 flex flex-col overflow-y-auto px-4">

        {/* Logo Section */}
        <div className="flex items-center gap-3 py-6 px-2">
          <div className="w-12 h-12 bg-[#3B5BA5] rounded-xl flex items-center justify-center shadow-md">
            <LogoIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NexAttend</h1>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/30 mb-6" />

        {/* Primary Menu */}
        <nav className="space-y-3.5 mb-6 mt-4">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-white text-[#7B7FED] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                  }
                `}
              >
                <span className={active ? 'text-[#7B7FED]' : 'text-white/90'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto flex items-center gap-3 px-3 py-4 mb-4 border-t border-white/20 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
          <div className="relative">
            <img
              src={profileImg}
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#7B7FED] rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">John Doe</p>
          </div>
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
