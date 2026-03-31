import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultLayout from '@/layout/DefaultLayout';
import { 
  Button,
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  Table,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Input,
  DropdownMenuItem,
  Icon
, Spinner } from '@legacy-apartment/ui';
import Sidebar from '@/components/Sidebar';
import * as XLSX from 'xlsx';
import api from '@/lib/api';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FinancePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fees, setFees] = useState({ monthlyFee: 1000, yearlyFee: 5000 });
  const [isPresident, setIsPresident] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const yearlyColumns = ['2023', '2024', '2025', '2026', '2027'];
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setIsPresident(user?.role === 'president' || user?.role === 'treasurer');
      } catch {}
    }
  }, []);

  // Generate years from 2023 to current year
  const availableYears = Array.from(
    { length: currentYear - 2023 + 1 }, 
    (_, i) => 2023 + i
  );

  useEffect(() => {
    if (id) {
      fetchResidentFinance();
      fetchSettings();
    }
  }, [id, selectedYear]);

  const fetchSettings = async () => {
    try {
      const response = await api.get(`/setting?year=${selectedYear}`);
      const data = response.data;
      if (data) {
        setFees({
          monthlyFee: data.monthlyFee,
          yearlyFee: data.yearlyFee,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchResidentFinance = async () => {
    try {
      const response = await api.get(`/finance/resident/${id}`);
      setResident(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        setAlertDialog({
          open: true,
          title: 'Error',
          description: 'Failed to fetch finance data',
          type: 'error'
        });
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMonthlyStatus = async (monthIndex: number, update: { status?: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number }) => {
    // Optimistic update
    setResident((prev: any) => {
      if (!prev) return prev;
      const newPayments = [...prev.monthlyPayments];
      const idx = newPayments.findIndex(p => p.month === monthIndex && p.year === selectedYear);
      
      if (idx > -1) {
        newPayments[idx] = { ...newPayments[idx], ...update };
      } else {
        newPayments.push({ 
          residentId: parseInt(id as string), 
          month: monthIndex, 
          year: selectedYear, 
          status: update.status ?? 0, 
          amount: update.amount ?? 0,
          paymentType: update.paymentType,
          paymentDate: update.paymentDate,
          lateFee: update.lateFee ?? 0
        });
      }
      return { ...prev, monthlyPayments: newPayments };
    });

    try {
      const payment = resident.monthlyPayments.find(
        (p: any) => p.month === monthIndex && p.year === selectedYear
      );
      await api.post(`/finance/monthly/${id}`, {
        month: monthIndex,
        year: selectedYear,
        status: update.status ?? payment?.status ?? 0,
        amount: update.amount ?? payment?.amount ?? 0,
        ...update
      });
    } catch (error) {
      fetchResidentFinance(); // Revert on failure
      setAlertDialog({
        open: true,
        title: 'Error',
        description: 'Failed to update payment details',
        type: 'error'
      });
    }
  };

  const updateSecurityStatus = async (year: number, update: { status?: number; yearlyRate?: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number }) => {
    // Optimistic update
    setResident((prev: any) => {
      if (!prev) return prev;
      const newPayments = [...prev.securityPayments];
      const idx = newPayments.findIndex(p => p.year === year);
      
      if (idx > -1) {
        newPayments[idx] = { ...newPayments[idx], ...update };
      } else {
        newPayments.push({ 
          residentId: parseInt(id as string), 
          year: year, 
          status: update.status ?? 0, 
          yearlyRate: update.yearlyRate ?? 0,
          amount: update.amount ?? 0,
          paymentType: update.paymentType,
          paymentDate: update.paymentDate,
          lateFee: update.lateFee ?? 0
        });
      }
      return { ...prev, securityPayments: newPayments };
    });

    try {
      const payment = resident.securityPayments.find(
        (p: any) => p.year === year
      );
      await api.post(`/finance/security/${id}`, {
        year: year,
        status: update.status ?? payment?.status ?? 0,
        amount: update.amount ?? payment?.amount ?? 0,
        ...update
      });
    } catch (error) {
      fetchResidentFinance(); // Revert
      setAlertDialog({
        open: true,
        title: 'Error',
        description: 'Failed to update status',
        type: 'error'
      });
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

  if (loading) return <div className="p-12 text-center"><div className="flex justify-center items-center w-full"><Spinner className="size-8 text-orange-500" /></div></div>;
  if (!resident) return <div className="p-12 text-center">Resident not found</div>;

  return (
    <DefaultLayout>
      <Head>
        <title>Finance Management | {resident.name}</title>
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          activeTab="finance" 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-12">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-400">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-100">
              Legacy <span className="text-orange-500">Admin</span>
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <Icon type="menu" className="text-[32px]" />
            </button>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()} icon={{ left: <Icon type="keyboard_arrow_left" className="text-[24px]" /> }} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Finance Management</h1>
                <p className="text-sm md:text-base">Managing payments for <span className="text-orange-500 font-bold">{resident.name}</span> ({resident.residence})</p>
              </div>
            </div>

          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-500 shadow-sm mb-8">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
                <h2 className="text-xl font-bold text-gray-900">Yearly Overview</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 font-bold text-gray-900 border-gray-200"
                    icon={{ right: <Icon type="keyboard_arrow_down" className="text-[16px]" /> }}
                  >
                    {selectedYear}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-400">
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

            <div className="mb-12">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <h3 className="text-sm font-bold text-gray-100">Monthly Society Fees</h3>
                <Button
                  onClick={() => {
                    const wb = XLSX.utils.book_new();
                    
                    // Sort years descending to show latest first in tabs
                    [...availableYears].sort((a, b) => b - a).forEach(year => {
                      const monthlyHeaders = ['Month', 'Monthly Rate', 'Amount Paid', 'Payment Mode', 'Payment Received On', 'Late Payment'];
                      const monthlyData = months.map((mon, idx) => {
                        const p = resident.monthlyPayments?.find(
                          (pay: any) => pay.month === idx && pay.year === year
                        );
                        return [
                          mon,
                          resident.monthlyRate || 0,
                          p ? Number(p.amount) : 0,
                          p?.paymentType || '-',
                          p?.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-',
                          p?.lateFee || 0
                        ];
                      });

                      const yearlyHeaders = ['Year', 'Yearly Rate', 'Payment Made', 'Payment Mode', 'Payment Received On', 'Late Payment'];
                      const secPayment = resident.securityPayments?.find(
                        (p: any) => p.year === year
                      );
                      const yearlyData = [
                        [
                          year,
                          secPayment?.yearlyRate || 0,
                          secPayment?.amount || 0,
                          secPayment?.paymentType || '-',
                          secPayment?.paymentDate ? new Date(secPayment.paymentDate).toLocaleDateString() : '-',
                          secPayment?.lateFee || 0
                        ]
                      ];

                      const wsData = [
                        ['Monthly Society Fees'],
                        monthlyHeaders,
                        ...monthlyData,
                        [],
                        ['Yearly Maintenance Fees'],
                        yearlyHeaders,
                        ...yearlyData
                      ];

                      const ws = XLSX.utils.aoa_to_sheet(wsData);
                      XLSX.utils.book_append_sheet(wb, ws, `${year}`);
                    });

                    XLSX.writeFile(wb, `finance-${resident.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400"
                  icon={{ left: <Icon type="download" className="text-[16px]" /> }}
                  label="Download .xlsx"
                />
              </div>
              <Table 
                data={months.map((m, i) => ({ month: m, index: i }))}
                columns={['month', 'monthlyRate', 'amount', 'type', 'date', 'lateFee', 'actions']}
                headers={['Month', 'Monthly Rate', 'Amount Paid', 'Payment Mode', 'Payment Received On', 'Late Payment', '']}
                type="general"
                theme="orange"
                className="!shadow-none !border-gray-400"
                readOnly={!isPresident}
                tight={true}
                overflowVisible={true}
                showMonthlyFeeLegend={false}
                showYearlyFeeLegend={false}
                renderCell={(row, col) => {
                  const payment = resident.monthlyPayments.find(
                    (p: any) => p.month === row.index && p.year === selectedYear
                  );
                  
                  if (col === 'month') return <span className="font-bold">{row.month}</span>;

                  if (col === 'monthlyRate') {
                    return `₹ ${(resident.monthlyRate || 0).toLocaleString()}`;
                  }
                  
                  if (col === 'amount') {
                    if (!isPresident) return `₹ ${(payment?.amount || 0).toLocaleString()}`;
                    return (
                      <Input 
                        id={`amount-${row.index}`}
                        label="Amount"
                        hideLabel
                        type="number"
                        className="w-24"
                        value={payment?.amount ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const rate = resident.monthlyRate || 0;
                          
                          if (val > rate && rate > 0) {
                            let remaining = val;
                            let currentIdx = row.index;
                            while (remaining > 0 && currentIdx < 12) {
                              const applyAmount = Math.min(remaining, rate);
                              updateMonthlyStatus(currentIdx, { amount: applyAmount, status: applyAmount > 0 ? 1 : 0 });
                              remaining -= applyAmount;
                              currentIdx++;
                            }
                          } else {
                            updateMonthlyStatus(row.index, { amount: val, status: val > 0 ? 1 : 0 });
                          }
                        }}
                      />
                    );
                  }

                  if (col === 'type') {
                    if (!isPresident) return payment?.paymentType || '-';
                    return (
                      <DropdownMenu className='py-1'>
                        <DropdownMenuTrigger asChild>
                          <button className="w-24 p-1 border border-gray-400 rounded text-sm text-left flex items-center justify-between">
                            {payment?.paymentType || 'Select'}
                            <Icon type="keyboard_arrow_down" className="text-[16px] text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-white border-gray-400">
                          <DropdownMenuItem onClick={() => updateMonthlyStatus(row.index, { paymentType: 'Cash' })}>Cash</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMonthlyStatus(row.index, { paymentType: 'Online' })}>Online</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  if (col === 'date') {
                    if (!isPresident) return payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-';
                    return (
                      <Input 
                        id={`date-${row.index}`}
                        label="Date"
                        hideLabel
                        type="date"
                        className="w-36"
                        value={payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateMonthlyStatus(row.index, { paymentDate: e.target.value })}
                      />
                    );
                  }

                  if (col === 'lateFee') {
                    if (!isPresident) return `₹ ${(payment?.lateFee || 0).toLocaleString()}`;
                    return (
                      <Input 
                        id={`lateFee-${row.index}`}
                        label="Late Fee"
                        hideLabel
                        type="number"
                        className="w-20"
                        value={payment?.lateFee ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateMonthlyStatus(row.index, { lateFee: val });
                        }}
                      />
                    );
                  }

                  if (col === 'actions') {
                    if (!isPresident) return null;
                    return (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateMonthlyStatus(row.index, { 
                          amount: 0, 
                          status: 0, 
                          paymentType: '', 
                          paymentDate: '', 
                          lateFee: 0 
                        })}
                      >Clear</Button>
                    );
                  }

                  return '-';
                }}
              />
            </div>

            <div className="pt-8 border-t border-gray-400">
               <h3 className="text-sm font-bold text-gray-100 mb-6 uppercase tracking-wider">Yearly Maintenance Fees</h3>
               <Table 
                data={[{ year: selectedYear }]}
                columns={['year', 'amount', 'type', 'date', 'lateFee', 'actions']}
                headers={['Year', 'Payment Made', 'Payment Mode', 'Payment Received On', 'Late Payment', '']}
                type="general"
                theme="blue"
                className="!shadow-none !border-gray-400"
                readOnly={!isPresident}
                tight={true}
                overflowVisible={true}
                showMonthlyFeeLegend={false}
                showYearlyFeeLegend={false}
                yearlyFee={`₹ ${fees.yearlyFee.toLocaleString()}`}
                onYearlyFeeChange={(val) => {
                  const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                  updateGlobalFees({ yearlyFee: num });
                }}
                renderCell={(row, col) => {
                  const payment = resident.securityPayments.find(
                    (p: any) => p.year === row.year
                  );

                  if (col === 'year') return <span className="font-bold">{row.year}</span>;

                  if (col === 'amount') {
                    if (!isPresident) return `₹ ${(payment?.amount || 0).toLocaleString()}`;
                    return (
                      <Input 
                        id={`yearly-amount-${row.year}`}
                        label="Payment Made"
                        hideLabel
                        type="number"
                        className="w-24"
                        value={payment?.amount ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateSecurityStatus(row.year, { amount: val });
                        }}
                      />
                    );
                  }

                  if (col === 'type') {
                    if (!isPresident) return payment?.paymentType || '-';
                    return (
                      <DropdownMenu className='py-1'>
                        <DropdownMenuTrigger asChild>
                          <button className="w-24 p-1 border border-gray-400 rounded text-sm text-left flex items-center justify-between">
                            {payment?.paymentType || 'Select'}
                            <Icon type="keyboard_arrow_down" className="text-[16px] text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-white border-gray-400">
                          <DropdownMenuItem onClick={() => updateSecurityStatus(row.year, { paymentType: 'Cash' })}>Cash</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateSecurityStatus(row.year, { paymentType: 'Online' })}>Online</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  if (col === 'date') {
                    if (!isPresident) return payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-';
                    return (
                      <Input 
                        id={`yearly-date-${row.year}`}
                        label="Date"
                        hideLabel
                        type="date"
                        className="w-36"
                        value={payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateSecurityStatus(row.year, { paymentDate: e.target.value })}
                      />
                    );
                  }

                  if (col === 'lateFee') {
                    if (!isPresident) return `₹ ${(payment?.lateFee || 0).toLocaleString()}`;
                    return (
                      <Input 
                        id={`yearly-lateFee-${row.year}`}
                        label="Late Fee"
                        hideLabel
                        type="number"
                        className="w-20"
                        value={payment?.lateFee ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateSecurityStatus(row.year, { lateFee: val });
                        }}
                      />
                    );
                  }

                  if (col === 'actions') {
                    if (!isPresident) return null;
                    return (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateSecurityStatus(row.year, { 
                          amount: 0, 
                          status: 0, 
                          paymentType: '', 
                          paymentDate: '', 
                          lateFee: 0 
                        })}
                      >Clear</Button>
                    );
                  }

                  return '-';
                }}
              />
            </div>
          </div>
          </div>
        </div>

        {/* Success/Error Alert Dialog */}
        {alertDialog && (
          <Dialog open={alertDialog.open} onOpenChange={(open) => !open && setAlertDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className={alertDialog.type === 'error' ? 'text-red-600' : 'text-orange-600'}>
                  {alertDialog.title}
                </DialogTitle>
                <DialogDescription>{alertDialog.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="primary" onClick={() => setAlertDialog(null)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DefaultLayout>
  );
};

export default FinancePage;
