import React, { useState, useEffect } from 'react';
import { Button, TextArea, Input, Upload, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Icon , Spinner, Modal } from '@legacy-apartment/ui';
import api from '@/lib/api';
import { documentSchema } from '@legacy-apartment/shared';

interface DocumentModel {
  id: number;
  document: string;
  fileName: string | null;
  date: string;
  description: string | null;
  category: string;
}

interface DocumentCategory {
  id: number;
  name: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tabOrderMap, setTabOrderMap] = useState<string[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentModel | null>(null);
  
  const [formData, setFormData] = useState<{
    documents: { document: string; fileName: string }[],
    date: string;
    description: string;
    category: string;
  }>({
    documents: [],
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onDiscard?: () => void;
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
        setCurrentUser(user);
        setCanManage(user?.role === 'president' || user?.role === 'treasurer');
        
        const savedOrder = localStorage.getItem(`adminDocTabsOrder_${user?.id}`);
        if (savedOrder) {
          setTabOrderMap(JSON.parse(savedOrder));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/documents/categories');
      setCategories(response.data);
      if (response.data.length > 0) {
         setActiveCategory(prev => {
            if (!prev || !response.data.find((c: any) => c.name === prev)) {
               setFormData(fd => ({ ...fd, category: response.data[0].name }));
               return response.data[0].name;
            }
            return prev;
         });
      } else {
         setActiveCategory('');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (files: File[]) => {
    setUploadFiles(files);
    
    if (files.length > 0) {
      const filePromises = files.map(file => {
        return new Promise<{document: string, fileName: string}>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            resolve({ document: reader.result as string, fileName: nameWithoutExt });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(results => {
        setFormData(prev => ({ ...prev, documents: results }));
      });
    } else {
      setFormData(prev => ({ ...prev, documents: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (formData.documents.length === 0) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: 'Please upload at least one document before submitting.',
        type: 'error'
      });
      return;
    }

    try {
      const promises = formData.documents.map(doc => {
        const payload = {
          document: doc.document,
          fileName: doc.fileName,
          date: formData.date,
          description: formData.description,
          category: activeCategory
        };
        return api.post('/documents', payload);
      });
      await Promise.all(promises);

      setIsFormOpen(false);
      setFormData({ 
        documents: [], 
        date: new Date().toISOString().split('T')[0], 
        description: '', 
        category: activeCategory 
      });
      setUploadFiles([]);
      fetchDocuments();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "You won't be able to revert this!",
      onConfirm: async () => {
        try {
          await api.delete(`/documents/${id}`);
          fetchDocuments();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete document',
            type: 'error'
          });
        }
      }
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/documents/categories', { name: newCategoryName.trim() });
      setNewCategoryName('');
      setIsManageCategoriesOpen(false);
      fetchCategories();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add category',
        type: 'error'
      });
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Category?',
      description: `This will delete the category "${name}". Are you sure?`,
      onConfirm: async () => {
        try {
          await api.delete(`/documents/categories/${id}`);
          fetchCategories();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete category',
            type: 'error'
          });
        }
      }
    });
  };

  const currentCategoryDocuments = documents.filter(doc => doc.category === activeCategory);
  
  // Tabs sorting and drag handling
  const sortedCategories = [...categories].sort((a, b) => {
     const indexA = tabOrderMap.indexOf(a.name);
     const indexB = tabOrderMap.indexOf(b.name);
     if (indexA === -1 && indexB === -1) return 0;
     if (indexA === -1) return 1;
     if (indexB === -1) return -1;
     return indexA - indexB;
  });

  const handleDragStart = (e: React.DragEvent, name: string) => {
    e.dataTransfer.setData('text/plain', name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetName: string) => {
    e.preventDefault();
    const draggedName = e.dataTransfer.getData('text/plain');
    if (!draggedName || draggedName === targetName) return;

    const currentOrder = sortedCategories.map(c => c.name);
    const fromIndex = currentOrder.indexOf(draggedName);
    const toIndex = currentOrder.indexOf(targetName);

    if (fromIndex > -1 && toIndex > -1) {
       const newOrder = [...currentOrder];
       newOrder.splice(fromIndex, 1);
       newOrder.splice(toIndex, 0, draggedName);
       setTabOrderMap(newOrder);
       if (currentUser?.id) {
          localStorage.setItem(`adminDocTabsOrder_${currentUser.id}`, JSON.stringify(newOrder));
       }
    }
  };

  // Group by year
  const groupedByYear: { [year: string]: DocumentModel[] } = {};
  currentCategoryDocuments.forEach(doc => {
    const year = new Date(doc.date).getFullYear().toString();
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(doc);
  });
  
  // Sort years descending
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-100">
            Documents
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Manage society records, maintenance logs, and financial documents.
          </p>
        </div>
        {canManage && categories.length > 0 && (
          <Button 
              variant="primary"
              icon={{ left: <Icon type="add" className="text-[20px]" /> }}
              onClick={() => {
                  if (!activeCategory) {
                      setAlertDialog({ open: true, title: 'No Category', description: 'Please create a category first.', type: 'error' });
                      return;
                  }
                  setFormErrors({});
                  setFormData({ 
                    documents: [], 
                    date: new Date().toISOString().split('T')[0], 
                    description: '', 
                    category: activeCategory 
                  });
                  setUploadFiles([]);
                  setIsFormOpen(true);
              }}
          >
            Upload Document(s)
          </Button>
        )}
      </div>

      <div className="flex flex-nowrap gap-2 mb-8 border-b border-gray-400 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide items-end">
        {sortedCategories.map(category => (
          <div
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, category.name)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category.name)}
            className={`flex items-center rounded-t-xl transition-colors text-sm overflow-hidden border border-b-0 cursor-grab active:cursor-grabbing ${
              activeCategory === category.name 
                ? 'bg-orange-500 text-white border-orange-500' 
                : 'text-gray-100 bg-gray-50 border-gray-400 hover:bg-gray-500'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveCategory(category.name);
                setIsFormOpen(false);
              }}
              className={`py-2 pl-4 ${canManage ? 'pr-2' : 'pr-4'}`}
            >
              {category.name}
            </button>
            {canManage && (
              <button
                type="button"
                disabled={documents.some(doc => doc.category === category.name)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category.id, category.name);
                }}
                className={`py-2 pr-3 pl-1 flex items-center justify-center transition-colors ${
                  documents.some(doc => doc.category === category.name)
                    ? 'opacity-30 cursor-not-allowed'
                    : activeCategory === category.name ? 'hover:text-red-200 text-white' : 'hover:text-red-500'
                }`}
                title={documents.some(doc => doc.category === category.name) ? "Cannot delete: Section contains documents" : "Delete Category"}
              >
                <Icon type="close" />
              </button>
            )}
          </div>
        ))}
        {canManage && (
          <button
            type="button"
            onClick={() => setIsManageCategoriesOpen(true)}
            className="px-3 py-2 rounded-t-xl transition-colors text-gray-100 bg-gray-500 hover:bg-gray-400 flex items-center justify-center font-bold"
            title="Add Category"
          >
            <Icon type="add"/>
          </button>
        )}
        {categories.length === 0 && !canManage && (
           <div className="text-sm text-gray-100 p-2 ">No categories available.</div>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-6 md:p-8 rounded-xl border border-gray-500 overflow-hidden relative shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Upload Files for {activeCategory}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Upload
              label="Select Document(s) (PDF or Image)"
              required
              accept={{
                "image/*": [".jpeg", ".png", ".webp"],
                "application/pdf": [".pdf"],
              }}
              value={uploadFiles}
              onValueChange={handleFileChange}
              maxSizeInMB={50}
              multiple
            />

            <Input 
              id="date"
              label="Date of Upload"
              required
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              error={formErrors.date}
            />
            <TextArea 
              id="description"
              label="Description (Optional)"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Provide context for this document..."
              error={formErrors.description}
            />
            <div className="flex gap-4 pt-2">
              <Button variant="primary" type="submit">
                Submit
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

      <div className="space-y-12">
        {loading ? (
            <div className="text-center py-20 text-gray-100"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>
        ) : (currentCategoryDocuments.length === 0 && !isFormOpen) ? (
            <div className="text-center py-20 px-4">
              <Icon type="description" className="text-[64px] text-gray-300 mx-auto mb-4" />
              <p>No documents uploaded for {activeCategory} yet.</p>
            </div>
        ) : (
            sortedYears.map(year => (
              <div key={year} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 border-b border-gray-400 pb-2 mb-4">Year {year}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedByYear[year].map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-400 flex items-center justify-between relative group hover:border-orange-200 transition-colors cursor-pointer">
                      <div 
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-3 overflow-hidden flex-1"
                      >
                        <div className="bg-orange-500/10 text-orange-500 flex size-10 shrink-0 items-center justify-center rounded-lg">
                          <Icon type="description" className="text-[24px]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {doc.fileName || `${doc.category} Document ${doc.id}`}
                          </span>
                        </div>
                      </div>
                      
                      {canManage && (
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="absolute top-2 right-2 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete document"
                        >
                          <Icon type="close" className="text-[20px]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 select-none">
          <div className="bg-white rounded-2xl w-full h-full max-w-5xl max-h-screen shadow-2xl flex flex-col overflow-hidden relative border border-gray-500 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-400 bg-gray-50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-orange-500/10 text-orange-500 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon type="description" className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-lg font-black text-gray-900 truncate">
                    {previewDoc.fileName || `${previewDoc.category} Document ${previewDoc.id}`}
                  </h3>
                  <p className="text-sm font-medium text-gray-100">
                    Uploaded on {new Date(previewDoc.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = previewDoc.document;
                    link.download = previewDoc.fileName || `document-${previewDoc.id}`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                >
                  Download
                </Button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="size-10 flex items-center justify-center text-gray-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon type="close" className="text-[24px]" />
                </button>
              </div>
            </div>

            {/* Modal Content / Preview Area */}
            <div className="flex-1 overflow-hidden flex items-center justify-center relative">
               <object
                  data={previewDoc.document}
                  type={previewDoc.document.startsWith('data:image/') ? previewDoc.document.split(';')[0].split(':')[1] : 'application/pdf'}
                  className="w-full h-full object-contain bg-white shadow-sm border border-gray-400"
                >
                  <div className="text-center p-8 bg-white h-full flex flex-col items-center justify-center">
                      <Icon type="description" className="text-[64px] text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-900 font-medium">No preview available for this format.</p>
                      <a href={previewDoc.document} download={previewDoc.fileName || `document-${previewDoc.id}`} className="mt-4 text-orange-600 hover:underline">Download directly instead</a>
                  </div>
                </object>
            </div>
          </div>
        </div>
      )}

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

      {/* Add Category Modal */}
      <Modal 
        open={isManageCategoriesOpen} 
        onOpenChange={setIsManageCategoriesOpen}
        title="Add Category"
        description="Create a new document category to organize your files."
        content={
          <form onSubmit={handleAddCategory} id="add-category-form" className="py-2">
            <Input 
              id="new-category"
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Utility Bills"
            />
          </form>
        }
        actions={[
          <Button variant="outline" onClick={() => setIsManageCategoriesOpen(false)}>Cancel</Button>,
          <Button variant="primary" type="submit" form="add-category-form" disabled={!newCategoryName.trim()}>Add Category</Button>
        ]}
      />
    </div>
  );
};

export default Documents;
