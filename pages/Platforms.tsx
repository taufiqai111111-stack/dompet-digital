
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Platform } from '../types';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const PlatformForm: React.FC<{ onSave: (platform: Omit<Platform, 'id'>) => void; initialData?: Platform | null }> = ({ onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Platform</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Simpan
        </button>
      </div>
    </form>
  );
};

const Platforms: React.FC = () => {
  const { platforms, addPlatform, updatePlatform, deletePlatform, isPlatformInUse } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = (platformData: Omit<Platform, 'id'>) => {
    if (editingPlatform) {
      updatePlatform({ ...editingPlatform, ...platformData });
    } else {
      addPlatform(platformData);
    }
    setModalOpen(false);
    setEditingPlatform(null);
  };
  
  const openAddModal = () => {
    setEditingPlatform(null);
    setModalOpen(true);
  };

  const openEditModal = (platform: Platform) => {
    setEditingPlatform(platform);
    setModalOpen(true);
  };
  
  const confirmDelete = (id: string) => {
    deletePlatform(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Platform Investasi</h2>
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Tambah Platform
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Platform</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platforms.map(platform => (
                <tr key={platform.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{platform.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEditModal(platform)} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-colors">
                      <Icon name="edit" className="w-5 h-5"/>
                    </button>
                    <button 
                      onClick={() => setDeletingId(platform.id)} 
                      className={`p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors ${isPlatformInUse(platform.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isPlatformInUse(platform.id)}
                      title={isPlatformInUse(platform.id) ? "Platform ini tidak bisa dihapus karena sedang digunakan" : "Hapus platform"}
                    >
                      <Icon name="delete" className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {platforms.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada platform. Silakan tambahkan.</p>}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingPlatform ? 'Edit Platform' : 'Tambah Platform'}>
        <PlatformForm onSave={handleSave} initialData={editingPlatform} />
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Konfirmasi Hapus">
        <div>
          <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus platform ini?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button onClick={() => confirmDelete(deletingId!)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Platforms;
