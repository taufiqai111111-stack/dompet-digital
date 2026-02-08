
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email tidak boleh kosong.');
      return;
    }
    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Format email tidak valid.');
        return;
    }
    setError('');
    login(email);
    navigate(from, { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
            <h1 className="text-3xl font-bold text-center text-blue-600">
                Dompet Digital
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
                Selamat datang! Silakan masuk untuk melanjutkan.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Alamat Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Masuk atau Daftar
            </button>
          </div>
        </form>
         <p className="mt-4 text-center text-xs text-gray-500">
            Aplikasi ini menyimpan data secara lokal di browser Anda. Menggunakan email yang sama di browser lain akan membuat set data yang baru.
        </p>
      </div>
    </div>
  );
};

export default Login;
