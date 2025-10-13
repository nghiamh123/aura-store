'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (id: number) => void;
  clearWishlist: () => void;
  isInWishlist: (id: number) => boolean;
}

// Initial state
const initialState: WishlistState = {
  items: [],
  itemCount: 0,
};

// Action types
type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: number }
  | { type: 'CLEAR_WISHLIST' };

// Reducer
function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
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
      };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.length,
      };
    }
    
    case 'CLEAR_WISHLIST':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const addToWishlist = (item: Omit<WishlistItem, 'addedAt'>) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
  };

  const removeFromWishlist = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
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
