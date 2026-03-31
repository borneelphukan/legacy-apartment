import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Icon , Spinner } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { announcementSchema } from '@legacy-apartment/shared';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  fileUrl?: string | null;
  fileName?: string | null;
}

const TiptapEditor = ({ value, onChange, onUploadPDF }: { value: string, onChange: (val: string) => void, onUploadPDF?: () => void }) => {
  const [activeStates, setActiveStates] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => {
      setActiveStates(prev => prev + 1);
    },
    onTransaction: () => {
      setActiveStates(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: '[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_p]:my-2 m-2 focus:outline-none min-h-[150px] p-2'
      }
    }
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-400 rounded-md bg-white">
      <div className="flex gap-2 p-2 border-b border-gray-400 bg-gray-50 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Text Alignments */}
          <div className="flex gap-2 border-r border-gray-400 pr-2">
            <Button variant={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'left' }) ? 'bg-white hover:bg-gray-400 ' : ''}`} title="Align Left" disabled={isPreview}>
              <Icon type="format_align_left" className='m-2'/>
            </Button>
            <Button variant={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'center' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Center" disabled={isPreview}>
              <Icon type="format_align_center" className='m-2'/>
            </Button>
            <Button variant={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'right' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Right" disabled={isPreview}>
              <Icon type="format_align_right" className='m-2'/>
            </Button>
            <Button variant={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'justify' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Justify" disabled={isPreview}>
              <Icon type="format_align_justify" className='m-2'/>
            </Button>
          </div>

          {/* Formatting */}
          <div className="flex gap-1 border-r border-gray-400 pr-2">
            <Button variant={editor.isActive('bold') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('bold') ? 'bg-white hover:bg-gray-400' : ''}`} title="Bold" disabled={isPreview}>
              <Icon type="format_bold" className='m-2'/>
            </Button>
            <Button variant={editor.isActive('italic') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('italic') ? 'bg-white hover:bg-gray-400' : ''}`} title="Italic" disabled={isPreview}>
              <Icon type="format_italic" className='m-2'/>
            </Button>
            <Button variant={editor.isActive('underline') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('underline') ? 'bg-white hover:bg-gray-400' : ''}`} title="Underline" disabled={isPreview}>
              <Icon type="format_underlined" className='m-2'/>
            </Button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-400 pr-2">
            <Button variant={editor.isActive('bulletList') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('bulletList') ? 'bg-white hover:bg-gray-400' : ''}`} title="Bullet List" disabled={isPreview}>
              <Icon type="format_list_bulleted" className='m-2' />
            </Button>
            <Button variant={editor.isActive('orderedList') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('orderedList') ? 'bg-white hover:bg-gray-400' : ''}`} title="Numbered List" disabled={isPreview}>
              <Icon type="format_list_numbered" className='m-2'/>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF Attachment Tool */}
          {onUploadPDF && (
            <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={onUploadPDF} 
                className={`flex items-center gap-2 h-8 px-3 rounded-md bg-white hover:bg-gray-400 border-gray-400`}
                title="Upload PDF"
                disabled={isPreview}
            >
              <Icon type="picture_as_pdf" className="text-[18px]" />
              <span className="text-sm font-bold truncate max-w-[100px]">Upload PDF</span>
            </Button>
          )}

          <Button 
            variant={isPreview ? 'primary' : 'outline'} 
            size="sm" 
            type="button" 
            onClick={() => setIsPreview(!isPreview)} 
            className={`flex items-center gap-2 h-8 px-3 rounded-md ${!isPreview ? 'bg-white hover:bg-gray-400 border-gray-400' : ''}`}
            title="Preview"
          >
            <Icon type={isPreview ? "edit" : "visibility"} className="text-[18px]" />
            <span className="text-sm font-bold">{isPreview ? 'Edit' : 'Preview'}</span>
          </Button>
        </div>
      </div>
      
      {isPreview ? (
        <div className="p-4 min-h-[150px] bg-white text-gray-800">
          <div dangerouslySetInnerHTML={{ __html: value }} className="[&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_strong]:font-bold" />
        </div>
      ) : (
        <EditorContent editor={editor} className="min-h-[150px]" />
      )}
    </div>
  );
};


