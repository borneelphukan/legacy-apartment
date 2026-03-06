"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import RulesBanner from "@/components/Rules/RulesBanner";
import Breadcrumb from "@/components/breadcrumb";

const rulesData = [
  {
    category: "General Rules",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    rules: [
      "Maintain peace and harmony within the society premises.",
      "Loud music or noise is strictly prohibited after 10:00 PM.",
      "Garbage must be segregated into wet and dry waste before disposal.",
      "Modification to the exterior facade of the apartments is not permitted.",
    ]
  },
  {
    category: "Security & Visitors",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    rules: [
      "All visitors must sign in at the main gate security cabin.",
      "Delivery personnel are allowed only up to the designated lobby areas unless pre-approved.",
      "Maids and support staff must carry valid society ID cards at all times.",
    ]
  },
  {
    category: "Amenities Usage",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
    rules: [
      "The clubhouse and pool are open from 6:00 AM to 10:00 PM.",
      "Proper swimming attire is mandatory for pool usage.",
      "Children under 12 must be accompanied by an adult in all amenity areas.",
      "Gym equipment must be wiped down after use.",
    ]
  },
  {
    category: "Parking Guidelines",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    rules: [
      "Vehicles must be parked only in the designated allotted slots.",
      "Visitor parking is strictly for guests and restricted to 4 hours maximum.",
      "Washing of vehicles in the basement parking is prohibited.",
    ]
  },
  {
    category: "Pet Policies",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    rules: [
      "Pets must be kept on a leash at all times in common areas.",
      "Pet owners are strictly responsible for cleaning up after their pets.",
      "Pets are not allowed in the pool area or the main clubhouse.",
    ]
  }
];

const Rules = () => {
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(0); // First one open by default

  const toggleCategory = (index: number) => {
    if (openCategoryIndex === index) {
      setOpenCategoryIndex(null); // Close if already open
    } else {
      setOpenCategoryIndex(index);
    }
  };

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
          <RulesBanner />
          <Breadcrumb items={[{ label: "Our Society" }, { label: "Rules" }]} linkClasses="inline-flex items-center text-sm font-normal text-gray-700" />

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
            <div className="space-y-4">
              {rulesData.map((section, index) => {
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
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                          {section.icon}
                        </div>
                        <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${isOpen ? "text-orange-600" : "text-gray-800"}`}>
                          {section.category}
                        </h3>
                      </div>
                      <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-gray-400"}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
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
            
            {/* Download/Print Action (Static UI representation) */}
            <div className="mt-12 flex justify-center">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Rulebook PDF</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Rules;
