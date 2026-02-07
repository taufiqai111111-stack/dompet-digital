
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Account, Platform, Investment, Transaction, Receivable, TransactionType, TransactionSource, ReceivableStatus } from '../types';

interface AppContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'balance'>, initialBalance: number) => void;
  updateAccount: (account: Account, newInitialBalance: number) => void;
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

// FIX: Change AppProvider to be a typed React.FC to ensure proper handling of children props by TypeScript.
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [platforms, setPlatforms] = useLocalStorage<Platform[]>('platforms', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('investments', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [receivables, setReceivables] = useLocalStorage<Receivable[]>('receivables', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

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
    if (initialBalance !== 0) { // Can be negative
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

  const updateAccount = (updatedAccountData: Account, newInitialBalance: number) => {
    const initialTxIndex = transactions.findIndex(
        t => t.accountId === updatedAccountData.id && t.category === 'Saldo Awal'
    );

    let oldInitialBalance = 0;
    if (initialTxIndex !== -1) {
        oldInitialBalance = transactions[initialTxIndex].amount;
    }

    const balanceDifference = newInitialBalance - oldInitialBalance;

    setTransactions(prevTxs => {
        const newTxs = [...prevTxs];
        if (initialTxIndex !== -1) {
            if (newInitialBalance === 0) {
                 // Remove transaction if new balance is 0
                newTxs.splice(initialTxIndex, 1);
            } else {
                 // Update existing transaction
                const updatedTx = { ...newTxs[initialTxIndex], amount: newInitialBalance };
                newTxs[initialTxIndex] = updatedTx;
            }
        } else if (newInitialBalance !== 0) {
            // Add new initial balance transaction if it didn't exist
            const newInitialTx: Transaction = {
                id: crypto.randomUUID(),
                date: new Date().toISOString().split('T')[0],
                type: TransactionType.Income,
                accountId: updatedAccountData.id,
                amount: newInitialBalance,
                category: 'Saldo Awal',
                description: `Saldo awal untuk rekening ${updatedAccountData.name}`,
                source: TransactionSource.Manual
            };
            newTxs.unshift(newInitialTx);
        }
        return newTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setAccounts(prevAccounts =>
        prevAccounts.map(acc => {
            if (acc.id === updatedAccountData.id) {
                return {
                    ...acc,
                    name: updatedAccountData.name,
                    type: updatedAccountData.type,
                    balance: acc.balance + balanceDifference
                };
            }
            return acc;
        })
    );
  };
  
  const isAccountInUse = (id: string) => {
    const isUsedInNonInitialTx = transactions.some(t => (t.accountId === id || t.toAccountId === id) && t.category !== 'Saldo Awal');
    return isUsedInNonInitialTx || investments.some(i => i.accountId === id);
  };
  
  const deleteAccount = (id: string) => {
    if (isAccountInUse(id)) {
        alert("Rekening tidak dapat dihapus karena sudah digunakan dalam transaksi atau investasi.");
        return;
    }
    // Delete account and its initial balance transaction
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    setTransactions(prev => prev.filter(t => !(t.accountId === id && t.category === 'Saldo Awal')));
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
    const investmentToDelete = investments.find(inv => inv.id === id);
    if (!investmentToDelete) return;

    // Refund the initial value to the account
    addTransaction({
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.Income,
        accountId: investmentToDelete.accountId,
        amount: investmentToDelete.initialValue,
        category: 'Pengembalian Investasi',
        description: `Pengembalian modal investasi ${investmentToDelete.name}`,
        source: TransactionSource.Investment,
        linkedInvestmentId: id,
    });

    setInvestments(prev => prev.filter(inv => inv.id !== id));
    // Also delete the original linked expense transaction
    setTransactions(prev => prev.filter(t => !(t.linkedInvestmentId === id && t.source === TransactionSource.Investment)));
  };
  
  const addReceivable = (receivable: Omit<Receivable, 'id'|'status'>) => {
    const newReceivable = { ...receivable, id: crypto.randomUUID(), status: ReceivableStatus.Unpaid };
    setReceivables(prev => [...prev, newReceivable]);
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.Expense,
      accountId: newReceivable.accountId,
      amount: newReceivable.amount,
      category: 'Piutang',
      description: `Piutang kepada ${newReceivable.debtorName}`,
      source: TransactionSource.Receivable,
      linkedReceivableId: newReceivable.id,
    });
  };

  const updateReceivable = (updatedReceivable: Receivable) => {
    setReceivables(prev => prev.map(r => r.id === updatedReceivable.id ? {
        ...r, // keep old financial data to prevent desync
        debtorName: updatedReceivable.debtorName,
        dueDate: updatedReceivable.dueDate,
    } : r));
  };

  const deleteReceivable = (id: string) => {
    // 1. Filter out the receivable and all linked transactions
    const newReceivables = receivables.filter(r => r.id !== id);
    const newTransactions = transactions.filter(t => t.linkedReceivableId !== id);

    // 2. Recalculate all account balances from the new transaction list
    const newAccounts = accounts.map(account => {
        const initialBalanceTx = newTransactions.find(
            t => t.accountId === account.id && t.category === 'Saldo Awal'
        );
        let newBalance = initialBalanceTx ? initialBalanceTx.amount : 0;

        newTransactions
            .filter(t => t.category !== 'Saldo Awal')
            .forEach(t => {
                if (t.accountId === account.id) {
                    if (t.type === TransactionType.Income) {
                        newBalance += t.amount;
                    } else if (t.type === TransactionType.Expense || t.type === TransactionType.Transfer) {
                        newBalance -= t.amount;
                    }
                }
                if (t.toAccountId === account.id && t.type === TransactionType.Transfer) {
                    newBalance += t.amount;
                }
            });
        return { ...account, balance: newBalance };
    });

    // 3. Update state
    setReceivables(newReceivables);
    setTransactions(newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAccounts(newAccounts);
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