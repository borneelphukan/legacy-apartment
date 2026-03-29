import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultLayout from '@/layout/DefaultLayout';
import { 
  Input, 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@legacy-apartment/ui';
import api from '@/lib/api';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
    onClose?: () => void;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setFormErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    if (!token) {
      setAlertDialog({
        open: true,
        title: 'Error',
        description: 'Missing reset token in the URL.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/users/reset-password', { 
        token, 
        password 
      });
      
      setAlertDialog({
        open: true,
        title: 'Success',
        description: 'Your password has been successfully reset. You can now log in.',
        type: 'success',
        onClose: () => router.push('/login')
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. The link might be expired or invalid.';
      setAlertDialog({
        open: true,
        title: 'Error',
        description: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Reset Password | Legacy Apartment Admin</title>
      </Head>
      
      <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full z-10">
          <div className="bg-white rounded-[2.5rem] border border-gray-400 p-8 md:p-10">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Admin Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
                Reset Password
              </h1>
              <p className="font-light text-gray-100">
                Enter your new password below.
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  id="password"
                  label="New Password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                />
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={formErrors.confirmPassword}
                />
              </div>

              <div className="text-center w-full space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  label="Save New Password"
                />
              </div>
            </form>
          </div>
        </div>

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
    </DefaultLayout>
  );
}
