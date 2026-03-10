import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Button, 
  Table,
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem 
} from '@legacy-apartment/ui';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '@/lib/api';


const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

interface MonthlyPayment {
    id: number;
    month: number;
    year: number;
    amount: number;
    status: number;
}

interface SecurityPayment {
    id: number;
    year: number;
    amount: number;
    status: number;
}

interface ResidentFinance {
    id: number;
    name: string;
    residence: string;
    phone_no: string;
    monthlyPayments: MonthlyPayment[];
    securityPayments: SecurityPayment[];
}

const Finance = () => {
    const router = useRouter();
    const [financeData, setFinanceData] = useState<ResidentFinance[]>([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx);
    const [fees, setFees] = useState({ monthlyFee: 1000, yearlyFee: 5000 });
    const [canEditFinance, setCanEditFinance] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('adminUser');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setCanEditFinance(user?.role === 'president' || user?.role === 'treasurer');
            } catch {}
        }
    }, []);

    const availableYears = Array.from(
        { length: currentYear - 2023 + 1 }, 
        (_, i) => 2023 + i
    );

    useEffect(() => {
        fetchFinanceData();
        fetchSettings();
    }, [selectedYear]);

    const fetchSettings = async () => {
        try {
            const response = await api.get(`/setting?year=${selectedYear}`);
            const data = response.data;
            if (data) {
                setFees({
                    monthlyFee: data.monthlyFee || 1000,
                    yearlyFee: data.yearlyFee || 5000,
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchFinanceData = async () => {
        try {
            const response = await api.get('/finance');
            setFinanceData(response.data);
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadXLSX = () => {
        const workbook = XLSX.utils.book_new();

        availableYears.forEach(year => {
            const exportData = financeData.map(resident => {
                const row: any = {
                    'Resident Name': resident.name,
                    'Apartment': resident.residence,
                    'Phone': resident.phone_no,
                };

                // Add months for the year
                months.forEach((month, idx) => {
                    const p = resident.monthlyPayments.find(pay => pay.month === idx && pay.year === year);
                    row[`${month} ${year}`] = p ? Number(p.amount) : 0;
                });

                const secPayment = resident.securityPayments.find(p => p.year === year);
                row[`Maintenance Fee ${year}`] = secPayment ? Number(secPayment.amount) : 0;
                
                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Finance ${year}`);
        });

        XLSX.writeFile(workbook, `Society_Fees.xlsx`);
    };

    const updateMonthlyStatus = async (residentId: number, monthIndex: number, status: number, amount?: number) => {
        try {
            await api.post(`/finance/monthly/${residentId}`, {
                month: monthIndex,
                year: selectedYear,
                status,
                amount
            });
            fetchFinanceData();
        } catch (error) {
            console.error('Error updating monthly status:', error);
        }
    };

    const updateSecurityStatus = async (residentId: number, status: number, amount?: number) => {
        try {
            await api.post(`/finance/security/${residentId}`, {
                year: selectedYear,
                status,
                amount
            });
            fetchFinanceData();
        } catch (error) {
            console.error('Error updating security status:', error);
        }
    };

    const updateGlobalFees = async (data: { monthlyFee?: number; yearlyFee?: number }) => {
        try {
            await api.post('/setting', {
                ...data,
                year: selectedYear
            });
            fetchSettings();
        } catch (error) {
            console.error('Error updating global fees:', error);
        }
    };

    const currentMonthName = months[selectedMonth];

    const stats = financeData.reduce((acc, resident) => {
        const monthPayment = (resident.monthlyPayments || []).find(
            p => p.month === selectedMonth && p.year === selectedYear
        );
        const monthAmount = monthPayment ? Number(monthPayment.amount) : 0;
        
        let residentPending = 0;
        let isDefaulter = false;
        const endMonth = selectedYear < currentYear ? 11 : (selectedYear === currentYear ? currentMonthIdx : -1);

        if (endMonth >= 0) {
            for (let m = 0; m <= endMonth; m++) {
                const p = (resident.monthlyPayments || []).find(pay => pay.month === m && pay.year === selectedYear);
                const amt = p ? Number(p.amount) : 0;
                if (amt < fees.monthlyFee) {
                    residentPending += (fees.monthlyFee - amt);
                    isDefaulter = true;
                }
            }
        }

        return {
            currentCollected: acc.currentCollected + monthAmount,
            totalPending: acc.totalPending + residentPending,
            defaulterCount: acc.defaulterCount + (isDefaulter ? 1 : 0)
        };
    }, { currentCollected: 0, totalPending: 0, defaulterCount: 0 });

    const totalExpectedCurrentMonth = financeData.length * fees.monthlyFee;
    const isReadOnly = !canEditFinance || selectedYear !== currentYear;

    return (
        <div className="w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl text-gray-100 font-black tracking-tight leading-tight">
                        Finance Management
                    </h1>
                    <p className="mt-2 text-lg text-gray-100/80">
                        Detailed overview of all resident contributions for the year {selectedYear}.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1.5 items-end">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button 
                                  className="flex items-center gap-2 font-bold text-gray-900 border border-gray-400 bg-white px-5 py-2.5 rounded-xl hover:border-orange-500 transition-all shadow-sm text-sm"
                              >
                                  {selectedYear}
                                  <KeyboardArrowDownIcon className="size-4 text-gray-400" />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-400 w-40">
                              <DropdownMenuRadioGroup>
                                  {availableYears.map((y) => (
                                      <DropdownMenuRadioItem 
                                          key={y} 
                                          checked={selectedYear === y} 
                                          onClick={() => setSelectedYear(y)}
                                          className="text-gray-900"
                                      >
                                          {y}
                                      </DropdownMenuRadioItem>
                                  ))}
                              </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button 
                        variant="primary"
                        onClick={downloadXLSX}
                        icon={{ left: <DownloadIcon className="size-5" /> }}
                    >
                        Download Data
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-xl border border-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.2em] mb-3 relative z-10">Collection On Selected Month ({currentMonthName})</p>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-orange-500">₹ {stats.currentCollected.toLocaleString()}</span>
                        <span className="text-gray-100/50 font-bold text-sm">/ ₹ {totalExpectedCurrentMonth.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.2em] mb-3 relative z-10">Pending Collection (Cumulative)</p>
                    <p className="text-4xl font-black text-blue-500 relative z-10">₹ {stats.totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.2em] mb-3 relative z-10">Total Defaulters ({selectedYear})</p>
                    <p className="text-4xl font-black text-red-500 relative z-10">{stats.defaulterCount}</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 shadow-sm font-medium">
                  Gathering financial records...
                </div>
            ) : financeData.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 shadow-sm">
                  No financial data available for this period.
                </div>
            ) : (
                <div className="space-y-20">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-sm font-black text-gray-100 uppercase tracking-[0.2em]">Monthly Society Fees</h3>
                          <div className="h-px bg-gray-400 flex-1"></div>
                        </div>
                        <Table 
                            theme="orange"
                            type="numerical"
                            residents={financeData}
                            columns={months}
                            readOnly={isReadOnly}
                            onHeaderClick={(idx) => setSelectedMonth(idx)}
                            selectedColumnIndex={selectedMonth}
                            onRowClick={(row) => router.push(`/finance/${row.id}`)}
                            getValue={(resident: ResidentFinance, colIdx) => {
                                const payment = (resident.monthlyPayments || []).find(
                                    (p: any) => p.month === colIdx && p.year === selectedYear
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
                            }}
                            onCellClick={(res, colIdx) => {
                                const payment = (res.monthlyPayments || []).find(
                                    (p: any) => p.month === colIdx && p.year === selectedYear
                                );
                                const currentStatus = payment ? payment.status : 0;
                                const nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? -1 : 0;
                                const amount = nextStatus === 1 ? fees.monthlyFee : (payment?.amount || 0);
                                updateMonthlyStatus(res.id, colIdx, nextStatus, amount);
                            }}
                            onValueChange={(res, colIdx, newValue) => {
                                const amount = parseFloat(newValue.replace(/,/g, '')) || 0;
                                const status = amount >= fees.monthlyFee ? 1 : amount > 0 ? 0 : -1;
                                updateMonthlyStatus(res.id, colIdx, status, amount);
                            }}
                            onMonthlyFeeChange={(val) => {
                                const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                updateGlobalFees({ monthlyFee: num });
                            }}
                            monthlyFee={`₹ ${fees.monthlyFee.toLocaleString()}`}
                            showYearlyFeeLegend={false}
                            minWidthClass="min-w-[1100px]"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-sm font-black text-gray-100 uppercase tracking-[0.2em]">Yearly Maintenance Fees</h3>
                          <div className="h-px bg-gray-400 flex-1"></div>
                        </div>
                        <Table 
                            theme="blue"
                            type="numerical"
                            residents={financeData}
                            columns={[`Fee ${selectedYear}`]}
                            readOnly={isReadOnly}
                            onRowClick={(row) => router.push(`/finance/${row.id}`)}
                            getValue={(resident: ResidentFinance) => {
                                const payment = (resident.securityPayments || []).find(
                                    (p: any) => p.year === selectedYear
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
                            }}
                            onCellClick={(res) => {
                                const payment = (res.securityPayments || []).find(
                                    (p: any) => p.year === selectedYear
                                );
                                const currentStatus = payment ? payment.status : 0;
                                const nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? -1 : 0;
                                const amount = nextStatus === 1 ? fees.yearlyFee : (payment?.amount || 0);
                                updateSecurityStatus(res.id, nextStatus, amount);
                            }}
                            onValueChange={(res, colIdx, newValue) => {
                                const amount = parseFloat(newValue.replace(/,/g, '')) || 0;
                                const status = amount >= fees.yearlyFee ? 1 : amount > 0 ? 0 : -1;
                                updateSecurityStatus(res.id, status, amount);
                            }}
                            onYearlyFeeChange={(val) => {
                                const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                updateGlobalFees({ yearlyFee: num });
                            }}
                            yearlyFee={`₹ ${fees.yearlyFee.toLocaleString()}`}
                            showMonthlyFeeLegend={false}
                            minWidthClass="min-w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
