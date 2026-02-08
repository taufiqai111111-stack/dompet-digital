import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
          {icon}
        </div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-800 mt-4">{value}</p>
    </div>
  );
};

export default DashboardCard;