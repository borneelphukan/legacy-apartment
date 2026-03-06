"use client";
import React from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import DetailsStack from "@/components/Contact/DetailsStack";
import Breadcrumb from "@/components/breadcrumb";
import ContactBanner from "@/components/Contact/ContactBanner";
import ContactForm from "@/components/Contact/ContactForm";

const Contact = () => {
  return (
    <DefaultLayout>
      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-purple-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          <ContactBanner />
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
          
          <div className="max-w-4xl mx-auto px-6 md:px-12 mt-12 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
              Get in <span className="text-orange-500">Touch</span>
            </h2>
            <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
              We&apos;re always here to listen. Whether you have an inquiry, constructive feedback, or simply want to connect with the society office, our dedicated team is just a message away.
            </p>
          </div>

          <DetailsStack />
          <ContactForm/>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Contact;
