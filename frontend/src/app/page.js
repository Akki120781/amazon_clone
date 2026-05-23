'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { ChevronLeft, ChevronRight, RefreshCw, XCircle } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    title: 'Shop Holiday Deals',
    subtitle: 'Huge savings on top brands. Fast delivery included.',
    cta: 'Browse Electronics',
    category: 'Electronics'
  },
  {
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&auto=format&fit=crop&q=80',
    title: 'Upgrade Your Home Office',
    subtitle: 'Find ergonomic chairs, desks, and smart displays.',
    cta: 'Explore Home & Kitchen',
    category: 'Home & Kitchen'
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
    title: 'Discover Fresh Trends',
    subtitle: 'Revamp your wardrobe with top seasonal fashion items.',
    cta: 'View Apparel',
    category: 'Clothing'
  }
];

export default function Home() {
  const { 
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    setSelectedCategory,
    API_BASE_URL 
  } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Fetch products from API on filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `${API_BASE_URL}/products?limit=30`;
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.products);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to connect to backend server. Ensure Express API is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, API_BASE_URL]);

  // 2. Banner slideshow logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Search Header Banner (Only shown if filtering) */}
      {(searchQuery || selectedCategory) && (
        <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Showing results for</span>
            {searchQuery && (
              <span className="font-bold text-gray-900">"{searchQuery}"</span>
            )}
            {selectedCategory && (
              <>
                <span>in</span>
                <span className="bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded text-xs">
                  {selectedCategory}
                </span>
              </>
            )}
            <span className="text-gray-400">({products.length} items found)</span>
          </div>
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-orange-600 font-semibold hover:underline"
          >
            <XCircle size={14} /> Clear all filters
          </button>
        </div>
      )}

      {/* Hero Slideshow Banner (Hidden if active search) */}
      {!searchQuery && !selectedCategory && (
        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[480px] overflow-hidden bg-gray-200">
          {/* Banner Images */}
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Fade Overlay mimicking Amazon gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#eaeded] via-transparent to-transparent z-10"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Caption Overlay */}
              <div className="absolute top-[12%] sm:top-[16%] md:top-[22%] left-6 sm:left-12 md:left-24 max-w-[75%] sm:max-w-md md:max-w-lg z-20 text-shadow-sm select-none">
                <span className="bg-black/35 text-[#febd69] font-bold text-xs uppercase px-2.5 py-1 rounded tracking-wider">
                  Sponsored
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mt-3">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-lg text-white font-medium mt-1 leading-normal opacity-90">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => setSelectedCategory(slide.category)}
                  className="mt-4 sm:mt-6 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold text-xs sm:text-sm py-2 px-5 rounded shadow-md border border-[#a88734] transition-colors"
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-2 top-[35%] -translate-y-1/2 z-20 p-2 text-white bg-black/10 hover:bg-black/30 rounded-md cursor-pointer border border-transparent hover:border-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-2 top-[35%] -translate-y-1/2 z-20 p-2 text-white bg-black/10 hover:bg-black/30 rounded-md cursor-pointer border border-transparent hover:border-white/20"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Main Grid Content */}
      <div className={`max-w-screen-2xl mx-auto px-4 w-full ${!searchQuery && !selectedCategory ? '-mt-16 sm:-mt-24 md:-mt-32 lg:-mt-44 z-20 relative' : 'mt-6'}`}>
        
        {/* Amazon Grid Cards (Only shown on default home page) */}
        {!searchQuery && !selectedCategory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Category Card 1 */}
            <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-between h-[320px]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Top Electronics</h2>
                <div className="h-40 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400"
                    alt="Electronics"
                    className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory('Electronics')} 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline font-semibold text-left"
              >
                Shop now
              </button>
            </div>

            {/* Category Card 2 */}
            <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-between h-[320px]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Home Essentials</h2>
                <div className="h-40 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1585515320310-259814833dcf?w=400"
                    alt="Home"
                    className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory('Home & Kitchen')} 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline font-semibold text-left"
              >
                Explore items
              </button>
            </div>

            {/* Category Card 3 */}
            <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-between h-[320px]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Bestseller Books</h2>
                <div className="h-40 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
                    alt="Books"
                    className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory('Books')} 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline font-semibold text-left"
              >
                Shop literature
              </button>
            </div>

            {/* Category Card 4 */}
            <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-between h-[320px] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#cc0c39] text-white text-[10px] uppercase font-bold py-1 px-3 rounded-bl">
                Deal of the Day
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">New Fashion Fits</h2>
                <div className="h-40 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
                    alt="Fashion"
                    className="w-full h-full object-cover rounded hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategory('Clothing')} 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline font-semibold text-left"
              >
                See all deals
              </button>
            </div>
          </div>
        )}

        {/* Product Listing Section */}
        <div className="bg-white p-5 md:p-6 rounded shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">
            {searchQuery || selectedCategory ? 'Search Results' : 'Recommended for You'}
          </h2>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 animate-pulse flex flex-col h-[380px]">
                  <div className="bg-gray-200 h-44 rounded-md mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded w-1/3 mb-4"></div>
                  <div className="flex-grow"></div>
                  <div className="bg-gray-200 h-8 rounded-full w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-6 text-center">
              <p className="text-red-800 font-semibold mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-800 hover:bg-red-900 text-white font-medium text-xs px-4 py-2 rounded flex items-center gap-1.5 mx-auto transition-colors"
              >
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
          )}

          {/* Empty Results */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-1">No products found matching your criteria.</p>
              <p className="text-gray-400 text-sm">Try broadening your search term or select another category.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 bg-[#f0c14b] border border-[#a88734] px-4 py-1.5 text-xs font-semibold rounded hover:bg-[#eeb933] shadow-sm text-gray-800 active:border-[#846a29]"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
