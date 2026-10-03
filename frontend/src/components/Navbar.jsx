import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, viewRole, logoutUser, toggleViewRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Search Bar Data & Logic ---
  const categoryData = {
    Household: ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mechanic'],
    Learning: ['Tutor'],
    Medical: ['Home Nurse', 'Physiotherapist', 'Lab Technician']
  };

  const allServices = Object.entries(categoryData).flatMap(([category, services]) =>
    services.map(service => ({ category, service }))
  );

  const categoryStyles = {
    Household: { badge: 'bg-amber-100 text-amber-800', icon: '🛠️' },
    Learning: { badge: 'bg-indigo-100 text-indigo-800', icon: '📚' },
    Medical: { badge: 'bg-teal-100 text-teal-800', icon: '⚕️' },
    General: { badge: 'bg-gray-100 text-gray-800', icon: '✨' }
  };

  const getStyle = (category) => categoryStyles[category] || categoryStyles.General;

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const matches = allServices.filter(item =>
        item.service.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectService = (selectedItem) => {
    setSearchQuery(''); // Clear navbar search after selection
    setIsDropdownOpen(false);
    // Navigate to Home and pass the search data via URL parameters
    navigate(`/providers?category=${encodeURIComponent(selectedItem.category)}&service=${encodeURIComponent(selectedItem.service)}`)
  };

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length === 1) {
      handleSelectService(suggestions[0]);
    } else if (suggestions.length > 1) {
      handleSelectService(suggestions[0]); 
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center gap-6">
        
        {/* 1. Logo (Left) */}
        <Link to="/" className="text-2xl font-black text-primary tracking-tight shrink-0 flex items-center gap-2">
          <div className="hidden sm:flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          </div>
          <span>Local<span className="text-gray-800">Link</span></span>
        </Link>

        {/* 2. Global Search Bar (Center) - Hidden on auth pages to keep them clean */}
        {!isAuthPage && (
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <form onSubmit={handleTypingSubmit} className="relative w-full">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner">
                <span className="pl-4 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchQuery.length > 0) setIsDropdownOpen(true); }}
                  placeholder="Search for Plumbers, Tutors, Nurses..."
                  className="w-full p-2.5 pl-3 bg-transparent border-none focus:outline-none text-gray-700 font-medium placeholder-gray-400 text-sm"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setIsDropdownOpen(false); }} className="pr-4 text-gray-400 hover:text-gray-700 font-bold">✕</button>
                )}
              </div>
              
              {/* Autocomplete Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-80 overflow-y-auto z-[110]">
                  {suggestions.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectService(item)}
                      className="px-5 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <span className="font-bold text-gray-700 flex items-center gap-3">
                        <span className="text-lg">{getStyle(item.category).icon}</span>
                        {item.service}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${getStyle(item.category).badge}`}>
                        {item.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
        )}

        {/* 3. Links (Right) */}
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/" className="text-gray-600 hover:text-primary font-medium transition hidden lg:block">
            Home
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              {viewRole === 'Customer' && (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium transition">
                  My Bookings
                </Link>
              )}
              {viewRole === 'Provider' && (
                <Link to="/provider-dashboard" className="text-gray-600 hover:text-primary font-medium transition">
                  Incoming Bookings
                </Link>
              )}
              {viewRole === 'Admin' && (
                <Link to="/admin-dashboard" className="text-gray-600 hover:text-blue-600 font-bold transition">
                  Admin Panel
                </Link>
              )}
              {user.role === 'Provider' && (
                <button
                  onClick={() => {
                    toggleViewRole();
                    navigate(viewRole === 'Provider' ? '/dashboard' : '/provider-dashboard');
                  }}
                  className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                >
                  Switch to {viewRole === 'Provider' ? 'Customer' : 'Provider'}
                </button>
              )}

              <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full hidden sm:block">
                {user.fullName} ({viewRole})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary transition">
                Sign In
              </Link>
              <Link to="/register" style={{ backgroundColor: '#2563eb', color: '#ffffff' }} className="px-5 py-2 text-sm font-semibold rounded-lg shadow transition hover:opacity-95">
                Get Started
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}