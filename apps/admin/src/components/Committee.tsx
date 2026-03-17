import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, Table, Badge, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Avatar, AvatarImage, AvatarFallback, Icon , Spinner } from '@legacy-apartment/ui';
import api from '@/lib/api';

interface CommitteeMember {
  id: number;
  avatar: string | null;
  name: string;
  residence: string;
  phone_no: string;
  role: string;
}

const roles = [
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

const Committee = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    residence: '',
    phone_no: '',
    avatar: '',
    role: roles[0],
  });
  const [loading, setLoading] = useState(true);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [isPresident, setIsPresident] = useState(false);
  const [currentUserFullName, setCurrentUserFullName] = useState('');
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
        setCurrentUserFullName(`${user.firstName} ${user.lastName}`);
      } catch {}
    }
    fetchMembers();
  }, [debouncedSearch, sortColumn, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const hasSynced = React.useRef(false);

  const fetchMembers = async () => {
    try {
      const backendSortBy = sortColumn === 'member' ? 'name' : sortColumn;
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (backendSortBy) params.append('sortBy', backendSortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await api.get(`/committee?${params.toString()}`);
      let rawData = response.data;

      // Auto-heal duplicate database entries
      let data: CommitteeMember[] = [];
      const seen = new Set<string>();
      for (const m of rawData) {
        const key = m.name.toLowerCase();
        if (seen.has(key)) {
          // It's a duplicate. Fire and forget a delete request to clean the database.
          api.delete(`/committee/${m.id}`).catch(() => {});
        } else {
          seen.add(key);
          data.push(m);
        }
      }

      const stored = localStorage.getItem('adminUser');
      if (stored && !debouncedSearch && !hasSynced.current) {
        hasSynced.current = true;
        
        const user = JSON.parse(stored);
        const currentName = `${user.firstName} ${user.lastName}`;
        const isPres = user?.role === 'president';
        let updated = false;

        const syncUser = async (uName: string, uRole: string, uResidence: string, uPhone: string) => {
          if (!data.some((m: CommitteeMember) => m.name.toLowerCase() === uName.toLowerCase())) {
            const rCap = uRole.charAt(0).toUpperCase() + uRole.slice(1);
            const roleFormatted = roles.includes(rCap) ? rCap : roles[0];
            
            // Add eagerly to local memory so subsequent loops or strict mode don't duplicate
            data.push({ id: Date.now() + Math.random(), name: uName, residence: uResidence || 'Not Provided', phone_no: uPhone || 'Not Provided', avatar: '', role: roleFormatted });
            
            try {
              await api.post('/committee', {
                name: uName,
                residence: uResidence || 'Not Provided',
                phone_no: uPhone || 'Not Provided',
                avatar: '',
                role: roleFormatted
              });
              updated = true;
            } catch (e) {}
          }
        };

        if (isPres) {
          try {
            const usersResp = await api.get('/users');
            for (const u of usersResp.data) {
              await syncUser(`${u.firstName} ${u.lastName}`, u.role, u.residence, u.phone_no);
            }
          } catch (e) {}
        } else {
          await syncUser(currentName, user.role, user.residence, user.phone_no);
        }

        if (updated) {
          const refreshed = await api.get(`/committee?${params.toString()}`);
          
          let refreshedData: CommitteeMember[] = [];
          const rSeen = new Set<string>();
          for (const m of refreshed.data) {
            const key = m.name.toLowerCase();
            if (!rSeen.has(key)) {
              rSeen.add(key);
              refreshedData.push(m);
            }
          }
          data = refreshedData;
        }
      }

      setMembers(data);
    } catch (error) {
      console.error('Error fetching committee members:', error);
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
    try {
      const response = editingId 
        ? await api.patch(`/committee/${editingId}`, formData)
        : await api.post('/committee', formData);

      await fetchMembers();
      setIsFormOpen(false);
      setEditingId(null);
      setAvatarFiles([]);
      setFormData({ name: '', residence: '', phone_no: '', avatar: '', role: roles[0] });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    }
  };

  const handleEdit = (member: CommitteeMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      residence: member.residence,
      phone_no: member.phone_no,
      avatar: member.avatar || '',
      role: member.role,
    });
    setAvatarFiles([]);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "Remove this member from the committee?",
      onConfirm: async () => {
        try {
          await api.delete(`/committee/${id}`);
          fetchMembers();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to remove member',
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
            Society Committee
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Manage society leadership and administrative roles.
          </p>
        </div>
        {isPresident && (
          <Button 
            variant="primary"
            icon={{ left: <Icon type="add" className="text-[20px]" /> }}
            onClick={() => {
                setEditingId(null);
                setFormData({ name: '', residence: '', phone_no: '', avatar: '', role: roles[0] });
                setAvatarFiles([]);
                setIsFormOpen(true);
            }}
          >
            Add Member
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 overflow-hidden relative text-gray-900 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Add'} Member</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                id="name"
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter member name"
              />
              <div className="flex flex-col gap-1.5 group/select">
                <label className="text-gray-100 font-medium text-sm">Role</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="w-full py-2 px-3 border border-gray-400 rounded-lg bg-white flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <span className="text-sm text-gray-900">{formData.role}</span>
                      <Icon type="keyboard_arrow_down" className="text-gray-400 text-[20px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-[440px]">
                    <DropdownMenuRadioGroup>
                      {roles.map(role => (
                        <DropdownMenuRadioItem 
                          key={role} 
                          checked={formData.role === role}
                          onClick={() => setFormData({...formData, role: role})}
                        >
                          {role}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Input 
                id="residence"
                label="Apartment Number"
                required
                value={formData.residence}
                onChange={(e) => setFormData({...formData, residence: e.target.value})}
                placeholder="Enter flat no."
              />
              <Input 
                id="phone_no"
                label="Phone Number"
                required
                value={formData.phone_no}
                onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
                placeholder="Enter phone number"
              />
              <div className="md:col-span-2">
                {formData.avatar ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-100 font-medium text-sm">Profile Image</span>
                    <div className="relative w-max mt-1">
                      <img src={formData.avatar} alt="Profile Preview" className="size-32 object-cover rounded-xl border border-gray-400" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, avatar: '' });
                          setAvatarFiles([]);
                        }}
                        className="absolute -top-3 -right-3 bg-red-200 text-white rounded-full hover:bg-red-100 transition-colors border-1 border-white"
                        title="Remove Image"
                      >
                        <Icon type="remove" className="text-[8px]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Upload 
                    label="Profile Image"
                    value={avatarFiles}
                    onValueChange={handleAvatarChange}
                    maxSizeInMB={2}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                    multiple={false}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="primary" type="submit">
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-20">
        {loading ? (
            <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100">
              <div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div>
            </div>
        ) : members.length === 0 ? (
            <div className="text-center">
                No committee members listed yet.
            </div>
        ) : (
            <Table 
              data={editingId && isFormOpen ? members.filter(m => m.id !== editingId) : members}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search committee..."
              type="general"
              theme="orange"
              columns={['member', 'role', 'residence', 'phone_no', 'actions']}
              headers={['Member', 'Role', 'Apartment', 'Phone', 'Actions']}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSortChange={(col) => {
                if (col === 'actions') return;
                if (sortColumn === col) {
                   if (sortOrder === 'asc') setSortOrder('desc');
                   else if (sortOrder === 'desc') {
                     setSortOrder('');
                     setSortColumn('');
                   }
                } else {
                   setSortColumn(col);
                   setSortOrder('asc');
                }
              }}
              minWidthClass="min-w-[800px]"
              showMonthlyFeeLegend={false}
              showYearlyFeeLegend={false}
              renderCell={(member, col) => {
                switch(col) {
                  case 'member':
                    return (
                      <div className="flex items-center gap-4">
                        <Avatar className="size-12 border border-gray-400">
                          <AvatarImage src={member.avatar || undefined} alt={member.name} />
                          <AvatarFallback className="bg-gray-300">
                            <Icon type="person" className="text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-gray-900">{member.name}</span>
                      </div>
                    );
                  case 'role':
                    return <Badge label={member.role} type="default" size="sm" />;
                  case 'residence':
                    return <span className="text-orange-500 font-bold">{member.residence}</span>;
                  case 'phone_no':
                    return <span className="font-medium text-gray-100">{member.phone_no}</span>;
                  case 'actions':
                    return (
                      <div className="flex justify-end gap-2">
                        {isPresident && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(member)} title="Edit" >
                            Edit
                          </Button>
                        )}
                        {isPresident && member.name.toLowerCase() !== currentUserFullName.toLowerCase() && (
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id)} title="Delete" >
                            Delete
                          </Button>
                        )}
                      </div>
                    );
                  default: return null;
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

export default Committee;
