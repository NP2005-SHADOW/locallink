import React, { useState } from 'react';
import axios from 'axios';

export default function EmailVerification({ userId, onVerified }) {
  const [step, setStep] = useState('init');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { userId });
      setStep('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send Email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { userId, otp });
      setStep('verified');
      if (onVerified) onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verified') {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <p className="text-emerald-700 font-semibold">✓ Email verified successfully!</p>
      </div>
    );
  }

  return (
    <div className="p-8 border border-slate-200 rounded-2xl shadow-sm bg-white max-w-md mx-auto mt-6 font-sans">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Email Verification</h3>
        <p className="text-slate-500 text-sm mt-1">We need to verify your email address.</p>
      </div>
      
      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{error}</div>}
      
      {step === 'init' && (
        <button 
          onClick={handleSendOtp} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      )}

      {step === 'sent' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Enter 6-Digit Code</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center tracking-widest text-xl font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </div>
  );
}