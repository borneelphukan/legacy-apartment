import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, Table, Switch, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import api from '@/lib/api';

interface Resident {
  id: number;
  avatar: string | null;
  name: string;
  residence: string;
  phone_no: string;
  showInWebsite: boolean;
}


const Residents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    phone_no: '',
    avatar: '',
    showInWebsite: false,
  });
  const [loading, setLoading] = useState(true);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [isPresident, setIsPresident] = useState(false);
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
  } | null>(null);

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
      ...formData
    };

    try {
      const response = editingId 
        ? await api.patch(`/residents/${editingId}`, body)
        : await api.post('/residents', body);

      setIsFormOpen(false);
      setEditingId(null);
      setAvatarFiles([]);
      setFormData({ name: '', residence: '', phone_no: '', avatar: '', showInWebsite: false });
      fetchResidents();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    }
  };

  const handleEdit = (res: Resident) => {
    setEditingId(res.id);
    setFormData({
      name: res.name,
      residence: res.residence,
      phone_no: res.phone_no,
      avatar: res.avatar || '',
      showInWebsite: res.showInWebsite || false,
    });
    setAvatarFiles([]); // Reset file input when editing (keeps existing URL if not changed)
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "You won't be able to revert this!",
      onConfirm: async () => {
        try {
          await api.delete(`/residents/${id}`);
          fetchResidents();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete resident',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-100 font-black tracking-tight leading-tight">
            Manage Residents
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Add, edit or remove society residents data.
          </p>
        </div>
        {isPresident && (
          <Button 
              variant="primary"
              icon={{ left: <AddIcon className="size-5" /> }}
              onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', residence: '', phone_no: '', avatar: '', showInWebsite: false });
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
              <div className="flex flex-col justify-center px-4 py-3">
                <Switch
                  id="showInWebsite"
                  label="Show in Website"
                  hint="Publicly show this name on the frontend website."
                  checked={formData.showInWebsite}
                  onChange={(checked) => setFormData({...formData, showInWebsite: checked})}
                />
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
              data={editingId && isFormOpen ? residents.filter(r => r.id !== editingId) : residents}
              type="general"
              theme="orange"
              columns={['resident', 'residence', 'phone_no', 'actions']}
              headers={['Resident', 'Apartment', 'Phone', 'Actions']}
              minWidthClass="min-w-[600px]"
              showMonthlyFeeLegend={false}
              showYearlyFeeLegend={false}
              renderCell={(res, col) => {
                switch(col) {
                  case 'resident':
                    return (
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border border-gray-400 shrink-0">
                          {res.avatar ? (
                              <img src={res.avatar} alt={res.name} className="w-full h-full object-cover" />
                          ) : (
                              <PersonIcon className="text-gray-400" />
                          )}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{res.name}</span>
                      </div>
                    );
                  case 'residence':
                    return <span className="text-orange-500 font-bold">{res.residence}</span>;
                  case 'phone_no':
                    return <span className="font-medium text-gray-100">{res.phone_no}</span>;
                  case 'actions':
                    return (
                      <div className="flex justify-end gap-2">
                        {isPresident && (
                          <Button 
                              variant="outline"
                              onClick={() => handleEdit(res)}
                              title="Edit"
                              size='sm'
                          >
                            Edit
                          </Button>
                        )}
                        {isPresident && (
                          <Button 
                              variant="destructive"
                              onClick={() => handleDelete(res.id)}
                              title="Delete"
                              size='sm'
                          >
                            Delete
                          </Button>
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

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(null);
              }}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success/Error Alert Dialog */}
      {alertDialog && (
        <Dialog open={alertDialog.open} onOpenChange={(open) => !open && setAlertDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className={alertDialog.type === 'error' ? 'text-red-600' : 'text-orange-600'}>
                {alertDialog.title}
              </DialogTitle>
              <DialogDescription>{alertDialog.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="primary" onClick={() => setAlertDialog(null)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Residents;
