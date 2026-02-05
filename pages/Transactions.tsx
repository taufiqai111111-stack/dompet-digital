
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction, TransactionType, TransactionSource } from '../types';
import { formatCurrency, formatDate, getTodayDateString, getMonthStartDateString } from '../utils/formatter';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const commonCategories = {
    [TransactionType.Income]: ['Gaji', 'Bonus', 'Hadiah', 'Penjualan', 'Piutang', 'Lainnya'],
    [TransactionType.Expense]: ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Investasi', 'Lainnya']
}

const TransactionForm: React.FC<{ onSave: (transaction: Omit<Transaction, 'id' | 'source'>) => void }> = ({ onSave }) => {
    const { accounts } = useAppContext();
    const [type, setType] = useState(TransactionType.Expense);
    const [date, setDate] = useState(getTodayDateString());
    const [amount, setAmount] = useState(0);
    const defaultAccountId = accounts[0]?.id || '';
    const [accountId, setAccountId] = useState(defaultAccountId);
    const [toAccountId, setToAccountId] = useState(accounts.find(a => a.id !== defaultAccountId)?.id || '');
    const [category, setCategory] = useState(commonCategories[type][0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        // Ensure `toAccountId` is never the same as `accountId` in a transfer
        if (type === TransactionType.Transfer && accountId === toAccountId) {
            const newToAccount = accounts.find(a => a.id !== accountId);
            setToAccountId(newToAccount?.id || '');
        }
    }, [type, accountId, toAccountId, accounts]);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        setCategory(newType === TransactionType.Transfer ? 'Transfer' : commonCategories[newType][0]);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            date, type, amount, accountId, 
            toAccountId: type === TransactionType.Transfer ? toAccountId : undefined, 
            category, description 
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 p-1">
                {Object.values(TransactionType).map(t => (
                    <button key={t} type="button" onClick={() => handleTypeChange(t)} className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${type === t ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-white/50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>

            {type === TransactionType.Transfer ? (
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Dari Rekening</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ke Rekening</label>
                        <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rekening</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="category-input" className="block text-sm font-medium text-gray-700">Kategori</label>
                        <input 
                            id="category-input"
                            type="text" 
                            list="category-list"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            required 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                        <datalist id="category-list">
                            {commonCategories[type].map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opsional" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Transaksi</button>
            </div>
        </form>
    );
};

const Transactions: React.FC = () => {
    const { transactions, addTransaction, getAccount, accounts } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(getMonthStartDateString());
    const [endDate, setEndDate] = useState(getTodayDateString());

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return txDate >= start && txDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const handleSave = (transactionData: Omit<Transaction, 'id' | 'source'>) => {
        addTransaction({ ...transactionData, source: TransactionSource.Manual });
        setModalOpen(false);
    };

    const getTypeColor = (type: TransactionType) => {
        switch (type) {
            case TransactionType.Income: return 'text-green-600';
            case TransactionType.Expense: return 'text-red-600';
            case TransactionType.Transfer: return 'text-blue-600';
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Riwayat Transaksi</h2>
                     <div className="flex items-center space-x-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input border-gray-300 rounded-md shadow-sm"/>
                        <span>-</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <button onClick={() => setModalOpen(true)} disabled={accounts.length === 0} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Tambah Transaksi
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map(tx => {
                                const fromAccount = getAccount(tx.accountId);
                                const toAccount = tx.toAccountId ? getAccount(tx.toAccountId) : null;
                                return (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{tx.description || tx.category}</p>
                                            <p className="text-sm text-gray-500">
                                                {tx.type === TransactionType.Transfer ? `${fromAccount?.name} -> ${toAccount?.name}` : fromAccount?.name}
                                            </p>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${getTypeColor(tx.type)}`}>
                                            {tx.type === TransactionType.Income ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && <p className="text-center py-4 text-gray-500">Tidak ada transaksi pada rentang tanggal ini.</p>}
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Tambah Transaksi Baru">
                <TransactionForm onSave={handleSave} />
            </Modal>
        </div>
    );
};

export default Transactions;