import React, { useState, useEffect } from 'react';
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

const API_BASE_URL = 'http://localhost:4000';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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
    const [financeData, setFinanceData] = useState<ResidentFinance[]>([]);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [fees, setFees] = useState({ monthlyFee: 1000, yearlyFee: 5000 });

    const availableYears = Array.from(
        { length: currentYear - 2023 + 1 }, 
        (_, i) => 2023 + i
    );

    useEffect(() => {
        fetchFinanceData();
        fetchSettings();
    }, []);

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

    const fetchFinanceData = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`${API_BASE_URL}/finance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFinanceData(data);
            }
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

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl">
                        Cumulative Society Fees
                    </h1>
                    <p className="mt-2 font-light">
                        View and export combined finance data of all residents for {selectedYear}.
                    </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="flex items-center gap-2 font-bold text-gray-900 border-gray-400 w-fit"
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
                    <Button 
                        variant="outline"
                        onClick={downloadXLSX}
                        icon={{ left: <DownloadIcon className="size-5" /> }}
                    >
                        Download .xlsx
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-100">Loading finance data...</div>
            ) : financeData.length === 0 ? (
                <p className="text-center">No resident data found.</p>
            ) : (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-sm font-bold text-gray-100 mb-6 uppercase tracking-wider">Monthly Society Fees</h3>
                        <Table 
                            theme="orange"
                            type="numerical"
                            residents={financeData}
                            columns={months}
                            readOnly={true}
                            getValue={(resident: ResidentFinance, colIdx) => {
                                const payment = resident.monthlyPayments.find(
                                    (p: any) => p.month === colIdx && p.year === selectedYear
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
                            }}
                            monthlyFee={`₹ ${fees.monthlyFee.toLocaleString()}`}
                            showYearlyFeeLegend={false}
                            minWidthClass="min-w-[1200px]"
                        />
                    </div>

                    <div className="pt-8 border-t border-gray-400">
                        <h3 className="text-sm font-bold text-gray-100 mb-6 uppercase tracking-wider">Yearly Maintenance Fees</h3>
                        <Table 
                            theme="blue"
                            type="numerical"
                            residents={financeData}
                            columns={[`Fee ${selectedYear}`]}
                            readOnly={true}
                            getValue={(resident: ResidentFinance) => {
                                const payment = resident.securityPayments.find(
                                    (p: any) => p.year === selectedYear
                                );
                                return payment ? payment.amount.toLocaleString() : "0";
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
