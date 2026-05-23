'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { Search, MapPin, ShoppingCart, Menu, ChevronDown, User, LogOut, Package } from 'lucide-react';

export default function Header() {
  const { 
    user, 
    cart, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    logout 
  } = useCart();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    router.push(`/?search=${encodeURIComponent(localSearch)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    router.push(`/?search=${encodeURIComponent(localSearch)}&category=${encodeURIComponent(catName)}`);
  };

  const handleQuickCategoryClick = (catName) => {
    setSelectedCategory(catName);
    setSearchQuery('');
    setLocalSearch('');
    router.push(`/?category=${encodeURIComponent(catName)}`);
  };

  const handleLogoClick = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setLocalSearch('');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full text-white select-none">
      {/* 1. Main Navigation Belt */}
      <div className="bg-[#131921] h-[60px] flex items-center px-4 py-2 justify-between gap-3 text-sm">
        
        {/* Amazon Logo */}
        <div onClick={handleLogoClick} className="flex items-center px-2 py-1 border border-transparent rounded-sm cursor-pointer hover:border-white">
          <div className="relative flex flex-col items-start leading-none font-bold text-lg tracking-tight">
            <span className="text-white text-xl">amazon</span>
            <span className="text-[#febd69] text-xs font-semibold self-end -mt-1 flex items-center">
              .clone <span className="w-1.5 h-1.5 bg-[#febd69] rounded-full ml-1"></span>
            </span>
          </div>
        </div>

        {/* Deliver To Selector */}
        <div className="hidden md:flex flex-col items-start px-2 py-1 border border-transparent rounded-sm cursor-pointer hover:border-white leading-tight">
          <span className="text-gray-300 text-[11px] pl-[15px]">Deliver to</span>
          <div className="flex items-center gap-1 font-bold text-[13px]">
            <MapPin size={15} className="text-white -mt-1" />
            <span>{user ? `${user.firstName}` : 'Guest'}</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 h-[40px] rounded-md overflow-hidden bg-white text-black focus-within:ring-2 focus-within:ring-[#e77600] group mx-2">
          {/* Categories Dropdown */}
          <div className="relative flex items-center bg-gray-100 border-r border-gray-300 px-3 cursor-pointer hover:bg-gray-200 text-[12px] text-gray-700 font-medium">
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <span>{selectedCategory || 'All'}</span>
            <ChevronDown size={14} className="ml-1 text-gray-500" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Amazon Clone..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-grow px-3 py-2 outline-none text-sm text-gray-800"
          />

          {/* Search Button */}
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] w-[45px] flex items-center justify-center cursor-pointer transition-colors duration-150">
            <Search size={20} className="text-gray-800" />
          </button>
        </form>

        {/* Right Section Navigation Links */}
        <div className="flex items-center gap-1">
          {/* Account Menu Trigger */}
          <div 
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            className="relative px-2 py-1 border border-transparent rounded-sm cursor-pointer hover:border-white leading-tight flex flex-col"
          >
            <span className="text-gray-300 text-[11px]">Hello, {user ? user.firstName : 'sign in'}</span>
            <div className="flex items-center font-bold text-[13px]">
              <span>Account & Lists</span>
              <ChevronDown size={12} className="ml-0.5 mt-0.5 text-gray-300" />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-[38px] right-0 bg-white text-black shadow-lg rounded-md border border-gray-200 p-4 w-[240px] flex flex-col z-50 transition-all duration-200">
                {!user ? (
                  <div className="flex flex-col items-center border-b border-gray-100 pb-3 mb-3">
                    <Link href="/login" className="bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] py-1.5 w-full rounded-md font-medium text-center text-xs shadow-sm active:border-[#846a29]">
                      Sign in
                    </Link>
                    <span className="text-[11px] text-gray-600 mt-2">
                      New customer? <Link href="/signup" className="text-blue-600 hover:text-orange-600 hover:underline">Start here.</Link>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User size={16} className="text-orange-500" />
                      <span className="font-bold text-sm text-gray-800">{user.firstName} {user.lastName}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 truncate">{user.email}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 text-[13px] text-gray-700">
                  <span className="font-bold text-black border-b border-gray-50 pb-1 text-xs">Your Account</span>
                  <Link href="/orders" className="hover:text-orange-600 hover:underline flex items-center gap-1.5">
                    <Package size={14} /> Your Orders
                  </Link>
                  {user && (
                    <button 
                      onClick={logout}
                      className="text-left hover:text-orange-600 hover:underline flex items-center gap-1.5 text-red-600 font-medium mt-1 pt-2 border-t border-gray-100"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Orders Link */}
          <Link href="/orders" className="px-2 py-1 border border-transparent rounded-sm cursor-pointer hover:border-white leading-tight flex flex-col">
            <span className="text-gray-300 text-[11px]">Returns</span>
            <span className="font-bold text-[13px]">& Orders</span>
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="px-2 py-1 border border-transparent rounded-sm cursor-pointer hover:border-white flex items-end gap-1 relative">
            <div className="relative flex items-center">
              <ShoppingCart size={28} className="text-white" />
              <span className="absolute -top-1 left-[11px] bg-[#f08804] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#131921]">
                {cart.summary.itemCount}
              </span>
            </div>
            <span className="font-bold text-[13px] hidden sm:inline mb-1">Cart</span>
          </Link>

        </div>

      </div>

      {/* 2. Subheader Nav Belt */}
      <div className="bg-[#232F3E] h-[39px] flex items-center px-4 justify-between text-xs font-medium">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none pr-4">
          <button onClick={handleLogoClick} className="flex items-center gap-1 font-bold border border-transparent px-2 py-1.5 rounded-sm hover:border-white">
            <Menu size={16} />
            <span>All</span>
          </button>
          
          {/* Render category names directly linked to data filters */}
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => handleQuickCategoryClick(cat.name)}
              className={`border border-transparent px-2 py-1.5 rounded-sm hover:border-white ${selectedCategory === cat.name ? 'text-[#febd69] font-bold border-white/20' : ''}`}
            >
              {cat.name}
            </button>
          ))}
          
          <span className="text-gray-400">|</span>
          <span className="opacity-75 hover:opacity-100 cursor-pointer border border-transparent px-2 py-1.5 rounded-sm hover:border-white">Registry</span>
          <span className="opacity-75 hover:opacity-100 cursor-pointer border border-transparent px-2 py-1.5 rounded-sm hover:border-white">Gift Cards</span>
          <span className="opacity-75 hover:opacity-100 cursor-pointer border border-transparent px-2 py-1.5 rounded-sm hover:border-white">Sell</span>
          <span className="opacity-75 hover:opacity-100 cursor-pointer border border-transparent px-2 py-1.5 rounded-sm hover:border-white">Customer Service</span>
        </div>

        <div className="hidden lg:block text-[#febd69] font-bold hover:underline cursor-pointer">
          Shop great deals now!
        </div>
      </div>
    </header>
  );
}
