import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  Receipt, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Utensils
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CashierPOS({ user, loadedDraft, onClearLoadedDraft, onBillFinalized }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [activeDraftId, setActiveDraftId] = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Fetch Menu Items and Categories
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingMenu(true);
      try {
        const token = localStorage.getItem('token');
        const [catRes, menuRes] = await Promise.all([
          fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/menu', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const catData = await catRes.json();
        const menuData = await menuRes.json();

        if (catData.success) setCategories(catData.categories || []);
        if (menuData.success) setMenuItems(menuData.items || []);
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to load menu catalog.' });
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchCatalog();
  }, []);

  // Handle resumed draft
  useEffect(() => {
    if (loadedDraft) {
      setTableNumber(loadedDraft.table_number || 1);
      setCustomerName(loadedDraft.customer_name || 'Walk-in Guest');
      setCustomerPhone(loadedDraft.customer_phone || '');
      setOrderNotes(loadedDraft.notes || '');
      setActiveDraftId(loadedDraft.id);

      if (Array.isArray(loadedDraft.items) && loadedDraft.items.length > 0) {
        const prefilledCart = loadedDraft.items.map(it => ({
          id: it.menu_item_id || it.id,
          name: it.item_name || it.name,
          price: parseFloat(it.price || 0),
          quantity: parseInt(it.quantity || 1, 10)
        }));
        setCart(prefilledCart);
      }
      setFeedback({ type: 'success', message: `Resumed Draft #${loadedDraft.bill_number}. Finish billing or save updates.` });
    }
  }, [loadedDraft]);

  // Cart operations
  const handleAddToCart = (item) => {
    if (!item.available) return;

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: 1
        }];
      }
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveItem = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && !window.confirm('Are you sure you want to clear the current order?')) {
      return;
    }
    setCart([]);
    setCustomerName('Walk-in Guest');
    setCustomerPhone('');
    setOrderNotes('');
    setDiscountValue(0);
    setAmountReceived('');
    setTransactionReference('');
    setActiveDraftId(null);
    if (onClearLoadedDraft) onClearLoadedDraft();
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 5.00; // 5% GST (2.5% CGST + 2.5% SGST)
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));

  let discountAmount = 0;
  const numDiscVal = parseFloat(discountValue) || 0;
  if (discountType === 'percentage') {
    discountAmount = parseFloat(((subtotal * Math.min(numDiscVal, 25)) / 100).toFixed(2));
  } else {
    discountAmount = Math.min(numDiscVal, (subtotal * 0.25));
  }

  const grandTotal = Math.max(0, parseFloat((subtotal + taxAmount - discountAmount).toFixed(2)));

  // Cash change due calculation
  const numAmountReceived = parseFloat(amountReceived) || 0;
  const changeDue = paymentMethod === 'Cash' && numAmountReceived >= grandTotal
    ? parseFloat((numAmountReceived - grandTotal).toFixed(2))
    : 0;

  // Filtered menu
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Save as Draft
  const handleSaveDraft = async () => {
    if (cart.length === 0) {
      setFeedback({ type: 'error', message: 'Cannot save an empty order as draft.' });
      return;
    }

    setSavingDraft(true);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          table_number: tableNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: cart,
          notes: orderNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Order successfully saved as ${data.bill_number}!` });
        handleClearCart();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to save draft.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error saving draft.' });
    } finally {
      setSavingDraft(false);
    }
  };

  // Finalize & Issue Bill
  const handleFinalizeBill = async () => {
    if (cart.length === 0) {
      setFeedback({ type: 'error', message: 'Order is empty. Please select menu items.' });
      return;
    }

    if (paymentMethod === 'Cash' && numAmountReceived > 0 && numAmountReceived < grandTotal) {
      setFeedback({ type: 'error', message: `Amount received (₹${numAmountReceived}) is less than total payable (₹${grandTotal}).` });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          table_number: tableNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: cart,
          discount_type: discountType,
          discount_value: numDiscVal,
          payment_method: paymentMethod,
          amount_received: numAmountReceived > 0 ? numAmountReceived : grandTotal,
          transaction_reference: transactionReference,
          notes: orderNotes,
          draft_id: activeDraftId
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Bill #${data.order.bill_number} generated successfully!` });
        // Clear cart
        setCart([]);
        setCustomerName('Walk-in Guest');
        setCustomerPhone('');
        setOrderNotes('');
        setDiscountValue(0);
        setAmountReceived('');
        setTransactionReference('');
        setActiveDraftId(null);
        if (onClearLoadedDraft) onClearLoadedDraft();

        // Trigger Receipt Modal in parent
        if (onBillFinalized) {
          onBillFinalized(data.order);
        }
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to finalize bill.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error generating bill.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT: Menu Items Catalog */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Search Bar & Header */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search dishes, beverages, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFF',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {['All', ...categories.map(c => c.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: selectedCategory === cat ? '#2563EB' : '#F1F5F9',
                color: selectedCategory === cat ? '#FFF' : '#475569',
                fontSize: '13px',
                fontWeight: selectedCategory === cat ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {loadingMenu ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <Utensils size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: '600' }}>Loading Menu Catalog...</p>
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No dishes found matching your search.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px',
            maxHeight: '620px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {filteredMenuItems.map(item => {
              const isAvailable = Boolean(item.available);
              const inCartItem = cart.find(i => i.id === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => isAvailable && handleAddToCart(item)}
                  style={{
                    background: isAvailable ? '#FFF' : '#F8FAFC',
                    borderRadius: '14px',
                    border: inCartItem ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.6,
                    transition: 'all 0.15s ease',
                    boxShadow: inCartItem ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                        {item.category_name}
                      </span>
                      {isAvailable ? (
                        inCartItem && (
                          <span style={{
                            background: '#2563EB',
                            color: '#FFF',
                            fontSize: '11px',
                            fontWeight: '800',
                            borderRadius: '12px',
                            padding: '2px 8px'
                          }}>
                            {inCartItem.quantity} in cart
                          </span>
                        )
                      ) : (
                        <span style={{
                          background: '#FEE2E2',
                          color: '#DC2626',
                          fontSize: '10px',
                          fontWeight: '800',
                          borderRadius: '6px',
                          padding: '2px 6px'
                        }}>
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    {item.description && (
                      <p style={{
                        fontSize: '12px',
                        color: '#64748B',
                        margin: 0,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                      ₹{parseFloat(item.price).toFixed(2)}
                    </span>
                    <button
                      disabled={!isAvailable}
                      style={{
                        background: isAvailable ? '#2563EB' : '#CBD5E1',
                        border: 'none',
                        color: '#FFF',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: isAvailable ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Order Cart & Authoritative Billing Calculator */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Cart Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Order Billing Summary
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              {activeDraftId ? `Resumed Draft #${activeDraftId}` : 'New Customer Invoice'}
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback.message && (
          <div style={{
            background: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: feedback.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
            color: feedback.type === 'success' ? '#166534' : '#991B1B',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Table & Guest Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              TABLE #
            </label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: '700',
                background: '#F8FAFC'
              }}
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Table {i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              CUSTOMER NAME
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Guest name"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Phone & Order Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              KITCHEN NOTES
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Less spicy, no onions"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div style={{
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          maxHeight: '220px',
          overflowY: 'auto',
          background: '#FAFAFA'
        }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8' }}>
              <Receipt size={32} style={{ opacity: 0.3, marginBottom: '6px' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>No items in cart</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px' }}>Click dishes on the left to add</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderBottom: '1px solid #F1F5F9',
                    background: '#FFF'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {item.name}
                    </h5>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      ₹{item.price.toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', borderRadius: '8px', padding: '3px 6px' }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      style={{
                        background: '#FFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      style={{
                        background: '#FFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Item Subtotal & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', minWidth: '55px', textAlign: 'right' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
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

        {/* Discount Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '10px',
          background: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
              DISCOUNT TYPE
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px'
              }}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Cash (₹)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
              DISCOUNT VALUE (Max 25%)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Calculation Summary Breakdown */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '13px',
          borderTop: '1px dashed #CBD5E1',
          paddingTop: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
            <span>GST Tax (2.5% CGST + 2.5% SGST):</span>
            <span>+₹{taxAmount.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', fontWeight: '600' }}>
              <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`}):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: '900',
            color: '#0F172A',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '8px'
          }}>
            <span>Total Payable:</span>
            <span style={{ color: '#2563EB' }}>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
            PAYMENT METHOD
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { id: 'Cash', label: 'Cash', icon: DollarSign },
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'Card', label: 'Card', icon: CreditCard },
              { id: 'Net Banking', label: 'NetBank', icon: Receipt }
            ].map(m => {
              const Icon = m.icon;
              const isSel = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSel ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: isSel ? '#EFF6FF' : '#FFF',
                    color: isSel ? '#1D4ED8' : '#475569',
                    fontSize: '11px',
                    fontWeight: isSel ? '800' : '600',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Payment Details Panel */}
        {paymentMethod === 'Cash' && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>
                Cash Tendered (Received)
              </label>
              {/* Quick Money Denominations */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[grandTotal, Math.ceil(grandTotal / 100) * 100, 500, 1000].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmountReceived(amt.toString())}
                    style={{
                      background: '#FFF',
                      border: '1px solid #86EFAC',
                      color: '#166534',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              placeholder={`Enter amount (e.g. ₹${grandTotal})`}
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #86EFAC',
                fontSize: '14px',
                fontWeight: '700',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #86EFAC' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>Change to Return:</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: changeDue >= 0 ? '#15803D' : '#DC2626' }}>
                ₹{changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'UPI' && (
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF' }}>Scan UPI QR Code</span>
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#FFF',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={13} />
                <span>Show QR</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="UTR / UPI Ref Number (Optional)"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {paymentMethod === 'Card' && (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
              POS Terminal Reference / Auth Code
            </label>
            <input
              type="text"
              placeholder="e.g. Card ending 4567 / Auth 98213"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
              🔒 Security safeguard: Never enter full 16-digit card number or CVV.
            </span>
          </div>
        )}

        {/* Action Buttons: Save Draft vs Finalize Bill */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || cart.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #FCD34D',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '13px',
              fontWeight: '700',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={15} />
            <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleFinalizeBill}
            disabled={submitting || cart.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: cart.length === 0 ? '#94A3B8' : '#2563EB',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '800',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: cart.length === 0 ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <Receipt size={17} />
            <span>{submitting ? 'Finalizing Bill...' : `Finalize & Print (₹${grandTotal.toFixed(2)})`}</span>
          </button>
        </div>
      </div>

      {/* UPI QR Modal Popup */}
      {showUpiModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '340px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Scan to Pay ₹{grandTotal.toFixed(2)}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B' }}>
              Royal Feast Restaurant UPI ID: royalfeast@upi
            </p>
            <div style={{ display: 'inline-block', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <QRCodeSVG
                value={`upi://pay?pa=royalfeast@upi&pn=RoyalFeastRestaurant&am=${grandTotal.toFixed(2)}&cu=INR&tn=Table${tableNumber}`}
                size={180}
              />
            </div>
            <p style={{ margin: '14px 0 16px 0', fontSize: '11px', color: '#475569' }}>
              Instruct the guest to scan with Google Pay, PhonePe, Paytm, or BHIM.
            </p>
            <button
              onClick={() => setShowUpiModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563EB',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}