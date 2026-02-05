
import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  return (
    <header className="md:hidden bg-white shadow-sm flex items-center justify-between p-4">
      <button onClick={onMenuClick} className="text-gray-600">
        <Icon name="menu" className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="w-6"></div> {/* Spacer */}
    </header>
  );
};

export default Header;
