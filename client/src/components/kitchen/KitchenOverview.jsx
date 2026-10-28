import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight,
  Bell,
  Utensils
} from 'lucide-react';

export default function KitchenOverview({ onNavigate, onAdvanceStatus }) {
  const [data, setData] = useState({
    newOrdersCount: 0,
    preparingOrdersCount: 0,
    readyOrdersCount: 0,
    completedTodayCount: 0,
    attentionOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/kitchen/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      } else {
        setFeedback({ type: 'error', message: resData.message || 'Failed to load kitchen overview.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error loading overview.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const timer = setInterval(fetchOverview, 10000); // 10s auto-refresh
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdvance = async (orderId, currentStatus) => {
    let target = 'Preparing';
    if (currentStatus === 'New') target = 'Preparing';
    else if (currentStatus === 'Preparing') target = 'Ready';
    else if (currentStatus === 'Ready') target = 'Completed';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_status: target })
      });
      const resData = await res.json();
      if (resData.success) {
        setFeedback({ type: 'success', message: resData.message });
        fetchOverview();
        if (onAdvanceStatus) onAdvanceStatus();
      } else {
        setFeedback({ type: 'error', message: resData.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update order status.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Kitchen Status Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: '#DC2626',
              color: '#FFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Flame size={13} />
              Kitchen Live Line
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              • Food Preparation & Kitchen Display System (KDS)
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Chef Station & Line Overview
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
            Sanitized chef station tracking dish preparation, cooking urgency, and table handover.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchOverview}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync Line</span>
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

      {/* KPI Counters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* New Orders */}
        <div 
          onClick={() => onNavigate('new')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: data.newOrdersCount > 0 ? '2px solid #F59E0B' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>New Orders</span>
            <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '10px', color: '#D97706' }}>
              <Bell size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: data.newOrdersCount > 0 ? '#D97706' : '#0F172A', margin: 0 }}>
              {data.newOrdersCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#D97706', fontWeight: '700' }}>
              Awaiting Chef Start →
            </p>
          </div>
        </div>

        {/* Preparing Orders */}
        <div 
          onClick={() => onNavigate('preparing')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: data.preparingOrdersCount > 0 ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Cooking in Progress</span>
            <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px', color: '#2563EB' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: data.preparingOrdersCount > 0 ? '#2563EB' : '#0F172A', margin: 0 }}>
              {data.preparingOrdersCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#2563EB', fontWeight: '700' }}>
              In Tandoor / Wok →
            </p>
          </div>
        </div>

        {/* Ready Orders */}
        <div 
          onClick={() => onNavigate('ready')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: data.readyOrdersCount > 0 ? '2px solid #10B981' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Ready for Pickup</span>
            <div style={{ background: '#ECFDF5', padding: '8px', borderRadius: '10px', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: data.readyOrdersCount > 0 ? '#059669' : '#0F172A', margin: 0 }}>
              {data.readyOrdersCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
              Ready for Serving →
            </p>
          </div>
        </div>

        {/* Completed Today */}
        <div 
          onClick={() => onNavigate('completed')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Completed Today</span>
            <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '10px', color: '#475569' }}>
              <Utensils size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {data.completedTodayCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Dishes served today
            </p>
          </div>
        </div>
      </div>

      {/* Priority Cooking Line (FIFO: Oldest Waiting First) */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Active Kitchen Priority Tickets (Oldest Orders First)
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Follow standard FIFO kitchen queue to guarantee fresh preparation and eliminate table delays.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
            {data.attentionOrders.length} active tickets
          </span>
        </div>

        {data.attentionOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <ChefHat size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#475569' }}>All Kitchen Tickets Cleared</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>The kitchen is completely caught up. New orders will appear automatically.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {data.attentionOrders.map(order => {
              const isUrgent = order.elapsed_minutes >= 20;
              const isCaution = order.elapsed_minutes >= 10 && order.elapsed_minutes < 20;
              const isNew = order.kitchen_status === 'New';
              const isPrep = order.kitchen_status === 'Preparing';
              const isReady = order.kitchen_status === 'Ready';

              let borderColor = '#E2E8F0';
              if (isUrgent) borderColor = '#EF4444';
              else if (isCaution) borderColor = '#F59E0B';
              else if (isReady) borderColor = '#22C55E';
              else if (isPrep) borderColor = '#3B82F6';

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFF',
                    borderRadius: '16px',
                    border: `2px solid ${borderColor}`,
                    padding: '18px',
                    boxShadow: isUrgent ? '0 4px 16px rgba(239, 68, 68, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div>
                    {/* Card Header: Table # and Timer */}
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
                      <span>{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Special Notes / Allergy Caution */}
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

                    {/* Items List (Large & Clear for Chefs) */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
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

                  {/* Advance Status Button */}
                  <div>
                    {isNew && (
                      <button
                        onClick={() => handleQuickAdvance(order.id, 'New')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#F59E0B',
                          color: '#FFF',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Flame size={16} />
                        <span>Accept & Start Preparing</span>
                      </button>
                    )}

                    {isPrep && (
                      <button
                        onClick={() => handleQuickAdvance(order.id, 'Preparing')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#10B981',
                          color: '#FFF',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Mark Order as Ready</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleQuickAdvance(order.id, 'Ready')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#0F172A',
                          color: '#FFF',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        <Utensils size={16} />
                        <span>Confirm Handover / Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}