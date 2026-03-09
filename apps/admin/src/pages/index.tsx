import { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultLayout from '@/layout/DefaultLayout';
import { useRouter } from 'next/router';
import Announcements from '@/components/Announcements';
import Residents from '@/components/Residents';
import Sidebar from '@/components/Sidebar';
 
const API_BASE_URL = 'http://localhost:4000';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements' | 'residents'>('dashboard');
  const [stats, setStats] = useState({
    residents: 0,
    announcements: 0,
  });

  useEffect(() => {
    if (router.query.tab) 
      setActiveTab(router.query.tab as any);
  }, [router.query.tab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resResponse, annResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/residents`),
          fetch(`${API_BASE_URL}/announcements`)
        ]);
        
        const residents = resResponse.ok ? await resResponse.json() : [];
        const announcements = annResponse.ok ? await annResponse.json() : [];
        
        setStats({
          residents: Array.isArray(residents) ? residents.length : 0,
          announcements: Array.isArray(announcements) ? announcements.length : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DefaultLayout>
      <Head>
        <title>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'announcements' ? 'Announcements' : 'Residents'} | Legacy Apartment Admin</title>
      </Head>

      <div className="flex min-h-screen bg-gray-50 text-gray-100">
        
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
                  { label: 'Total Residents', value: stats.residents.toString() },
                  { label: 'Active Announcements', value: stats.announcements.toString() },
                  { label: 'Pending Requests', value: '12' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-xl border border-gray-500">
                    <p className="text-xs font-bold text-gray-100 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-4xl font-black text-gray-100`}>{stat.value}</p>
                  </div>
                ))}
              </div>


            </div>
          ) : activeTab === 'announcements' ? (
            <div className="max-w-5xl mx-auto">
              <Announcements />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <Residents />
            </div>
          )}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default AdminDashboard;
