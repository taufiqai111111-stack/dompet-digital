
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon, { IconName } from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/rekening', label: 'Rekening', icon: 'accounts' },
  { path: '/transfer', label: 'Transfer', icon: 'transfer' },
  { path: '/platform', label: 'Platform', icon: 'platforms' },
  { path: '/investasi', label: 'Investasi', icon: 'investments' },
  { path: '/aset', label: 'Aset', icon: 'assets' },
  { path: '/transaksi', label: 'Transaksi', icon: 'transactions' },
  { path: '/piutang', label: 'Piutang', icon: 'receivables' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem: React.FC<{ path: string; label: string; icon: IconName }> = ({ path, label, icon }) => (
    <NavLink
      to={path}
      end
      onClick={() => setIsOpen(false)}
    >
      {({ isActive }) => (
        <div
          className={
            `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
              isActive 
                ? 'bg-blue-600 text-white font-semibold shadow-md' 
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`
          }
        >
          <Icon name={icon} className={`w-6 h-6 mr-4 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'}`} />
          <span>{label}</span>
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed top-0 left-0 w-64 bg-white h-full z-40 shadow-lg transform transition-transform md:relative md:translate-x-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div>
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Dompet Digital</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800">
              <Icon name="close" className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map(item => <NavItem key={item.path} path={item.path} label={item.label} icon={item.icon} />)}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            <div className="mb-4">
                <p className="text-xs text-gray-500">Masuk sebagai:</p>
                <p className="text-sm font-medium text-gray-800 break-words">{currentUser?.email}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 group bg-red-50 hover:bg-red-100 text-red-600"
            >
                <Icon name="logout" className="w-6 h-6 mr-3" />
                <span className="font-semibold">Logout</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;