import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Clock, 
  Utensils, 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  RefreshCw, 
  Receipt, 
  Sparkles,
  Printer
} from 'lucide-react';
import DishImage from '../common/DishImage';

export default function CashierWaiterQueue({ onBillFinalized }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  
  // Payment states keyed by order id
  const [paymentMethods, setPaymentMethods] = useState({});
  const [amountReceived, setAmountReceived] = useState({});
  const [discountValues, setDiscountValues] = useState({});

  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/waiter-pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending waiter orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFinalizeBill = async (order) => {
    setProcessingId(order.id);
    setFeedback({ type: '', message: '' });

    const payMethod = paymentMethods[order.id] || 'Cash';
    const discVal = parseFloat(discountValues[order.id]) || 0;
    const estTax = parseFloat(((order.subtotal * 5) / 100).toFixed(2));
    const finalTotal = parseFloat((parseFloat(order.subtotal) + estTax - discVal).toFixed(2));
    const amtRec = parseFloat(amountReceived[order.id]) || finalTotal;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${order.id}/finalize-waiter-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: payMethod,
          amount_received: amtRec,
          discount_type: 'fixed',
          discount_value: discVal,
          transaction_reference: payMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : ''
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Bill #${data.bill_number} generated! Order sent to Kitchen Chef and bill handed back to Waiter.`
        });
        fetchPendingOrders();

        // If parent handler exists, trigger receipt modal
        if (onBillFinalized) {
          try {
            const billRes = await fetch(`/api/orders/${order.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const billData = await billRes.json();
            if (billData.success && billData.order) {
              onBillFinalized(billData.order);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        setFeedback({ type: 'error', message: data.message || 'Billing failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error finalizing waiter bill.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#F3E8FF',
            color: '#7E22CE',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellRing size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Waiter Orders Queue (Pending Calculation)
              </h3>
              <span style={{
                background: orders.length > 0 ? '#EF4444' : '#E2E8F0',
                color: orders.length > 0 ? '#FFF' : '#475569',
                fontSize: '12px',
                fontWeight: '900',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {orders.length} PENDING
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Incoming table orders placed by Floor Waiters. Review items, compute GST & payment, and forward to Kitchen.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPendingOrders}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback.message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          border: feedback.type === 'success' ? '1px solid #86EFAC' : '1px solid #FCA5A5'
        }}>
          {feedback.message}
        </div>
      )}

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
          <p>Syncing incoming waiter orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <CheckCircle size={44} style={{ opacity: 0.3, marginBottom: '10px', color: '#10B981' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#334155' }}>
            No Waiter Orders Pending Billing
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            When a floor waiter places an order for any table, it will appear here instantly for billing calculation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '18px' }}>
          {orders.map(ord => {
            const curPayMethod = paymentMethods[ord.id] || 'Cash';
            const curDiscount = parseFloat(discountValues[ord.id]) || 0;
            const subtotal = parseFloat(ord.subtotal) || 0;
            const taxAmount = parseFloat(((subtotal * 5) / 100).toFixed(2));
            const calculatedTotal = Math.max(0, parseFloat((subtotal + taxAmount - curDiscount).toFixed(2)));
            const isProcessing = processingId === ord.id;

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  border: '2px solid #D8B4FE',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  {/* Table & Waiter Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
                      color: '#FFF',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '900',
                      letterSpacing: '0.4px'
                    }}>
                      TABLE #{ord.table_number}
                    </span>

                    <span style={{
                      background: '#F1F5F9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      Order #{ord.bill_number}
                    </span>
                  </div>

                  {/* Customer & Waiter Details */}
                  <div style={{
                    background: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B21A8', fontWeight: '700' }}>Floor Waiter:</span>
                      <span style={{ fontWeight: '800', color: '#0F172A' }}>{ord.waiter_name || ord.waiter_username || 'Floor Staff'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B21A8', fontWeight: '700' }}>Customer:</span>
                      <span style={{ fontWeight: '700', color: '#0F172A' }}>{ord.customer_name || 'Dine-in Guest'} {ord.customer_phone ? `(${ord.customer_phone})` : ''}</span>
                    </div>
                    {ord.notes && (
                      <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #D8B4FE', color: '#9333EA', fontStyle: 'italic' }}>
                        Notes: {ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Dishes Ordered */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
                      ORDERED ITEMS ({ord.items?.length || 0})
                    </div>
                    <div style={{
                      maxHeight: '140px',
                      overflowY: 'auto',
                      border: '1px solid #F1F5F9',
                      borderRadius: '8px',
                      padding: '6px 8px'
                    }}>
                      {ord.items?.map((itm, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: idx === ord.items.length - 1 ? 'none' : '1px dashed #E2E8F0',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DishImage
                              src={itm.image_url}
                              alt={itm.item_name}
                              size="sm"
                              style={{ width: '30px', height: '30px', minWidth: '30px', minHeight: '30px', borderRadius: '6px' }}
                            />
                            <span style={{
                              background: '#E2E8F0',
                              color: '#1E293B',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              {itm.quantity}x
                            </span>
                            <span style={{ fontWeight: '700', color: '#1E293B' }}>{itm.item_name}</span>
                          </div>
                          <span style={{ fontWeight: '700', color: '#0F172A' }}>
                            ₹{parseFloat(itm.subtotal || (itm.price * itm.quantity)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculation Breakdown */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#475569' }}>
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#475569' }}>
                      <span>GST (2.5% CGST + 2.5% SGST):</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    {curDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#15803D', fontWeight: '700' }}>
                        <span>Discount Applied:</span>
                        <span>-₹{curDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                      paddingTop: '6px',
                      borderTop: '1px solid #CBD5E1',
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#0F172A'
                    }}>
                      <span>Final Bill Total:</span>
                      <span style={{ color: '#059669' }}>₹{calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
                      SETTLEMENT METHOD
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {['Cash', 'UPI', 'Card'].map(m => {
                        const isSel = curPayMethod === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethods({ ...paymentMethods, [ord.id]: m })}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: isSel ? '2px solid #059669' : '1px solid #CBD5E1',
                              background: isSel ? '#ECFDF5' : '#FFF',
                              color: isSel ? '#065F46' : '#475569',
                              fontSize: '11px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            {m === 'Cash' && <Banknote size={13} />}
                            {m === 'UPI' && <QrCode size={13} />}
                            {m === 'Card' && <CreditCard size={13} />}
                            <span>{m}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Finalize & Forward Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleFinalizeBill(ord)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    border: 'none',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  <Receipt size={17} />
                  <span>{isProcessing ? 'Generating Bill...' : `Calculate & Finalize Bill (₹${calculatedTotal.toFixed(2)})`}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
