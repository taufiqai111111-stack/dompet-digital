
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency, getTodayDateString, getMonthStartDateString } from '../utils/formatter';
import DashboardCard from '../components/DashboardCard';
import Icon from '../components/Icon';
import { TransactionType, ReceivableStatus } from '../types';

const Dashboard: React.FC = () => {
  const { accounts, investments, receivables, transactions } = useAppContext();
  const [startDate, setStartDate] = useState(getMonthStartDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  const stats = useMemo(() => {
    const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalUnpaidReceivables = receivables
      .filter(r => r.status === ReceivableStatus.Unpaid)
      .reduce((sum, r) => sum + r.amount, 0);
    const totalWealth = totalAccountBalance + totalInvestmentValue + totalUnpaidReceivables;
    
    const investmentProfitLoss = investments.reduce((sum, inv) => sum + (inv.currentValue - inv.initialValue), 0);

    const filteredTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return txDate >= start && txDate <= end;
    });

    const totalExpense = filteredTransactions
        .filter(t => t.type === TransactionType.Expense)
        .reduce((sum, t) => sum + t.amount, 0);
        
    const todayStr = getTodayDateString();
    const expenseToday = transactions
        .filter(t => t.type === TransactionType.Expense && t.date === todayStr)
        .reduce((sum, t) => sum + t.amount, 0);

    const monthStartStr = getMonthStartDateString();
    const expenseThisMonth = transactions
        .filter(t => t.type === TransactionType.Expense && t.date >= monthStartStr && t.date <= todayStr)
        .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalWealth,
      totalAccountBalance,
      totalInvestmentValue,
      totalUnpaidReceivables,
      investmentProfitLoss,
      totalExpense,
      expenseToday,
      expenseThisMonth
    };
  }, [accounts, investments, receivables, transactions, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Total Wealth Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <Icon name="total-wealth" className="w-10 h-10" />
          <div>
            <h2 className="text-lg font-semibold">Total Kekayaan</h2>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalWealth)}</p>
          </div>
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Saldo Akun"
          value={formatCurrency(stats.totalAccountBalance)}
          icon={<Icon name="wallet" className="w-6 h-6 text-green-600" />}
          colorClass="bg-green-100"
        />
        <DashboardCard
          title="Total Nilai Investasi"
          value={formatCurrency(stats.totalInvestmentValue)}
          icon={<Icon name="investment" className="w-6 h-6 text-purple-600" />}
          colorClass="bg-purple-100"
        />
        <DashboardCard
          title="Total Piutang"
          value={formatCurrency(stats.totalUnpaidReceivables)}
          icon={<Icon name="receivable-icon" className="w-6 h-6 text-yellow-600" />}
          colorClass="bg-yellow-100"
        />
        <DashboardCard
          title="Total Pengeluaran (Filter)"
          value={formatCurrency(stats.totalExpense)}
          icon={<Icon name="expense" className="w-6 h-6 text-red-600" />}
          colorClass="bg-red-100"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rincian Saldo Rekening</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {accounts.length > 0 ? accounts.map(acc => (
              <div key={acc.id} className="flex justify-between items-center">
                <div>
                    <p className="font-medium text-gray-700">{acc.name}</p>
                    <p className="text-xs text-gray-500">{acc.type}</p>
                </div>
                <p className="font-semibold text-gray-800">{formatCurrency(acc.balance)}</p>
              </div>
            )) : <p className="text-gray-500 text-center">Belum ada rekening.</p>}
          </div>
        </div>

        {/* Investment & Expense Summary */}
        <div className="space-y-6">
            {/* Investment Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Investasi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nilai</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(stats.totalInvestmentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Keuntungan/Kerugian</span>
                  <span className={`font-semibold ${stats.investmentProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.investmentProfitLoss)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pengeluaran</h3>
                <div className="flex items-center space-x-4 mb-4">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-full border-gray-300 rounded-md shadow-sm"/>
                    <span className="text-gray-500">to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-full border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Hari Ini</span>
                        <span className="font-semibold text-red-600">{formatCurrency(stats.expenseToday)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Bulan Ini</span>
                        <span className="font-semibold text-red-600">{formatCurrency(stats.expenseThisMonth)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
