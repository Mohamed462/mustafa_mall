import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { dbStore } from '../services/dbStore';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'al_mostafa_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1, variant: ProductVariant | null = null) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        (variant ? item.variant?.id === variant.id : !item.variant)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        // Verify stock limits
        const maxStock = variant ? variant.stock_quantity : product.stock_quantity;
        updated[existingIndex].quantity = Math.min(newQty, maxStock > 0 ? maxStock : newQty);
        return updated;
      } else {
        return [...prev, { product, quantity, variant }];
      }
    });
  };

  const removeFromCart = (productId: string, variantId: string | null = null) => {
    setCartItems(prev => prev.filter(item => 
      !(item.product.id === productId && (variantId ? item.variant?.id === variantId : !item.variant))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, variantId: string | null = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId && (variantId ? item.variant?.id === variantId : !item.variant)) {
        const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
        return { ...item, quantity: Math.min(quantity, maxStock > 0 ? maxStock : quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.variant?.price_override_egp ?? item.product.price_egp;
    return sum + (unitPrice * item.quantity);
  }, 0);

  const settings = dbStore.getSettings();
  const isFreeShipping = subtotal >= settings.free_shipping_threshold_egp && subtotal > 0;
  const shippingFee = subtotal === 0 ? 0 : (isFreeShipping ? 0 : settings.shipping_flat_fee_egp);

  const applyCoupon = (code: string) => {
    const result = dbStore.validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      return { success: true, message: `تم تفعيل كوبون الخصم (${result.coupon.code}) بنجاح!` };
    }
    return { success: false, message: result.error || 'كوبون الخصم غير صالح' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Auto-recalculate coupon discount when subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const result = dbStore.validateCoupon(appliedCoupon.code, subtotal);
      if (result.valid) {
        setCouponDiscount(result.discount);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    }
  }, [subtotal, appliedCoupon]);

  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      shippingFee,
      discount: couponDiscount,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      total,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
