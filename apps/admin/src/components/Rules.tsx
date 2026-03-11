import React, { useState, useEffect } from 'react';
import { Button, TextArea, Input, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import api from '@/lib/api';

interface Rule {
  id: number;
  category: string;
  rule: string;
  icon?: string;
  createdAt: string;
}


const categories = [
  "General Rules",
  "Security & Visitors",
  "Facilities & Amenities",
  "Parking Guidelines",
  "Pet Policies"
];

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: categories[0],
    rule: '',
  });
  const [loading, setLoading] = useState(true);
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
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/rules');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = editingId 
        ? await api.patch(`/rules/${editingId}`, formData)
        : await api.post('/rules', formData);

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ category: categories[0], rule: '' });
      fetchRules();
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingId(rule.id);
    setFormData({
      category: rule.category,
      rule: rule.rule,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Are you sure?',
      description: "You won't be able to revert this!",
      onConfirm: async () => {
        try {
          await api.delete(`/rules/${id}`);
          fetchRules();
        } catch (error) {
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'Failed to delete rule',
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
            Rules
          </h1>
          <p className="mt-2 text-lg text-gray-100/80">
            Add, edit or remove society guidelines and regulations.
          </p>
        </div>
        {isPresident && (
          <Button 
              variant="primary"
              icon={{ left: <AddIcon className="size-5" /> }}
              onClick={() => {
                  setEditingId(null);
                  setFormData({ category: categories[0], rule: '' });
                  setIsFormOpen(true);
              }}
          >
            Add Rule
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-white p-8 rounded-md border border-gray-500 overflow-hidden relative">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Create'} Rule</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Category</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="w-full p-3 border border-gray-300 rounded-md bg-white flex items-center justify-between text-left focus:outline-none focus:border-orange-500"
                  >
                    <span>{formData.category}</span>
                    <KeyboardArrowDownIcon className="text-gray-400 size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-[440px]">
                  <DropdownMenuRadioGroup>
                    {categories.map(cat => (
                      <DropdownMenuRadioItem 
                        key={cat} 
                        checked={formData.category === cat}
                        onClick={() => setFormData({...formData, category: cat})}
                      >
                        {cat}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TextArea 
              id="rule"
              label="Rule Content"
              required
              rows={6}
              value={formData.rule}
              onChange={(e) => setFormData({...formData, rule: e.target.value})}
              placeholder="Enter one rule per line."
            />
            <div className="flex gap-4">
              <Button variant="primary" type="submit">
                {editingId ? 'Update' : 'Save Rule'}
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

      <div className="space-y-8">
        {loading ? (
            <div className="text-center py-20 text-gray-100">Loading rules...</div>
        ) : (rules.length === 0 && !isFormOpen) ? (
            <p className="text-center">
                No rules found. Add some to get started.
            </p>
        ) : (
            categories.map(category => {
              const currentRules = (editingId && isFormOpen ? rules.filter(r => r.id !== editingId) : rules);
              const categoryRules = currentRules.filter(r => r.category === category);
              if (categoryRules.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-black text-orange-500 uppercase tracking-tighter border-b border-gray-200 pb-2">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {categoryRules.map((rule) => (
                      <div key={rule.id} className="bg-white p-6 rounded-md border border-gray-500 flex justify-between items-center gap-6">
                        <div className="flex-1">
                          <ul className="space-y-2">
                            {rule.rule.split('\n').filter(line => line.trim()).map((line, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 mr-2"></span>
                                <span className="text-sm leading-relaxed">{line.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {isPresident && (
                          <div className="flex gap-3 shrink-0">
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(rule)}
                              icon={{ left: <EditIcon className="size-5" /> }}
                            />
                            <Button 
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(rule.id)}
                              icon={{ left: <DeleteIcon className="size-5" /> }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
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

export default Rules;
