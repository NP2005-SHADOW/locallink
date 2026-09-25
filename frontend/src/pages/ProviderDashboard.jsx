import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PhoneVerification from '../components/PhoneVerification';
import EmailVerification from '../components/EmailVerification';
import { useNavigate } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user, token, loginUser, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const status = user?.verificationStatus || 'Pending';
  const isPhoneVerified = user?.phoneVerified || false;
  const isEmailVerified = user?.emailVerified || false;

  // View & Analytics States
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'services', 'analytics'
  const [analyticsData, setAnalyticsData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });

  // OTP Completion States
  const [activeOtpBookingId, setActiveOtpBookingId] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && status === 'Approved') {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [token, status]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle OTP Submission for Service Completion
  const handleCompleteService = async (bookingId) => {
    if (!otpInput || otpInput.length !== 6) {
      return alert('Please enter the 6-digit OTP provided by the customer.');
    }
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/complete`, 
        { otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Service verified and marked as Completed!');
      setActiveOtpBookingId(null);
      setOtpInput('');
      fetchBookings(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete service. Incorrect OTP?');
    }
  };

  const handleSubmitDocs = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a document file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/upload-kyc', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      loginUser(res.data.provider, token);
      alert('KYC document uploaded successfully! Please wait for admin approval.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const fetchAnalyticsReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/provider-reviews/${user._id || user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics reviews', err);
    }
  };

  const handlePhoneVerified = () => loginUser({ ...user, phoneVerified: true }, token);
  const handleEmailVerified = () => loginUser({ ...user, emailVerified: true }, token);

  if (!user) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading session...</div>;
  }

  if (loading && status === 'Approved') {
    return <div className="p-6 text-center text-slate-500 font-medium">Loading dashboard...</div>;
  }

  // STEP 1: Verify Phone First
  if (!isPhoneVerified) {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10">
        <div className="mb-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Step 1 of 3</span>
        </div>
        <PhoneVerification userId={user._id || user.id} onVerified={handlePhoneVerified} />
      </div>
    );
  }

  // STEP 2: Verify Email Second
  if (!isEmailVerified) {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10">
        <div className="mb-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Step 2 of 3</span>
        </div>
        <EmailVerification userId={user._id || user.id} onVerified={handleEmailVerified} />
      </div>
    );
  }

  // STEP 3: Document Upload
  if (status === 'Pending') {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10 bg-white rounded-3xl shadow-sm border border-slate-200 font-sans">
        <div className="mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Step 3 of 3</span>
          <h2 className="text-2xl font-bold mt-2 text-slate-900">Upload KYC Document</h2>
          <p className="text-slate-500 text-sm mt-1">Please upload your professional license document or ID proof.</p>
        </div>
        <form onSubmit={handleSubmitDocs} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50">
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl transition cursor-pointer shadow-md">
            Upload Document & Submit
          </button>
        </form>
      </div>
    );
  }

  // STATE: Waiting for Admin Review
  if (status === 'Submitted') {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10 bg-amber-50 rounded-3xl shadow-sm border border-amber-200 text-center font-sans">
        <h2 className="text-2xl font-bold text-amber-900 mb-2">Verification in Progress</h2>
        <p className="text-amber-700 text-sm">Your document is awaiting review by an admin. You'll gain dashboard access shortly.</p>
      </div>
    );
  }

  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const activeTasks = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed');

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex font-sans text-slate-800">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <span className="w-4 h-4 rounded-full bg-indigo-600 inline-block"></span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Local<span className="text-indigo-600">Link</span>
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-5 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff&size=80&bold=true`} 
              alt="Profile" 
              className="w-16 h-16 rounded-full shadow-md mb-3"
            />
            <h3 className="font-bold text-slate-900 text-base">{user.fullName}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">{user.email}</p>
            <span className="mt-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
              {user.service || 'Provider'}
            </span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer text-left ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
            >
              <span>📊</span> Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('services')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer text-left ${currentView === 'services' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
            >
              <span>📋</span> Services & Tasks
            </button>
            <button 
              onClick={() => {
                setCurrentView('analytics');
                fetchAnalyticsReviews();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition cursor-pointer text-left ${currentView === 'analytics' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
            >
              <span>📈</span> Analytics
            </button>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-600 font-medium text-sm transition text-left cursor-pointer"
            >
              <span>⚙️</span> Settings
            </button>
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔄</span> Switch to Customer
          </button>
          <button 
            onClick={logout} 
            className="w-full py-2.5 text-rose-500 hover:bg-rose-50 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Hello, {user.fullName.split(' ')[0]}</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="lg:hidden px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Switch to Customer
            </button>
          </div>
        </div>

        {currentView === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Confirmed Bookings</p>
                  <h3 className="text-4xl font-extrabold">{confirmedCount}</h3>
                  <p className="text-xs text-indigo-100 mt-3 font-medium">Active scheduled appointments</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-10">📅</div>
              </div>

              <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Requests</p>
                  <h3 className="text-4xl font-extrabold text-amber-600">{pendingCount}</h3>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Awaiting your confirmation</p>
                </div>
              </div>

              <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Schedule Load</p>
                  <h3 className="text-4xl font-extrabold text-slate-900">{bookings.length}</h3>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Overall appointments assigned</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Tasks & Appointments for Today</h2>
              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                  <span className="text-4xl mb-2 block">📭</span>
                  <p className="text-slate-500 font-medium">No pending or confirmed appointments found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                            {booking.service}
                          </span>
                          <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-extrabold ${
                            booking.status === 'Confirmed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : booking.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-lg mb-1">{booking.customer?.fullName}</p>
                        <p className="text-xs text-slate-500 mb-4">📞 {booking.customer?.phone}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <span>📅 {booking.date}</span>
                          <span>⏰ {booking.timeSlot}</span>
                        </div>
                      </div>

                      {booking.status === 'Pending' && (
                        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                          >
                            Confirm Slot
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* OTP COMPLETION BLOCK FOR CONFIRMED BOOKINGS */}
                      {booking.status === 'Confirmed' && (
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          {activeOtpBookingId === booking._id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                placeholder="6-digit OTP" 
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-bold tracking-widest text-center shadow-inner"
                                maxLength={6}
                              />
                              <button 
                                onClick={() => handleCompleteService(booking._id)}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                              >
                                Submit
                              </button>
                              <button 
                                onClick={() => { setActiveOtpBookingId(null); setOtpInput(''); }}
                                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveOtpBookingId(booking._id)}
                              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition shadow-sm border border-indigo-200 cursor-pointer"
                            >
                              Finish Service (Enter OTP)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : currentView === 'services' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Services & Tasks</h2>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your active and pending appointment requests</p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">
                {activeTasks.length} Active
              </span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                <span className="text-4xl mb-2 block">✨</span>
                <h3 className="font-bold text-slate-800 text-lg">No pending or active tasks</h3>
                <p className="text-slate-400 text-sm mt-1">You have handled all incoming service requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTasks.map((booking) => (
                  <div key={booking._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                          {booking.service}
                        </span>
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-extrabold ${
                          booking.status === 'Confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.status === 'Confirmed' ? 'Confirmed' : 'Pending Approval'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-lg mb-1">{booking.customer?.fullName}</p>
                      <p className="text-xs text-slate-500 mb-4">📞 {booking.customer?.phone}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span>📅 {booking.date}</span>
                        <span>⏰ {booking.timeSlot}</span>
                      </div>
                    </div>

                    {booking.status === 'Pending' && (
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                        >
                          Confirm Slot
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                          className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* OTP COMPLETION BLOCK FOR CONFIRMED BOOKINGS */}
                    {booking.status === 'Confirmed' && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        {activeOtpBookingId === booking._id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="6-digit OTP" 
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value)}
                              className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-bold tracking-widest text-center shadow-inner"
                              maxLength={6}
                            />
                            <button 
                              onClick={() => handleCompleteService(booking._id)}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                            >
                              Submit
                            </button>
                            <button 
                              onClick={() => { setActiveOtpBookingId(null); setOtpInput(''); }}
                              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveOtpBookingId(booking._id)}
                            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition shadow-sm border border-indigo-200 cursor-pointer"
                          >
                            Finish Service (Enter OTP)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Performance Analytics</h2>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Ratings and feedback from your finished works</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-amber-500 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between h-36">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Average Rating Score</span>
                <h3 className="text-4xl font-extrabold">★ {analyticsData.averageRating || '0.0'} / 5.0</h3>
              </div>
              <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between h-36">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Total Finished Reviews</span>
                <h3 className="text-4xl font-extrabold">{analyticsData.totalReviews}</h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-xl text-slate-900 mb-6">Customer Feedback & Reviews</h3>
              {analyticsData.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-2 block">⭐</span>
                  <p className="text-slate-400 font-medium">No customer reviews available for finished works yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.reviews.map((item) => (
                    <div key={item._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">👤 {item.customer?.fullName || 'Valued Customer'}</span>
                        <span className="text-amber-500 font-extrabold text-sm">{'★'.repeat(item.rating)} ({item.rating}/5)</span>
                      </div>
                      <p className="text-slate-600 text-sm font-medium italic">"{item.review}"</p>
                      <span className="text-[10px] text-slate-400">Service: {item.service} | Date: {item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. RIGHT CALENDAR SIDEBAR */}
      <aside className="w-80 bg-white border-l border-slate-200 hidden xl:flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Calendar Schedule</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Active</span>
        </div>

        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-6 text-center">
          <p className="font-bold text-slate-800 mb-2">Upcoming Timelines</p>
          <p className="text-xs text-slate-500">All confirmed time slots automatically lock your schedule to prevent customer double-bookings.</p>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Timeline</h4>
          {bookings.filter(b => b.status === 'Confirmed').length === 0 ? (
            <p className="text-xs text-slate-400 italic">No confirmed bookings on calendar yet.</p>
          ) : (
            bookings
              .filter(b => b.status === 'Confirmed')
              .map(b => (
                <div key={b._id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-indigo-600">{b.timeSlot}</span>
                    <span className="text-[10px] font-bold text-slate-400">{b.date}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{b.service}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Customer: {b.customer?.fullName}</p>
                </div>
              ))
          )}
        </div>
      </aside>

    </div>
  );
}