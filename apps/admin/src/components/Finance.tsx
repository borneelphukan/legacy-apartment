import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Button, 
  Table,
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  Icon,
  Loader
 } from '@legacy-apartment/ui';
import * as XLSX from 'xlsx';
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
    lateFee?: number;
    paymentType?: string;
    paymentDate?: string;
}

interface SecurityPayment {
    id: number;
    year: number;
    amount: number;
    status: number;
    paymentType?: string;
    lateFee?: number;
}

interface ResidentFinance {
    id: number;
    name: string;
    residence: string;
    phone_no: string;
    monthlyRate: number;
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
    const [fees, setFees] = useState({ monthlyFee: 0, yearlyFee: 0 });
    const [canEditFinance, setCanEditFinance] = useState(false);
    const [sortColumn, setSortColumn] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

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
        { length: currentYear - 2023 + 2 }, 
        (_, i) => 2023 + i
    );

    const yearlyColumns = availableYears.map(String);

    useEffect(() => {
        fetchFinanceData();
        fetchSettings();
    }, [selectedYear, sortColumn, sortOrder]);

    const fetchSettings = async () => {
        try {
            const response = await api.get(`/setting?year=${selectedYear}`);
            const data = response.data;
            if (data) {
                setFees({
                    monthlyFee: data.monthlyFee ?? 0,
                    yearlyFee: data.yearlyFee ?? 0,
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchFinanceData = async () => {
        try {
            const params = new URLSearchParams();
            if (sortColumn) params.append('sortBy', sortColumn);
            if (sortOrder) params.append('sortOrder', sortOrder);

            const response = await api.get(`/finance?${params.toString()}`);
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

    const updateSecurityStatus = async (residentId: number, year: number, status: number, amount?: number) => {
        try {
            await api.post(`/finance/security/${residentId}`, {
                year: year,
                status,
                amount
            });
            fetchFinanceData();
        } catch (error) {
            console.error('Error updating security status:', error);
        }
    };

    const updateResidentMonthlyRate = async (residentId: number, rate: number) => {
        try {
            await api.patch(`/residents/${residentId}`, {
                monthlyRate: rate
            });
            fetchFinanceData();
        } catch (error) {
            console.error('Error updating resident monthly rate:', error);
        }
    };

    const updateGlobalFees = async (data: { monthlyFee?: number; yearlyFee?: number }) => {
        const oldYearlyFee = fees.yearlyFee;
        try {
            await api.post('/setting', {
                ...data,
                year: selectedYear
            });
            fetchSettings();
            
            // If yearly fee decreased, adjust overpayments automatically
            if (data.yearlyFee !== undefined && data.yearlyFee < oldYearlyFee) {
                const newFee = data.yearlyFee;
                for (const res of financeData) {
                    const payment = (res.securityPayments || []).find(p => p.year === selectedYear);
                    if (payment && payment.amount > newFee) {
                        const overpayment = payment.amount - newFee;
                        
                        // 1. Cap current year to the new lower fee
                        await api.post(`/finance/security/${res.id}`, {
                            year: selectedYear,
                            amount: newFee,
                            status: 1
                        });

                        // 2. Add overpayment to next year
                        const nextYearPayment = (res.securityPayments || []).find(p => (p as any).year === selectedYear + 1);
                        const nextYearAmount = (nextYearPayment?.amount || 0) + overpayment;
                        
                        await api.post(`/finance/security/${res.id}`, {
                            year: selectedYear + 1,
                            amount: nextYearAmount,
                            status: nextYearAmount > 0 ? 1 : 0
                        });
                    }
                }
                fetchFinanceData();
            } else if (data.yearlyFee !== undefined && data.yearlyFee > oldYearlyFee) {
                // If yearly fee increased, pull credits back from next year to complete payment
                const newFee = data.yearlyFee;
                for (const res of financeData) {
                    const payment = (res.securityPayments || []).find(p => p.year === selectedYear);
                    if (payment && payment.amount < newFee) {
                        const needed = newFee - payment.amount;
                        const nextYearPayment = (res.securityPayments || []).find(p => (p as any).year === selectedYear + 1);
                        
                        if (nextYearPayment && nextYearPayment.amount > 0) {
                            const takeAmount = Math.min(nextYearPayment.amount, needed);
                            
                            // 1. Pull credit from next year
                            await api.post(`/finance/security/${res.id}`, {
                                year: selectedYear + 1,
                                amount: nextYearPayment.amount - takeAmount,
                                status: (nextYearPayment.amount - takeAmount) > 0 ? 1 : 0
                            });

                            // 2. Add to current year
                            await api.post(`/finance/security/${res.id}`, {
                                year: selectedYear,
                                amount: payment.amount + takeAmount,
                                status: (payment.amount + takeAmount) >= newFee ? 1 : 0
                            });
                        }
                    }
                }
                fetchFinanceData();
            }
        } catch (error) {
            console.error('Error updating global fees:', error);
        }
    };

    const currentMonthName = months[selectedMonth];

    const stats = financeData.reduce((acc, resident) => {
        const monthPayment = (resident.monthlyPayments || []).find(
            p => p.month === selectedMonth && p.year === selectedYear
        );
        const monthAmount = monthPayment ? Number(monthPayment.amount) + (Number(monthPayment.lateFee) || 0) : 0;
        
        let isDefaulter = false;
        const endMonth = selectedYear < currentYear ? 11 : (selectedYear === currentYear ? currentMonthIdx : -1);

        if (endMonth >= 0) {
            for (let m = 0; m <= endMonth; m++) {
                const p = (resident.monthlyPayments || []).find(pay => pay.month === m && pay.year === selectedYear);
                const amt = p ? Number(p.amount) : 0;
                const expectedRate = resident.monthlyRate || fees.monthlyFee;
                if (amt < expectedRate) {
                    isDefaulter = true;
                }
            }
        }

        return {
            currentCollected: acc.currentCollected + monthAmount,
            defaulterCount: acc.defaulterCount + (isDefaulter ? 1 : 0)
        };
    }, { currentCollected: 0, defaulterCount: 0 });

    const checkIsDefaulter = (resident: ResidentFinance) => {
        const endMonth = selectedYear < currentYear ? 11 : (selectedYear === currentYear ? currentMonthIdx : -1);
        if (endMonth >= 0) {
            for (let m = 0; m <= endMonth; m++) {
                const p = (resident.monthlyPayments || []).find(pay => pay.month === m && pay.year === selectedYear);
                const amt = p ? Number(p.amount) : 0;
                const expectedRate = resident.monthlyRate || fees.monthlyFee;
                if (amt < expectedRate) return true;
            }
        }
        return false;
    };

    const totalExpectedCurrentMonth = financeData.reduce((sum, res) => sum + (res.monthlyRate || fees.monthlyFee), 0);
    const isReadOnly = !canEditFinance;

    return (
        <div className="w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl text-gray-100 font-black tracking-tight leading-tight">
                        Finance Management
                    </h1>
                    <p className="mt-2 text-lg text-gray-100/80">
                        Detailed overview of all resident finances for the year {selectedYear}.
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
                                  <Icon type="keyboard_arrow_down" className="text-[16px] text-gray-400" />
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
                        icon={{ left: <Icon type="download" className="text-[20px]" /> }}
                    >
                        Download Data
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-white p-8 rounded-xl border border-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.2em] mb-3 relative z-10">Collection On Selected Month ({currentMonthName})</p>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-orange-500">₹ {stats.currentCollected.toLocaleString()}</span>
                        <span className="text-gray-100/50 font-bold text-sm">/ ₹ {totalExpectedCurrentMonth.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-gray-100 uppercase tracking-[0.2em] mb-3 relative z-10">Total Defaulters ({selectedYear})</p>
                    <p className="text-4xl font-black text-red-500 relative z-10">{stats.defaulterCount}</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-400 p-20 text-center text-gray-100 shadow-sm font-medium">
                  <Loader/>
                </div>
            ) : financeData.length === 0 ? (
                <div className="text-center">
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
                            readOnly={true}
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
                            onHeaderClick={(idx) => setSelectedMonth(idx)}
                            selectedColumnIndex={selectedMonth}
                            onRowClick={(row) => router.push(`/finance/${row.id}`)}
                            getValue={(resident: ResidentFinance, colIdx) => {
                                const payment = (resident.monthlyPayments || []).find(
                                    (p: any) => p.month === colIdx && p.year === selectedYear
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
                            }}
                            onMonthlyFeeChange={(val) => {
                                const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                updateGlobalFees({ monthlyFee: num });
                            }}
                            showMonthlyFeeLegend={false}
                            showYearlyFeeLegend={false}
                            minWidthClass="min-w-[1100px]"
                            getRowClass={(res) => checkIsDefaulter(res) ? "!bg-red-300" : ""}
                            getCellClass={(res, colIdx) => {
                                const p = (res.monthlyPayments || []).find((pay: any) => pay.month === colIdx && pay.year === selectedYear);
                                if (p?.paymentType === 'Cash') return "!bg-green-300";
                                if (p?.paymentType === 'Online') return "!bg-blue-300";
                                return "";
                            }}
                            getCellTitle={(res, colIdx) => {
                                const p = (res.monthlyPayments || []).find((pay: any) => pay.month === colIdx && pay.year === selectedYear);
                                if (p?.paymentType === 'Cash') return "mode of payment: offline";
                                if (p?.paymentType === 'Online') return "mode of payment: online";
                                return "";
                            }}
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
                            columns={yearlyColumns}
                            showMonthlyRate={false}
                            showYearlyRate={true}
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
                            onRowClick={(row) => router.push(`/finance/${row.id}`)}
                            getValue={(resident: ResidentFinance, colIdx) => {
                                const year = parseInt(yearlyColumns[colIdx]);
                                const payment = (resident.securityPayments || []).find(
                                    (p: any) => p.year === year
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
                            }}
                            onYearlyFeeChange={(val) => {
                                const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                updateGlobalFees({ yearlyFee: num });
                            }}
                            yearlyFee={`₹ ${fees.yearlyFee.toLocaleString()}`}
                            showMonthlyFeeLegend={false}
                            showYearlyFeeLegend={true}
                            readOnly={!canEditFinance}
                            readOnlyCells={true}
                            minWidthClass="min-w-full"
                            getRowClass={(res) => {
                                const payment = (res.securityPayments || []).find((p: any) => p.year === selectedYear);
                                return !payment || Number(payment.amount) < fees.yearlyFee ? "!bg-red-300" : "";
                            }}
                            getCellClass={(res, colIdx) => {
                                const year = parseInt(yearlyColumns[colIdx]);
                                const p = (res.securityPayments || []).find((pay: any) => pay.year === year);
                                if (p?.paymentType === 'Cash') return "!bg-green-300";
                                if (p?.paymentType === 'Online') return "!bg-blue-300";
                                return "";
                            }}
                            getCellTitle={(res, colIdx) => {
                                const year = parseInt(yearlyColumns[colIdx]);
                                const p = (res.securityPayments || []).find((pay: any) => pay.year === year);
                                if (p?.paymentType === 'Cash') return "paid with cash";
                                if (p?.paymentType === 'Online') return "paid online";
                                return "";
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
