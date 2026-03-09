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
  Table
} from '@legacy-apartment/ui';
import Swal from 'sweetalert2';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Sidebar from '@/components/Sidebar';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:4000';

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
  }, [id]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/setting`);
      if (response.ok) {
        const data = await response.json();
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
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/finance/resident/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResident(data);
      } else {
        Swal.fire('Error', 'Failed to fetch finance data', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMonthlyStatus = async (monthIndex: number, status: number, amount?: number) => {
    // Optimistic update
    setResident((prev: any) => {
      if (!prev) return prev;
      const newPayments = [...prev.monthlyPayments];
      const idx = newPayments.findIndex(p => p.month === monthIndex && p.year === selectedYear);
      if (idx > -1) {
        newPayments[idx] = { ...newPayments[idx], status, amount: amount ?? newPayments[idx].amount };
      } else {
        newPayments.push({ residentId: parseInt(id as string), month: monthIndex, year: selectedYear, status, amount: amount ?? 0 });
      }
      return { ...prev, monthlyPayments: newPayments };
    });

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/finance/monthly/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: monthIndex,
          year: selectedYear,
          status,
          amount
        }),
      });

      if (!response.ok) {
        fetchResidentFinance(); // Revert on failure
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    } catch (error) {
      fetchResidentFinance(); // Revert on failure
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const updateSecurityStatus = async (status: number, amount?: number) => {
    // Optimistic update
    setResident((prev: any) => {
      if (!prev) return prev;
      const newPayments = [...prev.securityPayments];
      const idx = newPayments.findIndex(p => p.year === selectedYear);
      if (idx > -1) {
        newPayments[idx] = { ...newPayments[idx], status, amount: amount ?? newPayments[idx].amount };
      } else {
        newPayments.push({ residentId: parseInt(id as string), year: selectedYear, status, amount: amount ?? 0 });
      }
      return { ...prev, securityPayments: newPayments };
    });

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/finance/security/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year: selectedYear,
          status,
          amount
        }),
      });

      if (!response.ok) {
        fetchResidentFinance(); // Revert
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    } catch (error) {
      fetchResidentFinance(); // Revert
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const updateGlobalFees = async (data: { monthlyFee?: number; yearlyFee?: number }) => {
    // Optimistic update
    setFees((prev: any) => ({
      ...prev,
      ...data
    }));

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/setting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        fetchSettings(); // Revert
        Swal.fire('Error', 'Failed to update global fees', 'error');
      }
    } catch (error) {
      fetchSettings(); // Revert
      Swal.fire('Error', 'Failed to update global fees', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!resident) return <div className="p-12 text-center">Resident not found</div>;

  const getMonthlyStatus = (monthIndex: number) => {
    const payment = resident.monthlyPayments.find(
      (p: any) => p.month === monthIndex && p.year === selectedYear
    );
    return payment ? payment.status : 0;
  };

  const getSecurityStatus = () => {
    const payment = resident.securityPayments.find(
      (p: any) => p.year === selectedYear
    );
    return payment ? payment.status : 0;
  };

  const StatusBadge = ({ status, onClick }: { status: number, onClick?: (s: number) => void }) => {
    const configs: Record<number, any> = {
      1: { icon: <CheckCircleIcon className="text-green-500" />, label: 'Paid', color: 'bg-green-50 text-green-700 border-green-200' },
      [-1]: { icon: <CancelIcon className="text-red-500" />, label: 'Unpaid', color: 'bg-red-50 text-red-700 border-red-200' },
      0: { icon: <PendingIcon className="text-gray-400" />, label: 'Pending', color: 'bg-gray-50 text-gray-500 border-gray-200' },
    };
    const config = configs[status];

    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-gray-400 text-xs font-bold ${config.color}`}>
          {config.icon}
          {config.label}
        </div>
        <div className="flex gap-1 mt-2">
          <button onClick={() => onClick?.(1)} className="p-1 hover:bg-green-300 rounded transition-colors" title="Mark as Paid"><CheckCircleIcon className="size-5 text-green-200" /></button>
          <button onClick={() => onClick?.(-1)} className="p-1 hover:bg-red-300 rounded transition-colors" title="Mark as Unpaid"><CancelIcon className="size-5 text-red-200" /></button>
          <button onClick={() => onClick?.(0)} className="p-1 hover:bg-gray-400 rounded transition-colors" title="Mark as Pending"><PendingIcon className="size-5 text-gray-300" /></button>
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Finance Management | {resident.name}</title>
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab="residents" />

        <div className="flex-1 min-w-0 md:ml-64 p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()} icon={{ left: <KeyboardArrowLeftIcon /> }} />
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
                    icon={{ right: <KeyboardArrowDownIcon className="size-4" /> }}
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
                <button
                  onClick={() => {
                    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const monthlyRows = monthNames.map((mon, idx) => {
                      const p = resident.monthlyPayments?.find(
                        (pay: any) => pay.month === idx && pay.year === selectedYear
                      );
                      return {
                        Type: 'Monthly Society Fee',
                        Month: mon,
                        Year: selectedYear,
                        Amount: p ? Number(p.amount) : 0,
                        Status: p ? (p.status === 1 ? 'Paid' : p.status === -1 ? 'Unpaid' : 'Pending') : 'Pending',
                      };
                    });
                    const secPayment = resident.securityPayments?.find(
                      (p: any) => p.year === selectedYear
                    );
                    const yearlyRow = {
                      Type: 'Yearly Maintenance Fee',
                      Month: 'N/A',
                      Year: selectedYear,
                      Amount: secPayment ? Number(secPayment.amount) : 0,
                      Status: secPayment ? (secPayment.status === 1 ? 'Paid' : secPayment.status === -1 ? 'Unpaid' : 'Pending') : 'Pending',
                    };
                    const ws = XLSX.utils.json_to_sheet([...monthlyRows, yearlyRow]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, `${selectedYear}`);
                    XLSX.writeFile(wb, `finance-${resident.name.replace(/\s+/g, '-').toLowerCase()}-${selectedYear}.xlsx`);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-colors rounded-lg px-3 py-1.5 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download .xlsx
                </button>
              </div>
              <Table 
                residents={[resident]}
                columns={months}
                type="numerical"
                theme="orange"
                getValue={(res, colIdx) => {
                  const payment = res.monthlyPayments.find(
                    (p: any) => p.month === colIdx && p.year === selectedYear
                  );
                  return payment ? payment.amount.toLocaleString() : "0";
                }}
                onCellClick={(res, colIdx) => {
                  const payment = res.monthlyPayments.find(
                    (p: any) => p.month === colIdx && p.year === selectedYear
                  );
                  const currentStatus = payment ? payment.status : 0;
                  const nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? -1 : 0;
                  // Auto-set amount if marking as paid
                  const amount = nextStatus === 1 ? fees.monthlyFee : (payment?.amount || 0);
                  updateMonthlyStatus(colIdx, nextStatus, amount);
                }}
                onValueChange={(res, colIdx, newValue) => {
                  const amount = parseFloat(newValue.replace(/,/g, '')) || 0;
                  const status = amount >= fees.monthlyFee ? 1 : amount > 0 ? 0 : -1;
                  updateMonthlyStatus(colIdx, status, amount);
                }}
                onMonthlyFeeChange={(val) => {
                  const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                  updateGlobalFees({ monthlyFee: num });
                }}
                monthlyFee={`₹ ${fees.monthlyFee.toLocaleString()}`}
                showYearlyFeeLegend={false}
                className="!shadow-none !border-gray-500"
              />
            </div>

            <div className="pt-8 border-t border-gray-400">
               <h3 className="text-sm font-bold text-gray-100 mb-6 uppercase tracking-wider">Yearly Maintenance Fees</h3>
               <Table 
                residents={[resident]}
                columns={[`Fee ${selectedYear}`]}
                type="numerical"
                theme="blue"
                getValue={() => {
                  const payment = resident.securityPayments.find(
                    (p: any) => p.year === selectedYear
                  );
                  return payment ? payment.amount.toLocaleString() : "0";
                }}
                onCellClick={() => {
                  const payment = resident.securityPayments.find(
                    (p: any) => p.year === selectedYear
                  );
                  const currentStatus = payment ? payment.status : 0;
                  const nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? -1 : 0;
                  const amount = nextStatus === 1 ? fees.yearlyFee : (payment?.amount || 0);
                  updateSecurityStatus(nextStatus, amount);
                }}
                onValueChange={(res, colIdx, newValue) => {
                  const amount = parseFloat(newValue.replace(/,/g, '')) || 0;
                  const status = amount >= fees.yearlyFee ? 1 : amount > 0 ? 0 : -1;
                  updateSecurityStatus(status, amount);
                }}
                onYearlyFeeChange={(val) => {
                  const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                  updateGlobalFees({ yearlyFee: num });
                }}
                yearlyFee={`₹ ${fees.yearlyFee.toLocaleString()}`}
                showMonthlyFeeLegend={false}
                className="!shadow-none !border-gray-500"
                minWidthClass="min-w-full"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default FinancePage;
