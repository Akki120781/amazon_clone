'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { AlertTriangle, Info, ChevronRight } from 'lucide-react';

function SignupContent() {
  const { signup, user } = useCart();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    // Client-side validations
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(firstName, lastName, email, password, phone);
      if (result.success) {
        router.push(redirectPath ? `/${redirectPath}` : '/');
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-6 px-4 w-full">
      {/* Amazon Logo Header */}
      <Link href="/" className="mb-4 font-black text-3xl text-gray-900 tracking-tight flex items-center">
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

      {/* Signup Form Card */}
      <div className="border border-gray-300 rounded-md p-6 max-w-[350px] w-full bg-white shadow-sm mb-6 flex flex-col">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">Create account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* First Name Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="font-bold text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Last Name Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="font-bold text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Phone Input (Optional) */}
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="font-bold text-gray-700">Mobile Phone (optional)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              placeholder="+1234567890"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-bold text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              placeholder="At least 6 characters"
              required
            />
            <div className="flex gap-1 items-center text-[10px] text-gray-600 font-medium">
              <Info size={11} className="text-blue-600 mt-0.5 shrink-0" />
              <span>Passwords must be at least 6 characters.</span>
            </div>
          </div>

          {/* Re-enter Password Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="font-bold text-gray-700">Re-enter password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-400 rounded px-2.5 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm shadow-sm"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 rounded bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] text-gray-800 font-medium text-xs shadow-sm cursor-pointer active:border-[#846a29] mt-2.5 h-8 flex items-center justify-center"
          >
            {loading ? 'Registering...' : 'Create your Amazon account'}
          </button>
        </form>

        {/* Disclaimer terms */}
        <p className="text-[11px] text-gray-600 leading-normal mt-5 border-b border-gray-100 pb-4 mb-3">
          By creating an account, you agree to Amazon's <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">Conditions of Use</a> and <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">Privacy Notice</a>.
        </p>

        {/* Already have an account navigation */}
        <p className="text-xs text-gray-800">
          Already have an account?{' '}
          <Link href={redirectPath ? `/login?redirect=${redirectPath}` : '/login'} className="text-blue-600 hover:text-orange-600 hover:underline inline-flex items-center font-semibold">
            Sign in <ChevronRight size={10} className="mt-0.5" />
          </Link>
        </p>
      </div>

      {/* Footer Links */}
      <div className="flex flex-col items-center gap-2.5 text-[11px] text-gray-500 mt-12 border-t border-gray-200 pt-6 max-w-[500px] w-full">
        <div className="flex gap-6 text-blue-600 font-medium">
          <a href="#" className="hover:underline">Conditions of Use</a>
          <a href="#" className="hover:underline">Privacy Notice</a>
          <a href="#" className="hover:underline">Help</a>
        </div>
        <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex flex-col items-center pt-6 px-4">
        <div className="animate-pulse flex flex-col items-center w-full max-w-[350px]">
          <div className="h-10 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-96 bg-gray-200 border rounded-md w-full mb-6"></div>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
