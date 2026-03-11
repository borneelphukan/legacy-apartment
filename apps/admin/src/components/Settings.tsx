import React, { useState, useEffect } from 'react';
import { Button, Table, Badge, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@legacy-apartment/ui';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/lib/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

const Settings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPresident, setIsPresident] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
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
    onClose?: () => void;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsPresident(user?.role === 'president');
        setCurrentUserId(user?.id);
      } catch {}
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPresident) {
      fetchUsers();
    }
  }, [isPresident]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isSelf = id === currentUserId;

    setConfirmDialog({
      open: true,
      title: 'Delete user account?',
      description: isSelf
        ? "You are about to delete your own account. This action is irreversible and you will be logged out immediately."
        : "This action is irreversible and permanently removes the administrator's access to the society portal.",
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          setAlertDialog({
            open: true,
            title: 'Deleted!',
            description: 'The user account has been successfully removed.',
            type: 'success',
            onClose: () => {
              if (isSelf) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/login';
              } else {
                fetchUsers();
              }
            }
          });
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete user account.',
            type: 'error'
          });
        }
      }
    });
  };

  if (!loading && !isPresident) {
    return (
      <div className="w-full text-center p-20 bg-white rounded-xl border border-gray-400 mt-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-2xl font-black text-gray-100 mb-4 tracking-tight uppercase">Access Restricted</h2>
        <p>You do not have permission to view this section. Account management is restricted to the society President.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl text-gray-100 font-black tracking-tight leading-tight">
          Account Management
        </h1>
        <p className="mt-2 text-lg text-gray-100/80 font-medium">
          Review existing administrative users and securely remove legacy accounts.
        </p>
      </div>

      <div className="mb-20">
        {loading ? (
            <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 italic">
              Loading users...
            </div>
        ) : users.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 italic">
                No users found.
            </div>
        ) : (
            <Table 
              data={users}
              type="general"
              theme="orange"
              columns={['name', 'email', 'role', 'joined', 'actions']}
              headers={['Name', 'Email', 'Role', 'Joined Date', 'Actions']}
              minWidthClass="min-w-[800px]"
              tight={true}
              showMonthlyFeeLegend={false}
              showYearlyFeeLegend={false}
              renderCell={(user, col) => {
              switch(col) {
                case 'name':
                  return <span className="font-bold text-gray-900">{user.firstName} {user.lastName}</span>;
                case 'email':
                  return <span className="text-gray-600 font-medium">{user.email}</span>;
                case 'role':
                  return <Badge label={user.role} type="default" size="sm" />;
                case 'joined':
                  return <span>{new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
                case 'actions':
                  return (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)} 
                        
                      >
                      Delete
                      </Button>
                    </div>
                  );
                default: return null;
              }
            }}
          />
        )}
      </div>

      {/* Persistence Components */}
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
              <Button variant="primary" onClick={() => {
                alertDialog.onClose?.();
                setAlertDialog(null);
              }}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;
