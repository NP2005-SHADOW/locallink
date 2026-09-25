import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const categoryData = {
    Household: ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mechanic'],
    Learning: ['Tutor'],
    Medical: ['Home Nurse', 'Physiotherapist', 'Lab Technician']
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer',
    category: '',
    service: ''
  });
  
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Send regular JSON payload without file upload during initial sign-up
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      loginUser(res.data.user, res.data.token);
      
      if (res.data.user.role === 'Provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Join LocalLink to find or offer services</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">I want to join as</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value, category: '', service: '' });
              }}
            >
              <option value="Customer">Customer (Looking for Services)</option>
              <option value="Provider">Service Provider (Offering Services)</option>
            </select>
          </div>

          {formData.role === 'Provider' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Provider Info</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Category</label>
                <select
                  required={formData.role === 'Provider'}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, service: '' })}
                >
                  <option value="">Select Category</option>
                  {Object.keys(categoryData).map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Specific Service</label>
                <select
                  required={formData.role === 'Provider'}
                  disabled={!formData.category}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                    !formData.category ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer'
                  }`}
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                >
                  <option value="">Select Service</option>
                  {formData.category && categoryData[formData.category].map((serv, idx) => (
                    <option key={idx} value={serv}>{serv}</option>
                  ))}
                </select>
              </div>
              {/* Document upload field successfully removed from here */}
            </div>
          )}

          <button
            type="submit"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            className="w-full py-3.5 font-bold rounded-lg shadow-md transition cursor-pointer hover:opacity-90"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}