import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultLayout from '@/layout/DefaultLayout';
import { 
  Input, 
  Button, 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@legacy-apartment/ui';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('secretary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const router = useRouter();
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
    onClose?: () => void;
  } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        description: 'Please enter both email and password',
        type: 'error'
      });
      return;
    }

    if (isRegisterMode && (!firstName || !lastName)) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    const endpoint = isRegisterMode ? 'register' : 'login';
    const payload = isRegisterMode 
      ? { email, password, firstName, lastName, role }
      : { email, password };

    try {
      const response = await api.post(`/users/${endpoint}`, payload);
      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        if (!isRegisterMode) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          router.push('/');
        } else {
          setAlertDialog({
            open: true,
            title: 'User Created!',
            description: 'You can now log in',
            type: 'success',
            onClose: () => setIsRegisterMode(false)
          });
        }
      } else {
        setAlertDialog({
          open: true,
          title: 'Login failed',
          description: data.message || 'Invalid credentials',
          type: 'error'
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please check your credentials.';
      setAlertDialog({
        open: true,
        title: 'Authentication Failed',
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
        <title>Login | Legacy Apartment Admin</title>
      </Head>
      
      <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full z-10">
          <div className="bg-white rounded-[2.5rem] border border-gray-400 p-8 md:p-10">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Admin Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
                {isRegisterMode ? 'Create User' : 'Login'}
              </h1>
              <p className="font-light text-gray-100">
                {isRegisterMode ? 'Register a new administrator' : 'Sign in to manage your community'}
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-4">
                {isRegisterMode && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="firstName"
                        label="First Name"
                        name="firstName"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                      <Input
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <DropdownMenu className="w-full">
                        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-xl border border-gray-400 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all">
                          <span className="capitalize">{role}</span>
                          <KeyboardArrowDownIcon/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[300px]">
                          {['president', 'secretary', 'treasurer', 'advisor', 'technical_advisor', 'cultural_head', 'welfare_head', 'gym_head', 'gardening', 'catering'].map((r) => (
                            <DropdownMenuItem 
                              key={r} 
                              onClick={() => setRole(r)}
                              className="capitalize"
                            >
                              {r}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
                
                <Input
                  id="email-address"
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="text-center w-full space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  label={isRegisterMode ? 'Create Account' : 'Sign In'}
                />
                
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <span>
                    {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-orange-600 hover:text-orange-700 transition-colors font-semibold"
                  >
                    {isRegisterMode ? 'Sign in' : 'Create one'}
                  </button>
                </div>
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
