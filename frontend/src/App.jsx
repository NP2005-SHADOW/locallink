import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // 1. Import axios
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Providers from './pages/Providers'; // <-- Added the new Providers page import
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

// 2. Set global base URL for all Axios calls across the application
// Since Express serves the frontend static build on port 5000, relative paths will automatically route through ngrok!
axios.defaults.baseURL = 'https://reviver-shamrock-banshee.ngrok-free.dev';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Added the Providers route below */}
              <Route path="/providers" element={<Providers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/provider-dashboard" element={<ProviderDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}