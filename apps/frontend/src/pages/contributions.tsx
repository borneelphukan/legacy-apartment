"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Breadcrumb, Banner, Button, Table } from "@legacy-apartment/ui";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const years = ["2023", "2024", "2025"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const securityYearsAll = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];

const getStatus = (resident: any, monthIndex: number, year: string) => {
  const y = parseInt(year);
  const payment = resident.monthlyPayments?.find(
    (p: any) => p.month === monthIndex && p.year === y
  );
  if (payment) return payment.status;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  if (y > currentYear || (y === currentYear && monthIndex > currentMonth)) {
    return 0; // future
  }
  
  return 0; // default to pending
};

const getSecurityStatus = (resident: any, year: string) => {
  const y = parseInt(year);
  const payment = resident.securityPayments?.find(
    (p: any) => p.year === y
  );
  if (payment) return payment.status;

  const now = new Date();
  const currentYear = now.getFullYear();
  
  if (y > currentYear) {
    return 0; // future
  }
  
  return 0;
};


const securityFees = [
  { item: "24/7 Gate Security Guard", amount: "₹ 3,500" },
  { item: "CCTV Network & Surveillance AMC", amount: "₹ 1,000" },
  { item: "Biometric Access System Maint.", amount: "₹ 500" },
];
const totalSecurityFee = "₹ 5,000";

const MaintenancePay = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [securityStartIdx, setSecurityStartIdx] = useState<number>(Math.max(0, securityYearsAll.length - 4));
  const [residents, setResidents] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await fetch('http://localhost:4000/residents');
        if (response.ok) {
          const data = await response.json();
          setResidents(data);
        }
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };
    fetchResidents();
  }, []);

  const visibleSecurityYears = securityYearsAll.slice(securityStartIdx, securityStartIdx + 4);

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

            <Table
              residents={residents}
              columns={months}
              getStatus={(resident, colIndex) => getStatus(resident, colIndex, selectedYear)}
              theme="blue"
              minWidthClass="min-w-[1000px]"
              className="mb-16"
              enableLock
            />

            {/* Annual security fee section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 mt-16">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
                  Annual <span className="text-orange-500">Security Fees</span>
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto md:mx-0">
                  Track the annual security fee payment status for each residential unit.
                </p>
              </div>

              {/* Years Range Selector */}
              {securityYearsAll.length > 4 && (
                <div className="flex items-center space-x-3 text-gray-800">
                  <button 
                    onClick={() => {
                      if (securityStartIdx > 0) setSecurityStartIdx(securityStartIdx - 1);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      securityStartIdx > 0 
                        ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={securityStartIdx === 0}
                  >
                    <KeyboardArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="text-xl md:text-2xl font-extrabold text-orange-500 min-w-[140px] text-center">
                    {visibleSecurityYears[0]} - {visibleSecurityYears[visibleSecurityYears.length - 1]}
                  </div>
                  <button 
                    onClick={() => {
                      if (securityStartIdx < securityYearsAll.length - 4) setSecurityStartIdx(securityStartIdx + 1);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      securityStartIdx < securityYearsAll.length - 4 
                        ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={securityStartIdx >= securityYearsAll.length - 4}
                  >
                    <KeyboardArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              )}
            </div>

            <Table
              residents={residents}
              columns={visibleSecurityYears}
              getStatus={(resident, colIndex) => getSecurityStatus(resident, visibleSecurityYears[colIndex])}
              theme="orange"
              minWidthClass="min-w-[800px]"
              className="mb-20"
              enableLock
            />

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
