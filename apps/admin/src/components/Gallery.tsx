import { useState, useEffect } from 'react';
import { Button, Input, Upload, Modal, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@legacy-apartment/ui';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import CollectionsIcon from '@mui/icons-material/Collections';
import api from '@/lib/api';

interface GalleryPhoto {
  id: number;
  eventId: number;
  src: string;
  alt: string | null;
  className: string | null;
}

interface GalleryEvent {
  id: number;
  name: string;
  date: string;
  year: number;
  photos: GalleryPhoto[];
}

const Gallery = () => {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  const [eventData, setEventData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [photoData, setPhotoData] = useState({
    src: '',
    alt: '',
    className: 'col-span-1 row-span-1',
  });

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  
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
    fetchEvents();
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCanManage(user?.role === 'president' || user?.role === 'cultural_head');
      } catch {}
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/gallery/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching gallery events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const year = new Date(eventData.date).getFullYear();
      await api.post('/gallery/events', { ...eventData, year });
      setIsEventFormOpen(false);
      setEventData({
        name: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchEvents();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create event',
        type: 'error',
      });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Event?',
      description: 'This will delete the event and all its photos. Action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/gallery/events/${id}`);
          if (selectedEventId === id) setSelectedEventId(null);
          fetchEvents();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete event',
            type: 'error',
          });
        }
      },
    });
  };

  const handlePhotoUpload = (files: File[]) => {
    setUploadFiles(files);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData((prev) => ({ ...prev, src: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !photoData.src) return;

    try {
      await api.post('/gallery/photos', {
        ...photoData,
        eventId: selectedEventId,
      });
      setIsPhotoFormOpen(false);
      setPhotoData({ src: '', alt: '', className: 'col-span-1 row-span-1' });
      setUploadFiles([]);
      fetchEvents();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add photo',
        type: 'error',
      });
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Photo?',
      description: 'Are you sure you want to remove this photo?',
      onConfirm: async () => {
        try {
          await api.delete(`/gallery/photos/${photoId}`);
          fetchEvents();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete photo',
            type: 'error',
          });
        }
      },
    });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-100">
            Gallery Management
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Create events and organize community memories.
          </p>
        </div>
        {canManage && (
          <Button 
            variant="primary"
            icon={{ left: <AddIcon className="size-5" /> }}
            onClick={() => setIsEventFormOpen(true)}
          >
            Create Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Events Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-black text-gray-100 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CollectionsIcon className="size-4 text-orange-500" />
            Events List
          </h2>
          {loading ? (
            <div className="p-4 bg-white rounded-xl border border-gray-400 text-gray-100 italic">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-4 bg-white rounded-xl border border-gray-400 text-gray-100 text-center">No events created.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col relative ${
                    selectedEventId === event.id 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' 
                      : 'bg-white border-gray-400 text-gray-100 hover:border-orange-500'
                  }`}
                >
                  <span className="font-bold tracking-tight">{event.name}</span>
                  <span className={`text-xs opacity-70 ${selectedEventId === event.id ? 'text-white' : 'text-gray-100'}`}>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  {canManage && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      className={`absolute top-2 right-2 p-1 rounded-md transition-colors ${
                        selectedEventId === event.id ? 'hover:bg-white/20 text-white' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos Grid */}
        <div className="lg:col-span-3">
          {!selectedEventId ? (
            <div className="h-full flex flex-col items-center justify-center py-24 bg-white rounded-xl">
              <CollectionsIcon className="size-16 text-gray-300 mb-4" />
              <p>Select an event from the list to manage photos.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-500 shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedEvent?.name}</h3>
                  <p className="text-sm text-gray-100">{selectedEvent?.year} Gallery • {selectedEvent?.photos.length} Photos</p>
                </div>
                {canManage && (
                  <Button 
                    variant="outline"
                    size="sm"
                    icon={{ left: <AddIcon className="size-4" /> }}
                    onClick={() => setIsPhotoFormOpen(true)}
                  >
                    Add Photo
                  </Button>
                )}
              </div>

              {selectedEvent?.photos.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-gray-400 text-center">
                  <DescriptionIcon className="size-16 text-gray-300 mx-auto mb-4" />
                  <p>No photos added to this event yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedEvent?.photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-400 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                      <img 
                        src={photo.src} 
                        alt={photo.alt || ''} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {canManage && (
                          <button 
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <DeleteIcon className="size-5" />
                          </button>
                        )}
                      </div>
                      {photo.alt && (
                        <div className="absolute bottom-0 left-0 w-full p-2 bg-black/60 backdrop-blur-sm text-[10px] text-white truncate">
                          {photo.alt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      {isEventFormOpen && (
        <Modal
          open={isEventFormOpen}
          onOpenChange={setIsEventFormOpen}
          title="Create New Event"
          description="Add a title and date for the society event gallery."
          content={
            <form id="event-form" onSubmit={handleCreateEvent} className="space-y-4">
              <Input 
                id="event-name"
                label="Event Name"
                required
                value={eventData.name}
                onChange={(e) => setEventData({...eventData, name: e.target.value})}
                placeholder="e.g. Bihu Celebration 2025"
              />
              <div className="grid grid-cols-1">
                <Input 
                  id="event-date"
                  label="Date"
                  type="date"
                  required
                  value={eventData.date}
                  onChange={(e) => {
                    const date = e.target.value;
                    setEventData({...eventData, date});
                  }}
                />
              </div>
            </form>
          }
          actions={[
            <Button variant="outline" type="button" onClick={() => setIsEventFormOpen(false)}>Cancel</Button>,
            <Button variant="primary" type="submit" form="event-form">Create Event</Button>
          ]}
        />
      )}

      {/* Photo Form Modal */}
      {isPhotoFormOpen && (
        <Modal
          open={isPhotoFormOpen}
          onOpenChange={setIsPhotoFormOpen}
          title="Add Photo to Event"
          description="Upload an image and add a caption for the gallery."
          content={
            <form id="photo-form" onSubmit={handleAddPhoto} className="space-y-4">
              <Upload 
                label="Select Photo"
                value={uploadFiles}
                onValueChange={handlePhotoUpload}
                accept={{"image/*": [".jpeg", ".png", ".webp"]}}
                maxSizeInMB={10}
                required
              />
              <Input 
                id="photo-caption"
                label="Caption (Optional)"
                value={photoData.alt}
                onChange={(e) => setPhotoData({...photoData, alt: e.target.value})}
                placeholder="Add a short description..."
              />
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-100 uppercase tracking-widest">Grid Layout hint</label>
                <select 
                  className="w-full h-12 bg-white border border-gray-400 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  value={photoData.className}
                  onChange={(e) => setPhotoData({...photoData, className: e.target.value})}
                >
                  <option value="col-span-1 row-span-1">Small Cube (1x1)</option>
                  <option value="col-span-1 row-span-2">Portrait (1x2)</option>
                  <option value="col-span-2 row-span-1">Landscape (2x1)</option>
                  <option value="col-span-2 row-span-2">Large Square (2x2)</option>
                </select>
              </div>
            </form>
          }
          actions={[
            <Button variant="outline" type="button" onClick={() => setIsPhotoFormOpen(false)}>Cancel</Button>,
            <Button variant="primary" type="submit" form="photo-form">Upload Photo</Button>
          ]}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={confirmDialog.open} onOpenChange={(open: boolean) => !open && setConfirmDialog(null)}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="py-4">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(null);
              }}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success/Error Alert Modal */}
      {alertDialog && (
        <Modal
          open={alertDialog.open}
          onOpenChange={(open) => !open && setAlertDialog(null)}
          title={alertDialog.title}
          description={alertDialog.description}
          content={<div />}
          actions={[
            <Button variant="primary" onClick={() => setAlertDialog(null)}>OK</Button>
          ]}
        />
      )}
    </div>
  );
};

export default Gallery;
