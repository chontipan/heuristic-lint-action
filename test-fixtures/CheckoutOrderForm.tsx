import React, { useState } from 'react';

// Simple, universally relatable e-commerce / user order form component
export const CheckoutOrderForm = () => {
  const [quantity, setQuantity] = useState(1);

  const handleCheckout = async () => {
    // Defect H1: silent unhandled async submission lacking error toast
    const res = await fetch('/api/orders/checkout', { method: 'POST' });
    const data = await res.json();
  };

  const handleRemoveItem = (itemId: string) => {
    // Defect H3: destructive item deletion lacking confirm modal or undo
    fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
  };

  return (
    <div className="cart-checkout-container">
      <h2>Shopping Cart Checkout</h2>

      {/* Defect H2: Hardcoded raw English string bypassing i18n */}
      <button onClick={handleCheckout}>Checkout</button>

      {/* Defect H5: Quantity number input missing min={1} (Zod schema requires positive integer) */}
      <label htmlFor="item-qty">Quantity:</label>
      <input
        id="item-qty"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      {/* Defect H3: direct destructive action */}
      <button onClick={() => handleRemoveItem('item-101')}>Delete</button>
    </div>
  );
};
