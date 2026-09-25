import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Review states
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');

  const fetchCustomerBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/customer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomerBookings();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomerBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleSubmitReview = async (bookingId) => {
    if (!ratingInput || ratingInput < 1 || ratingInput > 5) {
      return alert('Please provide a valid rating between 1 and 5.');
    }
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/review`,
        { rating: ratingInput, review: reviewInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Review submitted successfully!');
      setActiveReviewBookingId(null);
      setReviewInput('');
      setRatingInput(5);
      fetchCustomerBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (!user) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading session...</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-slate-500 font-medium">Loading customer dashboard...</div>;
  }

  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col justify-between hidden lg:flex p-6">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
            <span className="w-3 h-3 rounded-full bg-teal-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight ml-2">Local<span className="text-indigo-600">Link</span></span>
          </div>

          {/* Profile Card in Sidebar */}
          <div className="flex flex-col items-center text-center p-5 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff&size=96&bold=true`} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full shadow-sm mb-3 border-2 border-white"
            />
            <h3 className="font-extrabold text-slate-900 text-base">{user.fullName}</h3>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[180px]">{user.email}</span>
            <span className="mt-2 inline-block bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Customer Portal
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-sm">
              <span>📊</span> Dashboard
            </a>
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer text-left"
            >
              <span>🔍</span> Explore & Book Services
            </button>
            {user.role === 'Provider' && (
              <button 
                onClick={() => navigate('/provider-dashboard')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-indigo-600 hover:bg-indigo-50 font-semibold text-sm transition cursor-pointer text-left"
              >
                <span>🔄</span> Switch to Provider View
              </button>
            )}
          </nav>
        </div>

        <div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* TOP GREETING HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, {user.fullName.split(' ')[0]}</h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Today is {todayDateStr}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <span>+</span> Book New Service
              </button>
              {user.role === 'Provider' && (
                <button 
                  onClick={() => navigate('/provider-dashboard')} 
                  className="lg:hidden px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-sm cursor-pointer"
                >
                  Switch to Provider
                </button>
              )}
            </div>
          </div>

          {/* SUMMARY CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#4361EE] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Total Bookings</span>
                <h3 className="text-3xl font-extrabold mt-1">{bookings.length}</h3>
              </div>
              <p className="text-xs text-indigo-200 font-medium">All service appointments requested</p>
            </div>

            <div className="bg-[#2A9D8F] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-100">Confirmed Bookings</span>
                <h3 className="text-3xl font-extrabold mt-1">{confirmedCount}</h3>
              </div>
              <p className="text-xs text-teal-100 font-medium">Approved by service providers</p>
            </div>

            <div className="bg-[#F4A261] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Pending Review</span>
                <h3 className="text-3xl font-extrabold mt-1">{pendingCount}</h3>
              </div>
              <p className="text-xs text-orange-100 font-medium">Awaiting provider confirmation</p>
            </div>
          </div>

          {/* BOOKINGS CONTENT & TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLS: APPOINTMENTS LIST */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900">My Service Appointments</h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bookings.length} total</span>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
                  <span className="text-4xl mb-3 block">📭</span>
                  <h3 className="font-bold text-slate-800 text-lg">No appointments found</h3>
                  <p className="text-slate-400 text-sm mt-1 mb-6">You haven't booked any professional services yet.</p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    Browse Services Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 transition hover:shadow-md">
                      
                      {/* Top Info Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            <h3 className="font-extrabold text-lg text-slate-900">{booking.service}</h3>
                          </div>
                          <p className="text-slate-600 text-sm font-medium">🛠️ Provider: {booking.provider?.fullName} ({booking.provider?.phone})</p>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">📅 {booking.date} | ⏰ {booking.timeSlot}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3.5 py-1.5 text-xs rounded-full font-extrabold uppercase tracking-wide ${
                            booking.status === 'Confirmed' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : booking.status === 'Pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OTP DISPLAY FOR CONFIRMED BOOKINGS */}
                      {booking.status === 'Confirmed' && booking.completionOtp && (
                        <div className="mt-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">Completion PIN</p>
                            <p className="text-[10px] text-indigo-600 font-medium">Give this to the provider when the job is done.</p>
                          </div>
                          <span className="text-2xl font-extrabold text-indigo-700 tracking-[0.25em] bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-50">
                            {booking.completionOtp}
                          </span>
                        </div>
                      )}

                      {/* REVIEW BLOCK FOR COMPLETED BOOKINGS */}
                      {booking.status === 'Completed' && (
                        <div className="mt-2 pt-4 border-t border-slate-100">
                          {booking.rating ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Review</span>
                              <div className="flex items-center gap-1">
                                <span className="text-amber-500 font-extrabold text-sm">{'★'.repeat(booking.rating)}</span>
                                <span className="text-slate-400 text-xs ml-1 font-bold">({booking.rating}/5)</span>
                              </div>
                              {booking.review && <p className="text-sm text-slate-600 italic mt-1">"{booking.review}"</p>}
                            </div>
                          ) : activeReviewBookingId === booking._id ? (
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leave a Review</span>
                                <select 
                                  value={ratingInput} 
                                  onChange={(e) => setRatingInput(Number(e.target.value))}
                                  className="p-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none bg-white"
                                >
                                  <option value={5}>5 Stars - Excellent</option>
                                  <option value={4}>4 Stars - Good</option>
                                  <option value={3}>3 Stars - Average</option>
                                  <option value={2}>2 Stars - Poor</option>
                                  <option value={1}>1 Star - Terrible</option>
                                </select>
                              </div>
                              <textarea
                                placeholder="How was the service? (Optional)"
                                value={reviewInput}
                                onChange={(e) => setReviewInput(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-20"
                              ></textarea>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleSubmitReview(booking._id)}
                                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                                >
                                  Submit Review
                                </button>
                                <button 
                                  onClick={() => { setActiveReviewBookingId(null); setReviewInput(''); setRatingInput(5); }}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveReviewBookingId(booking._id)}
                              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition shadow-sm border border-indigo-200 cursor-pointer"
                            >
                              Leave a Review ⭐
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COL: TIMELINE WIDGET */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-900 text-lg">Upcoming Schedule</h3>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">Active</span>
              </div>

              {bookings.filter(b => b.status === 'Confirmed').length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl mb-2 block">📅</span>
                  <p className="text-slate-400 text-sm font-medium">No confirmed appointments scheduled.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                  {bookings
                    .filter(b => b.status === 'Confirmed')
                    .map((booking) => (
                      <div key={booking._id} className="relative pl-8">
                        <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-400 block mb-0.5">{booking.date}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{booking.service}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">With {booking.provider?.fullName}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}