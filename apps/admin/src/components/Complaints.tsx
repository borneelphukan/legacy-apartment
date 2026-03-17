import { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Icon , Spinner } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import api from '@/lib/api';

interface Complaint {
  id: number;
  name: string;
  apartment: string;
  phone_no: string;
  complaint: string;
  createdAt: string;
}


const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "This complaint will be permanently removed.",
      onConfirm: async () => {
        try {
          await api.delete(`/complaints/${id}`);
          fetchComplaints();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete complaint',
            type: 'error'
          });
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-100 font-black tracking-tight leading-tight">
            Complaints
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Review and manage complaints submitted by residents.
          </p>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        {loading ? (
          <div className="text-center py-20 text-gray-100"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>
        ) : complaints.length === 0 ? (
          <p className="text-center">
           No complaints found
          </p>
        ) : (
          complaints.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-gray-500 overflow-hidden transition-all group"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        <Icon type="person" className="text-[16px]" />
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-100 bg-gray-500 px-3 py-1 rounded-full">
                        <Icon type="home" className="text-[16px]" />
                        {item.apartment}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-100 bg-gray-500 px-3 py-1 rounded-full">
                        <Icon type="call" className="text-[16px]" />
                        {item.phone_no}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-400">
                      <p className="text-gray-100">
                        {item.complaint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-100 text-xs font-medium">
                      Submitted on {formatDate(item.createdAt)}
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col gap-3">
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      icon={{ left: <Icon type="delete" className="text-[20px]" /> }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
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

export default Complaints;
