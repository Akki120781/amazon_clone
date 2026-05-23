'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { Star, StarHalf, ShieldCheck, MapPin, ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ProductDetails({ params }) {
  const { id } = params;
  const { addToCart, API_BASE_URL } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data.product);
          setSelectedImage(data.data.product.image_url);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Connection error. Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, API_BASE_URL]);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product, quantity);
    setAdding(false);
    if (result.success) {
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    } else {
      alert(result.message || 'Failed to add item to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={18} className="text-[#f08804] fill-[#f08804]" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} size={18} className="text-[#f08804] fill-[#f08804]" />);
      } else {
        stars.push(<Star key={i} size={18} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8 w-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full bg-gray-200 h-96 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="h-8 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="md:col-span-3">
            <div className="h-48 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error || 'Product details are unavailable.'}</p>
        <Link href="/" className="bg-[#f0c14b] border border-[#a88734] px-6 py-2 rounded font-semibold text-sm hover:bg-[#eeb933] shadow-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  // Parse dollar and cents for Amazon styles
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const priceParts = price.toFixed(2).split('.');
  const dollars = priceParts[0];
  const cents = priceParts[1];

  const inStock = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 5;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 w-full">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-orange-600 font-semibold mb-6 hover:underline"
      >
        <ArrowLeft size={14} /> Back to results
      </button>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        
        {/* Left Column: Image Carousel */}
        <div className="md:col-span-5 flex flex-col md:flex-row gap-4">
          {/* Vertical Thumbnails List */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:flex-col gap-2 order-2 md:order-1 justify-center md:justify-start">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-12 md:w-16 md:h-16 border rounded cursor-pointer overflow-hidden p-1 flex items-center justify-center transition-all ${
                    selectedImage === img ? 'border-[#f08804] ring-1 ring-[#f08804]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          )}

          {/* Main Large Image Display */}
          <div className="flex-1 border border-gray-100 rounded-md p-4 flex items-center justify-center h-[320px] md:h-[420px] order-1 md:order-2">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-[1.01] transition-transform duration-200 cursor-zoom-in"
            />
          </div>
        </div>

        {/* Middle Column: Product Specifications & Details */}
        <div className="md:col-span-4 flex flex-col">
          {/* Brand & Category */}
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 font-medium">
            <span className="text-blue-600 hover:underline hover:text-orange-600 cursor-pointer">Brand: {product.brand || 'Generic'}</span>
            <span>in</span>
            <span className="text-blue-600 hover:underline hover:text-orange-600 cursor-pointer">{product.category_name}</span>
          </div>

          {/* Product Title */}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 text-sm">
            <div className="flex items-center">{renderStars(parseFloat(product.rating))}</div>
            <span className="text-blue-600 hover:text-orange-600 cursor-pointer hover:underline">
              {product.rating} stars
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-blue-600 hover:text-orange-600 cursor-pointer hover:underline">
              {product.reviews_count?.toLocaleString()} ratings
            </span>
          </div>

          {/* Price Layout */}
          <div className="mb-4">
            <div className="flex items-start text-gray-900">
              <span className="text-sm font-semibold mt-1 mr-0.5">$</span>
              <span className="text-4xl font-extrabold leading-none">{dollars}</span>
              <span className="text-sm font-semibold mt-1">{cents}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* About This Item Section */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-900 mb-2">About this item</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="font-bold text-sm text-gray-900 mb-3">Product Specifications</h3>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 font-bold text-gray-700 w-1/3 border-r border-gray-200">{key}</td>
                        <td className="px-4 py-2 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Checkout Purchase Box */}
        <div className="md:col-span-3">
          <div className="border border-gray-300 rounded-lg p-5 flex flex-col bg-white shadow-sm leading-tight text-sm">
            
            {/* Price Box */}
            <div className="flex items-start text-gray-900 mb-2">
              <span className="text-xs font-semibold mt-0.5 mr-0.5">$</span>
              <span className="text-2xl font-bold leading-none">{dollars}</span>
              <span className="text-xs font-semibold mt-0.5">{cents}</span>
            </div>

            {/* Delivery Estimates */}
            <div className="flex items-center gap-1.5 text-xs text-[#00a8e1] font-bold mb-3">
              <div className="flex items-center">
                <span className="text-[#f08804] italic font-black">✓</span>
                <span className="italic ml-0.5">prime</span>
              </div>
              <span className="text-gray-600 font-normal">Free delivery</span>
              <span>Tomorrow</span>
            </div>

            <div className="text-gray-700 text-xs mb-4">
              Or fastest delivery <span className="font-bold">Today</span>. Order within 2 hrs.
            </div>

            {/* Stock status */}
            <div className="mb-4">
              {!inStock ? (
                <span className="text-red-600 font-bold text-base">Temporarily Out of Stock</span>
              ) : lowStock ? (
                <span className="text-orange-600 font-bold text-base">Only {product.stock_quantity} left in stock - order soon.</span>
              ) : (
                <span className="text-green-600 font-bold text-base">In Stock</span>
              )}
            </div>

            {/* Quantity Dropdown */}
            {inStock && (
              <div className="flex items-center gap-2 mb-4">
                <label htmlFor="qty-select" className="text-xs font-semibold text-gray-600">Qty:</label>
                <select
                  id="qty-select"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="bg-gray-100 border border-gray-300 rounded px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  {[...Array(Math.min(product.stock_quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Cart Buttons */}
            {inStock ? (
              <div className="flex flex-col gap-2 mb-4">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full py-2 px-3 rounded-full text-xs font-semibold shadow bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] cursor-pointer text-gray-800 active:border-[#846a29]"
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                {/* Buy Now */}
                <button
                  onClick={() => {
                    handleAddToCart().then(() => router.push('/cart'));
                  }}
                  className="w-full py-2 px-3 rounded-full text-xs font-semibold shadow bg-gradient-to-b from-[#f0b800] to-[#e47911] border border-[#a88734] hover:from-[#eec340] hover:to-[#df7200] cursor-pointer text-white"
                >
                  Buy Now
                </button>
              </div>
            ) : null}

            {/* Added Confirmation Overlay */}
            {addedMessage && (
              <div className="bg-green-50 border border-green-200 rounded p-2.5 text-xs text-green-800 font-semibold mb-4 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle size={16} className="text-green-600" /> Item added to cart successfully!
              </div>
            )}

            {/* Delivery address location link */}
            <div className="flex items-start gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-1.5">
              <MapPin size={15} className="text-gray-400 mt-0.5" />
              <span className="hover:text-orange-600 hover:underline cursor-pointer">Deliver to Guest Address</span>
            </div>

            {/* Secure Transaction Notice */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-4 leading-tight">
              <ShieldCheck size={16} className="text-gray-400" />
              <span>Secure transaction</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
