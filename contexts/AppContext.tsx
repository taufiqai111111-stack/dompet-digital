
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Account, Platform, Investment, Transaction, Receivable, TransactionType, TransactionSource, ReceivableStatus } from '../types';

interface AppContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'balance'>, initialBalance: number) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  getAccount: (id: string) => Account | undefined;
  isAccountInUse: (id: string) => boolean;

  platforms: Platform[];
  addPlatform: (platform: Omit<Platform, 'id'>) => void;
  updatePlatform: (platform: Platform) => void;
  deletePlatform: (id: string) => void;
  getPlatform: (id: string) => Platform | undefined;
  isPlatformInUse: (id: string) => boolean;

  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (id: string) => void;
  updateInvestmentValue: (id: string, newValue: number) => void;
  
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  
  receivables: Receivable[];
  addReceivable: (receivable: Omit<Receivable, 'id' | 'status'>) => void;
  updateReceivable: (receivable: Receivable) => void;
  deleteReceivable: (id: string) => void;
  markReceivableAsPaid: (id: string, accountId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [platforms, setPlatforms] = useLocalStorage<Platform[]>('platforms', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('investments', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [receivables, setReceivables] = useLocalStorage<Receivable[]>('receivables', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balances
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === newTransaction.accountId) {
        if (newTransaction.type === TransactionType.Income) return { ...acc, balance: acc.balance + newTransaction.amount };
        if (newTransaction.type === TransactionType.Expense || newTransaction.type === TransactionType.Transfer) return { ...acc, balance: acc.balance - newTransaction.amount };
      }
      if (acc.id === newTransaction.toAccountId && newTransaction.type === TransactionType.Transfer) {
        return { ...acc, balance: acc.balance + newTransaction.amount };
      }
      return acc;
    }));
  };

  const addAccount = (account: Omit<Account, 'id' | 'balance'>, initialBalance: number) => {
    const newAccount = { ...account, id: crypto.randomUUID(), balance: 0 }; // balance starts at 0
    setAccounts(prev => [...prev, newAccount]);
    if (initialBalance > 0) {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.Income,
        accountId: newAccount.id,
        amount: initialBalance,
        category: 'Saldo Awal',
        description: `Saldo awal untuk rekening ${newAccount.name}`,
        source: TransactionSource.Manual
      });
    }
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  
  const isAccountInUse = (id: string) => {
    return transactions.some(t => t.accountId === id || t.toAccountId === id) || investments.some(i => i.accountId === id);
  };
  
  const deleteAccount = (id: string) => {
    if (isAccountInUse(id)) {
        alert("Rekening tidak dapat dihapus karena sudah digunakan dalam transaksi atau investasi.");
        return;
    }
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };
  
  const getAccount = (id: string) => accounts.find(a => a.id === id);

  const addPlatform = (platform: Omit<Platform, 'id'>) => {
    setPlatforms(prev => [...prev, { ...platform, id: crypto.randomUUID() }]);
  };
  
  const updatePlatform = (updatedPlatform: Platform) => {
    setPlatforms(prev => prev.map(p => p.id === updatedPlatform.id ? updatedPlatform : p));
  };

  const isPlatformInUse = (id: string) => investments.some(i => i.platformId === id);

  const deletePlatform = (id: string) => {
    if (isPlatformInUse(id)) {
        alert("Platform tidak dapat dihapus karena sudah digunakan dalam investasi.");
        return;
    }
    setPlatforms(prev => prev.filter(p => p.id !== id));
  };

  const getPlatform = (id: string) => platforms.find(p => p.id === id);
  
  const addInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment = { ...investment, id: crypto.randomUUID() };
    setInvestments(prev => [...prev, newInvestment]);
    addTransaction({
      date: investment.date,
      type: TransactionType.Expense,
      accountId: investment.accountId,
      amount: investment.initialValue,
      category: 'Investasi',
      description: `Modal awal investasi ${investment.name}`,
      source: TransactionSource.Investment,
      linkedInvestmentId: newInvestment.id,
    });
  };

  const updateInvestment = (updatedInvestment: Investment) => {
    // This function is complex because changing initial value or account requires transaction adjustment
    // For this simple app, we'll only allow name, date, platform changes. Value changes are separate.
    setInvestments(prev => prev.map(inv => inv.id === updatedInvestment.id ? { ...inv, name: updatedInvestment.name, date: updatedInvestment.date, platformId: updatedInvestment.platformId } : inv));
  };
  
  const updateInvestmentValue = (id: string, newValue: number) => {
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, currentValue: newValue } : inv));
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    // Also delete the linked transaction
    setTransactions(prev => prev.filter(t => t.linkedInvestmentId !== id));
  };
  
  const addReceivable = (receivable: Omit<Receivable, 'id'|'status'>) => {
    setReceivables(prev => [...prev, { ...receivable, id: crypto.randomUUID(), status: ReceivableStatus.Unpaid }]);
  };

  const updateReceivable = (updatedReceivable: Receivable) => {
    setReceivables(prev => prev.map(r => r.id === updatedReceivable.id ? updatedReceivable : r));
  };

  const deleteReceivable = (id: string) => {
    setReceivables(prev => prev.filter(r => r.id !== id));
  };

  const markReceivableAsPaid = (id: string, accountId: string) => {
    const receivable = receivables.find(r => r.id === id);
    if (!receivable) return;

    setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: ReceivableStatus.Paid } : r));
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.Income,
      accountId: accountId,
      amount: receivable.amount,
      category: 'Piutang',
      description: `Pembayaran piutang dari ${receivable.debtorName}`,
      source: TransactionSource.Receivable,
      linkedReceivableId: id,
    });
  };

  return (
    <AppContext.Provider value={{
      accounts, addAccount, updateAccount, deleteAccount, getAccount, isAccountInUse,
      platforms, addPlatform, updatePlatform, deletePlatform, getPlatform, isPlatformInUse,
      investments, addInvestment, updateInvestment, deleteInvestment, updateInvestmentValue,
      transactions, addTransaction,
      receivables, addReceivable, updateReceivable, deleteReceivable, markReceivableAsPaid,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
