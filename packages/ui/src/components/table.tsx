import React, { useState, useEffect } from "react";
import { Input } from "./input";
import Button from "./button";
import { StatusLight } from "./statusLight";
import { Icon } from './icon';

export interface Resident {
  name: string;
  flat?: string;
  residence?: string;
  phone?: string;
  phone_no?: string;
  monthlyRate?: number;
  designation?: string | null;
}

export interface Props {
  residents?: any[];
  data?: any[];
  columns: string[];
  headers?: string[];
  getStatus?: (row: any, columnIndex: number) => number;
  getValue?: (row: any, columnIndex: number) => string | number;
  renderCell?: (row: any, column: string, index: number) => React.ReactNode;
  onCellClick?: (row: any, columnIndex: number) => void;
  onValueChange?: (row: any, columnIndex: number, value: string) => void;
  onMonthlyRateChange?: (row: any, value: string) => void;
  onMonthlyFeeChange?: (value: string) => void;
  onYearlyFeeChange?: (value: string) => void;
  theme: "blue" | "orange";
  minWidthClass?: string;
  className?: string;
  enableLock?: boolean;
  type?: "status" | "numerical" | "general";
  monthlyFee?: string;
  yearlyFee?: string;
  showMonthlyFeeLegend?: boolean;
  showYearlyFeeLegend?: boolean;
  showMonthlyRate?: boolean;
  storageKey?: string;
  expectedPassword?: string;
  readOnly?: boolean;
  onRowClick?: (row: any) => void;
  onHeaderClick?: (columnIndex: number) => void;
  selectedColumnIndex?: number;
  tight?: boolean;
  getRowClass?: (row: any) => string;
  getCellClass?: (row: any, columnIndex: number) => string;
  sortColumn?: string;
  sortOrder?: "asc" | "desc" | "";
  onSortChange?: (column: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const Table = ({
  residents,
  data,
  columns,
  headers,
  getStatus,
  getValue,
  renderCell,
  onCellClick,
  onValueChange,
  onMonthlyRateChange,
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
  showMonthlyRate = true,
  storageKey,
  expectedPassword = "",
  readOnly = false,
  onRowClick,
  onHeaderClick,
  selectedColumnIndex,
  tight = false,
  getRowClass,
  getCellClass,
  sortColumn,
  sortOrder,
  onSortChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
}: Props) => {
  const [isUnlocked, setIsUnlocked] = useState(!enableLock);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [editingCell, setEditingCell] = useState<{ resIdx: number; colIdx: number } | null>(null);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [editingYearly, setEditingYearly] = useState(false);
  const [tempValue, setTempValue] = useState("");

  const shadowColor = theme === "blue" ? "shadow-blue-900/5" : "shadow-orange-900/5";
  const apartmentTextColor = theme === "blue" ? "text-blue-600" : "text-orange-600";

  useEffect(() => {
    if (enableLock && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        setIsUnlocked(true);
      }
    }
  }, [enableLock, storageKey]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      setIsUnlocked(true);
      if (storageKey) {
        localStorage.setItem(storageKey, "true");
      }
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const rowData = residents || data || [];

  return (
    <div className={`bg-white rounded-xl ${shadowColor} border border-gray-400 overflow-hidden relative ${className}`}>
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-slate-50/50 min-h-[400px]">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 text-grey-100 border border-gray-400">
             <Icon type="lock" className="text-[32px]" />
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
              Unlock
            </Button>
          </form>
        </div>
      ) : (
        <>
          {onSearchChange && (
            <div className="p-2 border-b border-gray-400 bg-white w-full">
              <div className="w-full md:w-1/3">
                <Input 
                  id="table-search"
                  label="Search"
                  hideLabel
                  placeholder={searchPlaceholder}
                  value={search || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  icon={{ left: <Icon type="search" className="text-[20px]" /> as any }}
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto max-h-[800px] custom-scrollbar">
            <table className={`w-full text-left border-collapse ${minWidthClass}`}>
              <thead className="top-0 z-10 bg-slate-50 border-b border-gray-400">
                <tr>
                  {type !== "general" && (
                    <>
                      {[
                        { label: 'Resident', key: 'name' },
                        { label: 'Apartment', key: 'residence' },
                        { label: 'Phone', key: 'phone_no' },
                        ...(showMonthlyRate ? [{ label: 'Monthly Rate', key: 'monthlyRate' }] : [])
                      ].map((col) => {
                        const isSorted = sortColumn === col.key;
                        const isSortable = !!onSortChange;
                        return (
                          <th 
                            key={col.key}
                            className={`${tight ? 'py-2 px-2' : `py-4 px-4 ${col.key === 'name' ? 'md:px-6' : ''}`} text-xs text-gray-100 uppercase tracking-tighter font-black bg-slate-50 text-left ${isSortable ? "cursor-pointer hover:bg-gray-500" : ""}`}
                            onClick={() => { if (isSortable) onSortChange(col.key); }}
                          >
                            <div className="flex items-center justify-between w-full h-full">
                              {col.label}
                              {isSorted && sortOrder !== "" && (
                                <span className="flex items-center transition-colors text-orange-500">
                                  {sortOrder === 'desc' ? <Icon type="keyboard_arrow_down" className="text-[20px]" /> : <Icon type="keyboard_arrow_up" className="text-[20px]" />}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </>
                  )}
                  {(headers || columns).map((col: string, idx: number) => {
                    const isSelected = selectedColumnIndex === idx;
                    const headerHighlight = isSelected 
                      ? (theme === 'orange' ? 'bg-orange-100/50 text-orange-600' : 'bg-blue-100/50 text-blue-600')
                      : 'bg-slate-50 text-gray-100';
                    
                    const columnKey = columns[idx];
                    const isSortable = !!onSortChange && type === 'general';
                    const isSorted = sortColumn === columnKey;

                    return (
                      <th 
                        key={idx} 
                        className={`p-3 text-xs uppercase tracking-tighter font-black transition-colors ${headerHighlight} ${
                          type === 'general' ? 'text-left' : 'text-center'
                        } ${(onHeaderClick || isSortable) ? "cursor-pointer hover:bg-gray-500" : ""}`}
                        onClick={() => {
                           if (isSortable) onSortChange(columnKey);
                           else onHeaderClick?.(idx);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          {col}
                          {isSorted && sortOrder !== "" && (
                            <span className="flex items-center transition-colors text-orange-500">
                              {sortOrder === 'desc' ? <Icon type="keyboard_arrow_down" className="text-[20px]" /> : <Icon type="keyboard_arrow_up" className="text-[20px]" />}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rowData.map((row: any, idx: number) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-gray-50 hover:bg-orange-50/20 transition-colors duration-150 group ${getRowClass ? getRowClass(row) : ""}`}
                  >
                    {type !== "general" && (
                      <>
                        <td 
                          className={`${tight ? 'py-1 px-2' : 'py-2 px-4 md:px-6'} z-10 whitespace-nowrap transition-colors text-sm font-medium ${onRowClick ? "cursor-pointer" : ""}`}
                          onClick={() => onRowClick?.(row)}
                        >
                          {row.name}
                        </td>
                        <td 
                          className={`${tight ? 'py-1 px-2' : 'py-2 px-4'} text-sm whitespace-nowrap ${onRowClick ? "cursor-pointer" : ""}`}
                          onClick={() => onRowClick?.(row)}
                        >
                          <div className="flex items-center gap-2">
                            {row.residence || row.flat}
                          </div>
                        </td>
                        <td 
                          className={`${tight ? 'py-1 px-2' : 'py-2 px-4'} text-sm pr-6 whitespace-nowrap ${onRowClick ? "cursor-pointer" : ""}`}
                          onClick={() => onRowClick?.(row)}
                        >
                          {row.phone_no || row.phone}
                        </td>
                        {showMonthlyRate && (
                          <td 
                            className={`${tight ? 'py-1 px-2' : 'py-2 px-4'} text-sm font-bold text-orange-600 whitespace-nowrap ${readOnly ? "" : "cursor-pointer hover:bg-orange-50"}`}
                            onClick={() => {
                              if (!readOnly) {
                                setEditingCell({ resIdx: idx, colIdx: -1 });
                                setTempValue(String(row.monthlyRate || 0));
                              }
                            }}
                          >
                            {editingCell?.resIdx === idx && editingCell?.colIdx === -1 ? (
                               <input 
                                  autoFocus
                                  className="w-16 text-xs p-1 border rounded text-center outline-none focus:border-orange-500"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={() => {
                                    onMonthlyRateChange?.(row, tempValue);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                  }}
                               />
                            ) : (
                              `₹ ${(row.monthlyRate || 1000).toLocaleString()}`
                            )}
                          </td>
                        )}
                      </>
                    )}
                    {columns.map((col: string, colIdx: number) => {
                      if (type === "general") {
                        return (
                          <td 
                            key={colIdx} 
                            className={`${tight ? 'py-2 px-2' : 'py-4 px-4'} text-left`}
                          >
                            {renderCell ? renderCell(row, col, colIdx) : (row[col] || "-")}
                          </td>
                        );
                      } else if (type === "status") {
                        const status = getStatus ? getStatus(row, colIdx) : 0;
                        const value = getValue ? getValue(row, colIdx) : "";
                        const mFee = (monthlyFee || "0").replace(/[^0-9]/g, "");
                        const numericValue = String(value).replace(/[^0-9]/g, "");
                        
                        let finalStatus = status;
                        if (numericValue !== "0" && numericValue === mFee) finalStatus = 1;

                        return (
                          <td key={colIdx} className="py-2 px-1 text-center">
                            <StatusLight status={finalStatus} size="small" />
                          </td>
                        );
                      } else {
                        const isEditing = editingCell?.resIdx === idx && editingCell?.colIdx === colIdx;
                        const value = getValue ? getValue(row, colIdx) : "";
                        
                        const isSelected = selectedColumnIndex === colIdx;
                        const cellHighlight = isSelected 
                          ? (theme === 'orange' ? 'bg-orange-50/10' : 'bg-blue-50/10')
                          : '';

                        return (
                          <td 
                            key={colIdx} 
                            className={`py-1 px-2 text-center transition-colors ${cellHighlight} ${readOnly ? "" : "cursor-pointer"} ${getCellClass ? getCellClass(row, colIdx) : ""}`}
                            onClick={() => {
                              if (!readOnly && !isEditing) {
                                setEditingCell({ resIdx: idx, colIdx: colIdx });
                                setTempValue(String(value));
                                onCellClick?.(row, colIdx);
                              }
                            }}
                          >
                            {isEditing ? (
                              <input 
                                autoFocus
                                className="w-16 text-xs p-1 border rounded text-center outline-none focus:border-orange-500"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={() => {
                                  onValueChange?.(row, colIdx, tempValue);
                                  setEditingCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur();
                                }}
                              />
                            ) : (
                              <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
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
          
          {(type === "status" || showMonthlyFeeLegend || showYearlyFeeLegend) && (
            <div className="w-full border-t border-gray-400 p-4 flex flex-wrap gap-6 justify-center text-sm text-grey-100 relative z-20">
              {type === "status" ? (
                <>
                  <div className="flex items-center gap-2">
                      <StatusLight status={1} size="small" />
                      Paid
                  </div>
                  <div className="flex items-center gap-2">
                      <StatusLight status={-1} size="small" />
                      Unpaid
                  </div>
                  <div className="flex items-center gap-2">
                      <StatusLight status={0} size="small" />
                      Future
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
                            className={`font-bold ${!readOnly ? "cursor-pointer hover:underline" : ""} ${apartmentTextColor}`}
                            onClick={() => {
                              if (!readOnly) {
                                setEditingMonthly(true);
                                setTempValue((monthlyFee || "").replace("₹", "").trim());
                              }
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
                            className={`font-bold ${!readOnly ? "cursor-pointer hover:underline" : ""} ${apartmentTextColor}`}
                            onClick={() => {
                              if (!readOnly) {
                                setEditingYearly(true);
                                setTempValue((yearlyFee || "").replace("₹", "").trim());
                              }
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
          )}
        </>
      )}
    </div>
  );
};

export default Table;
