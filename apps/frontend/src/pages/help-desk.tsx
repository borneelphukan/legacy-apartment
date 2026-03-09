"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb, Button, Input, TextArea } from "@legacy-apartment/ui";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Swal from 'sweetalert2';
import { ChevronLeftOutlined, ChevronRightOutlined } from "@mui/icons-material";

const API_BASE_URL = 'http://localhost:4000';

const HelpDesk = () => {
  const [formData, setFormData] = useState({
    name: "",
    apartment: "",
    phone_no: "",
    complaint: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", apartment: "", phone_no: "", complaint: "" });
        Swal.fire({
          title: 'Submitted!',
          text: 'Your complaint has been successfully registered. Our team will look into it shortly.',
          icon: 'success',
          confirmButtonColor: '#f97316',
        });
      } else {
        Swal.fire('Error', 'Failed to submit complaint. Please try again.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Communication with server failed', 'error');
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
              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Info Sidebar */}
                <div className="md:col-span-2 bg-orange-500 p-8 md:p-12 text-white flex flex-col justify-between">
                  <div>
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                      <SupportAgentOutlinedIcon className="w-10 h-10 text-white" />
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
                        <CheckCircleOutlineIcon className="w-12 h-12" />
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
                        placeholder="John Doe"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                          id="apartment"
                          label="Apartment / Flat No."
                          required
                          value={formData.apartment}
                          onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                        />
                        <Input 
                          id="phone_no"
                          label="Phone Number"
                          required
                          type="tel"
                          value={formData.phone_no}
                          onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
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
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HelpDesk;
