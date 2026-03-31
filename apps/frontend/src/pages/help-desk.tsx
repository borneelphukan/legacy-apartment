"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb, Button, Input, TextArea, Icon, Spinner } from "@legacy-apartment/ui";
import api from "@/lib/api";
import { helpDeskSchema, unlockSchema } from '@legacy-apartment/shared';


const HelpDesk = () => {
  const [formData, setFormData] = useState({
    name: "",
    apartment: "",
    phone_no: "",
    complaint: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [globalPassword, setGlobalPassword] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/setting');
        if (response.data && response.data.frontendPassword) {
          setGlobalPassword(response.data.frontendPassword);
        }
      } catch (e) {}
    };
    fetchSettings();

    const saved = localStorage.getItem("helpdesk_lock");
    if (saved === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const result = unlockSchema.safeParse({ password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    
    if (password === globalPassword) {
      setIsUnlocked(true);
      localStorage.setItem("helpdesk_lock", "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    const result = helpDeskSchema.safeParse(formData);
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

    setSubmitting(true);

    try {
      const response = await api.post('/complaints', formData);

      if (response.status === 201 || response.status === 200) {
        setSubmitted(true);
        setFormData({ name: "", apartment: "", phone_no: "", complaint: "" });
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Help Desk | Legacy Apartment</title>
      </Head>

      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements (Consistency with other pages) */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-orange-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          <Banner 
            title="Help Desk & Support" 
            subtitle="We're here to help" 
            bgClass="support-cover" 
            theme="light" 
          />
          <Breadcrumb items={[{ label: "Services" }, { label: "Help Desk" }]} />

          <div className="max-w-4xl mx-auto px-6 md:px-12 mt-10">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                Resident <span className="text-orange-500">Support</span>
              </h2>
              <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
                Have a concern or need assistance? Fill out the form below, and our management team will address your request as a priority.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-400 shadow-xl overflow-hidden shadow-orange-500/5">
              {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-slate-50/50 min-h-[400px]">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 border border-gray-400">
                    <Icon type="lock" className="text-[32px]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">Restricted Access</h3>
                  <p className="mb-8 text-center max-w-sm">Please enter the password to submit a complaint or support ticket.</p>
                  <form onSubmit={handleUnlock} className="flex flex-col items-center w-full max-w-sm gap-4">
                    <Input 
                      id="unlock-password"
                      label="Password"
                      hideLabel
                      type="password" 
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      error={error}
                    />
                    <Button 
                      type="submit"
                      variant="primary"
                    >
                      Unlock
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Info Sidebar */}
                <div className="md:col-span-2 bg-orange-500 p-8 md:p-12 text-white flex flex-col justify-between">
                  <div>
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                      <Icon type="support_agent" className="text-[40px] text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Contact Info</h3>
                    <p className="text-orange-50/80 mb-8 leading-relaxed">
                      For immediate assistance or emergencies, please contact the Secretary or the President.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-white/40"></div>
                        <div>
                          <p className="font-bold">24/7 Security</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-white/40"></div>
                        <div>
                          <p className="font-bold">Society Office</p>
                          <p className="text-orange-50/70 text-sm">10:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="md:col-span-3 p-8 md:p-12">
                  {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-20 h-20 bg-green-300 rounded-full flex items-center justify-center mb-6 text-green-200">
                        <Icon type="check_circle" className="text-[48px]" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Complaint Received</h3>
                      <p className="mb-8">
                        Thank you for bringing this to our attention. We have registered your complaint and will get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Input 
                        id="name"
                        label="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        error={formErrors.name}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                          id="apartment"
                          label="Apartment / Flat No."
                          required
                          value={formData.apartment}
                          onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                          error={formErrors.apartment}
                        />
                        <Input 
                          id="phone_no"
                          label="Phone Number"
                          required
                          type="tel"
                          value={formData.phone_no}
                          onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
                          error={formErrors.phone_no}
                        />
                      </div>

                      <TextArea 
                        id="complaint"
                        label="Your Complaint"
                        required
                        rows={5}
                        className="border border-gray-400 text-gray-100"
                        value={formData.complaint}
                        onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                        error={formErrors.complaint}
                      />

                      <Button 
                        type="submit" 
                        variant="primary" 
                      >
                         Submit
                      </Button>
                    </form>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HelpDesk;
