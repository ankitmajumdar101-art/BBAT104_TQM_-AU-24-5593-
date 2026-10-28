import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, CreditCard, Banknote, QrCode, RefreshCw } from 'lucide-react';
import ReceiptModal from './ReceiptModal';

export default function BillHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedMethod]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/orders?limit=100';
      if (selectedMethod) url += `&payment_method=${selectedMethod}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
      }
    } catch (err) {
      alert('Failed to load bill details.');
    }
  };

  const filteredOrders = orders.filter(o => {
    const search = searchTerm.toLowerCase();
    return o.bill_number.toLowerCase().includes(search) ||
           (o.customer_name && o.customer_name.toLowerCase().includes(search)) ||
           (o.customer_phone && o.customer_phone.includes(search));
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Header & Controls */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Bill History & Invoices
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            View and reprint all past customer receipts and invoices
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search bill #, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Payment filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              background: '#FFF'
            }}
          >
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash Only</option>
            <option value="UPI">UPI Only</option>
            <option value="Card">Card Only</option>
          </select>

          <button
            onClick={fetchOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#F1F5F9',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#FFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '14px 18px' }}>Bill #</th>
              <th style={{ padding: '14px 18px' }}>Date & Time</th>
              <th style={{ padding: '14px 18px' }}>Table</th>
              <th style={{ padding: '14px 18px' }}>Customer</th>
              <th style={{ padding: '14px 18px' }}>Method</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Cashier</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  No bills found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
                >
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary)' }}>
                    {order.bill_number}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                      Table #{order.table_number}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: '600', color: '#0F172A' }}>{order.customer_name}</div>
                    {order.customer_phone && (
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{order.customer_phone}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: order.payment_method === 'UPI' ? '#FDF2F8' : order.payment_method === 'Card' ? '#F0FDF4' : '#FEF3C7',
                      color: order.payment_method === 'UPI' ? '#9D174D' : order.payment_method === 'Card' ? '#166534' : '#92400E'
                    }}>
                      {order.payment_method === 'UPI' && <QrCode size={12} />}
                      {order.payment_method === 'Card' && <CreditCard size={12} />}
                      {order.payment_method === 'Cash' && <Banknote size={12} />}
                      <span>{order.payment_method}</span>
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
                    ₹{parseFloat(order.total).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', color: '#64748B' }}>
                    {order.cashier_name || 'Staff'}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'var(--primary)',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={13} />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reprint Receipt Modal */}
      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
