"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Banner from "@/components/banner";
import Breadcrumb from "@/components/breadcrumb";
import Button from "@/components/button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import LocalParkingOutlinedIcon from "@mui/icons-material/LocalParkingOutlined";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const rulesData = [
  {
    category: "General Rules",
    icon: (
      <InfoOutlinedIcon className="w-6 h-6" />
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
      <SecurityOutlinedIcon className="w-6 h-6" />
    ),
    rules: [
      "All guests must register at the reception via the society app before entering.",
      "Delivery personnel are allowed only up to the lobby drops unless approved.",
      "Security guards are authorized to question unknown persons on the premises.",
    ]
  },
  {
    category: "Facilities & Amenities",
    icon: (
      <DomainOutlinedIcon className="w-6 h-6" />
    ),
    rules: [
      "The clubhouse and gym are restricted to residents only. Guests must be accompanied.",
      "Gym hours are from 5:30 AM to 10:30 PM. Proper attire is mandatory.",
      "Swimming pool is accessible only during designated operational hours.",
    ]
  },
  {
    category: "Parking Guidelines",
    icon: (
      <LocalParkingOutlinedIcon className="w-6 h-6" />
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
      <PetsOutlinedIcon className="w-6 h-6" />
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
                        <KeyboardArrowDownIcon className="w-6 h-6" />
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
              <Button 
                variant="primary" 
                icon={{ left: <FileDownloadOutlinedIcon className="w-5 h-5 mr-2" /> }}
              >
                Download Rulebook PDF
              </Button>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Rules;
