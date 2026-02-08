
import React, { useState, useMemo, ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Platforms from './pages/Platforms';
import Investments from './pages/Investments';
import Assets from './pages/Assets';
import Transactions from './pages/Transactions';
import Receivables from './pages/Receivables';
import Transfers from './pages/Transfers';
import Login from './pages/Login';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/rekening': 'Manajemen Rekening',
  '/transfer': 'Transfer Antar Rekening',
  '/platform': 'Manajemen Platform',
  '/investasi': 'Manajemen Investasi',
  '/aset': 'Manajemen Aset',
  '/transaksi': 'Riwayat Transaksi',
  '/piutang': 'Manajemen Piutang',
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dompet Digital';

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 hidden md:block">{title}</h1>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rekening" element={<Accounts />} />
        <Route path="/transfer" element={<Transfers />} />
        <Route path="/platform" element={<Platforms />} />
        <Route path="/investasi" element={<Investments />} />
        <Route path="/aset" element={<Assets />} />
        <Route path="/transaksi" element={<Transactions />} />
        <Route path="/piutang" element={<Receivables />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
};

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = useMemo(() => pageTitles[location.pathname] || 'Dompet Digital', [location.pathname]);

  return (
      <AppProvider>
        <div className="flex h-screen bg-gray-100 font-sans">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
            {/* The Outlet will render the nested routes inside MainContent */}
            <Outlet /> 
          </div>
        </div>
      </AppProvider>
  );
}

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}


const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppProvider>
                             <div className="flex h-screen bg-gray-100 font-sans">
                                <AppContentWrapper />
                             </div>
                        </AppProvider>
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

const AppContentWrapper = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const title = useMemo(() => pageTitles[location.pathname] || 'Dompet Digital', [location.pathname]);

    return (
        <>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
                <MainContent />
            </div>
        </>
    );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}