const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    fileUrl: null as string | null,
    fileName: null as string | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCanManage(user?.role === 'president' || user?.role === 'secretary');
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setAlertDialog({
          open: true,
          title: 'Invalid File',
          description: 'Please upload only PDF files.',
          type: 'error'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          fileUrl: reader.result as string,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = announcementSchema.safeParse({
        title: formData.title,
        description: formData.description,
        date: formData.date
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    try {
      const response = editingId 
        ? await api.patch(`/announcements/${editingId}`, formData)
        : await api.post('/announcements', formData);

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], fileUrl: '', fileName: '' });
      fetchAnnouncements();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    }
  };

  const handleEdit = (ann: Announcement) => {
    setFormErrors({});
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      description: ann.description,
      date: new Date(ann.date).toISOString().split('T')[0],
      fileUrl: ann.fileUrl || null,
      fileName: ann.fileName || null
    });
    setIsFormOpen(true);
  };

  const isFormEmpty = !formData.title.trim() || !formData.description || formData.description === '<p><br></p>' || formData.description === '<p></p>';
  const existingAnnouncement = announcements.find(a => a.id === editingId);
  const isFormUnchanged = editingId && existingAnnouncement 
    ? (formData.description === existingAnnouncement.description && formData.title === existingAnnouncement.title && formData.date === new Date(existingAnnouncement.date).toISOString().split('T')[0] && formData.fileUrl === (existingAnnouncement.fileUrl || '')) 
    : false;
  const isSaveDisabled = isFormEmpty || isFormUnchanged;

  const renderForm = (isCreating: boolean) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input 
        id="title"
        label="Title"
        required
        type="text" 
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Enter announcement title"
        error={formErrors.title}
      />
      <Input 
        id="date"
        label="Date"
        required
        type="date" 
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
        error={formErrors.date}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold mt-2">Description</label>
        <TiptapEditor 
          value={formData.description}
          onChange={(val) => setFormData({...formData, description: val})}
          onUploadPDF={() => fileInputRef.current?.click()}
        />
        {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf" 
        className="hidden" 
      />

      {formData.fileUrl && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon type="picture_as_pdf" className="text-orange-500 text-[24px]" />
            <div>
              <p className="text-sm font-bold text-gray-800 truncate max-w-[300px]">
                {formData.fileName || 'Attached PDF'}
              </p>
              {formData.fileUrl.startsWith('http') && (
                <a href={formData.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-orange-600 hover:underline">
                  View current file
                </a>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            type="button" 
            onClick={() => setFormData({...formData, fileUrl: null as any, fileName: null as any})}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Icon type="close" />
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="primary" type="submit" disabled={isSaveDisabled}>
          {isCreating ? 'Publish' : 'Update'}
        </Button>
        <Button 
          variant="outline"
          type="button" 
          onClick={() => {
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], fileUrl: null, fileName: null });
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "You won't be able to revert this!",
      onConfirm: async () => {
        try {
          await api.delete(`/announcements/${id}`);
          fetchAnnouncements();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete announcement',
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
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-100">
            Announcements
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Add, edit or remove society announcements.
          </p>
        </div>
        {canManage && (
          <Button 
              variant="primary"
              icon={{ left: <Icon type="add" className="text-[20px]" /> }}
              onClick={() => {
                  setFormErrors({});
                  setEditingId(null);
                  setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], fileUrl: null as any, fileName: null as any });
                  setIsFormOpen(true);
              }}
          >
            Create
          </Button>
        )}
      </div>

      {isFormOpen && !editingId && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 overflow-hidden relative">
          <h2 className="text-2xl font-bold mb-6">Create Announcement</h2>
          {renderForm(true)}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
            <div className="text-center py-20 text-gray-100"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>
        ) : (announcements.length === 0 && !isFormOpen) ? (
            <p className="text-center">
                No announcements. Create one to get started.
            </p>
        ) : (
            announcements.map((ann) => {
              if (editingId === ann.id && isFormOpen) {
                return (
                  <div key={ann.id} className="bg-white p-6 md:p-8 rounded-md border border-gray-500 flex flex-col gap-6 relative">
                    <h2 className="text-xl font-bold mb-2">Edit Announcement</h2>
                    {renderForm(false)}
                  </div>
                );
              }
              return (
                <div key={ann.id} className="bg-white p-6 md:p-8 rounded-md border border-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                {new Date(ann.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
                        <div className="text-sm">
                          {/<[a-z][\s\S]*>/i.test(ann.description) ? (
                            <div dangerouslySetInnerHTML={{ __html: ann.description }} className="[&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_strong]:font-bold" />
                          ) : (
                            <p className="line-clamp-2">{ann.description}</p>
                          )}
                        </div>
                        {ann.fileUrl && (
                          <div className="mt-4">
                            <a 
                              href={ann.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 transition-colors"
                            >
                              <Icon type="picture_as_pdf" />
                              <span className="truncate max-w-[250px]">{ann.fileName || 'View Document'}</span>
                            </a>
                          </div>
                        )}
                    </div>
                    {canManage && (
                      <div className="flex gap-3 shrink-0 self-end md:self-start">
                          <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(ann)}
                          >
                            Edit
                          </Button>
                          <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(ann.id)}
                          >
                            Delete
                          </Button>
                      </div>
                    )}
                </div>
            )})
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

export default Announcements;
