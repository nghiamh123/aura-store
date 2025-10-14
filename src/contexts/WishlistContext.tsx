'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types
export interface WishlistItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  material?: string;
  size?: string;
  color?: string;
  warranty?: string;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (id: number) => boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: WishlistState & { loading: boolean; error: string | null } = {
  items: [],
  itemCount: 0,
  loading: false,
  error: null,
};

// Action types
type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: number }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer
function wishlistReducer(state: typeof initialState, action: WishlistAction): typeof initialState {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return state; // Item already in wishlist
      }
      
      const newItem = { ...action.payload, addedAt: new Date() };
      const updatedItems = [...state.items, newItem];
      
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.length,
        error: null,
      };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.length,
        error: null,
      };
    }
    
    case 'CLEAR_WISHLIST':
      return { ...initialState };
    
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
        itemCount: action.payload.length,
        error: null,
        loading: false,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
}

// Context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        
        const data = await response.json();
        dispatch({ type: 'SET_WISHLIST', payload: data.items || [] });
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
      }
    };

    fetchWishlist();
  }, []);

  const addToWishlist = async (item: Omit<WishlistItem, 'addedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id }),
      });
      
      if (!response.ok) throw new Error('Failed to add to wishlist');
      
      // Fetch updated wishlist from API to get complete product data
      const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        dispatch({ type: 'SET_WISHLIST', payload: data.items || [] });
      } else {
        // Fallback to local state if API fetch fails
        dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to wishlist' });
    }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist?productId=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      
      // Fetch updated wishlist from API to get complete product data
      const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        dispatch({ type: 'SET_WISHLIST', payload: data.items || [] });
      } else {
        // Fallback to local state if API fetch fails
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove from wishlist' });
    }
  };

  const clearWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Remove all items one by one
      for (const item of state.items) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist?productId=${item.id}`, {
          method: 'DELETE',
        });
      }
      
      // Fetch updated wishlist from API to confirm it's empty
      const updatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        dispatch({ type: 'SET_WISHLIST', payload: data.items || [] });
      } else {
        // Fallback to local state if API fetch fails
        dispatch({ type: 'CLEAR_WISHLIST' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear wishlist' });
    }
  };

  const isInWishlist = (id: number) => {
    return state.items.some(item => item.id === id);
  };

  const value: WishlistContextType = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
