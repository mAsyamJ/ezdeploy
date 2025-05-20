
'use client';
import { useState } from 'react';
import Dashboard from './Dashboard';
export default function DashboardButton() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };
  
  return (
    <>
      <button
        onClick={toggleDashboard}
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-300"
      >
        <span className="mr-2">📊</span> Dashboard
      </button>
      
      {/* Dashboard Overlay - only visible when dashboard is open */}
      {isDashboardOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30"
          onClick={() => setIsDashboardOpen(false)}
        ></div>
      )}
      
      <Dashboard 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
      />
    </>
  );
}
