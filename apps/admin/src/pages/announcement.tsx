import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultLayout from '@/layout/DefaultLayout';
import { Button } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
}

const API_BASE_URL = 'http://localhost:4000';

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      Swal.fire('Error', 'Unauthorized. Please login again.', 'error');
      router.push('/login');
      return;
    }

    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId 
      ? `${API_BASE_URL}/announcements/${editingId}`
      : `${API_BASE_URL}/announcements`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire('Success', `Announcement ${editingId ? 'updated' : 'created'} successfully!`, 'success');
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
        fetchAnnouncements();
      } else {
        const data = await response.json();
        Swal.fire('Error', data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Communication with server failed', 'error');
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      description: ann.description,
      date: new Date(ann.date).toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Announcement has been deleted.', 'success');
          fetchAnnouncements();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete announcement', 'error');
      }
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Announcements | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                Manage <span className="text-orange-500">Announcements</span>
              </h1>
              <p className="text-gray-500 mt-2 font-light">
                Add, edit or remove society announcements.
              </p>
            </div>
            <Button 
                variant="primary"
                onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
                    setIsFormOpen(true);
                }}
                className="!bg-orange-500 hover:!bg-orange-600 text-white rounded-2xl px-6 py-3 shadow-lg shadow-orange-500/20"
            >
              + Create New
            </Button>
          </div>

          {isFormOpen && (
            <div className="mb-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
              <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Create'} Announcement</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    placeholder="Provide details about the announcement..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button variant="primary" type="submit" className="!bg-orange-500 hover:!bg-orange-600 text-white rounded-xl px-8 py-3">
                    {editingId ? 'Update' : 'Publish'}
                  </Button>
                  <Button 
                    variant="secondary"
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="!bg-gray-100 !text-gray-600 hover:!bg-gray-200 rounded-xl px-8 py-3 border-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading announcements...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
                    <p className="text-gray-500">No announcements found. Create one to get started!</p>
                </div>
            ) : (
                announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-shadow">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                    {new Date(ann.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
                            <p className="text-gray-500 font-light text-sm line-clamp-2">{ann.description}</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button 
                                onClick={() => handleEdit(ann)}
                                className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => handleDelete(ann.id)}
                                className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AnnouncementPage;
