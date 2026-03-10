import React, { useState, useEffect } from 'react';
import { Button } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This complaint will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/complaints/${id}`);
        Swal.fire('Deleted!', 'Complaint has been removed.', 'success');
        fetchComplaints();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete complaint', 'error');
      }
    }
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
          <div className="text-center py-20 text-gray-100">Loading complaints...</div>
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
                        <PersonIcon className="size-4" />
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-100 bg-gray-500 px-3 py-1 rounded-full">
                        <HomeIcon className="size-4" />
                        {item.apartment}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-100 bg-gray-500 px-3 py-1 rounded-full">
                        <PhoneIcon className="size-4" />
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
                      icon={{ left: <DeleteIcon className="size-5" /> }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaints;
