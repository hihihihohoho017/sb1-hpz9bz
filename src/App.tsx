import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Finals from './pages/Finals';
import Inventory from './pages/Inventory';
import Faculty from './pages/Advisers';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto p-4 lg:p-8 mt-16 lg:mt-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/finals" element={<Finals />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/faculty" element={<Faculty />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;