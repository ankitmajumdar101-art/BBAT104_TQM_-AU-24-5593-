import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  Banknote, 
  QrCode,
  RefreshCw
} from 'lucide-react';

export default function OwnerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    todayRevenue: 0,
    todayOrders: 0
  };

  const topItems = data?.topItems || [];
  const paymentBreakdown = data?.paymentBreakdown || [];
  const weeklyTrend = data?.weeklyTrend || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
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
            Executive Owner Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Real-time business performance, sales analytics, and restaurant revenue trends
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
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
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Today's Sales */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>TODAY'S REVENUE</span>
            <div style={{ background: '#ECFDF5', color: '#059669', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            ₹{stats.todayRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            {stats.todayOrders} orders processed today
          </div>
        </div>

        {/* All-time Revenue */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>TOTAL REVENUE</span>
            <div style={{ background: '#FEF3C7', color: '#D97706', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            ₹{stats.totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Cumulative gross restaurant earnings
          </div>
        </div>

        {/* Total Invoices */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>TOTAL INVOICES</span>
            <div style={{ background: '#EFF6FF', color: '#2563EB', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            {stats.totalOrders}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Completed customer dining transactions
          </div>
        </div>

        {/* Average Order Value */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>AVG ORDER VALUE</span>
            <div style={{ background: '#FDF2F8', color: '#DB2777', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            ₹{stats.avgOrderValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Average spend per customer order
          </div>
        </div>
      </div>

      {/* Middle Section: Top Dishes & Payment Mode Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Top 5 Best Selling Items */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Top 5 Best Selling Dishes
            </h3>
          </div>

          {topItems.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>No sales records yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topItems.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#FCD34D' : '#E2E8F0',
                      color: idx === 0 ? '#92400E' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '11px'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{it.item_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{it.total_quantity_sold} plates sold</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>
                    ₹{parseFloat(it.total_revenue).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Payment Methods Breakdown
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {paymentBreakdown.map((pm, idx) => (
              <div key={idx} style={{ padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: pm.payment_method === 'UPI' ? '#FDF2F8' : pm.payment_method === 'Card' ? '#ECFDF5' : '#FEF3C7',
                    color: pm.payment_method === 'UPI' ? '#DB2777' : pm.payment_method === 'Card' ? '#059669' : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {pm.payment_method === 'UPI' && <QrCode size={18} />}
                    {pm.payment_method === 'Card' && <CreditCard size={18} />}
                    {pm.payment_method === 'Cash' && <Banknote size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{pm.payment_method} Payments</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{pm.count} transactions</div>
                  </div>
                </div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#0F172A' }}>
                  ₹{parseFloat(pm.revenue).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
