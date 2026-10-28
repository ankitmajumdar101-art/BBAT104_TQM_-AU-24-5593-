import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  Phone, 
  Utensils, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function POSBilling({ user }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    }
  };

  // Add Item to Cart
  const addToCart = (item) => {
    if (!item.available) return;

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1
      }];
    });
  };

  // Update Cart Quantity
  const updateQuantity = (itemId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Remove Item from Cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  };

  // Clear Cart
  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the active bill?')) {
      setCart([]);
      setDiscountValue(0);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 5.00; // 5% GST
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  
  let calculatedDiscount = 0;
  const numDiscount = parseFloat(discountValue) || 0;
  if (discountType === 'percentage') {
    calculatedDiscount = parseFloat(((subtotal * numDiscount) / 100).toFixed(2));
  } else {
    calculatedDiscount = parseFloat(numDiscount.toFixed(2));
  }
  if (calculatedDiscount > subtotal) calculatedDiscount = subtotal;

  const total = parseFloat((subtotal + taxAmount - calculatedDiscount).toFixed(2));

  // Submit & Generate Bill
  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          table_number: parseInt(tableNumber, 10),
          customer_name: customerName || 'Walk-in Customer',
          customer_phone: customerPhone,
          items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
          discount_type: discountType,
          discount_value: numDiscount,
          payment_method: paymentMethod,
          notes: notes
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate bill.');
      }

      setGeneratedOrder(data.order);
      setShowReceipt(true);
      setCart([]);
      setDiscountValue(0);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
      {/* LEFT SECTION: MENU CATALOG */}
      <div>
        {/* Controls: Search & Category Pills */}
        <div style={{ background: '#FFF', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search dishes by name (e.g. Biryani, Pizza, Soup)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: selectedCategory === 'All' ? '700' : '500',
                background: selectedCategory === 'All' ? 'var(--primary)' : '#F1F5F9',
                color: selectedCategory === 'All' ? '#FFF' : '#475569',
                whiteSpace: 'nowrap'
              }}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat.name ? '700' : '500',
                  background: selectedCategory === cat.name ? 'var(--primary)' : '#F1F5F9',
                  color: selectedCategory === cat.name ? '#FFF' : '#475569',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => item.available && addToCart(item)}
              style={{
                background: '#FFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: item.available ? 'pointer' : 'not-allowed',
                opacity: item.available ? 1 : 0.6,
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (item.available) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(115, 15, 25, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (item.available) {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748B',
                    background: '#F1F5F9',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {item.category_name}
                  </span>
                  {!item.available && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#EF4444', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                  {item.name}
                </h4>
                {item.description && (
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', marginBottom: '12px' }}>
                    {item.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
                <button
                  disabled={!item.available}
                  style={{
                    background: item.available ? 'var(--primary)' : '#CBD5E1',
                    color: '#FFF',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION: ACTIVE CART & ORDER SUMMARY */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        position: 'sticky',
        top: '90px'
      }}>
        {/* Cart Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Current Order
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              {cart.reduce((cnt, it) => cnt + it.quantity, 0)} items in bill
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Clear entire bill"
              style={{
                background: 'transparent',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Table & Customer Details */}
        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                TABLE #
              </label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i+1} value={i+1}>Table #{i+1}</option>
                ))}
                <option value={99}>Takeaway / Counter</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                CUSTOMER PHONE
              </label>
              <input
                type="text"
                placeholder="Mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Cart Items Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <Utensils size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Your order is empty</p>
              <p style={{ fontSize: '12px' }}>Click dishes on the left to add them to this bill.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      ₹{item.price.toFixed(2)} × {item.quantity} = <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#E2E8F0',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--primary)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      title="Delete item"
                      style={{
                        background: 'transparent',
                        color: '#EF4444',
                        marginLeft: '4px',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Discounts Breakdown */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748B', fontSize: '12px' }}>
            <span>GST (5% total: 2.5% CGST + 2.5% SGST):</span>
            <span>+₹{taxAmount.toFixed(2)}</span>
          </div>

          {/* Discount Input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>Discount (₹):</span>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="0.00"
              style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', textAlign: 'right' }}
            />
          </div>

          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: '800',
            color: 'var(--primary)',
            padding: '8px 0',
            borderTop: '1.5px dashed #CBD5E1'
          }}>
            <span>Total Payable:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {/* Payment Method Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '10px', marginBottom: '14px' }}>
            {['Cash', 'UPI', 'Card'].map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: paymentMethod === m ? 'var(--primary)' : '#F1F5F9',
                  color: paymentMethod === m ? '#FFF' : '#475569',
                  border: paymentMethod === m ? '1px solid var(--primary)' : '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {m === 'Cash' && <Banknote size={14} />}
                {m === 'UPI' && <QrCode size={14} />}
                {m === 'Card' && <CreditCard size={14} />}
                <span>{m}</span>
              </button>
            ))}
          </div>

          {/* Generate Bill Button */}
          <button
            onClick={handleGenerateBill}
            disabled={cart.length === 0 || loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: cart.length === 0 ? '#CBD5E1' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFF',
              fontSize: '15px',
              fontWeight: '800',
              cursor: cart.length === 0 || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: cart.length > 0 ? '0 4px 12px rgba(115, 15, 25, 0.35)' : 'none'
            }}
          >
            <Receipt size={18} />
            <span>{loading ? 'Processing...' : `Generate Bill • ₹${total.toFixed(2)}`}</span>
          </button>
        </div>
      </div>

      {/* Modal for Receipt and Dynamic UPI QR */}
      {showReceipt && (
        <ReceiptModal
          order={generatedOrder}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
