import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, Table } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '@/lib/api';

interface Resident {
  id: number;
  avatar: string | null;
  name: string;
  residence: string;
  phone_no: string;
  designation?: string | null;
}

const designations = [
  'None', 
  'Secretary', 
  'President', 
  'Treasurer', 
  'Joint Secretary', 
  'Advisors', 
  'Technical Advisors', 
  'Cultural Head', 
  'Welfare Head', 
  'Gym Head', 
  'Gardening', 
  'Catering'
];

const Residents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    phone_no: '',
    avatar: '',
    designation: 'None',
  });
  const [loading, setLoading] = useState(true);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [isPresident, setIsPresident] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsPresident(user?.role === 'president');
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await api.get('/residents');
      setResidents(response.data);
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
    
    const body = {
      ...formData,
      designation: formData.designation === 'None' ? null : formData.designation
    };

    try {
      const response = editingId 
        ? await api.patch(`/residents/${editingId}`, body)
        : await api.post('/residents', body);

      Swal.fire('Success', `Resident ${editingId ? 'updated' : 'created'} successfully!`, 'success');
      setIsFormOpen(false);
      setEditingId(null);
      setAvatarFiles([]);
      setFormData({ name: '', residence: '', phone_no: '', avatar: '', designation: 'None' });
      fetchResidents();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const handleEdit = (res: Resident) => {
    setEditingId(res.id);
    setFormData({
      name: res.name,
      residence: res.residence,
      phone_no: res.phone_no,
      avatar: res.avatar || '',
      designation: res.designation || 'None',
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
      try {
        await api.delete(`/residents/${id}`);
        Swal.fire('Deleted!', 'Resident has been deleted.', 'success');
        fetchResidents();
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
        {isPresident && (
          <Button 
              variant="primary"
              onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', residence: '', phone_no: '', avatar: '', designation: 'None' });
                  setAvatarFiles([]);
                  setIsFormOpen(true);
              }}
          >
            Add Resident
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 overflow-hidden relative text-gray-900">
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
                label="Apartment Number"
                required
                type="text" 
                value={formData.residence}
                onChange={(e) => setFormData({...formData, residence: e.target.value})}
                placeholder="Enter flat no."
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
              <div className="flex flex-col gap-1.5 group/select">
                <label className="text-gray-100 font-medium text-sm group-focus-within/select:text-gray-100">
                  Designation (Optional)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      type="button"
                      className="w-full py-2 px-3 border border-gray-400 rounded-lg bg-white flex items-center justify-between text-left focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-xs shadow-black/20"
                    >
                      <span className={`text-sm ${formData.designation === 'None' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formData.designation}
                      </span>
                      <KeyboardArrowDownIcon className="text-gray-400 size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-[440px]">
                    <DropdownMenuRadioGroup>
                      {designations.map(des => {
                        const isOccupied = residents.some(r => r.id !== editingId && r.designation === des);
                        const isDisabled = des !== 'None' && isOccupied;
                        
                        return (
                          <DropdownMenuRadioItem 
                            key={des} 
                            checked={formData.designation === des}
                            onClick={() => setFormData({...formData, designation: des})}
                            disabled={isDisabled}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span>{des}</span>
                            </div>
                          </DropdownMenuRadioItem>
                        );
                      })}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

      <div className="mb-20">
        {loading ? (
            <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              Loading residents...
            </div>
        ) : (residents.length === 0 && !isFormOpen) ? (
            <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                No residents data available. Add one to get started.
            </div>
        ) : (
            <Table 
              data={residents}
              type="general"
              theme="orange"
              columns={['resident', 'residence', 'phone_no', 'designation', 'actions']}
              headers={['Resident', 'Apartment', 'Phone', 'Designation', 'Actions']}
              minWidthClass="min-w-[800px]"
              showMonthlyFeeLegend={false}
              showYearlyFeeLegend={false}
              renderCell={(res, col) => {
                switch(col) {
                  case 'resident':
                    return (
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 shadow-sm">
                          {res.avatar ? (
                              <img src={res.avatar} alt={res.name} className="w-full h-full object-cover" />
                          ) : (
                              <PersonIcon className="text-gray-400 size-6" />
                          )}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{res.name}</span>
                      </div>
                    );
                  case 'residence':
                    return <span className="text-orange-500 font-bold">{res.residence}</span>;
                  case 'phone_no':
                    return <span className="font-medium text-gray-100">{res.phone_no}</span>;
                  case 'designation':
                    return res.designation && res.designation !== 'None' ? (
                      <span className="bg-orange-100 text-orange-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter shadow-sm">
                        {res.designation}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">N/A</span>
                    );
                  case 'actions':
                    return (
                      <div className="flex justify-end gap-2">
                        {isPresident && (
                          <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(res)}
                              icon={{ left: <EditIcon className="size-5" /> }}
                              title="Edit"
                          />
                        )}
                        {isPresident && (
                          <Button 
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(res.id)}
                              icon={{ left: <DeleteIcon className="size-5" /> }}
                              title="Delete"
                          />
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              }}
            />
        )}
      </div>
    </div>
  );
};

export default Residents;
