'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, user } = useCart();
  const router = useRouter();

  const handleQtyChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    const result = await updateCartQuantity(itemId, quantity);
    if (!result.success) {
      alert(result.message || 'Failed to update quantity');
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      // Redirect to login page and preserve redirect to checkout page
      router.push('/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  const hasItems = cart.items && cart.items.length > 0;
  const freeShippingLimit = 35.00;
  const qualifiesForFreeShipping = cart.summary.subtotal >= freeShippingLimit;
  const shippingRemaining = freeShippingLimit - cart.summary.subtotal;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 w-full">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-9 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            {hasItems && (
              <button 
                onClick={clearCart} 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline font-semibold"
              >
                Deselect/Clear all items
              </button>
            )}
          </div>

          {!hasItems ? (
            <div className="text-center py-16 flex flex-col items-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Your Amazon Cart is empty.</h3>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                Your shopping cart lives to serve. Give it purpose — fill it with electronics, books, clothing, and more!
              </p>
              <Link href="/" className="bg-[#f0c14b] border border-[#a88734] px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#eeb933] shadow-sm text-gray-800">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  {/* Item Image */}
                  <div className="w-full sm:w-32 h-32 flex items-center justify-center border border-gray-100 p-2 rounded bg-white">
                    <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <Link href={`/product/${item.product_id}`} className="font-bold text-sm text-gray-900 hover:text-[#c45500] hover:underline line-clamp-2 leading-tight">
                        {item.name}
                      </Link>
                      {/* Price */}
                      <span className="font-bold text-base text-gray-900 shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <span className="text-xs text-green-600 font-semibold mt-1">In Stock</span>
                    
                    {/* Shipping mock info */}
                    <span className="text-[11px] text-gray-500 mt-0.5">Eligible for FREE Shipping & FREE Returns</span>

                    {/* Action Panel */}
                    <div className="flex flex-wrap items-center gap-4 mt-auto pt-3">
                      {/* Qty Controls */}
                      <div className="flex items-center border border-gray-300 rounded bg-gray-50 overflow-hidden h-7">
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition-colors h-full flex items-center"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3.5 py-0.5 font-bold text-xs text-gray-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition-colors h-full flex items-center"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-gray-300">|</span>

                      {/* Delete Button */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-blue-600 hover:text-orange-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={13} className="text-gray-500" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Price Summary & Checkout Action Box */}
        {hasItems && (
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Free Shipping Alert Box */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col leading-tight">
              {qualifiesForFreeShipping ? (
                <div className="flex gap-2">
                  <div className="bg-green-100 text-green-800 p-1.5 rounded-full h-fit mt-0.5">
                    <span className="font-black text-xs text-green-700">✓</span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-green-700 font-bold text-[13px]">Your order qualifies for FREE Shipping.</span>
                    <span className="text-gray-500">Choose this option at checkout. See details</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 text-xs">
                  <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-orange-800 font-bold">Add ${shippingRemaining.toFixed(2)} more of eligible items for FREE Shipping.</span>
                    <span className="text-gray-500">Add items to get free delivery.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtotal Panel */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col leading-tight text-sm">
              
              <div className="text-base text-gray-900 mb-4">
                Subtotal ({cart.summary.itemCount} item{cart.summary.itemCount !== 1 ? 's' : ''}):{' '}
                <span className="font-bold text-lg">${cart.summary.subtotal.toFixed(2)}</span>
              </div>

              {/* Gift Checkbox */}
              <div className="flex items-center gap-2 mb-5">
                <input type="checkbox" id="gift-checkbox" className="w-4 h-4 text-orange-500 border-gray-300 rounded cursor-pointer focus:ring-orange-500" />
                <label htmlFor="gift-checkbox" className="text-xs text-gray-700 cursor-pointer">This order contains a gift</label>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutRedirect}
                className="w-full py-2 px-3 rounded-full text-xs font-semibold shadow bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] cursor-pointer text-gray-800 active:border-[#846a29]"
              >
                Proceed to Checkout
              </button>

              {!user && (
                <p className="text-[11px] text-gray-500 text-center mt-2.5">
                  Sign in to save items and place order.
                </p>
              )}
            </div>

            {/* Recommended Products Promo Mock */}
            <div className="bg-[#eaeded]/50 p-4 rounded-lg border border-gray-300 text-xs flex flex-col">
              <span className="font-bold mb-1 text-gray-700">Buying for work?</span>
              <span className="text-gray-500 leading-normal">
                Register for a free Amazon Business account to save up to 20% on items.
              </span>
              <a href="#" className="text-blue-600 font-semibold hover:underline mt-1.5">Create a free account</a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
