import React, { useState, useEffect } from 'react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Icon , Spinner } from '@legacy-apartment/ui';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { ruleSchema } from '@legacy-apartment/shared';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface Rule {
  id: number;
  category: string;
  rule: string;
  icon?: string;
  createdAt: string;
}




const TiptapEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [activeStates, setActiveStates] = useState(0);

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
      <div className="flex gap-2 p-2 border-b border-gray-400 bg-gray-50 flex-wrap items-center">
        {/* Text Alignments */}
        <div className="flex gap-2 border-r border-gray-400 pr-2">
          <Button variant={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'left' }) ? 'bg-white hover:bg-gray-400 ' : ''}`} title="Align Left">
            <Icon type="format_align_left" className='m-2'/>
          </Button>
          <Button variant={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'center' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Center">
            <Icon type="format_align_center" className='m-2'/>
          </Button>
          <Button variant={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'right' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Right">
            <Icon type="format_align_right" className='m-2'/>
          </Button>
          <Button variant={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive({ textAlign: 'justify' }) ? 'bg-white hover:bg-gray-400' : ''}`} title="Align Justify">
            <Icon type="format_align_justify" className='m-2'/>
          </Button>
        </div>

        {/* Formatting */}
        <div className="flex gap-1 border-r border-gray-400 pr-2">
          <Button variant={editor.isActive('bold') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('bold') ? 'bg-white hover:bg-gray-400' : ''}`} title="Bold">
            <Icon type="format_bold" className='m-2'/>
          </Button>
          <Button variant={editor.isActive('italic') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('italic') ? 'bg-white hover:bg-gray-400' : ''}`} title="Italic">
            <Icon type="format_italic" className='m-2'/>
          </Button>
          <Button variant={editor.isActive('underline') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('underline') ? 'bg-white hover:bg-gray-400' : ''}`} title="Underline">
            <Icon type="format_underlined" className='m-2'/>
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <Button variant={editor.isActive('bulletList') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('bulletList') ? 'bg-white hover:bg-gray-400' : ''}`} title="Bullet List">
            <Icon type="format_list_bulleted" className='m-2' />
          </Button>
          <Button variant={editor.isActive('orderedList') ? 'primary' : 'outline'} size="sm" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-8 w-8 !p-0 flex items-center justify-center rounded-md ${!editor.isActive('orderedList') ? 'bg-white hover:bg-gray-400' : ''}`} title="Numbered List">
            <Icon type="format_list_numbered" className='m-2'/>
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-[150px]" />
    </div>
  );
};

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    rule: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
    setFormErrors({});

    const result = ruleSchema.safeParse(formData);
    if (!result.success) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        description: 'Please ensure all rule details are filled out correctly.',
        type: 'error'
      });
      return;
    }

    try {
      const response = editingId 
        ? await api.patch(`/rules/${editingId}`, formData)
        : await api.post('/rules', formData);

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ category: '', rule: '' });
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
    setFormErrors({});
    setEditingId(rule.id);
    setFormData({
      category: rule.category,
      rule: rule.rule,
    });
    setIsFormOpen(true);
  };



  const isRuleEmpty = !formData.rule || formData.rule === '<p><br></p>' || formData.rule === '<p></p>';
  const existingRule = rules.find(r => r.id === editingId);
  const isRuleUnchanged = editingId && existingRule ? formData.rule === existingRule.rule : false;
  const isSaveDisabled = isRuleEmpty || isRuleUnchanged;

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
              icon={{ left: <Icon type="add" className="text-[20px]" /> }}
              onClick={() => {
                  setFormErrors({});
                  setEditingId(null);
                  setFormData({ category: '', rule: '' });
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
              <Input 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Enter category name"
                hideLabel
                label="Category"
              />
            </div>
            <div className="flex flex-col gap-2 mb-8">
              <label className="text-sm font-bold mt-2">Rule Content</label>
              <TiptapEditor 
                value={formData.rule}
                onChange={(val) => setFormData({...formData, rule: val})}
              />
            </div>
            <div className="flex gap-4">
              <Button variant="primary" type="submit" disabled={isSaveDisabled}>
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
            <div className="text-center py-20 text-gray-100"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>
        ) : (rules.length === 0 && !isFormOpen) ? (
            <p className="text-center">
                No rules found. Add some to get started.
            </p>
        ) : (
            Array.from(new Set(rules.map((r) => r.category))).map(category => {
              const currentRules = (editingId && isFormOpen ? rules.filter(r => r.id !== editingId) : rules);
              const categoryRules = currentRules.filter(r => r.category === category);
              if (categoryRules.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-black text-orange-500 uppercase tracking-tighter border-b border-gray-400 pb-2">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {categoryRules.map((rule) => (
                      <div key={rule.id} className="bg-white p-6 rounded-md border border-gray-500 flex flex-col md:flex-row justify-between items-start gap-6 relative">
                        <div className="flex-1 w-full overflow-hidden">
                          <div className="space-y-4">
                              {/<[a-z][\s\S]*>/i.test(rule.rule) ? (
                                <div dangerouslySetInnerHTML={{ __html: rule.rule }} className="[&>p]:my-2 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-5 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-4 [&>strong]:font-bold" />
                              ) : (
                                rule.rule.split('\n').filter(line => line.trim()).map((line, idx) => {
                                    let content = line.trim();
                                    return (
                                      <div key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 mr-2"></span>
                                        <span className="text-sm leading-relaxed">{content}</span>
                                      </div>
                                    );
                                })
                              )}
                          </div>
                        </div>
                        {isPresident && (
                          <div className="flex gap-3 shrink-0 self-end md:self-start">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(rule)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(rule.id)}
                            >
                              Delete
                            </Button>
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
