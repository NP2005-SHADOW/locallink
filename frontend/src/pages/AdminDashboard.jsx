import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('providers'); // 'providers' or 'bookings'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch pending providers
        const provResponse = await axios.get('http://localhost:5000/api/admin/pending-providers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProviders(provResponse.data);

        // Fetch all platform bookings
        const bookResponse = await axios.get('http://localhost:5000/api/bookings/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookResponse.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === 'Admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const handleApprove = async (providerId) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/approve-provider/${providerId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProviders(providers.filter(p => p._id !== providerId));
      alert('Provider approved successfully!');
    } catch (error) {
      alert('Failed to approve provider.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex items-center justify-center text-slate-400 font-medium">
        Loading admin panel...
      </div>
    );
  }

  // Calculate metrics for top cards
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingApprovalsCount = providers.length;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex font-sans text-slate-100">
      
      {/* 1. DARK SIDEBAR */}
      <aside className="w-72 bg-[#111827] border-r border-slate-800 hidden lg:flex flex-col justify-between p-6">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-10">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 inline-block"></span>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Local<span className="text-indigo-400">Link</span>
            </span>
          </div>

          {/* Admin Profile Box */}
          <div className="flex flex-col items-center text-center p-4 bg-[#1F2937] rounded-3xl mb-8 border border-slate-800">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=6366f1&color=fff&size=80&bold=true`} 
              alt="Admin" 
              className="w-14 h-14 rounded-full shadow-md mb-2 border border-slate-700"
            />
            <h3 className="font-bold text-white text-sm">{user?.fullName || 'System Admin'}</h3>
            <span className="mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-950 text-indigo-400 rounded-full border border-indigo-800/50">
              Administrator
            </span>
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('providers')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer text-left ${activeTab === 'providers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-[#1F2937] hover:text-white'}`}
            >
              <span>🛡️</span> Pending Approvals
              {providers.length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {providers.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer text-left ${activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-[#1F2937] hover:text-white'}`}
            >
              <span>📋</span> System Bookings
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-400 hover:bg-[#1F2937] hover:text-white font-semibold text-sm transition cursor-pointer text-left"
            >
              <span>🏠</span> Back to Home
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={logout} 
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-sm transition cursor-pointer border border-rose-500/20"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage provider verifications and monitor platform activities</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={logout} 
              className="lg:hidden px-4 py-2 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* METRIC STAT CARDS (Dark Theme Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pending Verifications</p>
              <h3 className="text-4xl font-extrabold text-amber-400">{pendingApprovalsCount}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-medium">Providers awaiting document approval</p>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Confirmed Bookings</p>
              <h3 className="text-4xl font-extrabold text-emerald-400">{confirmedBookingsCount}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-medium">Active platform appointments</p>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total System Load</p>
              <h3 className="text-4xl font-extrabold text-indigo-400">{totalBookingsCount}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-medium">All recorded service transactions</p>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden gap-3 mb-6">
          <button 
            onClick={() => setActiveTab('providers')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${activeTab === 'providers' ? 'bg-indigo-600 text-white' : 'bg-[#111827] text-slate-400 border border-slate-800'}`}
          >
            Pending Approvals ({providers.length})
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'bg-[#111827] text-slate-400 border border-slate-800'}`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>

        {/* TAB 1: PENDING PROVIDERS */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-white">Service Providers Awaiting Approval</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{providers.length} pending</span>
            </div>

            {providers.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 p-12 rounded-3xl text-center shadow-sm">
                <span className="text-4xl mb-2 block">✨</span>
                <p className="text-slate-400 font-medium">No pending provider approvals at this time.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {providers.map((provider) => (
                  <div key={provider._id} className="bg-[#111827] border border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-xl text-white">{provider.fullName}</h4>
                          <p className="text-xs font-semibold text-indigo-400 mt-0.5">{provider.category} — {provider.service}</p>
                          <p className="text-xs text-slate-400 mt-1">📧 {provider.email} | 📞 {provider.phone}</p>
                        </div>
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                          KYC Submitted
                        </span>
                      </div>

                      <div className="mb-6 bg-[#1F2937] p-4 rounded-2xl text-sm border border-slate-800/60">
                        <span className="font-bold text-slate-300 block mb-1 text-xs uppercase tracking-wider">Submitted Document/ID:</span>
                        {provider.documentData ? (
                          <a 
                            href={`http://localhost:5000/${provider.documentData.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-400 font-bold hover:underline break-all flex items-center gap-1.5 text-xs"
                          >
                            <span>📄</span> View Uploaded Document ↗
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">No document provided</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprove(provider._id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-md"
                    >
                      Verify & Approve Provider
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYSTEM BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-white">Complete System Bookings Schedule</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bookings.length} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 p-12 rounded-3xl text-center shadow-sm">
                <span className="text-4xl mb-2 block">📭</span>
                <p className="text-slate-400 font-medium">No bookings have been made on the platform yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-[#111827] border border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <h4 className="font-bold text-base text-white">{booking.service}</h4>
                      </div>
                      <p className="text-xs text-slate-300">👤 Customer: <span className="font-semibold text-white">{booking.customer?.fullName}</span> ({booking.customer?.phone})</p>
                      <p className="text-xs text-slate-300 mt-0.5">🛠️ Provider: <span className="font-semibold text-white">{booking.provider?.fullName}</span></p>
                      <p className="text-[10px] text-slate-500 mt-1.5 font-bold">📅 {booking.date} | ⏰ {booking.timeSlot}</p>
                    </div>

                    <span className={`px-3 py-1 text-[10px] rounded-full font-extrabold uppercase tracking-widest ${
                      booking.status === 'Confirmed' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : booking.status === 'Completed'
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                        : booking.status === 'Pending' 
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}