
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction, TransactionType, TransactionSource } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatter';
import Icon from '../components/Icon';

const Transfers: React.FC = () => {
    const { accounts, transactions, addTransaction, getAccount } = useAppContext();
    const canTransfer = accounts.length >= 2;

    // Form state
    const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
    const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(getTodayDateString());
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset default accounts if accounts list changes
        if (accounts.length > 0 && !fromAccountId) {
            setFromAccountId(accounts[0].id);
        }
        if (accounts.length > 1 && !toAccountId) {
            setToAccountId(accounts[1].id);
        }
        // Ensure "to" account is never the same as "from" account
        if (fromAccountId === toAccountId && canTransfer) {
            const newToAccount = accounts.find(a => a.id !== fromAccountId);
            setToAccountId(newToAccount?.id || '');
        }
    }, [accounts, fromAccountId, toAccountId, canTransfer]);

    const resetForm = () => {
        setAmount(0);
        setDescription('');
        setDate(getTodayDateString());
        setError('');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fromAccountId === toAccountId) {
            setError('Rekening asal dan tujuan tidak boleh sama.');
            return;
        }
        if (amount <= 0) {
            setError('Jumlah transfer harus lebih dari 0.');
            return;
        }

        addTransaction({
            date,
            type: TransactionType.Transfer,
            amount,
            accountId: fromAccountId,
            toAccountId,
            category: 'Transfer',
            description: description || `Transfer ke ${getAccount(toAccountId)?.name}`,
            source: TransactionSource.Manual,
        });
        
        // Optionally show a success message or just reset
        resetForm();
    };

    const transferHistory = useMemo(() => {
        return transactions
            .filter(t => t.type === TransactionType.Transfer)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    return (
        <div className="space-y-6">
            {/* Transfer Form Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Buat Transfer Baru</h2>
                {canTransfer ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dari Rekening</label>
                                <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ke Rekening</label>
                                <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    {accounts.filter(a => a.id !== fromAccountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                            <input 
                              type="number" 
                              value={amount === 0 ? '' : amount} 
                              onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
                              placeholder="0"
                              required 
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opsional" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <Icon name="transfer" className="w-5 h-5 mr-2" />
                                Simpan Transfer
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-gray-500 py-4">
                        Anda memerlukan setidaknya dua rekening untuk dapat melakukan transfer. Silakan tambahkan rekening baru di halaman Rekening.
                    </p>
                )}
            </div>

            {/* Transfer History Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Transfer</h2>
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
                            {transferHistory.map(tx => {
                                const fromAccount = getAccount(tx.accountId);
                                const toAccount = tx.toAccountId ? getAccount(tx.toAccountId) : null;
                                return (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                            <p className="text-sm text-gray-500">{fromAccount?.name} → {toAccount?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {transferHistory.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada riwayat transfer.</p>}
                </div>
            </div>
        </div>
    );
};

export default Transfers;