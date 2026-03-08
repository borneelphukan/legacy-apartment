import { useState } from 'react';
import Head from 'next/head';
import DefaultLayout from '@/layout/DefaultLayout';
import { useRouter } from 'next/router';
import Announcements from '@/components/Announcements';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements'>('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
  ];

  return (
    <DefaultLayout>
      <Head>
        <title>{activeTab === 'dashboard' ? 'Dashboard' : 'Announcements'} | Legacy Apartment Admin</title>
      </Head>

      <div className="flex min-h-screen bg-gray-50 text-gray-100">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-500 flex flex-col fixed h-screen z-20">
          <div className="p-8">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-100">
              Legacy <span className="text-orange-500">Admin</span>
            </h2>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-orange-500 text-white' 
                    : 'hover:bg-gray-500'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-bold text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-12">
          {activeTab === 'dashboard' ? (
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-lg">
                  Welcome back! Here's an overview of the society management.
                </p>
              </div>

              {/* Quick Stats Grid Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  { label: 'Total Residents', value: '38'},
                  { label: 'Active Announcements', value: '8' },
                  { label: 'Pending Requests', value: '12' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-xl border border-gray-500">
                    <p className="text-xs font-bold text-gray-100 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-4xl font-black text-gray-100`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => setActiveTab('announcements')}
                  className="bg-white p-8 rounded-xl border border-gray-500 hover:border-orange-500 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Manage Announcements</h2>
                  <p className="text-gray-300 text-sm">
                    Broadcast new updates, news, or alerts to the entire community.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <Announcements />
            </div>
          )}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default AdminDashboard;
