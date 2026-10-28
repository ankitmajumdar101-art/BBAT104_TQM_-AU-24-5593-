import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Bell, 
  Utensils 
} from 'lucide-react';

export default function CashierKitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'In Progress', 'Ready', 'Completed'
  const [notificationMsg, setNotificationMsg] = useState('');

  const fetchKitchenStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/kitchen-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenStatus();
    // Auto-poll kitchen status every 15 seconds
    const interval = setInterval(fetchKitchenStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifyGuest = (billNumber, tableNumber) => {
    setNotificationMsg(`Waiter & Table #${tableNumber} notified for Bill #${billNumber}!`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const filteredOrders = orders.filter(ord => {
    if (filter === 'All') return true;
    if (filter === 'In Progress') return ord.kitchen_status === 'New' || ord.kitchen_status === 'Preparing';
    if (filter === 'Ready') return ord.kitchen_status === 'Ready';
    if (filter === 'Completed') return ord.kitchen_status === 'Completed';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return {
          bg: '#DCFCE7',
          color: '#15803D',
          border: '#86EFAC',
          label: 'Ready for Service'
        };
      case 'Preparing':
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE',
          label: 'In Kitchen Cooking'
        };
      case 'Completed':
        return {
          bg: '#F1F5F9',
          color: '#475569',
          border: '#CBD5E1',
          label: 'Food Served'
        };
      default:
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FCD34D',
          label: 'New Order Received'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Filter Controls */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChefHat size={20} color="#2563EB" />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Live Kitchen Order Surveillance
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Live status of customer dishes being prepared in the kitchen. Auto-refreshes every 15s.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
            {['All', 'In Progress', 'Ready', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: filter === f ? '#FFF' : 'transparent',
                  color: filter === f ? '#0F172A' : '#64748B',
                  fontWeight: filter === f ? '700' : '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={fetchKitchenStatus}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          color: '#15803D',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Bell size={16} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <p>Syncing kitchen display...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <Utensils size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No orders matching "{filter}"</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.kitchen_status);
            const isReady = order.kitchen_status === 'Ready';

            return (
              <div
                key={order.id}
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  border: isReady ? '2px solid #22C55E' : '1px solid #E2E8F0',
                  padding: '18px',
                  boxShadow: isReady ? '0 4px 16px rgba(34, 197, 94, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{
                      background: '#F1F5F9',
                      color: '#0F172A',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      Table #{order.table_number}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>
                      {order.bill_number}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#475569' }}>
                    Guest: <strong>{order.customer_name}</strong>
                  </p>

                  {/* Item List Preview */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    border: '1px solid #F1F5F9',
                    fontSize: '12px',
                    color: '#334155'
                  }}>
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>• {it.item_name}</span>
                        <strong style={{ color: '#0F172A' }}>×{it.quantity}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                    ₹{parseFloat(order.total).toFixed(2)}
                  </span>

                  {isReady ? (
                    <button
                      onClick={() => handleNotifyGuest(order.bill_number, order.table_number)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#16A34A',
                        color: '#FFF',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      <Bell size={13} />
                      <span>Notify Server</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Chef preparing...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}