import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  DollarSign, 
  Clock, 
  ChefHat, 
  FileText, 
  RefreshCw, 
  PlusCircle, 
  History, 
  AlertCircle,
  Eye,
  Printer
} from 'lucide-react';

export default function CashierOverview({ onNavigate, onReprintOrder }) {
  const [metrics, setMetrics] = useState({
    todayBillsCount: 0,
    todaySalesTotal: 0,
    draftCount: 0,
    pendingOrdersCount: 0,
    refundRequestsCount: 0,
    recentBills: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/cashier/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.message || 'Failed to load cashier overview.');
      }
    } catch (err) {
      setError('Network error while loading metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: '#059669',
              color: '#FFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Active Shift
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Front Desk Cashier Operations
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
            Isolated session monitoring your personal sales, live orders, drafts, and customer invoices.
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
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('pos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563EB',
              border: 'none',
              color: '#FFF',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <PlusCircle size={16} />
            <span>New POS Bill</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#991B1B',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Today's Bills */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Today's Bills Handled</span>
            <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px', color: '#2563EB' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {metrics.todayBillsCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
              Completed by you today
            </p>
          </div>
        </div>

        {/* Today's Sales Value */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Today's Revenue</span>
            <div style={{ background: '#ECFDF5', padding: '8px', borderRadius: '10px', color: '#059669' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              ₹{metrics.todaySalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Cashier shift total
            </p>
          </div>
        </div>

        {/* Active Drafts */}
        <div 
          onClick={() => onNavigate('drafts')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Active Draft Bills</span>
            <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '10px', color: '#D97706' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {metrics.draftCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#D97706', fontWeight: '600' }}>
              Click to resume drafts →
            </p>
          </div>
        </div>

        {/* Pending in Kitchen */}
        <div 
          onClick={() => onNavigate('kitchen')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Orders in Kitchen</span>
            <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '10px', color: '#475569' }}>
              <ChefHat size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              {metrics.pendingOrdersCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>
              Cooking / Preparing →
            </p>
          </div>
        </div>

        {/* Pending Refund Requests */}
        <div 
          onClick={() => onNavigate('history')}
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Refund Requests</span>
            <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '10px', color: '#DC2626' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: metrics.refundRequestsCount > 0 ? '#DC2626' : '#0F172A', margin: 0 }}>
              {metrics.refundRequestsCount}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Awaiting Admin approval
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Navigation */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Quick Cashier Launchpad:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('pos')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            + Create New Bill
          </button>
          <button
            onClick={() => onNavigate('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            My Bill History
          </button>
          <button
            onClick={() => onNavigate('drafts')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #FDE68A',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Saved Drafts ({metrics.draftCount})
          </button>
          <button
            onClick={() => onNavigate('kitchen')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Kitchen Status Tracker
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Recent Bills Created by You
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Showing your latest customer bills with instant reprint and status tracking
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563EB',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            View All Bills →
          </button>
        </div>

        {metrics.recentBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
            <Receipt size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>No bills generated yet in this session.</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Start creating bills using the POS interface.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Bill Number</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Table</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Total</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Payment</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Kitchen</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentBills.map(bill => {
                  const isRefundPending = bill.refund_status === 'Pending';
                  const isRefunded = bill.order_status === 'Refunded' || bill.refund_status === 'Approved';
                  
                  return (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                        {bill.bill_number}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          T-{bill.table_number}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {bill.customer_name}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0F172A' }}>
                        ₹{parseFloat(bill.total).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: bill.payment_method === 'Cash' ? '#ECFDF5' : '#EFF6FF',
                          color: bill.payment_method === 'Cash' ? '#065F46' : '#1E40AF'
                        }}>
                          {bill.payment_method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: bill.kitchen_status === 'Ready' ? '#DCFCE7' : '#FEF3C7',
                          color: bill.kitchen_status === 'Ready' ? '#15803D' : '#B45309'
                        }}>
                          {bill.kitchen_status || 'New'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isRefundPending ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '10px' }}>
                            Refund Requested
                          </span>
                        ) : isRefunded ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px' }}>
                            Refunded
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '10px' }}>
                            Completed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => onReprintOrder(bill.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer size={13} />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}