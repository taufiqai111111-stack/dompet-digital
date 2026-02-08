import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction, TransactionType, TransactionSource } from '../types';
import { formatCurrency, formatDate, getTodayDateString, getMonthStartDateString } from '../utils/formatter';
import { downloadAsCsv } from '../utils/csvExporter';
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
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [category, setCategory] = useState(commonCategories[type][0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!accountId && accounts.length > 0) {
            setAccountId(accounts[0].id);
        }
    }, [accounts, accountId]);

    const handleTypeChange = (newType: TransactionType.Income | TransactionType.Expense) => {
        setType(newType);
        setCategory(commonCategories[newType][0]);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || category.trim() === '') {
            alert('Kategori tidak boleh kosong.');
            return;
        }
        onSave({ 
            date, type, amount, accountId, 
            category, description 
        });
    };

    const showManualCategoryInput = !commonCategories[type].includes(category);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
                {([TransactionType.Expense, TransactionType.Income] as const).map(t => (
                    <button 
                        key={t} 
                        type="button" 
                        onClick={() => handleTypeChange(t)} 
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${type === t ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-white/50'}`}
                    >
                        {t}
                    </button>
                ))}
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
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Rekening</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                    id="category-select"
                    value={showManualCategoryInput ? 'Lainnya' : category}
                    onChange={e => {
                        const selectedValue = e.target.value;
                        setCategory(selectedValue === 'Lainnya' ? '' : selectedValue);
                    }}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    {commonCategories[type].map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Lainnya">Lainnya...</option>
                </select>
            </div>

            {showManualCategoryInput && (
                <div>
                    <label htmlFor="manual-category-input" className="block text-sm font-medium text-gray-700">Kategori Baru</label>
                    <input
                        id="manual-category-input"
                        type="text"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                        placeholder="Masukkan nama kategori"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        autoFocus
                    />
                </div>
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
            end.setHours(23, 59, 59, 999);
            return txDate >= start && txDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const handleSave = (transactionData: Omit<Transaction, 'id' | 'source'>) => {
        addTransaction({ ...transactionData, source: TransactionSource.Manual });
        setModalOpen(false);
    };
    
    const handleDownload = () => {
        const headers = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Dari Rekening", "Ke Rekening", "Jumlah"];
        const data = filteredTransactions.map(tx => {
            const fromAccount = getAccount(tx.accountId)?.name || 'N/A';
            const toAccount = tx.toAccountId ? (getAccount(tx.toAccountId)?.name || 'N/A') : '';
            return [
                tx.date,
                tx.type,
                tx.category,
                tx.description,
                fromAccount,
                toAccount,
                tx.amount
            ];
        });
        
        const today = new Date();
        const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const fileName = `Laporan-Transaksi-${formattedDate}.csv`;

        downloadAsCsv(fileName, headers, data);
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
                    <div className="flex items-center space-x-2">
                        <button onClick={handleDownload} className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <Icon name="download" className="w-5 h-5 mr-2" />
                            Unduh Laporan
                        </button>
                        <button onClick={() => setModalOpen(true)} disabled={accounts.length === 0} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            <Icon name="plus" className="w-5 h-5 mr-2" />
                            Tambah Transaksi
                        </button>
                    </div>
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