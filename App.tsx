
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Platforms from './pages/Platforms';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import Receivables from './pages/Receivables';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/rekening': 'Manajemen Rekening',
  '/platform': 'Manajemen Platform',
  '/investasi': 'Manajemen Investasi',
  '/transaksi': 'Riwayat Transaksi',
  '/piutang': 'Manajemen Piutang',
};

// FIX: Add explicit React.FC type to MainContent to aid type inference
const MainContent: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dompet Digital';

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 hidden md:block">{title}</h1>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rekening" element={<Accounts />} />
        <Route path="/platform" element={<Platforms />} />
        <Route path="/investasi" element={<Investments />} />
        <Route path="/transaksi" element={<Transactions />} />
        <Route path="/piutang" element={<Receivables />} />
      </Routes>
    </main>
  );
};

// FIX: Encapsulate UI that uses router hooks into a separate component
const AppContent = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = useMemo(() => pageTitles[location.pathname] || 'Dompet Digital', [location.pathname]);

  return (
      <AppProvider>
        <div className="flex h-screen bg-gray-100 font-sans">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
            <MainContent />
          </div>
        </div>
      </AppProvider>
  );
}

// FIX: Wrap the main content with HashRouter to provide routing context
export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
