import React, { useState, useEffect } from "react";
import { Input } from "./input";
import Button from "./button";

export interface Resident {
  name: string;
  flat?: string;
  residence?: string;
  phone?: string;
  phone_no?: string;
  designation?: string | null;
}

export interface Props {
  residents: Resident[];
  columns: string[];
  getStatus?: (resident: any, columnIndex: number) => number;
  getValue?: (resident: any, columnIndex: number) => string | number;
  onCellClick?: (resident: any, columnIndex: number) => void;
  onValueChange?: (resident: any, columnIndex: number, value: string) => void;
  onMonthlyFeeChange?: (value: string) => void;
  onYearlyFeeChange?: (value: string) => void;
  theme: "blue" | "orange";
  minWidthClass?: string;
  className?: string;
  enableLock?: boolean;
  type?: "status" | "numerical";
  monthlyFee?: string;
  yearlyFee?: string;
  showMonthlyFeeLegend?: boolean;
  showYearlyFeeLegend?: boolean;
  storageKey?: string;
}

const Table = ({
  residents,
  columns,
  getStatus,
  getValue,
  onCellClick,
  onValueChange,
  onMonthlyFeeChange,
  onYearlyFeeChange,
  theme,
  minWidthClass = "min-w-[1000px]",
  className = "",
  enableLock = false,
  type = "status",
  monthlyFee,
  yearlyFee,
  showMonthlyFeeLegend = true,
  showYearlyFeeLegend = true,
  storageKey,
}: Props) => {
  const [isUnlocked, setIsUnlocked] = useState(!enableLock);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (enableLock && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        setIsUnlocked(true);
      }
    }
  }, [enableLock, storageKey]);
  const [editingCell, setEditingCell] = useState<{ resIdx: number; colIdx: number } | null>(null);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [editingYearly, setEditingYearly] = useState(false);
  const [tempValue, setTempValue] = useState("");

  const shadowColor = theme === "blue" ? "shadow-blue-900/5" : "shadow-orange-900/5";
  const apartmentTextColor = theme === "blue" ? "text-blue-600" : "text-orange-600";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "legacy6mile") {
      setIsUnlocked(true);
      if (storageKey) {
        localStorage.setItem(storageKey, "true");
      }
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl ${shadowColor} border border-gray-100 overflow-hidden relative ${className}`}>
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-slate-50/50 min-h-[400px]">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-grey-100 border border-gray-100">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-tight">Restricted Access</h3>
          <p className="text-grey-100 mb-8 text-center max-w-sm">Please enter the password to view the contributions data.</p>
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
              Unlock Table
            </Button>
          </form>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className={`w-full text-left border-collapse ${minWidthClass}`}>
              <thead className="top-0 z-20 bg-slate-50 border-b border-gray-400">
                <tr>
                  <th className="py-4 px-4 md:px-6 text-sm bg-slate-50 z-30">
                    Resident
                  </th>
                  <th className="py-4 px-4 text-sm">
                    Apartment
                  </th>
                  <th className="py-4 px-4 text-sm">
                    Phone
                  </th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="py-4 px-2 text-center text-sm md:text-sm">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.map((resident, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-50 transition-colors duration-150 group"
                  >
                    <td className="py-2 px-4 md:px-6 z-10 whitespace-nowrap transition-colors">
                      {resident.name}
                    </td>
                    <td className={`py-2 px-4 text-sm whitespace-nowrap`}>
                      <div className="flex items-center gap-2">
                        {resident.residence || resident.flat}
                        {resident.designation && resident.designation !== 'None' && (
                          <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter shrink-0">
                            {resident.designation}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm pr-6 whitespace-nowrap">
                      {resident.phone_no || resident.phone}
                    </td>
                    {columns.map((col, colIdx) => {
                      if (type === "status") {
                        const status = getStatus ? getStatus(resident, colIdx) : 0;
                        const value = getValue ? getValue(resident, colIdx) : "";
                        const mFee = (monthlyFee || "0").replace(/[^0-9]/g, "");
                        const numericValue = String(value).replace(/[^0-9]/g, "");
                        
                        let bgClass = "bg-gray-300"; // Future/Blank
                        if (status === 1 || (numericValue !== "0" && numericValue === mFee)) bgClass = "bg-green-500";
                        else if (status === -1) bgClass = "bg-red-500";
                        return (
                          <td key={colIdx} className="py-3 px-4 md:px-2 text-center">
                            <div className={`w-3 h-3 md:w-4 md:h-4 mx-auto rounded-full shadow-sm border ${bgClass}`}></div>
                          </td>
                        );
                      } else {
                        const isEditing = editingCell?.resIdx === idx && editingCell?.colIdx === colIdx;
                        const value = getValue ? getValue(resident, colIdx) : "";
                        
                        return (
                          <td 
                            key={colIdx} 
                            className="py-1 px-2 text-center cursor-pointer transition-colors"
                            onClick={() => {
                              if (!isEditing) {
                                setEditingCell({ resIdx: idx, colIdx: colIdx });
                                setTempValue(String(value));
                              }
                              onCellClick?.(resident, colIdx);
                            }}
                          >
                            {isEditing ? (
                              <input 
                                autoFocus
                                className="w-16 text-xs p-1 border rounded text-center outline-none focus:border-orange-500"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={() => {
                                  onValueChange?.(resident, colIdx, tempValue);
                                  setEditingCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur();
                                }}
                              />
                            ) : (
                              <span className="text-sm">
                                {value !== "" ? `${value}` : "-"}
                              </span>
                            )}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10 hidden md:block"></div>
          
          <div className="w-full border-t border-gray-400 p-4 flex flex-wrap gap-6 justify-center text-sm text-grey-100 relative z-20">
             {type === "status" ? (
               <>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm border"></div>
                    Paid
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm border"></div>
                    Unpaid
                 </div>
               </>
             ) : (
               <>
                 {showMonthlyFeeLegend && (
                  <div className="flex items-center gap-2">
                      <span className="text-gray-100">Monthly Society Fees:</span>
                      {editingMonthly ? (
                        <input 
                          autoFocus
                          className="w-20 text-xs p-1 border rounded outline-none text-gray-900"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => {
                            onMonthlyFeeChange?.(tempValue);
                            setEditingMonthly(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                        />
                      ) : (
                        <span 
                          className={`font-bold cursor-pointer hover:underline ${apartmentTextColor}`}
                          onClick={() => {
                            setEditingMonthly(true);
                            setTempValue((monthlyFee || "").replace("₹", "").trim());
                          }}
                        >
                          {monthlyFee || "₹ 0"}
                        </span>
                      )}
                  </div>
                 )}
                 {showYearlyFeeLegend && (
                  <div className="flex items-center gap-2 ml-4">
                      <span className="text-gray-100">Yearly Maintenance Fees:</span>
                      {editingYearly ? (
                        <input 
                          autoFocus
                          className="w-20 text-xs p-1 border rounded outline-none text-gray-900"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => {
                            onYearlyFeeChange?.(tempValue);
                            setEditingYearly(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                        />
                      ) : (
                        <span 
                          className={`font-bold cursor-pointer hover:underline ${apartmentTextColor}`}
                          onClick={() => {
                            setEditingYearly(true);
                            setTempValue((yearlyFee || "").replace("₹", "").trim());
                          }}
                        >
                          {yearlyFee || "₹ 0"}
                        </span>
                      )}
                  </div>
                 )}
               </>
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default Table;
