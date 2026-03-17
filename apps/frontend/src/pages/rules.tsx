"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb, Button, Icon , Spinner } from "@legacy-apartment/ui";
import api from "@/lib/api";

const categoryMetadata: Record<string, { icon: React.ReactNode }> = {
  "General Rules": { icon: <Icon type="info" className="text-[24px]" /> },
  "Security & Visitors": { icon: <Icon type="security" className="text-[24px]" /> },
  "Facilities & Amenities": { icon: <Icon type="domain" className="text-[24px]" /> },
  "Parking Guidelines": { icon: <Icon type="local_parking" className="text-[24px]" /> },
  "Pet Policies": { icon: <Icon type="pets" className="text-[24px]" /> }
};


const Rules = () => {
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(0); // First one open by default
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await api.get('/rules');
        setRules(response.data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const toggleCategory = (index: number) => {
    if (openCategoryIndex === index) {
      setOpenCategoryIndex(null); // Close if already open
    } else {
      setOpenCategoryIndex(index);
    }
  };

  // Group rules by category
  const groupedRules = Object.keys(categoryMetadata).map((category) => {
    return {
      category,
      icon: categoryMetadata[category].icon,
      rules: rules
        .filter((r) => r.category === category)
        .flatMap((r) => r.rule.split('\n'))
        .map(line => line.trim())
        .filter(line => line.length > 0)
    };
  }).filter(group => group.rules.length > 0);

  return (
    <DefaultLayout>
      <Head>
        <title>Rules & Regulations | Our Society</title>
      </Head>

      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements (Consistency with Contact & Gallery Pages) */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-orange-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          <Banner title="Rules & Regulations" subtitle="Our Policies" bgClass="rules-cover" theme="light" />
          <Breadcrumb items={[{ label: "Our Society" }, { label: "Rules & Regulations" }]} />

          <div className="max-w-4xl mx-auto px-6 md:px-12 mt-10">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                Society <span className="text-orange-500">Guidelines</span>
              </h2>
              <p className="text-gray-600 md:text-lg">
                The foundation of our harmonious lifestyle. We invite you to explore the guidelines designed to foster mutual respect, ensure unparalleled safety, and nurture a vibrant quality of life for all residents.
              </p>
            </div>

            {/* Interactive Accordion */}
            {loading ? (
              <div className="text-center"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>
            ) : groupedRules.length === 0 ? (
              <div className="text-center py-20">No rules have been set yet.</div>
            ) : (
              <div className="space-y-4">
                {groupedRules.map((section, index) => {
                  const isOpen = openCategoryIndex === index;
                  
                  return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-gray-200 shadow-sm hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    {/* Accordion Header / Trigger */}
                    <button
                      onClick={() => toggleCategory(index)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? "bg-orange-100 text-orange-600" : "bg-gray-400 text-gray-100"}`}>
                          {section.icon}
                        </div>
                        <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${isOpen ? "text-orange-600" : "text-gray-800"}`}>
                          {section.category}
                        </h3>
                      </div>
                      <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-gray-400"}`}>
                        <Icon type="keyboard_arrow_down" className="text-[24px]" />
                      </div>
                    </button>

                    {/* Accordion Content */}
                    <div 
                      className={`transition-all duration-500 ease-in-out ${
                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 md:px-20">
                        <ul className="space-y-3">
                          {section.rules.map((rule, ruleIdx) => (
                            <li key={ruleIdx} className="flex items-start">
                              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-400 mr-3"></span>
                              <span className="text-gray-600 leading-relaxed">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Rules;
