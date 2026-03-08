import React from 'react';
import Head from 'next/head';
import DefaultLayout from '@/layout/DefaultLayout';
import { Button } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Dashboard | Legacy Apartment Admin</title>
      </Head>

      <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
        
        {/* Brand/Header Area */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                Admin <span className="text-orange-500">Dashboard</span>
              </h1>
              <p className="mt-2 font-light text-lg">
                Welcome back! Here's an overview of the society management.
              </p>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={handleLogout}
              className="!bg-white !text-gray-700 border border-gray-200 hover:!bg-red-50 transition-all rounded-2xl px-6 py-3 shadow-sm"
            >
              Logout
            </Button>
          </div>

          {/* New Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div 
              onClick={() => router.push('/announcement')}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:border-orange-500/30 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Announcements</h2>
              <p className="text-gray-500 font-light">
                Broadcast new updates, news, or alerts to the entire community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminDashboard;
