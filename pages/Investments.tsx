import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Investment } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatter';
import { downloadAsCsv } from '../utils/csvExporter';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

// Form for adding/editing an investment
const InvestmentForm: React.FC<{ onSave: (investment: Omit<Investment, 'id'>) => void; initialData?: Investment | null }> = ({ onSave, initialData }) => {
  const { accounts, platforms } = useAppContext();
  const [date, setDate] = useState(initialData?.date || getTodayDateString());
  const [name, setName] = useState(initialData?.name || '');
  const [platformId, setPlatformId] = useState(initialData?.platformId || (platforms[0]?.id || ''));
  const [accountId, setAccountId] = useState(initialData?.accountId || (accounts[0]?.id || ''));
  const [initialValue, setInitialValue] = useState(initialData?.initialValue || 0);
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ date, name, platformId, accountId, initialValue, currentValue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tanggal</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Jenis Investasi</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Saham BBCA, Reksadana" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Platform</label>
        <select value={platformId} onChange={e => setPlatformId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Sumber Dana</label>
        <select value={accountId} onChange={e => setAccountId(e.target.value)} required disabled={!!initialData} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Modal Awal</label>
        <input 
          type="number" 
          value={initialValue === 0 ? '' : initialValue} 
          onChange={e => setInitialValue(parseFloat(e.target.value) || 0)} 
          placeholder="0"
          required 
          disabled={!!initialData} 
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" 
        />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Nilai Saat Ini</label>
        <input 
          type="number" 
          value={currentValue === 0 ? '' : currentValue} 
          onChange={e => setCurrentValue(parseFloat(e.target.value) || 0)} 
          placeholder="0"
          required 
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
      </div>
    </form>
  );
};

// Form for updating just the current value
const UpdateValueForm: React.FC<{ onSave: (newValue: number) => void; currentValue: number; }> = ({ onSave, currentValue }) => {
    const [newValue, setNewValue] = useState(currentValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(newValue);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nilai Investasi Baru</label>
                <input 
                  type="number" 
                  value={newValue === 0 ? '' : newValue} 
                  onChange={e => setNewValue(parseFloat(e.target.value) || 0)} 
                  placeholder="0"
                  required 
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
            </div>
        </form>
    );
}

const Investments: React.FC = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment, updateInvestmentValue, accounts, platforms, getPlatform } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAddInvestment = accounts.length > 0 && platforms.length > 0;

  const handleSave = (investmentData: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      updateInvestment({ ...editingInvestment, ...investmentData });
    } else {
      addInvestment(investmentData);
    }
    setModalOpen(false);
    setEditingInvestment(null);
  };

  const handleUpdateValue = (newValue: number) => {
    if(editingInvestment) {
        updateInvestmentValue(editingInvestment.id, newValue);
    }
    setUpdateModalOpen(false);
    setEditingInvestment(null);
  }
  
  const openAddModal = () => {
    setEditingInvestment(null);
    setModalOpen(true);
  };

  const openEditModal = (investment: Investment) => {
    setEditingInvestment(investment);
    setModalOpen(true);
  };

  const openUpdateValueModal = (investment: Investment) => {
    setEditingInvestment(investment);
    setUpdateModalOpen(true);
  }
  
  const confirmDelete = (id: string) => {
    deleteInvestment(id);
    setDeletingId(null);
  };

  const handleDownload = () => {
    const headers = ['Tanggal', 'Nama Investasi', 'Platform', 'Modal Awal', 'Nilai Saat Ini', 'P/L'];
    const data = investments.map(inv => {
        const platformName = getPlatform(inv.platformId)?.name || 'N/A';
        const profitLoss = inv.currentValue - inv.initialValue;
        return [inv.date, inv.name, platformName, inv.initialValue, inv.currentValue, profitLoss];
    });
    downloadAsCsv('daftar-investasi.csv', headers, data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Investasi</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <Icon name="download" className="w-5 h-5 mr-2" />
              Unduh Data
            </button>
            <button 
              onClick={openAddModal} 
              disabled={!canAddInvestment}
              title={!canAddInvestment ? "Silakan tambah rekening dan platform terlebih dahulu" : "Tambah Investasi"}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Icon name="plus" className="w-5 h-5 mr-2" />
              Tambah Investasi
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Kini</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map(inv => {
                const profitLoss = inv.currentValue - inv.initialValue;
                const platform = getPlatform(inv.platformId);
                return (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{inv.name}</div>
                        <div className="text-sm text-gray-500">{platform?.name} - {formatDate(inv.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(inv.initialValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(inv.currentValue)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profitLoss)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openUpdateValueModal(inv)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold">Update Nilai</button>
                      <button onClick={() => openEditModal(inv)} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Icon name="edit" className="w-5 h-5"/>
                      </button>
                      <button onClick={() => setDeletingId(inv.id)} className="p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors">
                        <Icon name="delete" className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {investments.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada investasi. Silakan tambahkan.</p>}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingInvestment ? 'Edit Investasi' : 'Tambah Investasi'}>
        <InvestmentForm onSave={handleSave} initialData={editingInvestment} />
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={() => setUpdateModalOpen(false)} title={`Update Nilai ${editingInvestment?.name}`}>
        {editingInvestment && <UpdateValueForm onSave={handleUpdateValue} currentValue={editingInvestment.currentValue} />}
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Konfirmasi Hapus">
        <div>
          <p className="text-gray-600 mb-4">Menghapus investasi juga akan menghapus transaksi modal awal terkait. Anda yakin?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button onClick={() => confirmDelete(deletingId!)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Investments;