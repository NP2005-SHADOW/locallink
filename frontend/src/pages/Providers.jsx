import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Providers() {
  const categoryStyles = {
    Household: { badge: 'bg-amber-100 text-amber-800', border: 'border-t-amber-500', ring: 'focus:ring-amber-400' },
    Learning: { badge: 'bg-indigo-100 text-indigo-800', border: 'border-t-indigo-500', ring: 'focus:ring-indigo-400' },
    Medical: { badge: 'bg-teal-100 text-teal-800', border: 'border-t-teal-500', ring: 'focus:ring-teal-400' },
    General: { badge: 'bg-rose-100 text-rose-800', border: 'border-t-rose-400', ring: 'focus:ring-rose-400' }
  };

  const getStyle = (category) => categoryStyles[category] || categoryStyles.General;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null); 
  const [bookingInputs, setBookingInputs] = useState({ date: '', timeSlot: '' });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [providerReviewsData, setProviderReviewsData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });

  const totalDailySlots = 4; 

  // Helper to format Date picker output to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Create an array of fully booked Date objects to completely disable in the calendar
  const getFullyBookedDates = () => {
    const dateCounts = {};
    bookedSlots.forEach(b => {
      if (b.status === 'Confirmed') {
        dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
      }
    });
    return Object.keys(dateCounts)
      .filter(dateStr => dateCounts[dateStr] >= totalDailySlots)
      .map(dateStr => new Date(dateStr + 'T00:00:00')); 
  };

  const isDateFullyBooked = (dateString) => {
    if (!dateString) return false;
    const confirmedCountOnDate = bookedSlots.filter(
      (b) => b.date === dateString && b.status === 'Confirmed'
    ).length;
    return confirmedCountOnDate >= totalDailySlots;
  };

  const fetchProviderProfileData = async (providerId) => {
    try {
      const slotsRes = await axios.get(`http://localhost:5000/api/bookings/provider-slots/${providerId}`);
      setBookedSlots(slotsRes.data);

      const reviewsRes = await axios.get(`http://localhost:5000/api/bookings/provider-reviews/${providerId}`);
      setProviderReviewsData(reviewsRes.data);
    } catch (err) {
      console.error('Failed to fetch provider availability or reviews');
    }
  };

  const isSlotTaken = (timeSlot) => {
    if (!bookingInputs.date) return false;
    return bookedSlots.some(
      (b) => b.date === bookingInputs.date && b.timeSlot === timeSlot && b.status === 'Confirmed'
    );
  };

  useEffect(() => {
    const category = searchParams.get('category');
    const service = searchParams.get('service');
    
    const fetchProviders = async () => {
      setLoading(true);
      setError('');
      setSelectedProvider(null); 
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const res = await axios.get('http://localhost:5000/api/providers/search', { params: { category, service } });
        setProviders(res.data);
      } catch (err) {
        setError('Failed to fetch providers. Please ensure your backend is running.');
      } finally {
        setLoading(false);
      }
    };

    if (category || service) {
      fetchProviders();
    }
  }, [searchParams]);

  const handleBook = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in as a customer to book an appointment.');
      navigate('/login');
      return;
    }
    if (!bookingInputs.date || !bookingInputs.timeSlot) {
      alert('Please select both a date and a time slot before booking.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        { providerId: selectedProvider._id, service: selectedProvider.service, date: bookingInputs.date, timeSlot: bookingInputs.timeSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment booked successfully!');
      setSelectedProvider(null); 
      setBookingInputs({ date: '', timeSlot: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="animate-[fadeIn_0.3s_ease-out] min-h-[60vh]">
          {loading && <div className="text-center py-20"><div className="animate-spin text-4xl mb-4">🔄</div><p className="text-slate-500 font-bold">Finding the best professionals...</p></div>}
          {error && <p className="text-center text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">{error}</p>}

          {/* DETAILED PROVIDER VIEW */}
          {!loading && !error && selectedProvider && (
            <div>
              <button onClick={() => { setSelectedProvider(null); setBookingInputs({ date: '', timeSlot: '' }); setBookedSlots([]); setProviderReviewsData({ averageRating: 0, totalReviews: 0, reviews: [] }); }} className="mb-6 flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2.5 rounded-xl w-max cursor-pointer">
                ← Back to search results
              </button>
              <div className={`bg-white rounded-3xl shadow-xl border border-slate-100 border-t-8 ${getStyle(selectedProvider.category).border} p-8 md:p-12 flex flex-col md:flex-row gap-12`}>
                
                {/* Left Column: Profile & Reviews */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-6">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProvider.fullName)}&background=random&color=fff&size=128&bold=true`} alt="Avatar" className="w-24 h-24 rounded-full shadow-md border-4 border-white"/>
                    <div>
                      <span className={`${getStyle(selectedProvider.category).badge} text-sm font-bold px-3 py-1 rounded-full mb-2 inline-block`}>{selectedProvider.category || 'General'}</span>
                      <h2 className="text-3xl font-extrabold text-slate-900">{selectedProvider.fullName}</h2>
                      <p className="text-xl text-indigo-600 font-bold mt-1">{selectedProvider.service}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-3">Contact Details</h3>
                    <p className="font-medium">🖂 <a href={`mailto:${selectedProvider.email}`} className="hover:text-indigo-600">{selectedProvider.email}</a></p>
                    <p className="font-medium">☏ <a href={`tel:${selectedProvider.phone}`} className="hover:text-indigo-600">{selectedProvider.phone}</a></p>
                  </div>

                  {/* Customer Ratings & Reviews Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-extrabold text-amber-500">★ {providerReviewsData.averageRating || '0.0'}</span>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Customer Ratings & Reviews</p>
                        <p className="text-xs text-slate-400 font-medium">Based on {providerReviewsData.totalReviews} finished works</p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {providerReviewsData.reviews.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No reviews written for this professional yet.</p>
                      ) : (
                        providerReviewsData.reviews.map((item) => (
                          <div key={item._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-900">{item.customer?.fullName || 'Customer'}</span>
                              <span className="text-amber-500 font-bold">{'★'.repeat(item.rating)}</span>
                            </div>
                            <p className="text-slate-600 italic">"{item.review}"</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Booking Interface */}
                <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
                  <h3 className="font-extrabold text-2xl text-slate-900 mb-6">Book an Appointment</h3>
                  <div className="space-y-5 mb-8">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-slate-700">Select Date</label>
                        {bookingInputs.date && isDateFullyBooked(bookingInputs.date) && (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                            🔴 Fully Booked on this date
                          </span>
                        )}
                      </div>
                      <DatePicker 
                        selected={bookingInputs.date ? new Date(bookingInputs.date + 'T00:00:00') : null}
                        onChange={(date) => {
                          setBookingInputs({...bookingInputs, date: formatDate(date), timeSlot: ''});
                        }}
                        minDate={new Date()}
                        excludeDates={getFullyBookedDates()}
                        placeholderText="Select an available date"
                        className={`w-full p-4 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:outline-none ${getStyle(selectedProvider.category).ring} font-medium`}
                        dayClassName={(date) => isDateFullyBooked(formatDate(date)) ? 'bg-rose-100 text-rose-700 font-bold rounded-full line-through cursor-not-allowed' : undefined}
                      />
                    </div>

                    {/* Color-Coded Time Slot Selection Grid */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Select Time Slot {bookingInputs.date ? '' : '(Please select a date first)'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map((slot) => {
                          const taken = isSlotTaken(slot);
                          const isSelected = bookingInputs.timeSlot === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={taken || !bookingInputs.date}
                              onClick={() => setBookingInputs({ ...bookingInputs, timeSlot: slot })}
                              className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${
                                !bookingInputs.date 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : taken 
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed line-through opacity-75' 
                                    : isSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 cursor-pointer'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                              }`}
                            >
                              <span className="truncate">{slot}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide shrink-0">
                                {!bookingInputs.date ? 'Pick Date' : taken ? '🔴 Booked' : isSelected ? '✓ Selected' : '🟢 Available'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleBook} className="w-full py-4 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all text-lg cursor-pointer">Confirm Booking</button>
                </div>
              </div>
            </div>
          )}

          {/* GRID OF SEARCH RESULTS */}
          {!loading && !error && !selectedProvider && providers.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Search Results</h2>
                  <p className="text-slate-500 font-medium">Showing professionals matching your search</p>
                </div>
                <span className="text-slate-500 font-bold bg-slate-200 px-3 py-1 rounded-full">{providers.length} found</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.map((provider) => {
                  const style = getStyle(provider.category);
                  return (
                    <div key={provider._id} className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-100 border-t-4 hover:border-t-8 ${style.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center`}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(provider.fullName)}&background=random&color=fff&size=96`} alt="Avatar" className="w-20 h-20 rounded-full shadow-md mb-4 border-2 border-white" />
                      <span className={`${style.badge} text-xs font-bold px-3 py-1 rounded-full mb-3`}>{provider.category}</span>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{provider.fullName}</h3>
                      <p className="text-slate-500 font-medium mb-6">{provider.service}</p>
                      <button 
                        onClick={() => {
                          setSelectedProvider(provider);
                          fetchProviderProfileData(provider._id);
                        }} 
                        className="w-full mt-auto py-3 font-bold rounded-xl bg-slate-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && !selectedProvider && providers.length === 0 && (
            <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 shadow-sm mt-8 max-w-2xl mx-auto">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No professionals found</h3>
              <p className="text-slate-500 text-lg mb-8">We couldn't find any exact matches. Try searching for a broader category.</p>
              <button onClick={() => navigate('/')} className="px-6 py-3 font-bold rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all cursor-pointer">Go Home</button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t-4 border-indigo-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <p className="text-slate-500 font-medium text-sm">
             &copy; {new Date().getFullYear()} LocalLink. All rights reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}