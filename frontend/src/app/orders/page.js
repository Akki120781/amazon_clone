'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { CheckCircle, AlertCircle, ShoppingBag, Truck, ClipboardList, Star } from 'lucide-react';

function OrdersContent() {
  const { token, API_BASE_URL } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const orderIdParam = searchParams.get('orderId');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      const activeToken = token || localStorage.getItem('amazon_token');
      if (!activeToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/orders?limit=20`, {
          headers: {
            'Authorization': `Bearer ${activeToken}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.orders);
          
          // If we just placed a successful order, load its specific details
          if (successParam && orderIdParam) {
            const specificOrder = data.data.orders.find(o => o.id === parseInt(orderIdParam));
            if (specificOrder) {
              setSuccessOrder(specificOrder);
            }
          }
        } else {
          setError(data.message || 'Failed to retrieve order history');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to connect to backend server. Ensure Express API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, successParam, orderIdParam, API_BASE_URL]);

  const handleSigninRedirect = () => {
    router.push('/login?redirect=orders');
  };

  const getReadableDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const activeToken = token || (typeof window !== 'undefined' && localStorage.getItem('amazon_token'));

  if (!activeToken) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-16 text-center flex flex-col items-center">
        <ClipboardList size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Check your orders</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Log in to your account to review your purchase history, track packages, and print invoices.
        </p>
        <button 
          onClick={handleSigninRedirect}
          className="bg-[#f0c14b] border border-[#a88734] px-6 py-2 rounded font-semibold text-sm hover:bg-[#eeb933] shadow-sm text-gray-800 cursor-pointer active:border-[#846a29]"
        >
          Sign in to your account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 w-full">
      {/* 1. Success Message banner */}
      {successParam && successOrder && (
        <div className="bg-white border border-green-300 rounded-lg p-5 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="bg-green-100 text-green-800 p-2.5 rounded-full shrink-0">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <div className="flex-1 text-sm leading-normal text-gray-700">
            <h2 className="text-lg font-bold text-green-800 mb-0.5">Order placed, thank you!</h2>
            <p>
              Your order confirmation has been logged. Order Number:{' '}
              <span className="font-bold text-gray-900">{successOrder.order_number}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Deliver to: <span className="font-semibold">{successOrder.shipping_address?.fullName}</span>, {successOrder.shipping_address?.address}, {successOrder.shipping_address?.city}
            </p>
          </div>
          <Link href="/" className="bg-[#f0c14b] border border-[#a88734] px-5 py-1.5 rounded text-xs font-semibold hover:bg-[#eeb933] shadow-sm text-gray-800 shrink-0 self-stretch md:self-auto text-center flex items-center justify-center">
            Continue Shopping
          </Link>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Your Orders</h1>

      {/* 2. Loading State */}
      {loading && (
        <div className="flex flex-col gap-6 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 h-14 w-full"></div>
              <div className="p-6 h-32 w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-sm font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 4. Empty Orders State */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center bg-white border border-gray-200 rounded-lg p-8">
          <ShoppingBag size={48} className="text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">You haven't placed any orders yet.</h3>
          <p className="text-gray-500 text-xs mb-5">Browse our catalog to make your first purchase.</p>
          <Link href="/" className="bg-[#f0c14b] border border-[#a88734] px-5 py-1.5 rounded text-xs font-semibold hover:bg-[#eeb933] shadow-sm text-gray-800">
            Start shopping
          </Link>
        </div>
      )}

      {/* 5. Orders History List */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const dateStr = getReadableDate(order.created_at);
            const total = parseFloat(order.total_amount).toFixed(2);
            
            return (
              <div key={order.id} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:border-gray-400 transition-colors">
                
                {/* Order Header Info */}
                <div className="bg-[#f0f2f2] border-b border-gray-350 px-5 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div className="flex flex-col leading-tight">
                    <span className="uppercase text-[10px] text-gray-500 font-semibold mb-0.5">Order Placed</span>
                    <span className="font-medium text-gray-800">{dateStr}</span>
                  </div>
                  
                  <div className="flex flex-col leading-tight">
                    <span className="uppercase text-[10px] text-gray-500 font-semibold mb-0.5">Total</span>
                    <span className="font-bold text-gray-800">${total}</span>
                  </div>

                  <div className="flex flex-col leading-tight relative group/ship">
                    <span className="uppercase text-[10px] text-gray-500 font-semibold mb-0.5">Ship To</span>
                    <span className="text-blue-600 hover:text-orange-600 hover:underline font-medium cursor-pointer">
                      {order.shipping_address?.fullName || 'Guest'}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover/ship:flex absolute top-10 left-0 bg-white border border-gray-300 rounded shadow-md p-3 w-[220px] text-gray-800 z-30 leading-normal flex-col">
                      <p className="font-bold border-b border-gray-100 pb-1 mb-1">{order.shipping_address?.fullName}</p>
                      <p>{order.shipping_address?.address}</p>
                      <p>{order.shipping_address?.city}, {order.shipping_address?.postalCode}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Phone: {order.shipping_address?.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col leading-tight items-start sm:items-end justify-self-start sm:justify-self-end">
                    <span className="uppercase text-[10px] text-gray-500 font-semibold mb-0.5">Order # {order.order_number}</span>
                    <span className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">
                      View details
                    </span>
                  </div>
                </div>

                {/* Order Body Details */}
                <div className="p-5 flex flex-col md:flex-row gap-6 justify-between">
                  {/* Delivery Status and Mock Items */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-1.5 font-bold text-base text-gray-900">
                      <Truck size={18} className="text-green-600" />
                      <span>Status: {order.status === 'confirmed' ? 'Preparing Shipment' : order.status}</span>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 border border-gray-200 rounded text-xs text-gray-700">
                      <ClipboardList size={20} className="text-gray-500 shrink-0" />
                      <div className="flex-1 leading-normal">
                        <p>This order contains <span className="font-bold text-gray-900">{order.item_count} unique item(s)</span>.</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Shipped via Amazon Ground. Delivery confirmation logged on {dateStr}.</p>
                      </div>
                    </div>

                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 w-full md:w-[240px] shrink-0 text-xs font-semibold">
                    <button
                      onClick={() => alert(`Tracking information is simulated for order: ${order.order_number}`)}
                      className="w-full py-1.5 border border-gray-400 bg-gradient-to-b from-gray-50 to-gray-100 rounded text-center text-gray-800 hover:from-gray-100 hover:to-gray-150 shadow-sm active:bg-gray-200 cursor-pointer"
                    >
                      Track package
                    </button>
                    <button
                      onClick={() => alert('Returns are available within 30 days of delivery.')}
                      className="w-full py-1.5 border border-gray-400 bg-gradient-to-b from-gray-50 to-gray-100 rounded text-center text-gray-800 hover:from-gray-100 hover:to-gray-150 shadow-sm active:bg-gray-200 cursor-pointer"
                    >
                      Return or replace items
                    </button>
                    <Link
                      href="/"
                      className="w-full py-1.5 border border-gray-450 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#eeb933] text-gray-800 rounded text-center shadow-sm cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Star size={13} className="text-orange-600 fill-orange-600" /> Write a product review
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default function Orders() {
  return (
    <Suspense fallback={
      <div className="max-w-screen-xl mx-auto px-4 py-8 w-full">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white h-48"></div>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
