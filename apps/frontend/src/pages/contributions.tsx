"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Breadcrumb from "@/components/breadcrumb";
import Banner from "@/components/banner";
import Button from "@/components/button";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import residentsData from "@/data/residents.json";

const years = ["2023", "2024", "2025"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getStatus = (residentIndex: number, monthIndex: number, year: string) => {
  const y = parseInt(year);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  if (y > currentYear || (y === currentYear && monthIndex > currentMonth)) {
    return 0; // future
  }
  
  const seed = residentIndex * 31 + monthIndex * 17 + y * 13;
  return (seed % 10 > 1) ? 1 : -1; 
};

const residents = residentsData;

const securityFees = [
  { item: "24/7 Gate Security Guard", amount: "₹ 3,500" },
  { item: "CCTV Network & Surveillance AMC", amount: "₹ 1,000" },
  { item: "Biometric Access System Maint.", amount: "₹ 500" },
];
const totalSecurityFee = "₹ 5,000";

const MaintenancePay = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  return (
    <DefaultLayout>
      <Head>
        <title>Contributions | Our Society</title>
      </Head>

      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements (Consistency with other pages) */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-cyan-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          {/* Banner component */}
          <Banner title="Services" subtitle="Contributions" theme="maintenance" />
          
          <Breadcrumb items={[{ label: "Services", href: "/" }, { label: "Contributions" }]} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
            {/* Monthly fees section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
                  Monthly <span className="text-orange-500">Society Fees</span>
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto md:mx-0">
                  Track the monthly maintenance charges payment status for each residential unit.
                </p>
              </div>

              {/* Year Selector */}
              <div className="flex items-center space-x-3 text-gray-800">
                <button 
                  onClick={() => {
                    const idx = years.indexOf(selectedYear);
                    if (idx > 0) setSelectedYear(years[idx - 1]);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    years.indexOf(selectedYear) > 0 
                      ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  disabled={years.indexOf(selectedYear) === 0}
                >
                  <KeyboardArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="text-xl md:text-2xl font-extrabold text-orange-500 min-w-[80px] text-center">{selectedYear}</div>
                <button 
                  onClick={() => {
                    const idx = years.indexOf(selectedYear);
                    if (idx < years.length - 1) setSelectedYear(years[idx + 1]);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    years.indexOf(selectedYear) < years.length - 1 
                      ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  disabled={years.indexOf(selectedYear) === years.length - 1}
                >
                  <KeyboardArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden mb-16 relative">
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 z-20 bg-slate-50 border-b border-gray-100 shadow-sm">
                    <tr>
                      <th className="py-4 px-4 md:px-6 text-gray-500 font-semibold tracking-wider text-xs uppercase sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_#e5e7eb]">
                        Name of Resident
                      </th>
                      <th className="py-4 px-4 text-gray-500 font-semibold tracking-wider text-xs uppercase">
                        Apartment
                      </th>
                      <th className="py-4 px-4 text-gray-500 font-semibold tracking-wider text-xs uppercase text-right pr-6">
                        Phone Number
                      </th>
                      {months.map(m => (
                        <th key={m} className="py-4 px-2 text-center text-gray-500 font-semibold tracking-wider text-[10px] uppercase">
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((resident, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-gray-50 hover:bg-slate-50 transition-colors duration-150 group"
                      >
                        <td className="py-3 px-4 md:px-6 text-gray-800 font-bold sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f3f4f6] whitespace-nowrap group-hover:bg-slate-50 transition-colors">
                          {resident.name}
                        </td>
                        <td className="py-3 px-4 text-blue-600 font-bold text-sm tracking-wide bg-blue-50/30 whitespace-nowrap">
                          {resident.flat}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-medium text-sm text-right pr-6 whitespace-nowrap font-mono">
                          {resident.phone}
                        </td>
                        {months.map((m, mIdx) => {
                          const status = getStatus(idx, mIdx, selectedYear);
                          let bgClass = "bg-gray-300"; // Future/Blank
                          if (status === 1) bgClass = "bg-green-500";
                          else if (status === -1) bgClass = "bg-red-500";
                          return (
                            <td key={mIdx} className="py-3 px-2 text-center">
                              <div className={`w-3 h-3 md:w-4 md:h-4 mx-auto rounded-full shadow-sm border border-black/5 ${bgClass}`}></div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10 hidden md:block"></div>
              
              <div className="w-full bg-slate-50 border-t border-gray-100 p-4 flex flex-wrap gap-6 justify-center text-xs font-semibold text-gray-500 tracking-wide uppercase shadow-inner relative z-20">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm border border-black/5"></div>
                    Paid
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm border border-black/5"></div>
                    Unpaid
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300 shadow-sm border border-black/5"></div>
                    Future / No Info
                 </div>
              </div>
            </div>

            {/* Annual security fee section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-black mb-4 tracking-tight">
                Annual <span className="text-orange-500">Security Fees</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Breakdown of our comprehensive yearly security network maintenance and management.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden mb-20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100">
                      <th className="py-5 px-6 md:px-10 text-gray-500 font-semibold tracking-wider uppercase text-sm">
                        Charge Category
                      </th>
                      <th className="py-5 px-6 md:px-10 text-gray-500 font-semibold tracking-wider uppercase text-sm text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityFees.map((fee, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 md:px-10 text-gray-700 font-medium">
                          {fee.item}
                        </td>
                        <td className="py-4 px-6 md:px-10 text-gray-800 font-bold text-right font-mono">
                          {fee.amount}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-orange-50/50">
                      <td className="py-6 px-6 md:px-10 text-orange-900 font-extrabold text-lg md:text-xl">
                        Total Annual Security Fee
                      </td>
                      <td className="py-6 px-6 md:px-10 text-orange-600 font-black text-xl md:text-2xl text-right font-mono tracking-tight">
                        {totalSecurityFee}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Call To Action Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl flex flex-col items-center justify-center border border-blue-400/30">
              
              {/* Background abstract circles for CTA block */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-full mb-6 relative">
                  <CreditCardOutlinedIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl md:text-4xl font-black mb-3 drop-shadow-sm tracking-tight">
                  Haven&apos;t paid your fees yet?
                </h3>
                
                <p className="text-blue-100 md:text-lg mb-8 max-w-lg font-light">
                  Ensure seamless services and avoid late penalties. Click below to proceed to our secure payment gateway and clear your dues instantly.
                </p>

                <Button 
                  variant="secondary"
                  icon={{ right: <ArrowForwardIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> }}
                >
                  Pay Now
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MaintenancePay;
