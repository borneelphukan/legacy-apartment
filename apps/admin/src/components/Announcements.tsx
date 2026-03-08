import React, { useState, useEffect } from 'react';
import { Button, TextArea, Input } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
}

const API_BASE_URL = 'http://localhost:4000';

const Announcements = () => {
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
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl">
            Manage Announcements
          </h1>
          <p className="mt-2 font-light">
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
        >
          Create
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 shadow-xl overflow-hidden relative">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Create'} Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              id="title"
              label="Title"
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter announcement title"
            />
            <Input 
              id="date"
              label="Date"
              required
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
            <TextArea 
              id="description"
              label="Description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Provide details about the announcement..."
            />
            <div className="flex gap-4">
              <Button variant="primary" type="submit">
                {editingId ? 'Update' : 'Publish'}
              </Button>
              <Button 
                variant="secondary"
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="!bg-gray-500 !text-gray-600 hover:!bg-gray-400 rounded-xl px-8 py-3 border-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
            <div className="text-center py-20 text-gray-100">Loading announcements...</div>
        ) : (announcements.length === 0 && !isFormOpen) ? (
            <p className="text-center">
                No announcements. Create one to get started.
            </p>
        ) : (
            announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 md:p-8 rounded-md border border-gray-500 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-shadow">
                    <div className="flex-1 text-gray-900">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                {new Date(ann.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
                        <p className="text-sm line-clamp-2">{ann.description}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Button 
                            variant="secondary"
                            size="icon"
                            onClick={() => handleEdit(ann)}
                            className="!bg-blue-50 !text-blue-600 hover:!bg-blue-100 !rounded-xl !border-0 !shadow-none !px-0 !py-0"
                            icon={{ left: <EditIcon className="size-5" /> }}
                        />
                        <Button 
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(ann.id)}
                            className="!bg-red-50 !text-red-600 hover:!bg-red-100 !rounded-xl !border-0 !shadow-none !px-0 !py-0"
                            icon={{ left: <DeleteIcon className="size-5" /> }}
                        />
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
