'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { AlertTriangle, ChevronRight } from 'lucide-react';

function LoginContent() {
  const { login, user } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectPath ? `/${redirectPath}` : '/');
    }
  }, [user, redirectPath, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push(redirectPath ? `/${redirectPath}` : '/');
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-8 px-4 w-full">
      {/* Amazon Logo Header */}
      <Link href="/" className="mb-6 font-black text-3xl text-gray-900 tracking-tight flex items-center">
        <span>amazon</span><span className="text-[#f08804] text-sm font-semibold">.clone</span>
      </Link>

      {/* Error Alert Box */}
      {error && (
        <div className="max-w-[350px] w-full border border-red-300 rounded p-4 mb-4 bg-red-50 flex items-start gap-2.5">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex flex-col text-xs leading-tight text-red-800">
            <span className="font-bold text-sm text-red-950 mb-1">There was a problem</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="border border-gray-300 rounded-md p-6 max-w-[350px] w-full bg-white shadow-sm mb-6 flex flex-col">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">Sign in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-bold text-gray-700">Email or mobile phone number</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="font-bold text-gray-700">Password</label>
              <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 rounded bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] text-gray-800 font-medium text-xs shadow-sm cursor-pointer active:border-[#846a29] mt-2 h-8 flex items-center justify-center"
          >
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>

        {/* Disclaimer terms */}
        <p className="text-[11px] text-gray-600 leading-normal mt-5 border-b border-gray-100 pb-4 mb-3">
          By continuing, you agree to Amazon's <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">Conditions of Use</a> and <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">Privacy Notice</a>.
        </p>

        {/* Need Help Link */}
        <div className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">
          <ChevronRight size={12} className="text-gray-500" /> Need help?
        </div>
      </div>

      {/* Account Separator */}
      <div className="max-w-[350px] w-full flex items-center justify-center gap-3.5 mb-4 text-xs text-gray-500">
        <span className="h-[1px] bg-gray-300 flex-grow"></span>
        <span>New to Amazon?</span>
        <span className="h-[1px] bg-gray-300 flex-grow"></span>
      </div>

      {/* Signup Redirection button */}
      <Link
        href={redirectPath ? `/signup?redirect=${redirectPath}` : '/signup'}
        className="max-w-[350px] w-full py-1.5 border border-gray-400 bg-gradient-to-b from-gray-50 to-gray-100 rounded text-center text-xs font-semibold text-gray-800 hover:from-gray-100 hover:to-gray-150 shadow-sm active:bg-gray-200"
      >
        Create your Amazon account
      </Link>

      {/* Footer Links */}
      <div className="flex flex-col items-center gap-2.5 text-[11px] text-gray-500 mt-16 border-t border-gray-200 pt-6 max-w-[500px] w-full">
        <div className="flex gap-6 text-blue-600 font-medium">
          <a href="#" className="hover:underline">Conditions of Use</a>
          <a href="#" className="hover:underline">Privacy Notice</a>
          <a href="#" className="hover:underline">Consumer Health Data</a>
        </div>
        <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex flex-col items-center pt-8 px-4">
        <div className="animate-pulse flex flex-col items-center w-full max-w-[350px]">
          <div className="h-10 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-64 bg-gray-200 border rounded-md w-full mb-6"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
