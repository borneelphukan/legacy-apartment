import React, { useState, useEffect } from 'react';
import { Button, Input, Upload } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';

interface Resident {
  id: number;
  avatar: string | null;
  name: string;
  residence: string;
  phone_no: string;
}

const API_BASE_URL = 'http://localhost:4000';

const Residents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    phone_no: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents`);
      if (response.ok) {
        const data = await response.json();
        setResidents(data);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (files: File[]) => {
    setAvatarFiles(files);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, avatar: '' });
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
      ? `${API_BASE_URL}/residents/${editingId}`
      : `${API_BASE_URL}/residents`;

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
        Swal.fire('Success', `Resident ${editingId ? 'updated' : 'created'} successfully!`, 'success');
        setIsFormOpen(false);
        setEditingId(null);
        setAvatarFiles([]);
        setFormData({ name: '', residence: '', phone_no: '', avatar: '' });
        fetchResidents();
      } else {
        const data = await response.json();
        Swal.fire('Error', data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Communication with server failed', 'error');
    }
  };

  const handleEdit = (res: Resident) => {
    setEditingId(res.id);
    setFormData({
      name: res.name,
      residence: res.residence,
      phone_no: res.phone_no,
      avatar: res.avatar || '',
    });
    setAvatarFiles([]); // Reset file input when editing (keeps existing URL if not changed)
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
      confirmButtonText: 'Yes'
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`${API_BASE_URL}/residents/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Resident has been deleted.', 'success');
          fetchResidents();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete resident', 'error');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl text-gray-100">
            Manage Residents
          </h1>
          <p className="mt-2 font-light text-gray-100">
            Add, edit or remove society residents data.
          </p>
        </div>
        <Button 
            variant="primary"
            onClick={() => {
                setEditingId(null);
                setFormData({ name: '', residence: '', phone_no: '', avatar: '' });
                setAvatarFiles([]);
                setIsFormOpen(true);
            }}
        >
          Add Resident
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 shadow-xl overflow-hidden relative text-gray-900">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Add'} Resident</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                id="name"
                label="Full Name"
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter resident full name"
              />
              <Input 
                id="residence"
                label="Residence (e.g., FlatA-101)"
                required
                type="text" 
                value={formData.residence}
                onChange={(e) => setFormData({...formData, residence: e.target.value})}
                placeholder="Enter flat/villa no."
              />
              <Input 
                id="phone_no"
                label="Phone Number"
                required
                type="tel" 
                value={formData.phone_no}
                onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
                placeholder="Enter phone number"
              />
              <div className="md:col-span-2">
                <Upload 
                  label="Profile Image"
                  value={avatarFiles}
                  onValueChange={handleAvatarChange}
                  maxSizeInMB={2}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  multiple={false}
                  hint="PNG, JPG, or JPEG up to 2MB. This image will represent the resident across the dashboard."
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="primary" type="submit">
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button 
                variant="outline"
                type="button" 
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {loading ? (
            <div className="col-span-full text-center py-20 text-gray-100">Loading residents...</div>
        ) : (residents.length === 0 && !isFormOpen) ? (
            <p className="col-span-full text-center text-gray-100">
                No residents data available. Add one to get started.
            </p>
        ) : (
            residents.map((res) => (
                <div 
                    key={res.id} 
                    className="bg-white p-6 rounded-md border border-gray-500 flex justify-between items-center gap-4 transition-all hover:border-orange-500 group/card"
                >
                    <div className="flex items-center gap-4 text-gray-900 overflow-hidden">
                        <div className="size-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 group-hover/card:border-orange-200">
                            {res.avatar ? (
                                <img src={res.avatar} alt={res.name} className="w-full h-full object-cover" />
                            ) : (
                                <PersonIcon className="text-gray-400 size-8" />
                            )}
                        </div>
                        <div className="truncate">
                            <h3 className="font-bold text-lg truncate group-hover/card:text-orange-600 transition-colors">{res.name}</h3>
                            <p className="text-orange-500 text-sm font-bold">{res.residence} <span className='text-gray-100 text-xs font-medium'> | {res.phone_no}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/finance/${res.id}`)}
                            icon={{ left: <PaymentsIcon className="size-5" /> }}
                            title="Finance"
                        />
                        <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(res)}
                            icon={{ left: <EditIcon className="size-5" /> }}
                        />
                        <Button 
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(res.id)}
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

export default Residents;
