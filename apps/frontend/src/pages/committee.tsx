"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb } from "@legacy-apartment/ui";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";



const Committee = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [announcements, setAnnouncements] = useState<Record<string, any[]>>({});
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, resRes] = await Promise.all([
          fetch('http://localhost:4000/announcements'),
          fetch('http://localhost:4000/residents')
        ]);

        if (annRes.ok) {
          const data = await annRes.json();
          const grouped: Record<string, any[]> = {};
          data.forEach((ann: any) => {
            const year = new Date(ann.date).getFullYear().toString();
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push({
                ...ann,
                date: new Date(ann.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            });
          });
          setAnnouncements(grouped);
          const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
          if (years.length > 0) setSelectedYear(years[0]);
        }

        if (resRes.ok) {
          const data = await resRes.json();
          const committee = data
            .filter((res: any) => res.designation && res.designation !== 'None')
            .sort((a: any, b: any) => {
              const order = ['President', 'Secretary', 'Treasurer'];
              return order.indexOf(a.designation) - order.indexOf(b.designation);
            });
          setCommitteeMembers(committee);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DefaultLayout>
      <Head>
        <title>Committee | Our Society</title>
      </Head>

      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] bg-orange-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          <Banner title="Our Committee" subtitle="Meet The Heads" bgClass="committee-cover" theme="dark" />
          <Breadcrumb items={[{ label: "Our Society" }, { label: "Committee" }]} linkClasses="inline-flex items-center text-sm font-normal text-gray-700 hover:text-orange-500" />

          <div className="max-w-6xl mx-auto px-6 md:px-12 mt-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                Society <span className="text-orange-500">Heads</span>
              </h2>
              <p className="md:text-lg max-w-2xl mx-auto">
                The visionaries and stewards of our thriving community. Meet the dedicated individuals whose expertise and tireless commitment ensure seamless operations, robust financial health, and an elevated living experience for everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {loading ? (
                <div className="col-span-full text-center py-20">Loading committee...</div>
              ) : committeeMembers.length === 0 ? (
                <div className="col-span-full text-center py-20">No committee members assigned yet.</div>
              ) : (
                committeeMembers.map((member, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2 group"
                  >
                    <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-orange-50 group-hover:border-orange-100 transition-colors duration-300 bg-gray-50 flex items-center justify-center">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                          <span className="text-4xl text-gray-300 italic font-serif">{member.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <div className="text-gray-500 font-medium mb-4 text-sm flex items-center justify-center gap-2">
                      {member.residence}
                    </div>
                    <div className="text-orange-500 font-semibold mb-4 tracking-wide uppercase text-sm">{member.designation}</div>
                    <p className="text-gray-600 leading-relaxed text-sm">Dedicated to serving our society in the capacity of {member.designation}.</p>
                    
                    <div className="flex space-x-4 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="text-gray-400 hover:text-orange-500 transition-colors">
                        <EmailIcon className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-orange-500 transition-colors">
                        <PhoneIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Divider */}
            <div className="my-24 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            {/* Decisions Section */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                  Committee <span className="text-orange-500">Decisions</span>
                </h2>
                <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
                  Chronological record of key decisions and outcomes from our society meetings.
                </p>
              </div>

              {/* Year Selector */}
              <div className="max-w-4xl mx-auto px-4 md:px-0">
                <div className="flex items-center justify-center md:justify-end space-x-3 mb-6 md:mb-8 text-gray-800">
                  <button 
                    onClick={() => {
                      const sortedYears = Object.keys(announcements).sort();
                      const idx = sortedYears.indexOf(selectedYear);
                      if (idx > 0) setSelectedYear(sortedYears[idx - 1]);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      Object.keys(announcements).sort().indexOf(selectedYear) > 0 
                        ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={Object.keys(announcements).sort().indexOf(selectedYear) <= 0}
                  >
                    <KeyboardArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="text-xl md:text-2xl font-extrabold text-orange-500 min-w-[80px] text-center">{selectedYear}</div>
                  <button 
                    onClick={() => {
                      const sortedYears = Object.keys(announcements).sort();
                      const idx = sortedYears.indexOf(selectedYear);
                      if (idx < sortedYears.length - 1) setSelectedYear(sortedYears[idx + 1]);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      Object.keys(announcements).sort().indexOf(selectedYear) < Object.keys(announcements).length - 1 
                        ? "hover:bg-orange-50 hover:text-orange-500 text-gray-600 cursor-pointer" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={Object.keys(announcements).sort().indexOf(selectedYear) >= Object.keys(announcements).length - 1}
                  >
                    <KeyboardArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Stepper / Timeline */}
              <div className="max-w-4xl mx-auto px-4 md:px-0">
                <div className="relative border-l-4 border-orange-100 ml-4 md:ml-8">
                  {announcements[selectedYear]?.map(
                    (decision, idx) => {
                      return (
                        <div
                          key={idx}
                          className="mb-12 relative flex items-center w-full justify-start"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute w-5 h-5 rounded-full bg-orange-500 border-4 border-white shadow-md z-10"
                               style={{ left: "-12px" }}
                          ></div>

                          {/* Content Card */}
                          <div className="w-full ml-8 md:ml-12">
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-orange-200 group">
                              <span className="text-sm font-bold text-orange-500 mb-2 block tracking-wider uppercase">
                                {decision.date}
                              </span>
                              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
                                {decision.title}
                              </h3>
                              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                {decision.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
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

export default Committee;
