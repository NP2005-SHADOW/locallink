import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Home() {
  const categoryData = {
    Household: ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mechanic'],
    Learning: ['Tutor'],
    Medical: ['Home Nurse', 'Physiotherapist', 'Lab Technician']
  };

  const categoryStyles = {
    Household: { badge: 'bg-amber-100 text-amber-800', border: 'border-t-amber-500', ring: 'focus:ring-amber-400', icon: '🛠️', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop' },
    Learning: { badge: 'bg-indigo-100 text-indigo-800', border: 'border-t-indigo-500', ring: 'focus:ring-indigo-400', icon: '📚', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop' },
    Medical: { badge: 'bg-teal-100 text-teal-800', border: 'border-t-teal-500', ring: 'focus:ring-teal-400', icon: '⚕️', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop' },
    General: { badge: 'bg-rose-100 text-rose-800', border: 'border-t-rose-400', ring: 'focus:ring-rose-400', icon: '✨', image: 'https://images.unsplash.com/photo-1584820927498-cafe8c1c9695?q=80&w=800&auto=format&fit=crop' }
  };

  const serviceImages = {
    'Electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
    'Plumber': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop',
    'Carpenter': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
    'Mechanic': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    'Tutor': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
    'Home Nurse': 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800&auto=format&fit=crop',
    'Physiotherapist': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
    'Lab Technician': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop'
  };

  const getStyle = (category) => categoryStyles[category] || categoryStyles.General;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null); 
  const [bookingInputs, setBookingInputs] = useState({ date: '', timeSlot: '' });

  // Availability & Review States
  const [bookedSlots, setBookedSlots] = useState([]);
  const [providerReviewsData, setProviderReviewsData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });

  // Fetch taken slots and reviews whenever a provider profile is opened
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

  // Helper to check if slot is already confirmed/booked for the chosen date
  const isSlotTaken = (timeSlot) => {
    if (!bookingInputs.date) return false;
    return bookedSlots.some(
      (b) => b.date === bookingInputs.date && b.timeSlot === timeSlot && b.status === 'Confirmed'
    );
  };

  // Listen for Navbar Search URL parameters
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlService = searchParams.get('service');
    
    if (urlCategory && urlService) {
      fetchProviders(urlCategory, urlService);
    } else {
      setHasSearched(false);
      setProviders([]);
      setSelectedProvider(null);
    }
  }, [searchParams]);

  const fetchProviders = async (category, service) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    setSelectedProvider(null); 
    setSelectedCategory(null); 
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

  const goHome = () => {
    setSearchParams({}); 
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* VIEW 1: HOME (Categories List) */}
        {!hasSearched && !selectedProvider && !selectedCategory && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row items-center mb-16 mt-4">
              <div className="p-10 md:p-16 flex-1 text-left z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm mb-4 border border-indigo-500/30">
                  Top-rated professionals
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                  Expert services, <br/><span className="text-indigo-400">delivered to your door.</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-md font-medium leading-relaxed mb-8">
                  Skip the hassle. Connect instantly with verified professionals in your neighborhood for any task.
                </p>
                <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="px-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg cursor-pointer">
                  Explore Services
                </button>
              </div>
              <div className="w-full md:w-1/2 h-72 md:h-full min-h-[400px] relative">
                <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop" alt="Professional handymen" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent"></div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Explore Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.keys(categoryData).map((category) => (
                  <div key={category} onClick={() => { setSelectedCategory(category); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group relative h-72 rounded-3xl overflow-hidden shadow-lg cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                    <img src={getStyle(category).image} alt={category} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getStyle(category).icon}</span>
                        <h3 className="text-2xl font-bold text-white">{category}</h3>
                      </div>
                      <p className="text-slate-300 font-medium">{categoryData[category].length} services available</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.5: SERVICES IN A CATEGORY */}
        {!hasSearched && !selectedProvider && selectedCategory && (
          <div className="animate-[fadeIn_0.4s_ease-out] mt-6">
            <button onClick={() => setSelectedCategory(null)} className="mb-8 flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2.5 rounded-xl w-max cursor-pointer">
              ← Back to Categories
            </button>
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
              <span className="text-4xl">{getStyle(selectedCategory).icon}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{selectedCategory} Services</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryData[selectedCategory].map((service) => (
                <div key={service} onClick={() => fetchProviders(selectedCategory, service)} className="group relative h-64 rounded-3xl overflow-hidden shadow-md cursor-pointer transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                  <img src={serviceImages[service] || getStyle(selectedCategory).image} alt={service} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-1">{service}</h3>
                    <span className="text-indigo-300 font-bold text-sm group-hover:text-white transition-colors">Find professionals →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCH RESULTS & BOOKING */}
        {(hasSearched || selectedProvider) && (
          <div className="animate-[fadeIn_0.3s_ease-out] min-h-[60vh] mt-6">
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
                        <span className={`${getStyle(selectedProvider.category).badge} text-sm font-bold px-3 py-1 rounded-full mb-2 inline-block`}>{getStyle(selectedProvider.category).icon} {selectedProvider.category || 'General'}</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">{selectedProvider.fullName}</h2>
                        <p className="text-xl text-indigo-600 font-bold mt-1">{selectedProvider.service}</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h3 className="font-bold text-slate-900 text-lg mb-3">Contact Details</h3>
                      <p className="font-medium">📧 <a href={`mailto:${selectedProvider.email}`} className="hover:text-indigo-600">{selectedProvider.email}</a></p>
                      <p className="font-medium">📞 <a href={`tel:${selectedProvider.phone}`} className="hover:text-indigo-600">{selectedProvider.phone}</a></p>
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                        <input 
                          type="date" 
                          className={`w-full p-4 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:outline-none ${getStyle(selectedProvider.category).ring} font-medium`} 
                          value={bookingInputs.date} 
                          onChange={(e) => {
                            setBookingInputs({...bookingInputs, date: e.target.value, timeSlot: ''});
                          }}
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
                        <span className={`${style.badge} text-xs font-bold px-3 py-1 rounded-full mb-3`}>{style.icon} {provider.category}</span>
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
                <button onClick={goHome} className="px-6 py-3 font-bold rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all cursor-pointer">Clear Search</button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t-4 border-indigo-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-extrabold text-white tracking-tight mb-4 block">
              Local<span className="text-indigo-400">Link</span>
            </span>
            <p className="text-slate-400 font-medium max-w-sm mb-6">
              Empowering communities by connecting local talent with people who need them. Reliable, fast, and secure.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-medium">
              <li><button onClick={goHome} className="hover:text-indigo-400 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => { setSearchParams({ category: 'Household', service: '' }); }} className="hover:text-indigo-400 transition-colors cursor-pointer">Household Services</button></li>
              <li><button onClick={() => { setSearchParams({ category: 'Medical', service: '' }); }} className="hover:text-indigo-400 transition-colors cursor-pointer">Medical Care</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 font-medium text-sm">
          &copy; {new Date().getFullYear()} LocalLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}