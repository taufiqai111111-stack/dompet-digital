
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Receivable, ReceivableStatus } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatter';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const ReceivableForm: React.FC<{ onSave: (receivable: Omit<Receivable, 'id'|'status'>) => void; initialData?: Receivable | null }> = ({ onSave, initialData }) => {
  const [debtorName, setDebtorName] = useState(initialData?.debtorName || '');
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || getTodayDateString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ debtorName, amount, dueDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Peminjam</label>
        <input type="text" value={debtorName} onChange={(e) => setDebtorName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Nominal</label>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tanggal Jatuh Tempo</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
      </div>
    </form>
  );
};

const MarkAsPaidForm: React.FC<{ onConfirm: (accountId: string) => void }> = ({ onConfirm }) => {
    const { accounts } = useAppContext();
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(accountId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Rekening Penerima</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Konfirmasi Lunas</button>
            </div>
        </form>
    );
};

const Receivables: React.FC = () => {
  const { receivables, addReceivable, updateReceivable, deleteReceivable, markReceivableAsPaid, accounts } = useAppContext();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isPaidModalOpen, setPaidModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = (receivableData: Omit<Receivable, 'id'|'status'>) => {
    if (editingReceivable) {
      updateReceivable({ ...editingReceivable, ...receivableData });
    } else {
      addReceivable(receivableData);
    }
    setFormModalOpen(false);
    setEditingReceivable(null);
  };
  
  const handleMarkAsPaid = (accountId: string) => {
      if(editingReceivable) {
          markReceivableAsPaid(editingReceivable.id, accountId);
      }
      setPaidModalOpen(false);
      setEditingReceivable(null);
  };

  const openAddModal = () => {
    setEditingReceivable(null);
    setFormModalOpen(true);
  };

  const openEditModal = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setFormModalOpen(true);
  };

  const openPaidModal = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setPaidModalOpen(true);
  };
  
  const confirmDelete = (id: string) => {
    deleteReceivable(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Piutang</h2>
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Tambah Piutang
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receivables.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.debtorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(r.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.dueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === ReceivableStatus.Paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {r.status === ReceivableStatus.Unpaid && (
                      <button 
                        onClick={() => openPaidModal(r)} 
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold disabled:opacity-50"
                        disabled={accounts.length === 0}
                        title={accounts.length === 0 ? "Tambah rekening dulu untuk menerima pembayaran" : "Tandai Lunas"}
                      >
                        Tandai Lunas
                      </button>
                    )}
                    <button onClick={() => openEditModal(r)} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:hover:bg-transparent" disabled={r.status === ReceivableStatus.Paid}>
                      <Icon name="edit" className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setDeletingId(r.id)} className="p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors">
                      <Icon name="delete" className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {receivables.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada piutang.</p>}
        </div>
      </div>
      
      <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={editingReceivable ? 'Edit Piutang' : 'Tambah Piutang'}>
        <ReceivableForm onSave={handleSave} initialData={editingReceivable} />
      </Modal>

      <Modal isOpen={isPaidModalOpen} onClose={() => setPaidModalOpen(false)} title="Tandai Piutang Lunas">
          <MarkAsPaidForm onConfirm={handleMarkAsPaid} />
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Konfirmasi Hapus">
        <div>
          <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus piutang ini?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button onClick={() => confirmDelete(deletingId!)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Receivables;
