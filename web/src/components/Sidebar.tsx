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
  ];

  const secondaryItems = [
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

        {/* Primary Menu */}
        <nav className="space-y-1 mb-6 mt-4">
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

        {/* Divider */}
        <div className="h-[1px] bg-white/20 mb-6"></div>

        {/* Secondary Menu */}
        <nav className="space-y-1 mb-auto">
          {secondaryItems.map((item) => {
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

        {/* Illustration Card - Upgrade */}
        <div className="mt-6 mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#6B6FE8] to-[#8B5FED] p-4">
          {/* Decorative elements */}
          <div className="absolute top-2 left-2">
            <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="absolute top-6 right-4">
            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          {/* Illustration - simplified representation */}
          <div className="relative z-10 flex flex-col items-center py-3">
            {/* Chart illustration */}
            <div className="mb-3 relative">
              <div className="w-24 h-16 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 flex items-end justify-around p-2 gap-1">
                <div className="w-3 bg-blue-400 rounded-t" style={{ height: '40%' }}></div>
                <div className="w-3 bg-purple-400 rounded-t" style={{ height: '70%' }}></div>
                <div className="w-3 bg-pink-400 rounded-t" style={{ height: '50%' }}></div>
              </div>
              {/* Gift boxes */}
              <div className="absolute -bottom-1 -left-2 w-6 h-6 bg-yellow-400 rounded"></div>
              <div className="absolute -bottom-1 left-6 w-5 h-5 bg-orange-400 rounded"></div>
            </div>

            {/* Person illustration - simplified */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-16 h-20 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-400 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-5 h-5 bg-red-400 rounded-full relative">
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>
                </div>
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
              </div>
            </div>

            <button className="w-full bg-[#7B5FED] hover:bg-[#6B4FDD] text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-lg">
              Upgrade for Free
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-t border-white/20 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
          <div className="relative">
            <img
              src={profileImg}
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#7B7FED] rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 font-medium">Welcome back 👋</p>
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
