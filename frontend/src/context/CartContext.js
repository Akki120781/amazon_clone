'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, subtotal: 0, tax: 0, total: 0 } });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 1. Initial Load: Load user token from localStorage, load guest cart if not logged in
  useEffect(() => {
    const initializeApp = async () => {
      const storedToken = localStorage.getItem('amazon_token');
      
      // Fetch categories
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }

      if (storedToken) {
        setToken(storedToken);
        // Verify token and fetch user info
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data.user);
            // Fetch user cart
            await fetchUserCart(storedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem('amazon_token');
            loadLocalCart();
          }
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          loadLocalCart();
        }
      } else {
        // No stored token. Perform auto-login of the pre-seeded default user as per assignment spec
        const explicitLogout = localStorage.getItem('amazon_logout_explicit');
        if (!explicitLogout) {
          try {
            console.log('Logging in default demo user automatically...');
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: 'demo@amazon.com', password: 'password123' })
            });
            const data = await res.json();
            if (data.success) {
              const userToken = data.data.token;
              const loggedUser = data.data.user;
              
              setToken(userToken);
              setUser(loggedUser);
              localStorage.setItem('amazon_token', userToken);
              
              // Fetch user's cart
              await fetchUserCart(userToken);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to auto-login default user:', e);
          }
        }
        loadLocalCart();
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  // 2. Local Cart (Guest User) Helpers
  const loadLocalCart = () => {
    const localCart = localStorage.getItem('amazon_guest_cart');
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        setCart(parsed);
      } catch (e) {
        console.error('Error parsing local cart', e);
        resetCartState();
      }
    } else {
      resetCartState();
    }
  };

  const resetCartState = () => {
    setCart({
      items: [],
      summary: { itemCount: 0, subtotal: 0, tax: 0, total: 0 }
    });
  };

  const saveLocalCart = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const newCart = {
      items,
      summary: {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }
    };
    setCart(newCart);
    localStorage.setItem('amazon_guest_cart', JSON.stringify(newCart));
  };

  // 3. User Cart (Logged In User) API Calls
  const fetchUserCart = async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user cart:', err);
    }
  };

  // 4. Cart Action handlers
  const addToCart = async (product, quantity = 1) => {
    if (token) {
      // API call for logged in user
      try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id, quantity })
        });
        const data = await res.json();
        if (data.success) {
          await fetchUserCart();
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (err) {
        console.error('Add to cart failed:', err);
        return { success: false, message: 'Server error' };
      }
    } else {
      // Local cart handling for guests
      const existingItems = [...cart.items];
      const existingIdx = existingItems.findIndex(item => item.product_id === product.id);

      if (existingIdx > -1) {
        const totalQty = existingItems[existingIdx].quantity + quantity;
        if (product.stock_quantity < totalQty) {
          return { success: false, message: 'Insufficient stock available.' };
        }
        existingItems[existingIdx].quantity = totalQty;
        existingItems[existingIdx].subtotal = parseFloat((existingItems[existingIdx].quantity * product.price).toFixed(2));
      } else {
        if (product.stock_quantity < quantity) {
          return { success: false, message: 'Insufficient stock available.' };
        }
        existingItems.push({
          id: `guest_${Date.now()}_${product.id}`,
          product_id: product.id,
          quantity,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          subtotal: parseFloat((quantity * product.price).toFixed(2))
        });
      }
      saveLocalCart(existingItems);
      return { success: true };
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (data.success) {
          await fetchUserCart();
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (err) {
        console.error('Update cart failed:', err);
        return { success: false, message: 'Server error' };
      }
    } else {
      const existingItems = [...cart.items];
      const itemIdx = existingItems.findIndex(item => item.id === cartItemId);
      if (itemIdx > -1) {
        const item = existingItems[itemIdx];
        if (item.stock_quantity < quantity) {
          return { success: false, message: 'Insufficient stock available.' };
        }
        item.quantity = quantity;
        item.subtotal = parseFloat((quantity * item.price).toFixed(2));
        saveLocalCart(existingItems);
        return { success: true };
      }
      return { success: false, message: 'Item not found in cart' };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          await fetchUserCart();
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (err) {
        console.error('Remove from cart failed:', err);
        return { success: false, message: 'Server error' };
      }
    } else {
      const existingItems = cart.items.filter(item => item.id !== cartItemId);
      saveLocalCart(existingItems);
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await fetchUserCart();
      } catch (err) {
        console.error('Clear cart failed:', err);
      }
    } else {
      resetCartState();
      localStorage.removeItem('amazon_guest_cart');
    }
  };

  // 5. Auth operations
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        const userToken = data.data.token;
        const loggedUser = data.data.user;
        
        setToken(userToken);
        setUser(loggedUser);
        localStorage.setItem('amazon_token', userToken);
        localStorage.removeItem('amazon_logout_explicit');

        // Sync local guest cart items to the database
        const localCart = localStorage.getItem('amazon_guest_cart');
        if (localCart) {
          try {
            const parsed = JSON.parse(localCart);
            for (const item of parsed.items) {
              await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ productId: item.product_id, quantity: item.quantity })
              });
            }
            localStorage.removeItem('amazon_guest_cart');
          } catch (e) {
            console.error('Error syncing guest cart', e);
          }
        }

        // Fetch user's merged cart
        await fetchUserCart(userToken);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, message: 'Server connection error.' };
    }
  };

  const signup = async (firstName, lastName, email, password, phone) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password, phone })
      });
      const data = await res.json();
      if (data.success) {
        const userToken = data.data.token;
        const loggedUser = data.data.user;

        setToken(userToken);
        setUser(loggedUser);
        localStorage.setItem('amazon_token', userToken);
        localStorage.removeItem('amazon_logout_explicit');
        
        // Clear local guest cart or sync
        localStorage.removeItem('amazon_guest_cart');
        resetCartState();
        
        return { success: true };
      } else {
        // Return first validation error if list exists, else standard message
        const message = data.errors ? data.errors[0].msg : data.message;
        return { success: false, message };
      }
    } catch (err) {
      console.error('Signup request failed:', err);
      return { success: false, message: 'Server connection error.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('amazon_token');
    localStorage.setItem('amazon_logout_explicit', 'true');
    resetCartState();
    loadLocalCart(); // Reverts to local cart if any guest items were saved
  };

  // 6. Checkout operations
  const placeOrder = async (shippingAddress, paymentMethod) => {
    if (!token) {
      return { success: false, message: 'Authentication required. Please sign in to checkout.' };
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress, paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        // Clear cart locally
        resetCartState();
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      return { success: false, message: 'Server connection error.' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        token,
        cart,
        categories,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        login,
        signup,
        logout,
        placeOrder,
        fetchUserCart,
        API_BASE_URL
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
