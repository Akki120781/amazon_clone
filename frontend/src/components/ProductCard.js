'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Star, StarHalf } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={15} className="text-[#f08804] fill-[#f08804]" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} size={15} className="text-[#f08804] fill-[#f08804]" />);
      } else {
        stars.push(<Star key={i} size={15} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating to detail page on clicking button
    setAdding(true);
    const result = await addToCart(product, 1);
    setAdding(false);
    
    if (result.success) {
      setMessage('Added!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage(result.message || 'Error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Extract dollar and cents for Amazon price styling
  const priceParts = product.price.toFixed(2).split('.');
  const dollars = priceParts[0];
  const cents = priceParts[1];

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 p-4 h-full">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="relative h-48 w-full flex items-center justify-center overflow-hidden mb-3">
        <img
          src={product.image_url}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-200 ease-in-out"
          loading="lazy"
        />
      </Link>

      {/* Brand */}
      {product.brand && (
        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
          {product.brand}
        </span>
      )}

      {/* Product Title */}
      <Link href={`/product/${product.id}`} className="hover:text-[#c45500] text-gray-900 font-medium text-sm leading-tight line-clamp-2 min-h-[40px] mb-1">
        {product.name}
      </Link>

      {/* Star Ratings */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex items-center">{renderStars(parseFloat(product.rating))}</div>
        <span className="text-[12px] text-blue-600 hover:text-orange-600 cursor-pointer hover:underline">
          {product.reviews_count?.toLocaleString()}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-start text-gray-900 mb-2">
        <span className="text-xs font-semibold mt-0.5">$</span>
        <span className="text-2xl font-bold leading-none">{dollars}</span>
        <span className="text-xs font-semibold mt-0.5">{cents}</span>
      </div>

      {/* Prime Badge Mock */}
      <div className="flex items-center gap-1 mb-4 text-[11px] font-bold text-[#00a8e1] leading-none">
        <span className="text-gray-600 font-normal">Get it by </span>
        <span className="text-gray-900">Tomorrow</span>
        <div className="flex items-center ml-1">
          <span className="text-[#f08804] italic font-black">✓</span>
          <span className="italic ml-0.5 text-[#00a8e1]">prime</span>
        </div>
      </div>

      {/* Spacing element to push button to bottom */}
      <div className="flex-grow"></div>

      {/* Add To Cart Button */}
      <div className="relative mt-2">
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock_quantity <= 0}
          className={`w-full py-1.5 px-3 rounded-full text-xs font-medium text-center shadow-sm flex items-center justify-center transition-all duration-150 ${
            product.stock_quantity <= 0
              ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] text-gray-800 cursor-pointer active:border-[#846a29]'
          }`}
        >
          {product.stock_quantity <= 0 ? 'Out of Stock' : adding ? 'Adding...' : message || 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
