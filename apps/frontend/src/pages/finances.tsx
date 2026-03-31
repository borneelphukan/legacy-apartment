"use client";
import React, { useState } from "react";
import Image from "next/image";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Breadcrumb, Banner, Button, Table, Icon } from "@legacy-apartment/ui";
import api from "@/lib/api";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => String(2023 + i));
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const securityYearsAll = years;

const getStatus = (resident: any, monthIndex: number, year: string, monthlyFee: number) => {
  const targetYear = parseInt(year);
  const rate = resident.monthlyRate || monthlyFee;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let surplus = 0;
  let currentStatus = 0;

  // Iterate chronologically to calculate status and carrying surplus
  for (let y = 2023; y <= targetYear; y++) {
    const endMonth = (y === targetYear) ? monthIndex : 11;
    for (let m = 0; m <= endMonth; m++) {
      const payment = resident.monthlyPayments?.find((p: any) => p.year === y && p.month === m);
      const paid = payment ? Number(payment.amount) : 0;
      
      const available = surplus + paid;
      if (available >= rate || paid >= rate) {
        currentStatus = 1; // Green
        surplus = Math.max(0, available - rate);
      } else {
        const isPast = y < currentYear || (y === currentYear && m < currentMonth);
        const isCurrent = y === currentYear && m === currentMonth;
        currentStatus = (isPast || isCurrent) ? -1 : 0; // Red or Gray
        surplus = 0;
      }
    }
  }
  return currentStatus;
};

const getSecurityStatus = (resident: any, year: string, yearlyFee: number) => {
  const targetYear = parseInt(year);
  const now = new Date();
  const currentYear = now.getFullYear();

  let surplus = 0;
  let currentStatus = 0;

  for (let y = 2023; y <= targetYear; y++) {
    const payment = resident.securityPayments?.find((p: any) => p.year === y);
    const paid = payment ? Number(payment.amount) : 0;
    
    const available = surplus + paid;
    if (available >= yearlyFee || paid >= yearlyFee) {
      currentStatus = 1;
      surplus = Math.max(0, available - yearlyFee);
    } else {
      currentStatus = (y <= currentYear) ? -1 : 0;
      surplus = 0;
    }
  }
  return currentStatus;
};

const MaintenancePay = () => {
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [securityStartIdx, setSecurityStartIdx] = useState<number>(Math.max(0, securityYearsAll.length - 4));
  const [residents, setResidents] = useState<any[]>([]);
  const [fees, setFees] = useState({ monthlyFee: 1000, yearlyFee: 5000 });
  const [globalPassword, setGlobalPassword] = useState("");
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  React.useEffect(() => {
    fetchSettings();
  }, []);

  React.useEffect(() => {
    const fetchResidents = async () => {
      try {
        const params = new URLSearchParams();
        if (sortColumn) params.append('sortBy', sortColumn);
        if (sortOrder) params.append('sortOrder', sortOrder);

        const response = await api.get(`/residents?${params.toString()}`);
        setResidents(response.data);
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };
    fetchResidents();
  }, [sortColumn, sortOrder]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/setting');
      const data = response.data;
      if (data) {
        setFees({
          monthlyFee: data.monthlyFee,
          yearlyFee: data.yearlyFee,
        });
        if (data.frontendPassword) {
          setGlobalPassword(data.frontendPassword);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const visibleSecurityYears = securityYearsAll.slice(securityStartIdx, securityStartIdx + 4);

  return (
    <DefaultLayout>
      <Head>
        <title>Finances | Our Society</title>
      </Head>

      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements (Consistency with other pages) */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-cyan-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          {/* Banner component */}
          <Banner title="Services" subtitle="Finances" theme="maintenance" />
          
          <Breadcrumb items={[{ label: "Services", href: "/" }, { label: "Finances" }]} />

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
                  <Icon type="keyboard_arrow_left" className="text-[24px]" />
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
                  <Icon type="keyboard_arrow_right" className="text-[24px]" />
                </button>
              </div>
            </div>

            <Table
              residents={residents}
              columns={months}
              getStatus={(resident, colIndex) => getStatus(resident, colIndex, selectedYear, fees.monthlyFee)}
              getValue={(resident, colIdx) => {
                const payment = resident.monthlyPayments?.find(
                  (p: any) => p.month === colIdx && p.year === parseInt(selectedYear)
                );
                return payment?.amount || "0";
              }}
              monthlyFee={`₹ ${fees.monthlyFee.toLocaleString()}`}
              theme="blue"
              minWidthClass="min-w-[1000px]"
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSortChange={(col) => {
                  if (sortColumn === col) {
                      if (sortOrder === 'asc') setSortOrder('desc');
                      else if (sortOrder === 'desc') {
                          setSortOrder('');
                          setSortColumn('');
                      }
                  } else {
                      setSortColumn(col);
                      setSortOrder('asc');
                  }
              }}
              enableLock
              storageKey="contributions_monthly_lock"
              expectedPassword={globalPassword}
              readOnly={true}
            />

            {/* Annual security fee section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 mt-16">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
                  Yearly <span className="text-orange-500">Maintenance Fees</span>
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto md:mx-0">
                  Track the annual maintenance fee payment status for each residential unit.
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
                    <Icon type="keyboard_arrow_left" className="text-[24px]" />
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
                    <Icon type="keyboard_arrow_right" className="text-[24px]" />
                  </button>
                </div>
              )}
            </div>

            <Table
              residents={residents}
              columns={visibleSecurityYears}
              getStatus={(resident, colIndex) => getSecurityStatus(resident, visibleSecurityYears[colIndex], fees.yearlyFee)}
              getValue={(resident, colIdx) => {
                const year = parseInt(visibleSecurityYears[colIdx]);
                const payment = resident.securityPayments?.find(
                  (p: any) => p.year === year
                );
                return payment?.amount || "0";
              }}
              yearlyFee={`₹ ${fees.yearlyFee.toLocaleString()}`}
              theme="orange"
              minWidthClass="min-w-[800px]"
              className="mb-20"
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSortChange={(col) => {
                  if (sortColumn === col) {
                      if (sortOrder === 'asc') setSortOrder('desc');
                      else if (sortOrder === 'desc') {
                          setSortOrder('');
                          setSortColumn('');
                      }
                  } else {
                      setSortColumn(col);
                      setSortOrder('asc');
                  }
              }}
              enableLock
              storageKey="contributions_yearly_lock"
              expectedPassword={globalPassword}
              showMonthlyRate={false}
              readOnly={true}
            />

            {/* Payment Section */}
            <div className="mt-20 mb-10 pb-10 max-w-2xl mx-auto text-center">
               <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                 Haven't paid your dues yet? <br />
                 <span className="text-orange-500 font-extrabold text-3xl mt-2 block">Feel free to pay through the QR Code here</span>
               </h3>
               
               <div className="bg-white p-8 rounded-2xl shadow border border-orange-100 inline-block">
                 <Image 
                   src="/image.webp" 
                   alt="Payment QR Code" 
                   width={350} 
                   height={350} 
                   className="mx-auto rounded-xl rounded border border-gray-200"
                 />
                 <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
                   <p className="text-xl font-bold text-gray-900 font-mono tracking-wider">327473603864370@cnrb</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MaintenancePay;
