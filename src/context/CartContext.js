// CartContext.js — global cart state via React Context
// When backend is ready: POST /api/cart, GET /api/cart, DELETE /api/cart/:id

import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],      // [{ food, quantity }]
  orders: [],     // completed orders history
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.food.id === action.food.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.food.id === action.food.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { food: action.food, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.food.id !== action.id) };
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          i.food.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case 'DECREMENT': {
      const item = state.items.find((i) => i.food.id === action.id);
      if (!item) return state;
      if (item.quantity === 1) {
        return { ...state, items: state.items.filter((i) => i.food.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.food.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'PLACE_ORDER': {
      const subtotal = state.items.reduce(
        (sum, i) => sum + i.food.price * i.quantity,
        0
      );
      const newOrder = {
        id: `ORD${Date.now()}`,
        items: state.items,
        subtotal,
        total: subtotal,
        status: 'Preparing',
        placedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
      return { items: [], orders: [newOrder, ...state.orders] };
    }
    case 'PLACE_ORDER_WITH_DETAILS': {
      const customOrder = {
        id: action.order.orderNumber || `ORD${Date.now()}`,
        orderNumber: action.order.orderNumber,
        userId: action.order.userId,
        items: action.order.items || state.items,
        subtotal: action.order.totalAmount,
        total: action.order.totalAmount,
        status: 'Preparing',
        paymentStatus: action.order.paymentStatus || 'paid',
        orderStatus: action.order.orderStatus || 'preparing',
        placedAt: action.order.placedAt || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: action.order.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      return { items: [], orders: [customOrder, ...state.orders] };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (food) => dispatch({ type: 'ADD_ITEM', food });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const increment = (id) => dispatch({ type: 'INCREMENT', id });
  const decrement = (id) => dispatch({ type: 'DECREMENT', id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const placeOrder = () => dispatch({ type: 'PLACE_ORDER' });
  const placeOrderWithDetails = (order) => dispatch({ type: 'PLACE_ORDER_WITH_DETAILS', order });

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = state.items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);

  const getQuantity = (foodId) => {
    const item = state.items.find((i) => i.food.id === foodId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        orders: state.orders,
        cartCount,
        cartTotal,
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        placeOrder,
        placeOrderWithDetails,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
