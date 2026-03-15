import React from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@legacy-apartment/ui';

interface SidebarProps {
  activeTab: 'dashboard' | 'announcements' | 'residents' | 'rules' | 'complaints' | 'finance' | 'committee' | 'settings' | 'documents' | 'gallery' | 'none';
  onTabChange?: (tab: 'dashboard' | 'announcements' | 'residents' | 'rules' | 'complaints' | 'finance' | 'committee' | 'settings' | 'documents' | 'gallery') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
  const router = useRouter();
  const [isPresident, setIsPresident] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsPresident(user?.role === 'president');
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <Icon type="dashboard" className="text-[20px]" />
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      icon: <Icon type="campaign" className="text-[20px]" />
    },
    { 
      id: 'residents', 
      label: 'Residents', 
      icon: <Icon type="apartment" className="text-[20px]" />
    },
    { 
      id: 'committee', 
      label: 'Committee', 
      icon: <Icon type="group" className="text-[20px]" />
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: <Icon type="payments" className="text-[20px]" />
    },
    { 
      id: 'rules', 
      label: 'Rules', 
      icon: <Icon type="gavel" className="text-[20px]" />
    },
    { 
      id: 'complaints', 
      label: 'Complaints', 
      icon: <Icon type="feedback" className="text-[20px]" />
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: <Icon type="description" className="text-[20px]" />
    },
    { 
      id: 'gallery', 
      label: 'Gallery', 
      icon: <Icon type="collections_bookmark" className="text-[20px]" />
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
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-100">
              Legacy <span className="text-orange-500">Admin</span>
            </h2>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 transition-colors"
          >
            <Icon type="close" className="text-[24px] text-gray-100" />
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

        <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
          {isPresident && (
            <button 
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-100 hover:bg-orange-50 hover:text-orange-500'
              }`}
            >
              <Icon type="settings" className="text-[20px]" />
              <span className="font-bold text-sm">Settings</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-all duration-300 text-gray-100 hover:text-orange-500"
          >
            <Icon type="logout" className="text-[20px]" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
