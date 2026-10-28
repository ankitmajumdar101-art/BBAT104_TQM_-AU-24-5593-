import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Bell, 
  Utensils 
} from 'lucide-react';

export default function KitchenOrderQueue({ status, title, subtitle, nextStatus, nextButtonLabel, nextButtonIcon: NextIcon, onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('status', status);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/kitchen/orders?${params.toString()}`, {
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
    fetchOrders();
    const timer = setInterval(fetchOrders, 10000);
    return () => clearInterval(timer);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId) => {
    setActionLoading(orderId);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        fetchOrders();
        if (onOrderUpdated) onOrderUpdated();
      } else {
        setFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update order status.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Search */}
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
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              {title}
            </h3>
            <span style={{
              background: '#F1F5F9',
              color: '#0F172A',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              {orders.length}
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            {subtitle}
          </p>
        </div>

        {/* Search and Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search table or ticket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </form>

          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {feedback.message && (
        <div style={{
          background: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: feedback.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
          color: feedback.type === 'success' ? '#166534' : '#991B1B',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {feedback.message}
        </div>
      )}

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <p>Syncing kitchen line...</p>
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
          <ChefHat size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#475569' }}>
            No Orders in this Queue
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            New customer orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {orders.map(order => {
            const isUrgent = order.elapsed_minutes >= 20;
            const isCaution = order.elapsed_minutes >= 10 && order.elapsed_minutes < 20;

            let borderStyle = '1px solid #E2E8F0';
            if (isUrgent) borderStyle = '2px solid #EF4444';
            else if (isCaution) borderStyle = '2px solid #F59E0B';
            else if (status === 'Ready') borderStyle = '2px solid #10B981';

            return (
              <div
                key={order.id}
                style={{
                  background: '#FFF',
                  borderRadius: '16px',
                  border: borderStyle,
                  padding: '18px',
                  boxShadow: isUrgent ? '0 4px 16px rgba(239, 68, 68, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  {/* Table # & Timer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: '#0F172A',
                      color: '#FFF',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '900',
                      letterSpacing: '0.3px'
                    }}>
                      TABLE #{order.table_number}
                    </span>

                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isUrgent ? '#FEE2E2' : isCaution ? '#FEF3C7' : '#F1F5F9',
                      color: isUrgent ? '#DC2626' : isCaution ? '#B45309' : '#475569'
                    }}>
                      <Clock size={13} />
                      <span>{order.elapsed_minutes || 0}m waiting</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>{order.bill_number}</span>
                    <span>Placed: {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Special Notes / Allergy Alert */}
                  {order.notes && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#B91C1C',
                      marginBottom: '10px'
                    }}>
                      ⚠️ NOTE: {order.notes}
                    </div>
                  )}

                  {/* Food Items List */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                          {item.item_name}
                        </span>
                        <span style={{
                          background: '#0F172A',
                          color: '#FFF',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transition Action Button */}
                {nextStatus && (
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    disabled={actionLoading === order.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: status === 'New' ? '#F59E0B' : status === 'Preparing' ? '#10B981' : '#0F172A',
                      color: '#FFF',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: status === 'New' 
                        ? '0 2px 8px rgba(245, 158, 11, 0.3)' 
                        : status === 'Preparing' 
                        ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
                        : '0 2px 8px rgba(15, 23, 42, 0.3)'
                    }}
                  >
                    {NextIcon && <NextIcon size={16} />}
                    <span>{actionLoading === order.id ? 'Updating...' : nextButtonLabel}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}