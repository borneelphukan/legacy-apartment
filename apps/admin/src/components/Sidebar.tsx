import React from 'react';
import { useRouter } from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PaymentsIcon from '@mui/icons-material/Payments';
import GavelIcon from '@mui/icons-material/Gavel';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarProps {
  activeTab: 'dashboard' | 'announcements' | 'residents' | 'rules' | 'complaints' | 'finance' | 'none';
  onTabChange?: (tab: 'dashboard' | 'announcements' | 'residents' | 'rules' | 'complaints' | 'finance') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon className="size-5" />
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      icon: <CampaignIcon className="size-5" />
    },
    { 
      id: 'residents', 
      label: 'Residents', 
      icon: <ApartmentIcon className="size-5" />
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: <PaymentsIcon className="size-5" />
    },
    { 
      id: 'rules', 
      label: 'Rules', 
      icon: <GavelIcon className="size-5" />
    },
    { 
      id: 'complaints', 
      label: 'Complaints', 
      icon: <FeedbackIcon className="size-5" />
    },
  ];

  const handleNavClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id as any);
    } else {
      // If we are on a page where state management isn't local (like finance/[id]), navigate home
      router.push(`/?tab=${id}`);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`w-64 bg-white border-r border-gray-500 flex flex-col fixed h-screen z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-8 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => router.push('/')}>
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-100">
              Legacy <span className="text-orange-500">Admin</span>
            </h2>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <CloseIcon className="size-6 text-gray-100" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-gray-500 text-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-all duration-300 text-gray-100 hover:text-orange-500"
          >
            <LogoutIcon className="size-5" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
