import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  Utensils, 
  FileText,
  Clock 
} from 'lucide-react';

export default function KitchenCompletedHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('status', 'Completed');
      if (search.trim()) params.append('search', search.trim());
      if (dateFilter) params.append('date', dateFilter);

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
    fetchHistory();
  }, [dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('');
    fetchHistory();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search and Date Filter Bar */}
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
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Completed Kitchen Preparation Archive
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Read-only historical audit of dishes prepared, completed, and handed over to service staff.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
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
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px'
            }}
          />

          <button
            type="submit"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563EB',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Filter
          </button>

          {(search || dateFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={fetchHistory}
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
        </form>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <p>Loading completed ticket records...</p>
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
          <FileText size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#475569' }}>
            No Completed Orders Found
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            Orders marked as Completed will be stored here in read-only format.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: '#FFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: '#F1F5F9',
                    color: '#0F172A',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '800'
                  }}>
                    TABLE #{order.table_number}
                  </span>
                  <span style={{
                    background: '#ECFDF5',
                    color: '#065F46',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    Completed
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>{order.bill_number}</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                </div>

                {order.notes && (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    color: '#475569',
                    marginBottom: '8px',
                    fontStyle: 'italic'
                  }}>
                    Note: {order.notes}
                  </div>
                )}

                {/* Items */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {(order.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#334155', fontWeight: '600' }}>• {it.item_name}</span>
                      <strong style={{ color: '#0F172A' }}>×{it.quantity}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                <span>Placed: {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Served: {new Date(order.kitchen_updated_at || order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}