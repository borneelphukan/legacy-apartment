import { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultLayout from '@/layout/DefaultLayout';
import { useRouter } from 'next/router';
import Announcements from '@/components/Announcements';
import Residents from '@/components/Residents';
import Rules from '@/components/Rules';
import Complaints from '@/components/Complaints';
import Finance from '@/components/Finance';
import Committee from '@/components/Committee';
import Settings from '@/components/Settings';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import MenuIcon from '@mui/icons-material/Menu';
import Documents from '@/components/Documents';
import Gallery from '@/components/Gallery';


const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements' | 'residents' | 'rules' | 'complaints' | 'finance' | 'committee' | 'settings' | 'documents' | 'gallery'>('dashboard');
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({
    residents: 0,
    announcements: 0,
    rules: 0,
    complaints: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (router.query.tab) 
      setActiveTab(router.query.tab as any);
  }, [router.query.tab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    router.push(`/?tab=${tab}`, undefined, { shallow: true });
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.role) setUserRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resResponse, annResponse, rulesResponse, complaintsResponse] = await Promise.all([
          api.get('/residents').catch(() => ({ data: [] })),
          api.get('/announcements').catch(() => ({ data: [] })),
          api.get('/rules').catch(() => ({ data: [] })),
          api.get('/complaints').catch(() => ({ data: [] }))
        ]);
        
        const residents = resResponse.data || [];
        const announcements = annResponse.data || [];
        const rules = rulesResponse.data || [];
        const complaints = complaintsResponse.data || [];
        
        setStats({
          residents: Array.isArray(residents) ? residents.length : 0,
          announcements: Array.isArray(announcements) ? announcements.length : 0,
          rules: Array.isArray(rules) ? rules.length : 0,
          complaints: Array.isArray(complaints) ? complaints.length : 0,
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
        <title>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | Legacy Apartment Admin</title>
      </Head>

      <div className="flex min-h-screen bg-gray-50 text-gray-100">
        
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 min-w-0 overflow-x-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-400">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-100">
              Legacy <span className="text-orange-500">Admin</span>
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <MenuIcon className="size-8 text-gray-100" />
            </button>
          </div>
          {activeTab === 'dashboard' ? (
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-100">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-lg text-gray-100/80">
                  Welcome back{userRole ? `, ${userRole}` : ''}. Here's an overview of the society.
                </p>
              </div>

              {/* Quick Stats Grid Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[
                  { label: 'Total Residents', value: stats.residents.toString() },
                  { label: 'Active Announcements', value: stats.announcements.toString() },
                  { label: 'Pending Complaints', value: stats.complaints.toString() },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-xl border border-gray-500">
                    <p className="text-xs font-bold text-gray-100 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-4xl font-black text-gray-100`}>{stat.value}</p>
                  </div>
                ))}
              </div>

            </div>
          ) : activeTab === 'announcements' ? (
            <div className="max-w-7xl mx-auto">
              <Announcements />
            </div>
          ) : activeTab === 'residents' ? (
            <div className="max-w-7xl mx-auto">
              <Residents />
            </div>
          ) : activeTab === 'finance' ? (
            <div className="max-w-7xl mx-auto">
              <Finance />
            </div>
          ) : activeTab === 'rules' ? (
            <div className="max-w-7xl mx-auto">
              <Rules />
            </div>
          ) : activeTab === 'complaints' ? (
            <div className="max-w-7xl mx-auto">
              <Complaints />
            </div>
          ) : activeTab === 'committee' ? (
            <div className="max-w-7xl mx-auto">
              <Committee />
            </div>
          ) : activeTab === 'settings' ? (
            <div className="max-w-7xl mx-auto">
              <Settings />
            </div>
          ) : activeTab === 'documents' ? (
            <div className="max-w-7xl mx-auto">
              <Documents />
            </div>
          ) : activeTab === 'gallery' ? (
            <div className="max-w-7xl mx-auto">
              <Gallery />
            </div>
          ) : null}
        </main>
      </div>
    </DefaultLayout>
  );
};

export default AdminDashboard;
