import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const categoryData = {
    Household: ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mechanic'],
    Learning: ['Tutor'],
    Medical: ['Home Nurse', 'Physiotherapist', 'Lab Technician']
  };

  const categoryStyles = {
    Household: { badge: 'bg-amber-100 text-amber-800', border: 'border-t-amber-500', ring: 'focus:ring-amber-400', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop' },
    Learning: { badge: 'bg-indigo-100 text-indigo-800', border: 'border-t-indigo-500', ring: 'focus:ring-indigo-400', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop' },
    Medical: { badge: 'bg-teal-100 text-teal-800', border: 'border-t-teal-500', ring: 'focus:ring-teal-400', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop' },
    General: { badge: 'bg-rose-100 text-rose-800', border: 'border-t-rose-400', ring: 'focus:ring-rose-400', image: 'https://images.unsplash.com/photo-1584820927498-cafe8c1c9695?q=80&w=800&auto=format&fit=crop' }
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
  const [selectedCategory, setSelectedCategory] = useState(null); 

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* VIEW 1: HOME (Categories List) */}
        {!selectedCategory && (
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
        {selectedCategory && (
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
                <div 
                  key={service} 
                  /* THIS LINE IS CRITICAL - It navigates to the Providers page */
                  onClick={() => navigate(`/providers?category=${encodeURIComponent(selectedCategory)}&service=${encodeURIComponent(service)}`)} 
                  className="group relative h-64 rounded-3xl overflow-hidden shadow-md cursor-pointer transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                >
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
              <li><button onClick={() => { setSelectedCategory(null); window.scrollTo(0,0); }} className="hover:text-indigo-400 transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => navigate('/providers?category=Household&service=')} className="hover:text-indigo-400 transition-colors cursor-pointer">Household Services</button></li>
              <li><button onClick={() => navigate('/providers?category=Medical&service=')} className="hover:text-indigo-400 transition-colors cursor-pointer">Medical Care</button></li>
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