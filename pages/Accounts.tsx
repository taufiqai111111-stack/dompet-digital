import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Account, AccountType } from '../types';
import { formatCurrency } from '../utils/formatter';
import { downloadAsCsv } from '../utils/csvExporter';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const AccountForm: React.FC<{ 
    onSave: (account: Omit<Account, 'id' | 'balance'>, initialBalance: number) => void; 
    initialData?: Account | null;
    initialBalance?: number;
}> = ({ onSave, initialData, initialBalance }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || AccountType.Bank);
  const [balance, setBalance] = useState(initialBalance ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, type }, balance);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Rekening</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Jenis Rekening</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as AccountType)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Saldo Awal</label>
        <input 
          type="number" 
          step="any" 
          id="balance" 
          value={balance === 0 ? '' : balance} 
          onChange={(e) => setBalance(parseFloat(e.target.value) || 0)} 
          placeholder="0"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Simpan
        </button>
      </div>
    </form>
  );
};

const Accounts: React.FC = () => {
  const { accounts, transactions, addAccount, updateAccount, deleteAccount, isAccountInUse } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingInitialBalance, setEditingInitialBalance] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = (accountData: Omit<Account, 'id' | 'balance'>, initialBalance: number) => {
    if (editingAccount) {
      updateAccount({ ...editingAccount, ...accountData }, initialBalance);
    } else {
      addAccount(accountData, initialBalance);
    }
    setModalOpen(false);
    setEditingAccount(null);
  };
  
  const openAddModal = () => {
    setEditingAccount(null);
    setEditingInitialBalance(0);
    setModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    const initialBalanceTx = transactions.find(t => t.accountId === account.id && t.category === 'Saldo Awal');
    const initialBalance = initialBalanceTx ? initialBalanceTx.amount : 0;
    setEditingAccount(account);
    setEditingInitialBalance(initialBalance);
    setModalOpen(true);
  };
  
  const confirmDelete = (id: string) => {
    deleteAccount(id);
    setDeletingId(null);
  };

  const handleDownload = () => {
    const headers = ['Nama Rekening', 'Jenis', 'Saldo'];
    const data = accounts.map(acc => [acc.name, acc.type, acc.balance]);
    downloadAsCsv('daftar-rekening.csv', headers, data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Rekening</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <Icon name="download" className="w-5 h-5 mr-2" />
              Unduh Data
            </button>
            <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Icon name="plus" className="w-5 h-5 mr-2" />
              Tambah Rekening
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map(account => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(account.balance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEditModal(account)} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors">
                      <Icon name="edit" className="w-5 h-5"/>
                    </button>
                    <button 
                      onClick={() => setDeletingId(account.id)} 
                      className={`p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors ${isAccountInUse(account.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isAccountInUse(account.id)}
                      title={isAccountInUse(account.id) ? "Rekening ini tidak bisa dihapus karena sedang digunakan" : "Hapus rekening"}
                    >
                      <Icon name="delete" className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada rekening. Silakan tambahkan.</p>}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingAccount ? 'Edit Rekening' : 'Tambah Rekening'}>
        <AccountForm 
          onSave={handleSave} 
          initialData={editingAccount} 
          initialBalance={editingInitialBalance} 
        />
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Konfirmasi Hapus">
        <div>
          <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus rekening ini? Transaksi saldo awal terkait juga akan dihapus.</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button onClick={() => confirmDelete(deletingId!)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;