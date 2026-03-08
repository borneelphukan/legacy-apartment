import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import DefaultLayout from '@/layout/DefaultLayout';
import { Input, Button } from '@legacy-apartment/ui';

export default function Login() {
  const [email, setEmail] = useState('phukandipak@gmail.com');
  const [password, setPassword] = useState('dipak5969');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:4000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: 'Login successful',
          timer: 1500,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#1f2937',
        });
        
        localStorage.setItem('adminToken', data.token);
        router.push('/');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: data.message || 'Invalid credentials',
          confirmButtonColor: '#f97316',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
        confirmButtonColor: '#f97316',
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
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-400 p-8 md:p-10">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Admin Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
                Login
              </h1>
              <p className="font-light text-gray-100">
                Sign in to manage your community
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  id="email-address"
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="text-center w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  label="Sign In"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
