import React, { useState } from "react";

export interface Resident {
  name: string;
  flat: string;
  phone: string;
}

export interface Props {
  residents: Resident[];
  columns: string[];
  getStatus: (residentIndex: number, columnIndex: number) => number;
  theme: "blue" | "orange";
  minWidthClass?: string;
  className?: string;
}

const Table = ({
  residents,
  columns,
  getStatus,
  theme,
  minWidthClass = "min-w-[1000px]",
  className = "",
}: Props) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const shadowColor = theme === "blue" ? "shadow-blue-900/5" : "shadow-orange-900/5";
  const apartmentTextColor = theme === "blue" ? "text-blue-600" : "text-orange-600";
  const apartmentBgColor = theme === "blue" ? "bg-blue-50/30" : "bg-orange-50/30";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "legacy6mile") {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl ${shadowColor} border border-gray-100 overflow-hidden relative ${className}`}>
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-slate-50/50 min-h-[400px]">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-gray-400 border border-gray-100">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">Restricted Access</h3>
          <p className="text-gray-500 mb-8 text-center max-w-sm">Please enter the password to view the contributions data.</p>
          <form onSubmit={handleUnlock} className="flex flex-col items-center w-full max-w-sm">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center bg-white shadow-sm mb-3 font-medium placeholder-gray-400"
            />
            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98] mt-2"
            >
              Unlock Table
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className={`w-full text-left border-collapse ${minWidthClass}`}>
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
                  {columns.map((col, idx) => (
                    <th key={idx} className="py-4 px-2 text-center text-gray-500 font-semibold tracking-wider text-[10px] md:text-xs uppercase">
                      {col}
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
                    <td className={`py-3 px-4 ${apartmentTextColor} font-bold text-sm tracking-wide ${apartmentBgColor} whitespace-nowrap`}>
                      {resident.flat}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium text-sm text-right pr-6 whitespace-nowrap font-mono">
                      {resident.phone}
                    </td>
                    {columns.map((col, colIdx) => {
                      const status = getStatus(idx, colIdx);
                      let bgClass = "bg-gray-300"; // Future/Blank
                      if (status === 1) bgClass = "bg-green-500";
                      else if (status === -1) bgClass = "bg-red-500";
                      return (
                        <td key={colIdx} className="py-3 px-4 md:px-2 text-center">
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
          </div>
        </>
      )}
    </div>
  );
};

export default Table;
