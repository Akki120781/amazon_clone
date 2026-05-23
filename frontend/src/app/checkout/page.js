'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { Lock, CreditCard, ChevronRight, Check } from 'lucide-react';

export default function Checkout() {
  const { cart, user, token, placeOrder, API_BASE_URL } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // Step 1: Address, Step 2: Payment, Step 3: Review

  // Redirect if guest
  useEffect(() => {
    if (!token && !localStorage.getItem('amazon_token')) {
      router.push('/login?redirect=checkout');
    } else if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`
      }));
    }
  }, [user, token, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.address || !address.city || !address.postalCode || !address.phone) {
      setError('Please fill in all shipping fields.');
      return;
    }
    setError('');
    setActiveStep(2);
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await placeOrder(address, paymentMethod);
      if (result.success) {
        // Redirect to orders page with success param
        router.push(`/orders?success=true&orderId=${result.data.order.id}`);
      } else {
        setError(result.message || 'An error occurred while placing your order.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your checkout cart is empty</h2>
        <p className="text-gray-500 mb-6">Add products to your cart before proceeding to checkout.</p>
        <Link href="/" className="bg-[#f0c14b] border border-[#a88734] px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#eeb933] shadow-sm text-gray-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Cost calculations
  const itemsSubtotal = cart.summary.subtotal;
  const shippingCost = itemsSubtotal >= 35.0 ? 0.0 : 4.99;
  const taxCost = cart.summary.tax;
  const totalCost = itemsSubtotal + shippingCost + taxCost;

  return (
    <div className="bg-[#eaeded] min-h-screen pb-12">
      {/* Checkout Navbar */}
      <div className="bg-white border-b border-gray-200 py-3 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl text-gray-900 tracking-tight flex items-center gap-1">
            <span>amazon</span><span className="text-[#f08804] text-xs font-semibold">.clone</span>
          </Link>
          <h1 className="text-lg md:text-xl font-medium text-gray-800 flex items-center gap-1">
            Checkout (<span className="text-orange-700 font-bold">{cart.summary.itemCount} item{cart.summary.itemCount !== 1 ? 's' : ''}</span>)
          </h1>
          <div className="text-gray-500 flex items-center gap-1.5 text-xs font-semibold">
            <Lock size={15} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Steps Panel */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className={`p-4 flex items-center justify-between border-b ${activeStep === 1 ? 'bg-orange-50/40 border-orange-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep > 1 ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                  {activeStep > 1 ? <Check size={14} /> : '1'}
                </span>
                <h2 className="font-bold text-base text-gray-900">Shipping Address</h2>
              </div>
              {activeStep > 1 && (
                <button 
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-blue-600 hover:text-orange-600 font-semibold hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 1 ? (
              <form onSubmit={handleAddressSubmit} className="p-6 flex flex-col gap-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs font-semibold">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={address.fullName} 
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={address.phone} 
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm"
                      placeholder="+1 (123) 456-7890"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Street Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={address.address} 
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm"
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={address.city} 
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm"
                      placeholder="Seattle"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Postal / Zip Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      value={address.postalCode} 
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-orange-500 shadow-sm"
                      placeholder="98101"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="bg-[#f0c14b] border border-[#a88734] py-2 px-6 rounded-md font-semibold text-xs text-center self-start hover:bg-[#eeb933] shadow-sm cursor-pointer active:border-[#846a29]"
                >
                  Use this address
                </button>
              </form>
            ) : (
              <div className="p-4 px-12 text-sm text-gray-700">
                <p className="font-semibold text-black">{address.fullName}</p>
                <p>{address.address}</p>
                <p>{address.city}, {address.postalCode}</p>
                <p>Phone: {address.phone}</p>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className={`p-4 flex items-center justify-between border-b ${activeStep === 2 ? 'bg-orange-50/40 border-orange-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep > 2 ? 'bg-green-600 text-white' : activeStep === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {activeStep > 2 ? <Check size={14} /> : '2'}
                </span>
                <h2 className="font-bold text-base text-gray-900">Payment Method</h2>
              </div>
              {activeStep > 2 && (
                <button 
                  onClick={() => setActiveStep(2)}
                  className="text-xs text-blue-600 hover:text-orange-600 font-semibold hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 2 && (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 border rounded border-orange-300 bg-orange-50/20 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Cash on Delivery" 
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 cursor-pointer"
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
                      <span className="text-xs text-gray-500">Pay in cash when your order is delivered to your door.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Credit / Debit Card" 
                      checked={paymentMethod === 'Credit / Debit Card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 cursor-pointer"
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        Credit or Debit Card <CreditCard size={15} className="text-gray-500" />
                      </span>
                      <span className="text-xs text-gray-500">Mock Card Processing - No real billing details required.</span>
                    </div>
                  </label>
                </div>

                <button 
                  onClick={() => setActiveStep(3)}
                  className="bg-[#f0c14b] border border-[#a88734] py-2 px-6 rounded-md font-semibold text-xs text-center self-start hover:bg-[#eeb933] shadow-sm cursor-pointer active:border-[#846a29]"
                >
                  Use this payment method
                </button>
              </div>
            )}

            {activeStep > 2 && (
              <div className="p-4 px-12 text-sm text-gray-700 font-semibold text-black">
                {paymentMethod}
              </div>
            )}
          </div>

          {/* Step 3: Review Items and Shipping */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className={`p-4 flex items-center justify-between border-b ${activeStep === 3 ? 'bg-orange-50/40 border-orange-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </span>
                <h2 className="font-bold text-base text-gray-900">Review items and delivery</h2>
              </div>
            </div>

            {activeStep === 3 && (
              <div className="p-6 flex flex-col gap-6">
                
                {/* Items List */}
                <div className="flex flex-col gap-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start border-b border-gray-150 pb-4 last:border-b-0 last:pb-0">
                      <img src={item.image_url} alt="" className="w-16 h-16 object-contain border border-gray-100 rounded p-1 bg-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-[11px] text-orange-600 font-bold mt-1">In Stock</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        <p className="text-[10px] text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secure checkout buttons inside section */}
                <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 pt-5 items-center justify-between">
                  <div className="text-xs text-gray-500 max-w-md leading-normal text-center sm:text-left">
                    By placing your order, you agree to Amazon Clone's <a href="#" className="text-blue-600 hover:underline">conditions of use</a> and <a href="#" className="text-blue-600 hover:underline">privacy policy</a>.
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="bg-[#f0c14b] hover:bg-[#eeb933] border border-[#a88734] py-2 px-6 rounded-md font-bold text-xs shadow text-gray-800 cursor-pointer active:border-[#846a29] shrink-0"
                  >
                    {loading ? 'Placing Order...' : 'Place your order'}
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-300 rounded-lg p-5 flex flex-col shadow-sm leading-tight text-sm">
            
            {/* Primary Order Action Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || activeStep < 3}
              className={`w-full py-2 px-3 rounded-md text-xs font-bold text-center shadow transition-all mb-4 ${
                activeStep < 3 
                  ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] text-gray-800 cursor-pointer active:border-[#846a29]'
              }`}
            >
              {loading ? 'Placing Order...' : 'Place your order'}
            </button>

            <div className="text-[11px] text-gray-500 text-center leading-normal mb-4 border-b border-gray-100 pb-3">
              Choose shipping and payment details on the left before placing your order.
            </div>

            {/* Price Calculations */}
            <h3 className="font-bold text-base text-gray-900 mb-3">Order Summary</h3>
            
            <div className="flex flex-col gap-2.5 text-xs border-b border-gray-100 pb-3 mb-3 text-gray-700">
              <div className="flex justify-between">
                <span>Items ({cart.summary.itemCount}):</span>
                <span>${itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & handling:</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              {shippingCost > 0 && (
                <div className="text-[10px] text-orange-600 font-semibold self-end -mt-1.5">
                  Qualify for Free shipping by adding ${(35.0 - itemsSubtotal).toFixed(2)} of items
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (10% GST):</span>
                <span>${taxCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-[#b12704] text-lg mb-4">
              <span>Order Total:</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>

            {/* Terms and secure locks */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-[11px] text-gray-600 flex flex-col gap-1.5 leading-normal">
              <span className="font-semibold text-black">Payment Details</span>
              <p>Method: <span className="font-bold text-gray-800">{paymentMethod}</span></p>
              <p className="border-t border-gray-200 pt-1.5 mt-1">
                Your card is not billed. This is a secure checkout simulation.
              </p>
            </div>

            {/* General errors */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded text-xs font-semibold mt-4">
                {error}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
