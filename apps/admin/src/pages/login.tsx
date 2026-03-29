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
  DialogDescription,
  Icon
} from '@legacy-apartment/ui';
import api from '@/lib/api';
import { loginSchema, registerSchema } from '@legacy-apartment/shared';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [residence, setResidence] = useState('');
  const [phone_no, setPhoneNo] = useState('');
  const [role, setRole] = useState('secretary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
    onClose?: () => void;
  } | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!email) {
      setFormErrors({ email: 'Email is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/users/forgot-password', { email });
      setAlertDialog({
        open: true,
        title: 'Check your email',
        description: response.data.message || 'If an account exists, a reset link will be sent.',
        type: 'success',
        onClose: () => setIsForgotPasswordMode(false)
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = isRegisterMode 
      ? { email, password, firstName, lastName, role, residence, phone_no }
      : { email, password };

    const schema = isRegisterMode ? registerSchema : loginSchema;
    const result = schema.safeParse(payload);

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

    setIsSubmitting(true);

    const endpoint = isRegisterMode ? 'register' : 'login';

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
                {isForgotPasswordMode ? 'Reset Password' : isRegisterMode ? 'Create User' : 'Login'}
              </h1>
              <p className="font-light text-gray-100">
                {isForgotPasswordMode 
                  ? 'Enter your email to receive a reset link' 
                  : isRegisterMode 
                    ? 'Register a new administrator' 
                    : 'Sign in to manage your community'}
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={isForgotPasswordMode ? handleForgotPassword : handleAuth}>
              <div className="space-y-4">
                {isRegisterMode && !isForgotPasswordMode && (
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
                        error={formErrors.firstName}
                      />
                      <Input
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={formErrors.lastName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="residence"
                        label="Apartment No."
                        name="residence"
                        required
                        placeholder="A-101"
                        value={residence}
                        onChange={(e) => setResidence(e.target.value)}
                        error={formErrors.residence}
                      />
                      <Input
                        id="phone_no"
                        label="Phone Number"
                        name="phone_no"
                        required
                        placeholder="+91 9876543210"
                        value={phone_no}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        error={formErrors.phone_no}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <DropdownMenu className="w-full">
                        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-xl border border-gray-400 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all">
                          <span className="capitalize">{role}</span>
                          <Icon type="keyboard_arrow_down" className="text-[20px]" />
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
                  error={formErrors.email}
                />
                
                {!isForgotPasswordMode && (
                  <>
                    <Input
                      id="password"
                      label="Password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={formErrors.password}
                    />
                    {!isRegisterMode && (
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordMode(true)}
                          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="text-center w-full space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  label={isForgotPasswordMode ? 'Send Reset Link' : isRegisterMode ? 'Create Account' : 'Sign In'}
                />
                
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  {isForgotPasswordMode ? (
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(false)}
                      className="text-orange-600 hover:text-orange-700 transition-colors font-semibold"
                    >
                      Back to login
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}
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
