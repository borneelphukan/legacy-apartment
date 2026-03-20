"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb, Button, Icon, Spinner, Input } from "@legacy-apartment/ui";
import api from "@/lib/api";

const categoryMetadata: Record<string, { icon: React.ReactNode }> = {
  "General Rules": { icon: <Icon type="info"/> },
  "Security & Visitors": { icon: <Icon type="security"/> },
  "Facilities & Amenities": { icon: <Icon type="domain"/> },
  "Parking Guidelines": { icon: <Icon type="local_parking"/> },
  "Pet Policies": { icon: <Icon type="pets"/> },
  "Housing Society by law in India": { icon: <Icon type="account_balance"/> },
  "Eligibility of Tenants in Housing Society": { icon: <Icon type="how_to_reg"/> },
  "Duty of Associated Member": { icon: <Icon type="assignment_ind"/> },
  "Formation of Society": { icon: <Icon type="group_add"/> },
  "Pet & Dog": { icon: <Icon type="pets"/> }
};


const Rules = () => {
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(0); // First one open by default
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lock logic states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [globalPassword, setGlobalPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('rules_lock');
    if (saved === "true") {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesRes, settingsRes] = await Promise.all([
          api.get('/rules'),
          api.get('/setting')
        ]);
        setRules(rulesRes.data);
        if (settingsRes.data?.frontendPassword) {
          setGlobalPassword(settingsRes.data.frontendPassword);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === globalPassword) {
      setIsUnlocked(true);
      localStorage.setItem('rules_lock', "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const toggleCategory = (index: number) => {
    if (openCategoryIndex === index) {
      setOpenCategoryIndex(null); // Close if already open
    } else {
      setOpenCategoryIndex(index);
    }
  };

  // Group rules by category
  const uniqueCategories = Array.from(new Set(rules.map((r) => r.category)));

  const groupedRules = uniqueCategories.map((category) => {
    return {
      category: category as string,
      icon: categoryMetadata[category as string]?.icon || <Icon type="info"/>,
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
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                Society <span className="text-orange-500">Guidelines</span>
              </h2>
              <p className="text-gray-600 md:text-lg mb-6">
                The foundation of our harmonious lifestyle. We invite you to explore the guidelines designed to foster mutual respect, ensure unparalleled safety, and nurture a vibrant quality of life for all residents.
              </p>
            </div>

            {/* View PDF Section */}
            <div className="flex justify-center mb-12">
              <Button
                href="/legacy-registration-certificate.pdf"
                target="_blank"
                variant="outline"
                className="hover:!border-orange-500 bg-white"
                icon={{ 
                  left: (
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-300 transition-colors">
                      <Icon type="picture_as_pdf" className="text-red-500 text-[18px]" />
                    </div>
                  ) 
                }}
              >
                View Registration Certificate
              </Button>
            </div>

            {/* Interactive Accordion */}
            {!isUnlocked ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-400 overflow-hidden relative">
                <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-slate-50/50 min-h-[400px]">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 text-gray-800 border border-gray-400">
                    <Icon type="lock" className="text-[32px]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">Restricted Access</h3>
                  <p className="mb-8 text-center max-w-sm">Please enter the password to view the rules and regulations.</p>
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
              </div>
            ) : loading ? (
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
                    className={`bg-white rounded-2xl border border-gray-500 transition-all duration-300 overflow-hidden`}
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
                      <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-orange-500"}`}>
                        <Icon type="keyboard_arrow_down" />
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
