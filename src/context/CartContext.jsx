import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'agri_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Persist to localStorage whenever items change
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
        catch { }
    }, [items]);

    // Add product to cart (or increment if already exists)
    const addToCart = useCallback((product, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.product.id === product.id
                        ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                        : i
                );
            }
            return [...prev, { product, quantity: Math.min(99, qty) }];
        });
    }, []);

    // Remove a product from cart
    const removeFromCart = useCallback((productId) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    }, []);

    // Update quantity of a specific product
    const updateQty = useCallback((productId, qty) => {
        const newQty = Math.max(1, Math.min(99, qty));
        setItems(prev => prev.map(i =>
            i.product.id === productId ? { ...i, quantity: newQty } : i
        ));
    }, []);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // Computed values
    const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const cartTotal = items.reduce((acc, i) => {
        const price = i.product.show_price == 1 && i.product.price ? Number(i.product.price) : 0;
        return acc + price * i.quantity;
    }, 0);
    const hasPrice = items.some(i => i.product.show_price == 1 && i.product.price);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, hasPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}
