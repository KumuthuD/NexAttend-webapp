
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Ensure these icons are exported from your icons.js or replace with imports from a library like heroicons
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
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from './icons';

import profileImg from '../assets/team/kumuthu.jpg'; // Placeholder, replace with real user image or generic avatar

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('dashboard');

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
    { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-5 h-5" />, path: '/analytics' },
    { id: 'profile', label: 'My Profile', icon: <UserCircleIcon className="w-5 h-5" />, path: '/profile' },
  ];

  const handleNavigation = (path: string, id: string) => {
    setActiveLink(id);
    navigate(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#4A88E5] to-[#5D5FEF] text-white flex flex-col font-sans shadow-2xl z-50">
      
      {/* Scrollbar Track (Visual Only as CSS scrollbar handling needs global css) */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative px-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 py-8 px-2">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NexAttend</h1>
        </div>

        {/* Primary Menu */}
        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${activeLink === item.id 
                  ? 'bg-white text-[#4A88E5] font-bold shadow-lg shadow-black/5' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-px bg-white/20 mx-2 mb-8"></div>

        {/* Secondary Menu */}
        <nav className="space-y-2 mb-auto">
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${activeLink === item.id 
                  ? 'bg-white text-[#4A88E5] font-bold shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Pro Card */}
        <div className="mt-8 mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5D5FEF] via-[#7B61FF] to-[#9D68F7] p-4 text-center border border-white/10">
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
            
            <p className="relative z-10 text-xs text-white/90 font-medium mb-3">Upgrade to Pro for more features</p>
            <button className="relative z-10 w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg">
                Upgrade for Free
            </button>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-t border-white/10 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
            <div className="relative">
                <img src={profileImg} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#5D5FEF] rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 font-medium truncate">Welcome back 👋</p>
                <p className="text-sm font-bold text-white truncate">Dr. Evelyn Reed</p>
            </div>
             <ArrowRightOnRectangleIcon className="w-5 h-5 text-white/60 hover:text-white transition-colors" />
        </div>

      </div>
      
      {/* Logout Button Absolute Top Right (as in design? actually design shows logout top right of main content, not sidebar. 
          The sidebar usually has the profile. The design shows Logout in the top header. I will keep sidebar clean.) 
      */}

    </aside>
  );
};

export default Sidebar;
