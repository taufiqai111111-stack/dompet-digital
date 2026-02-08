import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Asset, AssetType } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatter';
import { downloadAsCsv } from '../utils/csvExporter';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const AssetForm: React.FC<{ onSave: (asset: Omit<Asset, 'id'>, isNewPurchase: boolean) => void; initialData?: Asset | null }> = ({ onSave, initialData }) => {
    const { accounts, getAccount } = useAppContext();
    const isEditing = !!initialData;
    
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState(initialData?.type || AssetType.Other);
    const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || getTodayDateString());
    const [accountId, setAccountId] = useState(initialData?.accountId || (accounts[0]?.id || ''));
    const [purchaseValue, setPurchaseValue] = useState(initialData?.purchaseValue || 0);
    const [currentValue, setCurrentValue] = useState(initialData?.currentValue || 0);
    const [isNewPurchase, setIsNewPurchase] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const assetPayload: Omit<Asset, 'id'> = {
            name,
            type,
            purchaseDate,
            accountId: (!isEditing && isNewPurchase) ? accountId : initialData?.accountId,
            purchaseValue,
            currentValue,
        };
        onSave(assetPayload, !isEditing && isNewPurchase);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
                <div className="bg-gray-50 p-3 rounded-md">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isNewPurchase} 
                            onChange={e => setIsNewPurchase(e.target.checked)} 
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Buat transaksi pengeluaran untuk aset baru ini</span>
                    </label>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Aset</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Rumah, Mobil Toyota, Laptop" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Aset</label>
                <select value={type} onChange={e => setType(e.target.value as AssetType)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Beli</label>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            
            {((!isEditing && isNewPurchase) || (isEditing && initialData?.accountId)) && (
             <div>
                <label className="block text-sm font-medium text-gray-700">Sumber Dana</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} required={!isEditing && isNewPurchase} disabled={isEditing} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:text-gray-500">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Nilai Beli</label>
                <input type="number" value={purchaseValue === 0 ? '' : purchaseValue} onChange={e => setPurchaseValue(parseFloat(e.target.value) || 0)} required placeholder="0" disabled={isEditing} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nilai Saat Ini</label>
                <input type="number" value={currentValue === 0 ? '' : currentValue} onChange={e => setCurrentValue(parseFloat(e.target.value) || 0)} required placeholder="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Aset</button>
            </div>
        </form>
    );
};

const UpdateAssetValueForm: React.FC<{ onSave: (newValue: number) => void; currentValue: number; }> = ({ onSave, currentValue }) => {
    const [newValue, setNewValue] = useState(currentValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(newValue);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nilai Aset Baru</label>
                <input type="number" value={newValue === 0 ? '' : newValue} onChange={e => setNewValue(parseFloat(e.target.value) || 0)} placeholder="0" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
            </div>
        </form>
    );
}

const SellAssetForm: React.FC<{ onConfirm: (accountId: string) => void; assetName: string; }> = ({ onConfirm, assetName }) => {
    const { accounts } = useAppContext();
    const [receivingAccountId, setReceivingAccountId] = useState(accounts[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(receivingAccountId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p>Anda akan menjual aset "{assetName}". Pilih rekening untuk menerima dana dari penjualan ini.</p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rekening Penerima</label>
                <select value={receivingAccountId} onChange={e => setReceivingAccountId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Konfirmasi Penjualan</button>
            </div>
        </form>
    );
};


const Assets: React.FC = () => {
  const { assets, accounts, addAsset, updateAsset, updateAssetValue, sellAsset, getAccount } = useAppContext();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const canAddAsset = accounts.length > 0;

  const handleSave = (assetData: Omit<Asset, 'id'>, isNewPurchase: boolean) => {
    if (editingAsset) {
      updateAsset({ ...editingAsset, ...assetData });
    } else {
      addAsset(assetData, isNewPurchase);
    }
    setFormModalOpen(false);
    setEditingAsset(null);
  };
  
  const handleUpdateValue = (newValue: number) => {
    if(editingAsset) {
        updateAssetValue(editingAsset.id, newValue);
    }
    setUpdateModalOpen(false);
    setEditingAsset(null);
  }

  const handleSell = (receivingAccountId: string) => {
    if(editingAsset) {
        sellAsset(editingAsset.id, receivingAccountId);
    }
    setSellModalOpen(false);
    setEditingAsset(null);
  }
  
  const openAddModal = () => {
    setEditingAsset(null);
    setFormModalOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormModalOpen(true);
  };

  const openUpdateValueModal = (asset: Asset) => {
    setEditingAsset(asset);
    setUpdateModalOpen(true);
  }

  const openSellModal = (asset: Asset) => {
    setEditingAsset(asset);
    setSellModalOpen(true);
  };

  const handleDownload = () => {
    const headers = ['Nama Aset', 'Jenis', 'Tanggal Beli', 'Nilai Beli', 'Nilai Saat Ini', 'P/L'];
    const data = assets.map(asset => {
        const profitLoss = asset.currentValue - asset.purchaseValue;
        return [asset.name, asset.type, asset.purchaseDate, asset.purchaseValue, asset.currentValue, profitLoss];
    });
    downloadAsCsv('daftar-aset.csv', headers, data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Aset</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                <Icon name="download" className="w-5 h-5 mr-2" />
                Unduh Data
            </button>
            <button 
              onClick={openAddModal} 
              disabled={!canAddAsset}
              title={!canAddAsset ? "Silakan tambah rekening terlebih dahulu" : "Tambah Aset"}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Icon name="plus" className="w-5 h-5 mr-2" />
              Tambah Aset
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Beli</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Kini</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map(asset => {
                const profitLoss = asset.currentValue - asset.purchaseValue;
                return (
                  <tr key={asset.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">{asset.type} - {formatDate(asset.purchaseDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(asset.purchaseValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(asset.currentValue)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profitLoss)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openUpdateValueModal(asset)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold">Update Nilai</button>
                      <button onClick={() => openEditModal(asset)} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Icon name="edit" className="w-5 h-5"/>
                      </button>
                      <button onClick={() => openSellModal(asset)} className="p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors">
                        <Icon name="delete" className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {assets.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada aset. Silakan tambahkan.</p>}
        </div>
      </div>
      
      <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={editingAsset ? 'Edit Aset' : 'Tambah Aset'}>
        <AssetForm onSave={handleSave} initialData={editingAsset} />
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={() => setUpdateModalOpen(false)} title={`Update Nilai ${editingAsset?.name}`}>
        {editingAsset && <UpdateAssetValueForm onSave={handleUpdateValue} currentValue={editingAsset.currentValue} />}
      </Modal>

      <Modal isOpen={isSellModalOpen} onClose={() => setSellModalOpen(false)} title="Konfirmasi Penjualan Aset">
        {editingAsset && <SellAssetForm onConfirm={handleSell} assetName={editingAsset.name} />}
      </Modal>
    </div>
  );
};

export default Assets;